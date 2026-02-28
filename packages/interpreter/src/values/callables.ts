import type { BlockStatement, Expression } from "@z-lang/types";
import { ZValue } from "./base.js";
import type { Environment } from "../environment.js";

export class ZFunction extends ZValue {
  readonly name: string;
  readonly params: string[];
  readonly body: BlockStatement;
  readonly closure: Environment;

  constructor(
    name: string,
    params: string[],
    body: BlockStatement,
    closure: Environment,
  ) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
    this.closure = closure;
  }

  get kind(): string {
    return "function";
  }

  unbox(): string {
    return `[Function: ${this.name}]`;
  }

  toString(): string {
    return `fn ${this.name}(${this.params.join(", ")})`;
  }
}

export class ZArrowFunction extends ZValue {
  readonly params: string[];
  readonly body: Expression | BlockStatement;
  readonly closure: Environment;

  constructor(
    params: string[],
    body: Expression | BlockStatement,
    closure: Environment,
  ) {
    super();
    this.params = params;
    this.body = body;
    this.closure = closure;
  }

  get kind(): string {
    return "arrow";
  }

  unbox(): string {
    return "[Function: anonymous]";
  }

  toString(): string {
    return `fn(${this.params.join(", ")}) => ...`;
  }
}

export type ZCallable = ZFunction | ZArrowFunction;

export function isCallable(v: ZValue): v is ZCallable {
  return v instanceof ZFunction || v instanceof ZArrowFunction;
}
