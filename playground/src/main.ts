import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { run } from "@z-lang/core";
import { EXAMPLES } from "./examples";
import { renderSegments } from "./renderer";
import { registerZLang, createZLangTheme, ZLANG_ID } from "./monaco-lang";
import "./style.css";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

registerZLang();
createZLangTheme();

const editorContainer = document.getElementById("editor")!;
const status = document.getElementById("status")!;
const select = document.getElementById("example-select") as HTMLSelectElement;
const runBtn = document.getElementById("run-btn")!;
const output = document.getElementById("output-content")!;
const divider = document.getElementById("divider")!;

const editor = monaco.editor.create(editorContainer, {
  value: EXAMPLES[0]!.code,
  language: ZLANG_ID,
  theme: "zlang-dark",
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily:
    '"SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  wordWrap: "on",
  contextmenu: true,
  suggest: { showKeywords: true },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
});

for (const ex of EXAMPLES) {
  const opt = document.createElement("option");
  opt.value = ex.name;
  opt.textContent = ex.name;
  select.appendChild(opt);
}

select.addEventListener("change", () => {
  const found = EXAMPLES.find((e) => e.name === select.value);
  if (found) {
    editor.setValue(found.code);
    execute();
  }
});

function execute() {
  const source = editor.getValue();
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
    output.innerHTML = `<div class="error-item">${escapeHtml(message)}</div>`;
  }
}

runBtn.addEventListener("click", execute);

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
  execute();
});

let debounceTimer: ReturnType<typeof setTimeout>;
editor.onDidChangeModelContent(() => {
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

execute();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
