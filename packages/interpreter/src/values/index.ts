export { ZValue } from "./base.js";
export { ZNumber } from "./znumber.js";
export { ZString } from "./zstring.js";
export { ZBoolean } from "./zboolean.js";
export { ZNull } from "./znull.js";
export { ZArray } from "./zarray.js";
export { ZObject } from "./zobject.js";
export { ZFunction } from "./zfunction.js";
export { ZArrowFunction } from "./zarrow-function.js";
export { ZTable } from "./ztable.js";
export type { TableColumn, RenderTable, RenderColumn } from "./ztable.js";

import { ZValue } from "./base.js";
import { ZNumber } from "./znumber.js";
import { ZString } from "./zstring.js";
import { ZBoolean } from "./zboolean.js";
import { ZNull } from "./znull.js";
import { ZArray } from "./zarray.js";
import { ZObject } from "./zobject.js";
import { ZFunction } from "./zfunction.js";
import { ZArrowFunction } from "./zarrow-function.js";

export type ZCallable = ZFunction | ZArrowFunction;

export function isCallable(v: ZValue): v is ZCallable {
  return v instanceof ZFunction || v instanceof ZArrowFunction;
}

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
