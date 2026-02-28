import { ZValue } from "./base.js";

export class ZNumber extends ZValue {
  readonly value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  get kind(): string {
    return "number";
  }

  unbox(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  isTruthy(): boolean {
    return this.value !== 0;
  }

  toNumber(): number {
    return this.value;
  }
}
