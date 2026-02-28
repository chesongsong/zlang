// Value domain
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

// Signals
export { ReturnSignal, BreakSignal, ContinueSignal } from "./signals.js";

// Segments
export type {
  ScopeResult,
  MarkdownSegment,
  ScopeSegment,
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
import type { Program } from "@z-lang/types";
import type { ScopeResult } from "./segments.js";

export function execute(program: Program): ScopeResult[] {
  const interpreter = new Interpreter();
  return interpreter.executeProgram(program);
}
