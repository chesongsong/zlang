import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  BlockStatement,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  ExpressionStatement,
  AssignmentExpression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  IndexExpression,
  ArrayExpression,
  ObjectExpression,
  ArrowFunctionExpression,
  NamedArgument,
} from "@z-lang/types";
import { Environment } from "./environment.js";
import {
  type ZValue,
  type ZObject,
  type ZTable,
  type TableColumn,
  type ScopeResult,
  ReturnSignal,
  BreakSignal,
  ContinueSignal,
  isZObject,
  isCallable,
} from "./values.js";

const MAX_LOOP_ITERATIONS = 100_000;

export class Interpreter {
  executeProgram(program: Program): ScopeResult[] {
    const results: ScopeResult[] = [];
    for (let i = 0; i < program.body.length; i++) {
      try {
        const value = this.executeScopeBlock(program.body[i]!);
        results.push({ index: i, value });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ index: i, value: null, error: message });
      }
    }
    return results;
  }

  private executeScopeBlock(scope: ScopeBlock): ZValue {
    const env = new Environment();
    let lastValue: ZValue = null;
    for (const stmt of scope.body) {
      lastValue = this.executeStatement(stmt, env);
    }
    return lastValue;
  }

  private executeStatement(stmt: Statement, env: Environment): ZValue {
    switch (stmt.type) {
      case "VariableDeclaration":
        return this.executeVariableDeclaration(stmt, env);
      case "FunctionDeclaration":
        return this.executeFunctionDeclaration(stmt, env);
      case "ExpressionStatement":
        return this.executeExpressionStatement(stmt, env);
      case "IfStatement":
        return this.executeIfStatement(stmt, env);
      case "WhileStatement":
        return this.executeWhileStatement(stmt, env);
      case "ForStatement":
        return this.executeForStatement(stmt, env);
      case "ReturnStatement":
        return this.executeReturnStatement(stmt, env);
      case "BreakStatement":
        throw new BreakSignal();
      case "ContinueStatement":
        throw new ContinueSignal();
      case "BlockStatement":
        return this.executeBlock(stmt, env);
    }
  }

  private executeVariableDeclaration(
    stmt: VariableDeclaration,
    env: Environment,
  ): ZValue {
    const value = this.evaluate(stmt.init, env);
    env.define(stmt.name, value);
    return value;
  }

  private executeFunctionDeclaration(
    stmt: FunctionDeclaration,
    env: Environment,
  ): ZValue {
    const fn = {
      __kind: "function" as const,
      name: stmt.name,
      params: stmt.params.map((p) => p.name),
      body: stmt.body,
      closure: env,
    };
    env.define(stmt.name, fn);
    return fn;
  }

  private executeExpressionStatement(
    stmt: ExpressionStatement,
    env: Environment,
  ): ZValue {
    return this.evaluate(stmt.expression, env);
  }

  private executeIfStatement(stmt: IfStatement, env: Environment): ZValue {
    const test = this.evaluate(stmt.test, env);
    if (this.isTruthy(test)) {
      return this.executeBlock(stmt.consequent, env);
    }
    if (stmt.alternate) {
      if (stmt.alternate.type === "IfStatement") {
        return this.executeIfStatement(stmt.alternate, env);
      }
      return this.executeBlock(stmt.alternate, env);
    }
    return null;
  }

  private executeWhileStatement(
    stmt: WhileStatement,
    env: Environment,
  ): ZValue {
    let lastValue: ZValue = null;
    let iterations = 0;
    while (this.isTruthy(this.evaluate(stmt.test, env))) {
      if (++iterations > MAX_LOOP_ITERATIONS) {
        throw new Error("Maximum loop iterations exceeded");
      }
      try {
        lastValue = this.executeBlock(stmt.body, env);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        throw e;
      }
    }
    return lastValue;
  }

  private executeForStatement(stmt: ForStatement, env: Environment): ZValue {
    const forEnv = new Environment(env);
    this.evaluate(stmt.init, forEnv);
    let lastValue: ZValue = null;
    let iterations = 0;
    while (this.isTruthy(this.evaluate(stmt.test, forEnv))) {
      if (++iterations > MAX_LOOP_ITERATIONS) {
        throw new Error("Maximum loop iterations exceeded");
      }
      try {
        lastValue = this.executeBlockInEnv(stmt.body, forEnv);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {
          this.evaluate(stmt.update, forEnv);
          continue;
        }
        throw e;
      }
      this.evaluate(stmt.update, forEnv);
    }
    return lastValue;
  }

  private executeReturnStatement(
    stmt: ReturnStatement,
    env: Environment,
  ): never {
    const value = stmt.argument ? this.evaluate(stmt.argument, env) : null;
    throw new ReturnSignal(value);
  }

  private executeBlock(block: BlockStatement, parentEnv: Environment): ZValue {
    const env = new Environment(parentEnv);
    return this.executeBlockInEnv(block, env);
  }

  private executeBlockInEnv(block: BlockStatement, env: Environment): ZValue {
    let lastValue: ZValue = null;
    for (const stmt of block.body) {
      lastValue = this.executeStatement(stmt, env);
    }
    return lastValue;
  }

  // ---------------------------------------------------------------------------
  // Expression evaluation
  // ---------------------------------------------------------------------------

  evaluate(expr: Expression, env: Environment): ZValue {
    switch (expr.type) {
      case "NumberLiteral":
        return expr.value;
      case "StringLiteral":
        return expr.value;
      case "BooleanLiteral":
        return expr.value;
      case "NullLiteral":
        return null;
      case "Identifier":
        return env.get(expr.name);
      case "BinaryExpression":
        return this.evaluateBinary(expr, env);
      case "UnaryExpression":
        return this.evaluateUnary(expr, env);
      case "AssignmentExpression":
        return this.evaluateAssignment(expr, env);
      case "CallExpression":
        return this.evaluateCall(expr, env);
      case "MemberExpression":
        return this.evaluateMember(expr, env);
      case "IndexExpression":
        return this.evaluateIndex(expr, env);
      case "ArrayExpression":
        return this.evaluateArray(expr, env);
      case "ObjectExpression":
        return this.evaluateObject(expr, env);
      case "ArrowFunctionExpression":
        return this.evaluateArrowFunction(expr, env);
    }
  }

  private evaluateBinary(expr: BinaryExpression, env: Environment): ZValue {
    const left = this.evaluate(expr.left, env);
    const right = this.evaluate(expr.right, env);

    switch (expr.operator) {
      case "+":
        if (typeof left === "string" || typeof right === "string") {
          return String(left ?? "null") + String(right ?? "null");
        }
        return this.toNumber(left) + this.toNumber(right);
      case "-":
        return this.toNumber(left) - this.toNumber(right);
      case "*":
        return this.toNumber(left) * this.toNumber(right);
      case "/": {
        const r = this.toNumber(right);
        if (r === 0) throw new Error("Division by zero");
        return this.toNumber(left) / r;
      }
      case "%":
        return this.toNumber(left) % this.toNumber(right);
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return this.toNumber(left) < this.toNumber(right);
      case ">":
        return this.toNumber(left) > this.toNumber(right);
      case "<=":
        return this.toNumber(left) <= this.toNumber(right);
      case ">=":
        return this.toNumber(left) >= this.toNumber(right);
      case "&&":
        return this.isTruthy(left) ? right : left;
      case "||":
        return this.isTruthy(left) ? left : right;
    }
  }

  private evaluateUnary(expr: UnaryExpression, env: Environment): ZValue {
    const arg = this.evaluate(expr.argument, env);
    switch (expr.operator) {
      case "-":
        return -this.toNumber(arg);
      case "!":
        return !this.isTruthy(arg);
    }
  }

  private evaluateAssignment(
    expr: AssignmentExpression,
    env: Environment,
  ): ZValue {
    const value = this.evaluate(expr.value, env);

    if (expr.target.type === "Identifier") {
      const name = expr.target.name;
      switch (expr.operator) {
        case "=":
          if (env.has(name)) {
            env.set(name, value);
          } else {
            env.define(name, value);
          }
          return value;
        case "+=": {
          const cur = env.get(name);
          const result =
            typeof cur === "string" || typeof value === "string"
              ? String(cur ?? "null") + String(value ?? "null")
              : this.toNumber(cur) + this.toNumber(value);
          env.set(name, result);
          return result;
        }
        case "-=": {
          const cur = env.get(name);
          const result = this.toNumber(cur) - this.toNumber(value);
          env.set(name, result);
          return result;
        }
      }
    }

    if (expr.target.type === "MemberExpression") {
      const obj = this.evaluate(expr.target.object, env);
      if (isZObject(obj)) {
        const resolved = expr.operator === "=" ? value : this.applyCompoundOp(obj.entries[expr.target.property], value, expr.operator);
        obj.entries[expr.target.property] = resolved;
        return resolved;
      }
      throw new Error("Cannot set property on non-object");
    }

    if (expr.target.type === "IndexExpression") {
      const obj = this.evaluate(expr.target.object, env);
      const idx = this.evaluate(expr.target.index, env);
      if (Array.isArray(obj) && typeof idx === "number") {
        const resolved = expr.operator === "=" ? value : this.applyCompoundOp(obj[idx], value, expr.operator);
        obj[idx] = resolved;
        return resolved;
      }
      if (isZObject(obj) && typeof idx === "string") {
        const resolved = expr.operator === "=" ? value : this.applyCompoundOp(obj.entries[idx], value, expr.operator);
        obj.entries[idx] = resolved;
        return resolved;
      }
      throw new Error("Invalid index assignment target");
    }

    throw new Error("Invalid assignment target");
  }

  private applyCompoundOp(
    cur: ZValue | undefined,
    value: ZValue,
    op: string,
  ): ZValue {
    const current = cur ?? null;
    if (op === "+=") {
      if (typeof current === "string" || typeof value === "string") {
        return String(current ?? "null") + String(value ?? "null");
      }
      return this.toNumber(current) + this.toNumber(value);
    }
    if (op === "-=") {
      return this.toNumber(current) - this.toNumber(value);
    }
    return value;
  }

  private evaluateCall(expr: CallExpression, env: Environment): ZValue {
    if (expr.callee.type === "Identifier" && expr.callee.name === "rtable") {
      return this.evaluateRtable(expr, env);
    }

    const callee = this.evaluate(expr.callee, env);
    if (!isCallable(callee)) {
      throw new Error("Not a function");
    }

    const args = expr.arguments.map((a) => {
      if (a.type === "NamedArgument") return this.evaluate(a.value, env);
      return this.evaluate(a, env);
    });
    const callEnv = new Environment(callee.closure);
    for (let i = 0; i < callee.params.length; i++) {
      callEnv.define(callee.params[i]!, args[i] ?? null);
    }

    if (callee.__kind === "arrow" && callee.body.type !== "BlockStatement") {
      return this.evaluate(callee.body as Expression, callEnv);
    }

    try {
      const body = callee.__kind === "arrow"
        ? (callee.body as BlockStatement)
        : callee.body;
      let lastValue: ZValue = null;
      for (const stmt of body.body) {
        lastValue = this.executeStatement(stmt, callEnv);
      }
      return lastValue;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    }
  }

  private evaluateRtable(expr: CallExpression, env: Environment): ZValue {
    const allArgs = expr.arguments;
    if (allArgs.length < 1) {
      throw new Error("rtable requires at least 1 argument (data source)");
    }

    const firstArg = allArgs[0]!;
    if (firstArg.type === "NamedArgument") {
      throw new Error("rtable first argument must be a data source, not a named argument");
    }

    const recordsVal = this.evaluate(firstArg, env);
    if (!Array.isArray(recordsVal)) {
      throw new Error("rtable first argument must be an array");
    }

    const namedArgs: NamedArgument[] = [];
    for (let i = 1; i < allArgs.length; i++) {
      const arg = allArgs[i]!;
      if (arg.type !== "NamedArgument") {
        throw new Error("rtable column definitions must be named arguments (name = expression)");
      }
      namedArgs.push(arg);
    }

    const columns: TableColumn[] = namedArgs.map((na) => {
      const values: ZValue[] = recordsVal.map((record) => {
        const recordEnv = new Environment(env);

        if (isZObject(record)) {
          for (const [key, val] of Object.entries(record.entries)) {
            recordEnv.define(key, val);
          }
          recordEnv.define("自己", record);
        }

        return this.evaluate(na.value, recordEnv);
      });

      return { name: na.name, values };
    });

    return { __kind: "table", columns } as ZTable;
  }

  private evaluateMember(expr: MemberExpression, env: Environment): ZValue {
    const obj = this.evaluate(expr.object, env);
    if (isZObject(obj)) {
      return obj.entries[expr.property] ?? null;
    }
    if (Array.isArray(obj) && expr.property === "length") {
      return obj.length;
    }
    return null;
  }

  private evaluateIndex(expr: IndexExpression, env: Environment): ZValue {
    const obj = this.evaluate(expr.object, env);
    const idx = this.evaluate(expr.index, env);
    if (Array.isArray(obj) && typeof idx === "number") {
      return obj[idx] ?? null;
    }
    if (isZObject(obj) && typeof idx === "string") {
      return obj.entries[idx] ?? null;
    }
    return null;
  }

  private evaluateArray(expr: ArrayExpression, env: Environment): ZValue {
    return expr.elements.map((el) => this.evaluate(el, env));
  }

  private evaluateObject(expr: ObjectExpression, env: Environment): ZValue {
    const entries: Record<string, ZValue> = {};
    for (const prop of expr.properties) {
      entries[prop.key] = this.evaluate(prop.value, env);
    }
    return { __kind: "object", entries } as ZObject;
  }

  private evaluateArrowFunction(
    expr: ArrowFunctionExpression,
    env: Environment,
  ): ZValue {
    return {
      __kind: "arrow" as const,
      params: expr.params.map((p) => p.name),
      body: expr.body,
      closure: env,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private isTruthy(v: ZValue): boolean {
    if (v === null) return false;
    if (v === false) return false;
    if (v === 0) return false;
    if (v === "") return false;
    return true;
  }

  private toNumber(v: ZValue): number {
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "string") {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  }
}
