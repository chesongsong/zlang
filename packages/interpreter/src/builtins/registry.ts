import type { Expression, CallArgument } from "@z-lang/types";
import type { ZValue } from "../values/base.js";
import type { Environment } from "../environment.js";

export interface Evaluator {
  evaluate(expr: Expression, env: Environment): ZValue;
}

export interface BuiltinFunction {
  execute(
    args: readonly CallArgument[],
    env: Environment,
    evaluator: Evaluator,
  ): ZValue;
}

export class BuiltinRegistry {
  private readonly builtins = new Map<string, BuiltinFunction>();

  register(name: string, fn: BuiltinFunction): void {
    this.builtins.set(name, fn);
  }

  has(name: string): boolean {
    return this.builtins.has(name);
  }

  get(name: string): BuiltinFunction | undefined {
    return this.builtins.get(name);
  }
}
