import { ZValue } from "./base.js";

export class ZString extends ZValue {
  readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  get kind(): string {
    return "string";
  }

  unbox(): string {
    return this.value;
  }

  toString(): string {
    return `"${this.value}"`;
  }

  isTruthy(): boolean {
    return this.value !== "";
  }

  toNumber(): number {
    const n = Number(this.value);
    return isNaN(n) ? 0 : n;
  }
}
