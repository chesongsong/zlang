import type { BlockStatement, Expression } from "@z-lang/types";
import type { Environment } from "./environment.js";

export type ZValue =
  | number
  | string
  | boolean
  | null
  | ZValue[]
  | ZObject
  | ZFunction
  | ZArrowFunction;

export interface ZObject {
  readonly __kind: "object";
  readonly entries: Record<string, ZValue>;
}

export interface ZFunction {
  readonly __kind: "function";
  readonly name: string;
  readonly params: string[];
  readonly body: BlockStatement;
  readonly closure: Environment;
}

export interface ZArrowFunction {
  readonly __kind: "arrow";
  readonly params: string[];
  readonly body: Expression | BlockStatement;
  readonly closure: Environment;
}

export interface ScopeResult {
  readonly index: number;
  readonly value: ZValue;
  readonly error?: string;
}

export interface MarkdownSegment {
  readonly type: "markdown";
  readonly content: string;
}

export interface ScopeSegment {
  readonly type: "scope";
  readonly result: ScopeResult;
}

export type OutputSegment = MarkdownSegment | ScopeSegment;

export class ReturnSignal {
  constructor(public readonly value: ZValue) {}
}

export class BreakSignal {}
export class ContinueSignal {}

export function isZObject(v: ZValue): v is ZObject {
  return v !== null && typeof v === "object" && !Array.isArray(v) && "__kind" in v && v.__kind === "object";
}

export function isZFunction(v: ZValue): v is ZFunction {
  return v !== null && typeof v === "object" && !Array.isArray(v) && "__kind" in v && v.__kind === "function";
}

export function isZArrowFunction(v: ZValue): v is ZArrowFunction {
  return v !== null && typeof v === "object" && !Array.isArray(v) && "__kind" in v && v.__kind === "arrow";
}

export function isCallable(v: ZValue): v is ZFunction | ZArrowFunction {
  return isZFunction(v) || isZArrowFunction(v);
}

export function formatValue(v: ZValue): string {
  if (v === null) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    return `[${v.map(formatValue).join(", ")}]`;
  }
  if (isZFunction(v)) return `fn ${v.name}(${v.params.join(", ")})`;
  if (isZArrowFunction(v)) return `fn(${v.params.join(", ")}) => ...`;
  if (isZObject(v)) {
    const entries = Object.entries(v.entries);
    if (entries.length === 0) return "{}";
    const inner = entries.map(([k, val]) => `${k}: ${formatValue(val)}`).join(", ");
    return `{ ${inner} }`;
  }
  return String(v);
}
