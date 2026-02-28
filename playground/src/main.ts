import { parse, tokenize } from "@z-lang/core";
import type { ParseError } from "@z-lang/core";
import { EXAMPLES } from "./examples";
import { renderAST, renderTokens, renderErrors } from "./renderer";
import "./style.css";

const editor = document.getElementById("editor") as HTMLTextAreaElement;
const status = document.getElementById("status")!;
const select = document.getElementById("example-select") as HTMLSelectElement;
const runBtn = document.getElementById("run-btn")!;
const tabBtns = document.querySelectorAll<HTMLButtonElement>(".tab");
const tabAst = document.getElementById("tab-ast")!;
const tabTokens = document.getElementById("tab-tokens")!;
const tabErrors = document.getElementById("tab-errors")!;
const divider = document.getElementById("divider")!;

// --- Examples ---
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
    run();
  }
});

// --- Tabs ---
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-pane").forEach((p) => p.classList.remove("active"));
    const target = document.getElementById(`tab-${btn.dataset["tab"]!}`);
    target?.classList.add("active");
  });
});

// --- Run ---
function run() {
  const source = editor.value;
  const startTime = performance.now();

  try {
    const { ast, errors } = parse(source);
    const elapsed = (performance.now() - startTime).toFixed(1);

    let tokens: ReturnType<typeof tokenize> = [];
    try {
      tokens = tokenize(source);
    } catch {
      // tokenize may throw on lexer error; still show parse results
    }

    if (errors.length === 0) {
      status.textContent = `✓ Parsed in ${elapsed}ms`;
      status.className = "status ok";
    } else {
      status.textContent = `✗ ${errors.length} error(s)`;
      status.className = "status err";
    }

    tabAst.innerHTML = renderAST(ast);
    tabTokens.innerHTML = renderTokens(tokens);
    tabErrors.innerHTML = renderErrors(errors);

    const errTab = document.querySelector('.tab[data-tab="errors"]')!;
    if (errors.length > 0) {
      errTab.textContent = `Errors (${errors.length})`;
    } else {
      errTab.textContent = "Errors";
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    status.textContent = "✗ Fatal error";
    status.className = "status err";
    tabErrors.innerHTML = renderErrors([{ message }]);
    tabAst.innerHTML = "";
    tabTokens.innerHTML = "";
  }
}

runBtn.addEventListener("click", run);

editor.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    run();
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
  debounceTimer = setTimeout(run, 300);
});

// --- Resizable divider ---
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

// --- Init ---
editor.value = EXAMPLES[0]!.code;
editor.placeholder = "// 输入 z-lang 代码...";
run();
