// Value domain
export { ZValue } from "./values/base.js";
export {
  ZNumber,
  ZString,
  ZBoolean,
  ZNull,
} from "./values/primitives.js";
export { ZArray, ZObject } from "./values/collections.js";
export {
  ZFunction,
  ZArrowFunction,
  isCallable,
} from "./values/callables.js";
export type { ZCallable } from "./values/callables.js";
export { ZTable } from "./values/table.js";
export type { TableColumn, RenderTable, RenderColumn } from "./values/table.js";
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
export { RtableBuiltin } from "./builtins/rtable.js";

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
