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
} from "@z-lang/types";
import { Environment } from "./environment.js";
import { ZValue } from "./values/base.js";
import { ZNumber } from "./values/number.js";
import { ZString } from "./values/string.js";
import { ZBool } from "./values/bool.js";
import { ZNull } from "./values/null.js";
import { ZArray } from "./values/array.js";
import { ZObject } from "./values/object.js";
import { ZFunction } from "./values/function.js";
import { ReturnSignal, BreakSignal, ContinueSignal } from "./signals.js";
import type { ScopeResult } from "./segments.js";
import { BuiltinRegistry } from "./builtins/registry.js";
import type { BuiltinFunction, Evaluator } from "./builtins/registry.js";

const MAX_LOOP_ITERATIONS = 100_000;

export class Interpreter implements Evaluator {
  private readonly builtins: BuiltinRegistry;

  constructor(externalBuiltins?: Map<string, BuiltinFunction>) {
    this.builtins = new BuiltinRegistry();
    if (externalBuiltins) {
      for (const [name, fn] of externalBuiltins) {
        this.builtins.register(name, fn);
      }
    }
  }

  executeProgram(
    program: Program,
    globalEnv?: Environment,
  ): ScopeResult[] {
    const results: ScopeResult[] = [];
    for (let i = 0; i < program.body.length; i++) {
      try {
        const value = this.executeScopeBlock(program.body[i]!, globalEnv);
        results.push({ index: i, value });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ index: i, value: ZNull.instance, error: message });
      }
    }
    return results;
  }

  private executeScopeBlock(
    scope: ScopeBlock,
    parentEnv?: Environment,
  ): ZValue {
    const env = parentEnv ? new Environment(parentEnv) : new Environment();
    let lastValue: ZValue = ZNull.instance;
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
    const fn = new ZFunction(
      stmt.name,
      stmt.params.map((p) => p.name),
      stmt.body,
      env,
    );
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
    if (test.isTruthy()) {
      return this.executeBlock(stmt.consequent, env);
    }
    if (stmt.alternate) {
      if (stmt.alternate.type === "IfStatement") {
        return this.executeIfStatement(stmt.alternate, env);
      }
      return this.executeBlock(stmt.alternate, env);
    }
    return ZNull.instance;
  }

  private executeWhileStatement(
    stmt: WhileStatement,
    env: Environment,
  ): ZValue {
    let lastValue: ZValue = ZNull.instance;
    let iterations = 0;
    while (this.evaluate(stmt.test, env).isTruthy()) {
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
    let lastValue: ZValue = ZNull.instance;
    let iterations = 0;
    while (this.evaluate(stmt.test, forEnv).isTruthy()) {
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
    const value = stmt.argument
      ? this.evaluate(stmt.argument, env)
      : ZNull.instance;
    throw new ReturnSignal(value);
  }

  private executeBlock(block: BlockStatement, parentEnv: Environment): ZValue {
    const env = new Environment(parentEnv);
    return this.executeBlockInEnv(block, env);
  }

  private executeBlockInEnv(block: BlockStatement, env: Environment): ZValue {
    let lastValue: ZValue = ZNull.instance;
    for (const stmt of block.body) {
      lastValue = this.executeStatement(stmt, env);
    }
    return lastValue;
  }

  // -------------------------------------------------------------------------
  // Expression evaluation (implements Evaluator interface)
  // -------------------------------------------------------------------------

  evaluate(expr: Expression, env: Environment): ZValue {
    switch (expr.type) {
      case "NumberLiteral":
        return new ZNumber(expr.value);
      case "StringLiteral":
        return new ZString(expr.value);
      case "BooleanLiteral":
        return new ZBool(expr.value);
      case "NullLiteral":
        return ZNull.instance;
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
        if (left instanceof ZString || right instanceof ZString) {
          const l = left instanceof ZNull ? "null" : String(left.unbox());
          const r = right instanceof ZNull ? "null" : String(right.unbox());
          return new ZString(l + r);
        }
        return new ZNumber(left.toNumber() + right.toNumber());
      case "-":
        return new ZNumber(left.toNumber() - right.toNumber());
      case "*":
        return new ZNumber(left.toNumber() * right.toNumber());
      case "/": {
        const r = right.toNumber();
        if (r === 0) throw new Error("Division by zero");
        return new ZNumber(left.toNumber() / r);
      }
      case "%":
        return new ZNumber(left.toNumber() % right.toNumber());
      case "==":
        return new ZBool(this.isEqual(left, right));
      case "!=":
        return new ZBool(!this.isEqual(left, right));
      case "<":
        return new ZBool(left.toNumber() < right.toNumber());
      case ">":
        return new ZBool(left.toNumber() > right.toNumber());
      case "<=":
        return new ZBool(left.toNumber() <= right.toNumber());
      case ">=":
        return new ZBool(left.toNumber() >= right.toNumber());
      case "&&":
        return left.isTruthy() ? right : left;
      case "||":
        return left.isTruthy() ? left : right;
    }
  }

  private evaluateUnary(expr: UnaryExpression, env: Environment): ZValue {
    const arg = this.evaluate(expr.argument, env);
    switch (expr.operator) {
      case "-":
        return new ZNumber(-arg.toNumber());
      case "!":
        return new ZBool(!arg.isTruthy());
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
          const result = this.applyAdd(cur, value);
          env.set(name, result);
          return result;
        }
        case "-=": {
          const cur = env.get(name);
          const result = new ZNumber(cur.toNumber() - value.toNumber());
          env.set(name, result);
          return result;
        }
      }
    }

    if (expr.target.type === "MemberExpression") {
      const obj = this.evaluate(expr.target.object, env);
      if (obj instanceof ZObject) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(expr.target.property), value, expr.operator);
        obj.set(expr.target.property, resolved);
        return resolved;
      }
      throw new Error("Cannot set property on non-object");
    }

    if (expr.target.type === "IndexExpression") {
      const obj = this.evaluate(expr.target.object, env);
      const idx = this.evaluate(expr.target.index, env);
      if (obj instanceof ZArray && idx instanceof ZNumber) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(idx.value), value, expr.operator);
        obj.set(idx.value, resolved);
        return resolved;
      }
      if (obj instanceof ZObject && idx instanceof ZString) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(idx.value), value, expr.operator);
        obj.set(idx.value, resolved);
        return resolved;
      }
      throw new Error("Invalid index assignment target");
    }

    throw new Error("Invalid assignment target");
  }

  private applyCompoundOp(cur: ZValue, value: ZValue, op: string): ZValue {
    if (op === "+=") return this.applyAdd(cur, value);
    if (op === "-=") return new ZNumber(cur.toNumber() - value.toNumber());
    return value;
  }

  private applyAdd(left: ZValue, right: ZValue): ZValue {
    if (left instanceof ZString || right instanceof ZString) {
      const l = left instanceof ZNull ? "null" : String(left.unbox());
      const r = right instanceof ZNull ? "null" : String(right.unbox());
      return new ZString(l + r);
    }
    return new ZNumber(left.toNumber() + right.toNumber());
  }

  private evaluateCall(expr: CallExpression, env: Environment): ZValue {
    if (expr.callee.type === "Identifier") {
      const builtin = this.builtins.get(expr.callee.name);
      if (builtin) {
        return builtin.execute(expr.arguments, env, this);
      }
    }

    const callee = this.evaluate(expr.callee, env);
    if (!(callee instanceof ZFunction)) {
      throw new Error("Not a function");
    }

    const args = expr.arguments.map((a) => {
      if (a.type === "NamedArgument") return this.evaluate(a.value, env);
      return this.evaluate(a, env);
    });
    const callEnv = new Environment(callee.closure);
    for (let i = 0; i < callee.params.length; i++) {
      callEnv.define(callee.params[i]!, args[i] ?? ZNull.instance);
    }

    if (callee.isExpression) {
      return this.evaluate(callee.body as Expression, callEnv);
    }

    try {
      let lastValue: ZValue = ZNull.instance;
      for (const stmt of (callee.body as BlockStatement).body) {
        lastValue = this.executeStatement(stmt, callEnv);
      }
      return lastValue;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    }
  }

  private evaluateMember(expr: MemberExpression, env: Environment): ZValue {
    const obj = this.evaluate(expr.object, env);
    if (obj instanceof ZObject) {
      return obj.get(expr.property);
    }
    if (obj instanceof ZArray && expr.property === "length") {
      return new ZNumber(obj.length);
    }
    return ZNull.instance;
  }

  private evaluateIndex(expr: IndexExpression, env: Environment): ZValue {
    const obj = this.evaluate(expr.object, env);
    const idx = this.evaluate(expr.index, env);
    if (obj instanceof ZArray && idx instanceof ZNumber) {
      return obj.get(idx.value);
    }
    if (obj instanceof ZObject && idx instanceof ZString) {
      return obj.get(idx.value);
    }
    return ZNull.instance;
  }

  private evaluateArray(expr: ArrayExpression, env: Environment): ZValue {
    return new ZArray(expr.elements.map((el) => this.evaluate(el, env)));
  }

  private evaluateObject(expr: ObjectExpression, env: Environment): ZValue {
    const entries: Record<string, ZValue> = {};
    for (const prop of expr.properties) {
      entries[prop.key] = this.evaluate(prop.value, env);
    }
    return new ZObject(entries);
  }

  private evaluateArrowFunction(
    expr: ArrowFunctionExpression,
    env: Environment,
  ): ZValue {
    return new ZFunction(
      "<anonymous>",
      expr.params.map((p) => p.name),
      expr.body,
      env,
    );
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private isEqual(a: ZValue, b: ZValue): boolean {
    if (a instanceof ZNull && b instanceof ZNull) return true;
    if (a.kind !== b.kind) return false;
    return a.unbox() === b.unbox();
  }
}
