import type { ScopeResult } from "@z-lang/core";
import { formatValue } from "@z-lang/core";

export function renderResults(
  results: readonly ScopeResult[],
  errors: readonly { message: string }[],
): string {
  let html = "";

  if (errors.length > 0) {
    html += `<div class="scope-errors">`;
    for (const e of errors) {
      html += `<div class="error-item">${escape(e.message)}</div>`;
    }
    html += `</div>`;
    return html;
  }

  if (results.length === 0) {
    return `<div class="scope-empty">没有可执行的 scope</div>`;
  }

  for (const result of results) {
    html += `<div class="scope-card${result.error ? " scope-error" : ""}">`;
    html += `<div class="scope-header">Scope ${result.index + 1}</div>`;
    if (result.error) {
      html += `<div class="scope-body scope-body-error">${escape(result.error)}</div>`;
    } else {
      const formatted = formatValue(result.value);
      const typeLabel = getTypeLabel(result.value);
      html += `<div class="scope-body">`;
      html += `<span class="scope-value">${escape(formatted)}</span>`;
      html += `<span class="scope-type">${typeLabel}</span>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  return html;
}

function getTypeLabel(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    if (v.__kind === "function") return "function";
    if (v.__kind === "arrow") return "arrow function";
    if (v.__kind === "object") return "object";
  }
  return typeof value;
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
