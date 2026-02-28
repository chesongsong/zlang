import type { BlockStatement, Expression } from "@z-lang/types";
import { ZValue } from "./base.js";
import type { Environment } from "../environment.js";

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
