export { ZValue } from "./base.js";
export { ZNumber } from "./number.js";
export { ZString } from "./string.js";
export { ZBool } from "./bool.js";
export { ZNull } from "./null.js";
export { ZArray } from "./array.js";
export { ZObject } from "./object.js";
export { ZFunction } from "./function.js";
export { ZDate } from "./date.js";

import { ZValue } from "./base.js";
import { ZNumber } from "./number.js";
import { ZString } from "./string.js";
import { ZBool } from "./bool.js";
import { ZNull } from "./null.js";
import { ZArray } from "./array.js";
import { ZObject } from "./object.js";
import { ZDate } from "./date.js";

export function box(value: unknown): ZValue {
  if (value === null || value === undefined) return ZNull.instance;
  if (typeof value === "number") return new ZNumber(value);
  if (typeof value === "string") return new ZString(value);
  if (typeof value === "boolean") return new ZBool(value);
  if (value instanceof Date) return new ZDate(value);

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
