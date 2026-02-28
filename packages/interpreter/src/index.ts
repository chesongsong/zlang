export { Interpreter } from "./interpreter.js";
export { Environment } from "./environment.js";
export {
  type ZValue,
  type ZObject,
  type ZFunction,
  type ZArrowFunction,
  type ScopeResult,
  formatValue,
  isZObject,
  isZFunction,
  isZArrowFunction,
  isCallable,
} from "./values.js";

import { Interpreter } from "./interpreter.js";
import type { Program } from "@z-lang/types";
import type { ScopeResult } from "./values.js";

export function execute(program: Program): ScopeResult[] {
  const interpreter = new Interpreter();
  return interpreter.executeProgram(program);
}
