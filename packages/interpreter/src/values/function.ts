import type { BlockStatement, Expression } from "@z-lang/types";
import { ZValue } from "./base.js";
import type { Environment } from "../environment.js";

export class ZFunction extends ZValue {
  readonly name: string;
  readonly params: string[];
  readonly body: Expression | BlockStatement;
  readonly closure: Environment;

  constructor(
    name: string,
    params: string[],
    body: Expression | BlockStatement,
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

  get isExpression(): boolean {
    return this.body.type !== "BlockStatement";
  }

  unbox(): string {
    return `[Function: ${this.name}]`;
  }

  toString(): string {
    return `fn ${this.name}(${this.params.join(", ")})`;
  }
}
