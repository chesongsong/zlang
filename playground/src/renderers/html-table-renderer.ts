import type { ComponentRenderer, Disposable, RenderTable } from "@z-lang/render";

export class HtmlTableRenderer implements ComponentRenderer<RenderTable> {
  render(value: RenderTable, container: HTMLElement): Disposable {
    const table = document.createElement("table");
    table.className = "zlang-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const thIndex = document.createElement("th");
    thIndex.className = "zlang-table-index";
    headerRow.appendChild(thIndex);

    for (const col of value.columns) {
      const th = document.createElement("th");
      th.textContent = col.name;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const rowCount = value.columns[0]?.values.length ?? 0;

    for (let i = 0; i < rowCount; i++) {
      const tr = document.createElement("tr");

      const tdIndex = document.createElement("td");
      tdIndex.className = "zlang-table-index";
      tdIndex.textContent = String(i + 1);
      tr.appendChild(tdIndex);

      for (const col of value.columns) {
        const td = document.createElement("td");
        td.textContent = String(col.values[i] ?? "");
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    container.appendChild(table);
    return { dispose: () => table.remove() };
  }
}
