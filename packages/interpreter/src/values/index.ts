export { ZValue } from "./base.js";
export { ZNumber, ZString, ZBoolean, ZNull } from "./primitives.js";
export { ZArray, ZObject } from "./collections.js";
export { ZFunction, ZArrowFunction, isCallable } from "./callables.js";
export type { ZCallable } from "./callables.js";
export { ZTable } from "./table.js";
export type { TableColumn, RenderTable, RenderColumn } from "./table.js";

import { ZValue } from "./base.js";
import { ZNumber, ZString, ZBoolean, ZNull } from "./primitives.js";
import { ZArray } from "./collections.js";
import { ZObject } from "./collections.js";

export function box(value: unknown): ZValue {
  if (value === null || value === undefined) return ZNull.instance;
  if (typeof value === "number") return new ZNumber(value);
  if (typeof value === "string") return new ZString(value);
  if (typeof value === "boolean") return new ZBoolean(value);

  if (Array.isArray(value)) {
    return new ZArray(value.map(box));
  }

  if (typeof value === "object") {
    const entries: Record<string, ZValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      entries[k] = box(v);
    }
    return new ZObject(entries);
  }

  return new ZString(String(value));
}
