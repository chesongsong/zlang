import type { Node, Statement, Expression, Program } from "@z-lang/core";
import type { TokenInfo } from "@z-lang/core";

const COLLAPSED = new WeakSet<object>();

export function renderAST(ast: Program): string {
  return renderNode(ast, 0);
}

function renderNode(node: Record<string, unknown>, depth: number): string {
  const type = node["type"] as string | undefined;
  if (!type) return renderValue(node, depth);

  const id = `ast-${depth}-${Math.random().toString(36).slice(2, 8)}`;
  const expanded = !COLLAPSED.has(node);
  const cls = expanded ? "expanded" : "";

  let inner = "";
  for (const [key, val] of Object.entries(node)) {
    if (key === "type" || key === "loc") continue;
    inner += renderProp(key, val, depth + 1);
  }

  return `<div class="ast-node">
    <span class="ast-type ${cls}" data-id="${id}" onclick="this.classList.toggle('expanded');this.parentElement.querySelector('.ast-children').classList.toggle('expanded')">${escape(type)}</span>
    <div class="ast-children ${cls}">${inner}</div>
  </div>`;
}

function renderProp(key: string, val: unknown, depth: number): string {
  return `<div class="ast-prop">
    <span class="ast-key">${escape(key)}</span>: ${renderValue(val, depth)}
  </div>`;
}

function renderValue(val: unknown, depth: number): string {
  if (val === null || val === undefined) {
    return `<span class="ast-null">null</span>`;
  }
  if (typeof val === "string") {
    return `<span class="ast-string">"${escape(val)}"</span>`;
  }
  if (typeof val === "number") {
    return `<span class="ast-number">${val}</span>`;
  }
  if (typeof val === "boolean") {
    return `<span class="ast-boolean">${val}</span>`;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return `<span class="ast-null">[]</span>`;
    const items = val.map((item) => renderValue(item, depth + 1)).join("");
    return `<div class="ast-node">${items}</div>`;
  }
  if (typeof val === "object") {
    const record = val as Record<string, unknown>;
    if ("type" in record) {
      return renderNode(record, depth);
    }
    let inner = "";
    for (const [k, v] of Object.entries(record)) {
      if (k === "loc") continue;
      inner += renderProp(k, v, depth + 1);
    }
    return `<div class="ast-node">{${inner}}</div>`;
  }
  return `<span>${escape(String(val))}</span>`;
}

export function renderTokens(tokens: readonly TokenInfo[]): string {
  let html = `<table class="token-table">
    <thead><tr>
      <th>#</th>
      <th>Type</th>
      <th>Text</th>
      <th>Position</th>
    </tr></thead><tbody>`;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    html += `<tr>
      <td class="token-pos">${i}</td>
      <td><span class="token-type-badge">${t.type}</span></td>
      <td class="token-text">${escape(t.text)}</td>
      <td class="token-pos">${t.line}:${t.column}</td>
    </tr>`;
  }

  html += `</tbody></table>`;
  return html;
}

export function renderErrors(errors: readonly { message: string }[]): string {
  if (errors.length === 0) {
    return `<div class="error-empty">✓ No errors</div>`;
  }
  return errors
    .map((e) => `<div class="error-item">${escape(e.message)}</div>`)
    .join("");
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
