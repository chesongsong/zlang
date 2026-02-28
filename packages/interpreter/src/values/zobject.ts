import { ZValue } from "./base.js";
import { ZNull } from "./znull.js";

export class ZObject extends ZValue {
  readonly entries: Record<string, ZValue>;

  constructor(entries: Record<string, ZValue>) {
    super();
    this.entries = entries;
  }

  get kind(): string {
    return "object";
  }

  get(key: string): ZValue {
    return this.entries[key] ?? ZNull.instance;
  }

  set(key: string, value: ZValue): void {
    this.entries[key] = value;
  }

  has(key: string): boolean {
    return key in this.entries;
  }

  unbox(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(this.entries)) {
      result[k] = v.unbox();
    }
    return result;
  }

  toString(): string {
    const entries = Object.entries(this.entries);
    if (entries.length === 0) return "{}";
    const inner = entries
      .map(([k, v]) => `${k}: ${v.toString()}`)
      .join(", ");
    return `{ ${inner} }`;
  }
}
