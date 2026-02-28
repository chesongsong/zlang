import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  BlockStatement,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ExpressionStatement,
  ReturnStatement,
  VariableDeclaration,
  AssignmentExpression,
  Identifier,
  CallArgument,
} from "@z-lang/types";

export class ScopeResolver {
  private scopeStack: Set<string>[] = [];

  resolve(program: Program): Program {
    return {
      ...program,
      body: program.body.map((scope) => this.resolveScopeBlock(scope)),
    };
  }

  private resolveScopeBlock(scope: ScopeBlock): ScopeBlock {
    this.pushScope();
    const body = this.resolveStatements(scope.body as Statement[]);
    this.popScope();
    return { ...scope, body };
  }

  private resolveStatements(stmts: Statement[]): Statement[] {
    return stmts.map((s) => this.resolveStatement(s));
  }

  private resolveStatement(stmt: Statement): Statement {
    switch (stmt.type) {
      case "ExpressionStatement":
        return this.resolveExpressionStatement(stmt);
      case "FunctionDeclaration":
        return this.resolveFunctionDeclaration(stmt);
      case "IfStatement":
        return this.resolveIfStatement(stmt);
      case "WhileStatement":
        return this.resolveWhileStatement(stmt);
      case "ForStatement":
        return this.resolveForStatement(stmt);
      case "BlockStatement":
        return this.resolveBlockStatement(stmt);
      case "ReturnStatement":
        return this.resolveReturnStatement(stmt);
      case "VariableDeclaration":
      case "BreakStatement":
      case "ContinueStatement":
        return stmt;
    }
  }

  private resolveExpressionStatement(
    stmt: ExpressionStatement,
  ): ExpressionStatement | VariableDeclaration {
    const expr = stmt.expression;

    if (this.isImplicitDeclaration(expr)) {
      const assign = expr as AssignmentExpression;
      const target = assign.target as Identifier;
      this.defineInCurrentScope(target.name);
      return {
        type: "VariableDeclaration",
        name: target.name,
        init: this.resolveExpression(assign.value),
        loc: stmt.loc,
      };
    }

    return {
      ...stmt,
      expression: this.resolveExpression(stmt.expression),
    };
  }

  private resolveFunctionDeclaration(
    stmt: FunctionDeclaration,
  ): FunctionDeclaration {
    this.defineInCurrentScope(stmt.name);

    this.pushScope();
    for (const param of stmt.params) {
      this.defineInCurrentScope(param.name);
    }
    const body = this.resolveBlockStatement(stmt.body);
    this.popScope();

    return { ...stmt, body };
  }

  private resolveIfStatement(stmt: IfStatement): IfStatement {
    const test = this.resolveExpression(stmt.test);
    const consequent = this.resolveBlockStatement(stmt.consequent);
    let alternate: BlockStatement | IfStatement | undefined;
    if (stmt.alternate) {
      alternate =
        stmt.alternate.type === "IfStatement"
          ? this.resolveIfStatement(stmt.alternate)
          : this.resolveBlockStatement(stmt.alternate);
    }
    return { ...stmt, test, consequent, alternate };
  }

  private resolveWhileStatement(stmt: WhileStatement): WhileStatement {
    return {
      ...stmt,
      test: this.resolveExpression(stmt.test),
      body: this.resolveBlockStatement(stmt.body),
    };
  }

  private resolveForStatement(stmt: ForStatement): ForStatement {
    this.pushScope();

    const init = this.resolveForInit(stmt.init);
    const test = this.resolveExpression(stmt.test);
    const update = this.resolveExpression(stmt.update);

    const bodyStmts = this.resolveStatements(stmt.body.body as Statement[]);
    const body: BlockStatement = { ...stmt.body, body: bodyStmts };

    this.popScope();

    return { ...stmt, init, test, update, body };
  }

  private resolveForInit(expr: Expression): Expression {
    if (this.isImplicitDeclaration(expr)) {
      const assign = expr as AssignmentExpression;
      const target = assign.target as Identifier;
      this.defineInCurrentScope(target.name);
    }
    return this.resolveExpression(expr);
  }

  private resolveBlockStatement(block: BlockStatement): BlockStatement {
    this.pushScope();
    const body = this.resolveStatements(block.body as Statement[]);
    this.popScope();
    return { ...block, body };
  }

  private resolveReturnStatement(stmt: ReturnStatement): ReturnStatement {
    if (!stmt.argument) return stmt;
    return { ...stmt, argument: this.resolveExpression(stmt.argument) };
  }

  // -----------------------------------------------------------------------
  // Expression resolution (recursively resolves nested expressions)
  // -----------------------------------------------------------------------

  private resolveExpression(expr: Expression): Expression {
    switch (expr.type) {
      case "AssignmentExpression":
        return {
          ...expr,
          value: this.resolveExpression(expr.value),
        };
      case "BinaryExpression":
        return {
          ...expr,
          left: this.resolveExpression(expr.left),
          right: this.resolveExpression(expr.right),
        };
      case "UnaryExpression":
        return {
          ...expr,
          argument: this.resolveExpression(expr.argument),
        };
      case "CallExpression":
        return {
          ...expr,
          callee: this.resolveExpression(expr.callee),
          arguments: expr.arguments.map((a) => this.resolveCallArgument(a)),
        };
      case "MemberExpression":
        return {
          ...expr,
          object: this.resolveExpression(expr.object),
        };
      case "IndexExpression":
        return {
          ...expr,
          object: this.resolveExpression(expr.object),
          index: this.resolveExpression(expr.index),
        };
      case "ArrayExpression":
        return {
          ...expr,
          elements: expr.elements.map((e) => this.resolveExpression(e)),
        };
      case "ObjectExpression":
        return {
          ...expr,
          properties: expr.properties.map((p) => ({
            ...p,
            value: this.resolveExpression(p.value),
          })),
        };
      case "ArrowFunctionExpression": {
        this.pushScope();
        for (const param of expr.params) {
          this.defineInCurrentScope(param.name);
        }
        const body =
          expr.body.type === "BlockStatement"
            ? this.resolveBlockStatement(expr.body)
            : this.resolveExpression(expr.body);
        this.popScope();
        return { ...expr, body };
      }
      default:
        return expr;
    }
  }

  private resolveCallArgument(arg: CallArgument): CallArgument {
    if (arg.type === "NamedArgument") {
      return { ...arg, value: this.resolveExpression(arg.value) };
    }
    return this.resolveExpression(arg);
  }

  // -----------------------------------------------------------------------
  // Scope helpers
  // -----------------------------------------------------------------------

  private pushScope(): void {
    this.scopeStack.push(new Set());
  }

  private popScope(): void {
    this.scopeStack.pop();
  }

  private defineInCurrentScope(name: string): void {
    const current = this.scopeStack[this.scopeStack.length - 1];
    if (current) {
      current.add(name);
    }
  }

  private isDefined(name: string): boolean {
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i]!.has(name)) return true;
    }
    return false;
  }

  private isImplicitDeclaration(expr: Expression): boolean {
    return (
      expr.type === "AssignmentExpression" &&
      expr.operator === "=" &&
      expr.target.type === "Identifier" &&
      !this.isDefined(expr.target.name)
    );
  }
}
