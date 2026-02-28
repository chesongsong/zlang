import dayjs from "dayjs";
import type { Dayjs, ConfigType } from "dayjs";
import { ZValue } from "./base.js";

export class ZDate extends ZValue {
  readonly inner: Dayjs;

  constructor(value?: ConfigType) {
    super();
    this.inner = dayjs(value);
  }

  get kind(): string {
    return "date";
  }

  unbox(): Date {
    return this.inner.toDate();
  }

  toString(): string {
    return this.inner.format("YYYY-MM-DD HH:mm:ss");
  }

  format(template: string): string {
    return this.inner.format(template);
  }

  year(): number {
    return this.inner.year();
  }

  month(): number {
    return this.inner.month() + 1;
  }

  day(): number {
    return this.inner.date();
  }

  hour(): number {
    return this.inner.hour();
  }

  minute(): number {
    return this.inner.minute();
  }

  second(): number {
    return this.inner.second();
  }

  timestamp(): number {
    return this.inner.valueOf();
  }

  isTruthy(): boolean {
    return this.inner.isValid();
  }

  toNumber(): number {
    return this.inner.valueOf();
  }
}
