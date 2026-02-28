export { Interpreter } from "./interpreter.js";
export { Environment } from "./environment.js";
export {
  type ZValue,
  type ZObject,
  type ZFunction,
  type ZArrowFunction,
  type ZTable,
  type TableColumn,
  type ScopeResult,
  type MarkdownSegment,
  type ScopeSegment,
  type OutputSegment,
  formatValue,
  isZObject,
  isZFunction,
  isZArrowFunction,
  isZTable,
  isCallable,
} from "./values.js";

export {
  type RenderTable,
  type RenderColumn,
  box,
  unbox,
  unboxTable,
  format,
} from "./bridge.js";

import { Interpreter } from "./interpreter.js";
import type { Program } from "@z-lang/types";
import type { ScopeResult } from "./values.js";

export function execute(program: Program): ScopeResult[] {
  const interpreter = new Interpreter();
  return interpreter.executeProgram(program);
}
