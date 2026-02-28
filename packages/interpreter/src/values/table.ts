import { ZValue } from "./base.js";

export interface TableColumn {
  readonly name: string;
  readonly values: readonly ZValue[];
}

export interface RenderTable {
  readonly columns: readonly RenderColumn[];
}

export interface RenderColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

export class ZTable extends ZValue {
  readonly columns: readonly TableColumn[];

  constructor(columns: readonly TableColumn[]) {
    super();
    this.columns = columns;
  }

  get kind(): string {
    return "table";
  }

  unbox(): RenderTable {
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
