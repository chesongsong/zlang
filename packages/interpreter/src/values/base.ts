export abstract class ZValue {
  abstract get kind(): string;

  abstract unbox(): unknown;

  abstract toString(): string;

  isTruthy(): boolean {
    return true;
  }

  toNumber(): number {
    return 0;
  }
}
