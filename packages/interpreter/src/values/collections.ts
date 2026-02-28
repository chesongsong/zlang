import { ZValue } from "./base.js";
import { ZNull } from "./primitives.js";

export class ZArray extends ZValue {
  readonly elements: ZValue[];

  constructor(elements: ZValue[]) {
    super();
    this.elements = elements;
  }

  get kind(): string {
    return "array";
  }

  get length(): number {
    return this.elements.length;
  }

  get(index: number): ZValue {
    return this.elements[index] ?? ZNull.instance;
  }

  set(index: number, value: ZValue): void {
    this.elements[index] = value;
  }

  unbox(): unknown[] {
    return this.elements.map((e) => e.unbox());
  }

  toString(): string {
    return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
  }
}

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
