import { run } from "@z-lang/core";
import { EXAMPLES } from "./examples";
import { renderSegments } from "./renderer";
import "./style.css";

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const status = document.getElementById("status")!;
const select = document.getElementById("example-select") as HTMLSelectElement;
const runBtn = document.getElementById("run-btn")!;
const output = document.getElementById("output-content")!;
const divider = document.getElementById("divider")!;

for (const ex of EXAMPLES) {
  const opt = document.createElement("option");
  opt.value = ex.name;
  opt.textContent = ex.name;
  select.appendChild(opt);
}

select.addEventListener("change", () => {
  const found = EXAMPLES.find((e) => e.name === select.value);
  if (found) {
    editor.value = found.code;
    execute();
  }
});

function execute() {
  const source = editor.value;
  const startTime = performance.now();

  try {
    const { segments, errors } = run(source);
    const elapsed = (performance.now() - startTime).toFixed(1);

    if (errors.length === 0) {
      status.textContent = `✓ ${elapsed}ms`;
      status.className = "status ok";
    } else {
      status.textContent = `✗ ${errors.length} error(s)`;
      status.className = "status err";
    }

    output.innerHTML = renderSegments(segments, errors);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    status.textContent = "✗ Fatal error";
    status.className = "status err";
    output.innerHTML = `<div class="error-item">${escape(message)}</div>`;
  }
}

runBtn.addEventListener("click", execute);

editor.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    execute();
  }
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
  }
});

let debounceTimer: ReturnType<typeof setTimeout>;
editor.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(execute, 300);
});

let isDragging = false;
divider.addEventListener("mousedown", (e) => {
  isDragging = true;
  divider.classList.add("dragging");
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const main = document.getElementById("main")!;
  const rect = main.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const clamped = Math.max(0.2, Math.min(0.8, ratio));
  const editorPanel = document.getElementById("editor-panel")!;
  const outputPanel = document.getElementById("output-panel")!;
  editorPanel.style.flex = `${clamped}`;
  outputPanel.style.flex = `${1 - clamped}`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  divider.classList.remove("dragging");
});

editor.value = EXAMPLES[0]!.code;
editor.placeholder = "// 输入 z-lang 代码...";
execute();

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
