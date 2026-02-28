import type { ZValue } from "./values/base.js";

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
