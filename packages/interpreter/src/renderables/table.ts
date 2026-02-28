import type { ZValue } from "../values/base.js";
import { ZRenderable } from "./base.js";

export interface TableColumn {
  readonly name: string;
  readonly values: readonly ZValue[];
}

export interface RenderTableData {
  readonly columns: readonly RenderTableColumn[];
}

export interface RenderTableColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

export class ZRenderTable extends ZRenderable {
  readonly columns: readonly TableColumn[];

  constructor(columns: readonly TableColumn[]) {
    super();
    this.columns = columns;
  }

  get kind(): string {
    return "rtable";
  }

  get renderData(): RenderTableData {
    return {
      columns: this.columns.map((col) => ({
        name: col.name,
        values: col.values.map((v) => v.unbox()),
      })),
    };
  }

  toString(): string {
    const cols = this.columns.length;
    const rows = this.columns[0]?.values.length ?? 0;
    return `[Table: ${cols} columns, ${rows} rows]`;
  }
}
