import { createApp, defineComponent, h } from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";
import type { ComponentRenderer, Disposable, RenderTable } from "@z-lang/render";

export class ElementTableRenderer implements ComponentRenderer<RenderTable> {
  render(value: RenderTable, container: HTMLElement): Disposable {
    const rowCount = value.columns[0]?.values.length ?? 0;
    const rows: Record<string, string>[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, string> = { _index: String(i + 1) };
      for (const col of value.columns) {
        row[col.name] = String(col.values[i] ?? "");
      }
      rows.push(row);
    }

    const columns = value.columns.map((col) => col.name);

    const TableWrapper = defineComponent({
      setup() {
        return () =>
          h(
            ElTable,
            {
              data: rows,
              stripe: true,
              border: true,
              size: "small",
              style: { width: "100%" },
            },
            () => [
              h(ElTableColumn, {
                type: "index",
                label: "#",
                width: 50,
              }),
              ...columns.map((name) =>
                h(ElTableColumn, {
                  prop: name,
                  label: name,
                  minWidth: 120,
                }),
              ),
            ],
          );
      },
    });

    const mountEl = document.createElement("div");
    container.appendChild(mountEl);

    const app = createApp(TableWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  }
}
