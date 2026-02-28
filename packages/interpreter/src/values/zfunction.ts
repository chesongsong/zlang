import type { BlockStatement } from "@z-lang/types";
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
