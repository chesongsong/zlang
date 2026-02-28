// Value domain
export { ZValue } from "./values/base.js";
export { ZNumber } from "./values/znumber.js";
export { ZString } from "./values/zstring.js";
export { ZBoolean } from "./values/zboolean.js";
export { ZNull } from "./values/znull.js";
export { ZArray } from "./values/zarray.js";
export { ZObject } from "./values/zobject.js";
export { ZFunction } from "./values/zfunction.js";
export { ZArrowFunction } from "./values/zarrow-function.js";
export { isCallable } from "./values/index.js";
export type { ZCallable } from "./values/index.js";
export { ZTable } from "./values/ztable.js";
export type { TableColumn, RenderTable, RenderColumn } from "./values/ztable.js";
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
