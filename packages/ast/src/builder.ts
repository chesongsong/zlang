import { ParserRuleContext, type Token } from "antlr4ng";
import { ZLangParser } from "@z-lang/parser";
import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
  AssignmentExpression,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryOperator,
  UnaryOperator,
  AssignmentOperator,
  MemberExpression,
  IndexExpression,
  SourceLocation,
  Parameter,
  Property,
  TypeAnnotationNode,
  NamedArgument,
  CallArgument,
} from "@z-lang/types";
import { ASTBuildError } from "@z-lang/types";

function loc(ctx: ParserRuleContext): SourceLocation {
  const start = ctx.start!;
  const stop = ctx.stop ?? start;
  return {
    start: {
      line: start.line,
      column: start.column,
      offset: start.start,
    },
    end: {
      line: stop.line,
      column: stop.column + (stop.text?.length ?? 0),
      offset: stop.stop + 1,
    },
  };
}

function tokenLoc(token: Token): SourceLocation {
  return {
    start: {
      line: token.line,
      column: token.column,
      offset: token.start,
    },
    end: {
      line: token.line,
      column: token.column + (token.text?.length ?? 0),
      offset: token.stop + 1,
    },
  };
}

export class ASTBuilder {
  buildProgram(ctx: ParserRuleContext): Program {
    const scopes: ScopeBlock[] = [];
    for (const child of ctx.children ?? []) {
      if (
        child instanceof ParserRuleContext &&
        child.ruleIndex === ZLangParser.RULE_scopeBlock
      ) {
        scopes.push(this.buildScopeBlock(child));
      }
    }
    return {
      type: "Program",
      body: scopes,
      loc: loc(ctx),
    };
  }

  private buildScopeBlock(ctx: ParserRuleContext): ScopeBlock {
    const stmts: Statement[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        const stmt = this.buildStatement(child);
        if (stmt) stmts.push(stmt);
      }
    }
    return {
      type: "ScopeBlock",
      body: stmts,
      loc: loc(ctx),
    };
  }

  private buildStatement(ctx: ParserRuleContext): Statement | null {
    const ruleIndex = ctx.ruleIndex;

    if (ruleIndex === ZLangParser.RULE_functionDeclaration) {
      return this.buildFunctionDeclaration(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_ifStatement) {
      return this.buildIfStatement(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_whileStatement) {
      return this.buildWhileStatement(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_forStatement) {
      return this.buildForStatement(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_returnStatement) {
      return this.buildReturnStatement(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_expressionStatement) {
      return this.buildExpressionStatement(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_block) {
      return this.buildBlock(ctx);
    }
    if (ruleIndex === ZLangParser.RULE_statement) {
      const child = ctx.getChild(0);
      if (child instanceof ParserRuleContext) {
        return this.buildStatement(child);
      }
    }
    if (ruleIndex === ZLangParser.RULE_breakStatement) {
      return { type: "BreakStatement", loc: loc(ctx) };
    }
    if (ruleIndex === ZLangParser.RULE_continueStatement) {
      return { type: "ContinueStatement", loc: loc(ctx) };
    }

    return null;
  }

  private buildFunctionDeclaration(ctx: ParserRuleContext): FunctionDeclaration {
    const nameToken = ctx.getToken(ZLangParser.IDENTIFIER, 0);
    const name = nameToken?.getText() ?? "";

    const paramListCtx = this.findRuleChild(ctx, ZLangParser.RULE_parameterList);
    const params = paramListCtx ? this.buildParameterList(paramListCtx) : [];

    const blockCtx = this.findRuleChild(ctx, ZLangParser.RULE_block)!;

    return {
      type: "FunctionDeclaration",
      name,
      params,
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  private buildIfStatement(ctx: ParserRuleContext): IfStatement {
    const exprCtx = this.findRuleChild(ctx, ZLangParser.RULE_expression)!;
    const blocks = this.findAllRuleChildren(ctx, ZLangParser.RULE_block);
    const nestedIf = this.findRuleChild(ctx, ZLangParser.RULE_ifStatement);

    let alternate: BlockStatement | IfStatement | undefined;
    if (nestedIf) {
      alternate = this.buildIfStatement(nestedIf);
    } else if (blocks.length > 1) {
      alternate = this.buildBlock(blocks[1]!);
    }

    return {
      type: "IfStatement",
      test: this.buildExpression(exprCtx),
      consequent: this.buildBlock(blocks[0]!),
      alternate,
      loc: loc(ctx),
    };
  }

  private buildWhileStatement(ctx: ParserRuleContext): WhileStatement {
    const exprCtx = this.findRuleChild(ctx, ZLangParser.RULE_expression)!;
    const blockCtx = this.findRuleChild(ctx, ZLangParser.RULE_block)!;

    return {
      type: "WhileStatement",
      test: this.buildExpression(exprCtx),
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  private buildForStatement(ctx: ParserRuleContext): ForStatement {
    const expressions = this.findAllRuleChildren(ctx, ZLangParser.RULE_expression);
    const blockCtx = this.findRuleChild(ctx, ZLangParser.RULE_block)!;

    return {
      type: "ForStatement",
      init: expressions[0]
        ? this.buildExpression(expressions[0])
        : { type: "NullLiteral", loc: loc(ctx) },
      test: expressions[1]
        ? this.buildExpression(expressions[1])
        : { type: "BooleanLiteral", value: true, loc: loc(ctx) },
      update: expressions[2]
        ? this.buildExpression(expressions[2])
        : { type: "NullLiteral", loc: loc(ctx) },
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  private buildReturnStatement(ctx: ParserRuleContext): ReturnStatement {
    const exprCtx = this.findRuleChild(ctx, ZLangParser.RULE_expression);
    return {
      type: "ReturnStatement",
      argument: exprCtx ? this.buildExpression(exprCtx) : undefined,
      loc: loc(ctx),
    };
  }

  private buildExpressionStatement(ctx: ParserRuleContext): ExpressionStatement {
    const exprCtx = this.findRuleChild(ctx, ZLangParser.RULE_expression)!;
    return {
      type: "ExpressionStatement",
      expression: this.buildExpression(exprCtx),
      loc: loc(ctx),
    };
  }

  private buildBlock(ctx: ParserRuleContext): BlockStatement {
    const stmts: Statement[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        const stmt = this.buildStatement(child);
        if (stmt) stmts.push(stmt);
      }
    }
    return {
      type: "BlockStatement",
      body: stmts,
      loc: loc(ctx),
    };
  }

  // -----------------------------------------------------------------------
  // Expressions
  // -----------------------------------------------------------------------

  buildExpression(ctx: ParserRuleContext): Expression {
    const ruleIndex = ctx.ruleIndex;

    if (ruleIndex === ZLangParser.RULE_expression) {
      const child = ctx.getChild(0);
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (ruleIndex === ZLangParser.RULE_assignmentExpression) {
      return this.buildAssignmentExpression(ctx);
    }

    if (
      ruleIndex === ZLangParser.RULE_logicalOrExpression ||
      ruleIndex === ZLangParser.RULE_logicalAndExpression ||
      ruleIndex === ZLangParser.RULE_equalityExpression ||
      ruleIndex === ZLangParser.RULE_relationalExpression ||
      ruleIndex === ZLangParser.RULE_additiveExpression ||
      ruleIndex === ZLangParser.RULE_multiplicativeExpression
    ) {
      return this.buildBinaryChain(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_unaryExpression) {
      return this.buildUnaryExpression(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_postfixExpression) {
      return this.buildPostfixExpression(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_primaryExpression) {
      return this.buildPrimaryExpression(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_arrayLiteral) {
      return this.buildArrayLiteral(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_objectLiteral) {
      return this.buildObjectLiteral(ctx);
    }

    if (ruleIndex === ZLangParser.RULE_arrowFunction) {
      return this.buildArrowFunction(ctx);
    }

    const child = ctx.getChild(0);
    if (child instanceof ParserRuleContext) {
      return this.buildExpression(child);
    }

    throw new ASTBuildError(
      `Cannot build expression from rule index ${ruleIndex}`,
      loc(ctx),
    );
  }

  private buildAssignmentExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (children.length === 3) {
      const leftCtx = children[0];
      const opToken = children[1];
      const rightCtx = children[2];

      if (leftCtx instanceof ParserRuleContext && rightCtx instanceof ParserRuleContext) {
        const left = this.buildExpression(leftCtx);
        const op = (opToken?.getText() ?? "=") as AssignmentOperator;
        const right = this.buildExpression(rightCtx);

        return {
          type: "AssignmentExpression",
          operator: op,
          target: left as Identifier | MemberExpression | IndexExpression,
          value: right,
          loc: loc(ctx),
        } as AssignmentExpression;
      }
    }

    const child = children[0];
    if (child instanceof ParserRuleContext) {
      return this.buildExpression(child);
    }

    throw new ASTBuildError("Invalid assignment expression", loc(ctx));
  }

  private buildBinaryChain(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    let left: Expression | null = null;
    let op: string | null = null;

    for (const child of children) {
      if (child instanceof ParserRuleContext) {
        const expr = this.buildExpression(child);
        if (left === null) {
          left = expr;
        } else {
          left = {
            type: "BinaryExpression",
            operator: (op ?? "+") as BinaryOperator,
            left,
            right: expr,
            loc: loc(ctx),
          };
          op = null;
        }
      } else {
        op = child.getText();
      }
    }

    return left!;
  }

  private buildUnaryExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (children.length === 2) {
      const opText = children[0]!.getText();
      const operandCtx = children[1];
      if (operandCtx instanceof ParserRuleContext) {
        return {
          type: "UnaryExpression",
          operator: (opText === "typeof" ? "!" : opText) as UnaryOperator,
          argument: this.buildExpression(operandCtx),
          loc: loc(ctx),
        };
      }
    }

    throw new ASTBuildError("Invalid unary expression", loc(ctx));
  }

  private buildPostfixExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 0) {
      throw new ASTBuildError("Empty postfix expression", loc(ctx));
    }

    const primaryCtx = children[0];
    if (!(primaryCtx instanceof ParserRuleContext)) {
      throw new ASTBuildError("Invalid postfix expression", loc(ctx));
    }

    let result: Expression = this.buildExpression(primaryCtx);

    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      if (child instanceof ParserRuleContext &&
          child.ruleIndex === ZLangParser.RULE_postfixOp) {
        result = this.applyPostfixOp(result, child);
      }
    }

    return result;
  }

  private applyPostfixOp(
    target: Expression,
    opCtx: ParserRuleContext,
  ): Expression {
    const children = opCtx.children ?? [];
    const firstText = children[0]?.getText() ?? "";

    if (firstText === ".") {
      const propToken = children[1];
      return {
        type: "MemberExpression",
        object: target,
        property: propToken?.getText() ?? "",
        loc: loc(opCtx),
      };
    }

    if (firstText === "[") {
      const indexCtx = children[1];
      if (indexCtx instanceof ParserRuleContext) {
        return {
          type: "IndexExpression",
          object: target,
          index: this.buildExpression(indexCtx),
          loc: loc(opCtx),
        };
      }
    }

    if (firstText === "(") {
      const args: CallArgument[] = [];
      const argListCtx = children[1];
      if (argListCtx instanceof ParserRuleContext &&
          argListCtx.ruleIndex === ZLangParser.RULE_argumentList) {
        for (const child of argListCtx.children ?? []) {
          if (child instanceof ParserRuleContext &&
              child.ruleIndex === ZLangParser.RULE_argument) {
            args.push(this.buildArgument(child));
          }
        }
      }
      return {
        type: "CallExpression",
        callee: target,
        arguments: args,
        loc: loc(opCtx),
      };
    }

    throw new ASTBuildError(`Unknown postfix op: ${firstText}`, loc(opCtx));
  }

  private buildPrimaryExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 0) {
      throw new ASTBuildError("Empty primary expression", loc(ctx));
    }

    const first = children[0]!;

    if (first instanceof ParserRuleContext) {
      return this.buildExpression(first);
    }

    const text = first.getText();
    const token = ctx.start!;

    if (ctx.getToken(ZLangParser.NUMBER, 0)) {
      return {
        type: "NumberLiteral",
        value: Number(text),
        raw: text,
        loc: tokenLoc(token),
      } as NumberLiteral;
    }

    if (ctx.getToken(ZLangParser.STRING, 0)) {
      return {
        type: "StringLiteral",
        value: text.slice(1, -1),
        raw: text,
        loc: tokenLoc(token),
      } as StringLiteral;
    }

    if (ctx.getToken(ZLangParser.TRUE, 0)) {
      return { type: "BooleanLiteral", value: true, loc: tokenLoc(token) } as BooleanLiteral;
    }

    if (ctx.getToken(ZLangParser.FALSE, 0)) {
      return { type: "BooleanLiteral", value: false, loc: tokenLoc(token) } as BooleanLiteral;
    }

    if (ctx.getToken(ZLangParser.NULL, 0)) {
      return { type: "NullLiteral", loc: tokenLoc(token) } as NullLiteral;
    }

    if (ctx.getToken(ZLangParser.IDENTIFIER, 0)) {
      return { type: "Identifier", name: text, loc: tokenLoc(token) } as Identifier;
    }

    if (text === "(") {
      const exprCtx = children[1];
      if (exprCtx instanceof ParserRuleContext) {
        return this.buildExpression(exprCtx);
      }
    }

    throw new ASTBuildError(`Unexpected primary expression: ${text}`, loc(ctx));
  }

  private buildArrayLiteral(ctx: ParserRuleContext): Expression {
    const elements: Expression[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        elements.push(this.buildExpression(child));
      }
    }
    return { type: "ArrayExpression", elements, loc: loc(ctx) };
  }

  private buildObjectLiteral(ctx: ParserRuleContext): Expression {
    const properties: Property[] = [];
    const propContexts = this.findAllRuleChildren(ctx, ZLangParser.RULE_property);

    for (const propCtx of propContexts) {
      const keyCtx = this.findRuleChild(propCtx, ZLangParser.RULE_propertyKey);
      const exprCtx = this.findRuleChild(propCtx, ZLangParser.RULE_expression);

      let key = keyCtx?.getText() ?? "";
      if (key.startsWith('"') || key.startsWith("'")) {
        key = key.slice(1, -1);
      }

      properties.push({
        key,
        value: exprCtx
          ? this.buildExpression(exprCtx)
          : { type: "NullLiteral", loc: loc(propCtx) },
        loc: loc(propCtx),
      });
    }

    return { type: "ObjectExpression", properties, loc: loc(ctx) };
  }

  private buildArrowFunction(ctx: ParserRuleContext): Expression {
    const paramListCtx = this.findRuleChild(ctx, ZLangParser.RULE_parameterList);
    const params = paramListCtx ? this.buildParameterList(paramListCtx) : [];

    const blockCtx = this.findRuleChild(ctx, ZLangParser.RULE_block);
    const exprCtx = this.findRuleChild(ctx, ZLangParser.RULE_expression);

    const body: Expression | BlockStatement = blockCtx
      ? this.buildBlock(blockCtx)
      : exprCtx
        ? this.buildExpression(exprCtx)
        : { type: "NullLiteral", loc: loc(ctx) };

    return {
      type: "ArrowFunctionExpression",
      params,
      body,
      loc: loc(ctx),
    };
  }

  // -----------------------------------------------------------------------
  // Arguments
  // -----------------------------------------------------------------------

  private buildArgument(ctx: ParserRuleContext): CallArgument {
    const children = ctx.children ?? [];

    if (children.length === 3) {
      const first = children[0]!;
      const secondText = children[1]?.getText();

      if (secondText === "=") {
        const exprCtx = children[2];
        if (!(exprCtx instanceof ParserRuleContext)) {
          throw new ASTBuildError("Invalid named argument value", loc(ctx));
        }

        const firstText = first.getText();
        let name: string;

        if (first instanceof ParserRuleContext) {
          name = firstText;
        } else if (firstText.startsWith('"') || firstText.startsWith("'")) {
          name = firstText.slice(1, -1);
        } else {
          name = firstText;
        }

        return {
          type: "NamedArgument",
          name,
          value: this.buildExpression(exprCtx),
          loc: loc(ctx),
        } as NamedArgument;
      }
    }

    const exprChild = children[0];
    if (exprChild instanceof ParserRuleContext) {
      return this.buildExpression(exprChild);
    }

    throw new ASTBuildError("Invalid argument", loc(ctx));
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private buildParameterList(ctx: ParserRuleContext): Parameter[] {
    const params: Parameter[] = [];
    const paramContexts = this.findAllRuleChildren(ctx, ZLangParser.RULE_parameter);

    for (const paramCtx of paramContexts) {
      const nameToken = paramCtx.getToken(ZLangParser.IDENTIFIER, 0);
      const typeAnno = this.findRuleChild(paramCtx, ZLangParser.RULE_typeAnnotation);
      params.push({
        name: nameToken?.getText() ?? "",
        typeAnnotation: typeAnno ? this.buildTypeAnnotation(typeAnno) : undefined,
        loc: loc(paramCtx),
      });
    }
    return params;
  }

  private buildTypeAnnotation(ctx: ParserRuleContext): TypeAnnotationNode {
    const baseCtx = this.findRuleChild(ctx, ZLangParser.RULE_baseType);
    const text = baseCtx?.getText() ?? ctx.getText();

    const hasBrackets = ctx.getToken(ZLangParser.LBRACKET, 0) !== null;

    let baseType: TypeAnnotationNode;
    switch (text) {
      case "number":
      case "string":
      case "boolean":
      case "void":
        baseType = { kind: text, loc: loc(ctx) };
        break;
      default:
        baseType = { kind: "custom", name: text, loc: loc(ctx) } as TypeAnnotationNode;
        break;
    }

    if (hasBrackets) {
      return { kind: "array", elementType: baseType, loc: loc(ctx) } as TypeAnnotationNode;
    }

    return baseType;
  }

  private findRuleChild(
    ctx: ParserRuleContext,
    ruleIndex: number,
  ): ParserRuleContext | null {
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext && child.ruleIndex === ruleIndex) {
        return child;
      }
    }
    return null;
  }

  private findAllRuleChildren(
    ctx: ParserRuleContext,
    ruleIndex: number,
  ): ParserRuleContext[] {
    const result: ParserRuleContext[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext && child.ruleIndex === ruleIndex) {
        result.push(child);
      }
    }
    return result;
  }
}
