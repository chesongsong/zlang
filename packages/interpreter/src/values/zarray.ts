import { ZValue } from "./base.js";
import { ZNull } from "./znull.js";

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
