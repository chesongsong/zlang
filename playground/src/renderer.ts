import type { OutputSegment } from "@z-lang/core";
import { formatValue } from "@z-lang/core";

export function renderSegments(
  segments: readonly OutputSegment[],
  errors: readonly { message: string }[],
): string {
  let html = "";

  if (errors.length > 0) {
    html += `<div class="scope-errors">`;
    for (const e of errors) {
      html += `<div class="error-item">${escape(e.message)}</div>`;
    }
    html += `</div>`;
  }

  if (segments.length === 0 && errors.length === 0) {
    return `<div class="scope-empty">没有可执行的内容</div>`;
  }

  for (const segment of segments) {
    if (segment.type === "markdown") {
      html += renderMarkdown(segment.content);
    } else {
      const result = segment.result;
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
  }

  return html;
}

function renderMarkdown(content: string): string {
  const lines = content.split("\n");
  let html = `<div class="md-block">`;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      html += `<br/>`;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      html += `<h4 class="md-h3">${escape(trimmed.slice(4))}</h4>`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h3 class="md-h2">${escape(trimmed.slice(3))}</h3>`;
    } else if (trimmed.startsWith("# ")) {
      html += `<h2 class="md-h1">${escape(trimmed.slice(2))}</h2>`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      html += `<div class="md-li">${escape(trimmed.slice(2))}</div>`;
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, "");
      html += `<div class="md-li">${escape(trimmed.split(". ")[0]!)}. ${escape(text)}</div>`;
    } else {
      html += `<p class="md-p">${escape(trimmed)}</p>`;
    }
  }

  html += `</div>`;
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
