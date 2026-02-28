import type { ZValue, ZTable } from "./values.js";
import {
  isZObject,
  isZFunction,
  isZArrowFunction,
  isZTable,
} from "./values.js";

/**
 * Unboxed table — pure JS structure, no z-lang internals.
 * This is what renderers and external consumers should work with.
 */
export interface RenderTable {
  readonly columns: readonly RenderColumn[];
}

export interface RenderColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

// ---------------------------------------------------------------------------
// box: JS -> ZValue  (external data entering z-lang)
// ---------------------------------------------------------------------------

export function box(value: unknown): ZValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.map(box);
  }

  if (typeof value === "object") {
    const entries: Record<string, ZValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      entries[k] = box(v);
    }
    return { __kind: "object" as const, entries };
  }

  return String(value);
}

// ---------------------------------------------------------------------------
// unbox: ZValue -> JS  (z-lang data leaving to external world)
// ---------------------------------------------------------------------------

export function unbox(value: ZValue): unknown {
  if (value === null) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.map(unbox);
  }

  if (isZTable(value)) {
    return unboxTable(value);
  }

  if (isZObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value.entries)) {
      result[k] = unbox(v);
    }
    return result;
  }

  if (isZFunction(value)) {
    return `[Function: ${value.name}]`;
  }

  if (isZArrowFunction(value)) {
    return `[Function: anonymous]`;
  }

  return value;
}

// ---------------------------------------------------------------------------
// unboxTable: ZTable -> RenderTable  (dedicated table conversion)
// ---------------------------------------------------------------------------

export function unboxTable(table: ZTable): RenderTable {
  return {
    columns: table.columns.map((col) => ({
      name: col.name,
      values: col.values.map(unbox),
    })),
  };
}

// ---------------------------------------------------------------------------
// format: ZValue -> display string  (for human-readable output)
// ---------------------------------------------------------------------------

export function format(value: ZValue): string {
  const jsVal = unbox(value);
  return formatJS(jsVal);
}

function formatJS(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return `[${value.map(formatJS).join(", ")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const inner = entries
      .map(([k, v]) => `${k}: ${formatJS(v)}`)
      .join(", ");
    return `{ ${inner} }`;
  }

  return String(value);
}
