import { ZRenderable } from "./base.js";

export class ZRenderCustom extends ZRenderable {
  private readonly _kind: string;
  private readonly _data: unknown;

  constructor(kind: string, data: unknown) {
    super();
    this._kind = kind;
    this._data = data;
  }

  get kind(): string {
    return this._kind;
  }

  get renderData(): unknown {
    return this._data;
  }

  toString(): string {
    return `[${this._kind}]`;
  }
}
