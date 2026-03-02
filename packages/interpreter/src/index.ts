// Value domain — basic types
export { ZValue } from "./values/base.js";
export { ZNumber } from "./values/number.js";
export { ZString } from "./values/string.js";
export { ZBool } from "./values/bool.js";
export { ZNull } from "./values/null.js";
export { ZArray } from "./values/array.js";
export { ZObject } from "./values/object.js";
export { ZFunction } from "./values/function.js";
export { ZDate } from "./values/date.js";
export { box } from "./values/index.js";

// Renderables — UI-renderable value types
export { ZRenderable } from "./renderables/base.js";
export { ZRenderCustom } from "./renderables/custom.js";

// Signals
export { ReturnSignal, BreakSignal, ContinueSignal } from "./signals.js";

// Segments
export type {
  ScopeResult,
  MarkdownSegment,
  ScopeSegment,
  CodeBlockSegment,
  PendingSegment,
  OutputSegment,
} from "./segments.js";

// Environment
export { Environment } from "./environment.js";

// Builtins
export { BuiltinRegistry } from "./builtins/registry.js";
export type { BuiltinFunction, Evaluator } from "./builtins/registry.js";

// Interpreter
export { Interpreter } from "./interpreter.js";

// Convenience entry point
import { Interpreter } from "./interpreter.js";
import { Environment } from "./environment.js";
import { box } from "./values/index.js";
import type { BuiltinFunction } from "./builtins/registry.js";
import type { Program } from "@z-lang/types";
import type { ScopeResult } from "./segments.js";

export interface ExecuteOptions {
  readonly variables?: Record<string, unknown>;
  readonly builtins?: Map<string, BuiltinFunction>;
}

export function execute(
  program: Program,
  options?: ExecuteOptions,
): ScopeResult[] {
  const interpreter = new Interpreter(options?.builtins);

  let globalEnv: Environment | undefined;
  if (options?.variables) {
    globalEnv = new Environment();
    for (const [name, value] of Object.entries(options.variables)) {
      globalEnv.define(name, box(value));
    }
  }

  return interpreter.executeProgram(program, globalEnv);
}
