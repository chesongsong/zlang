import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { run } from "@z-lang/core";
import { RenderEngine } from "@z-lang/render";
import type { ComponentFactory } from "@z-lang/render";
import { HtmlComponentFactory } from "./renderers/html-factory";
import { ElementComponentFactory } from "./renderers/element-factory";
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
const output = document.getElementById("output-content")!;
const divider = document.getElementById("divider")!;

const factories: Record<string, ComponentFactory> = {
  html: new HtmlComponentFactory(),
  element: new ElementComponentFactory(),
};

let currentRendererKey = "html";
const renderEngine = new RenderEngine(factories[currentRendererKey]!);

const DEFAULT_CODE = `# z-lang Playground

在下方编写 z-lang 代码，右上角可切换渲染器：

\`\`\`
变量A = 9999
records = [{ 变量A: 1, 名字: "Alice" }, { 变量A: 2, 名字: "Bob" }, { 变量A: 3, 名字: "Charlie" }]
TB = rtable(records, 输出1 = 变量A, 名字 = 自己.名字)
\`\`\`

上面的代码会渲染一个表格，试试切换到 Element Plus 看看效果。
`;

const editor = monaco.editor.create(editorContainer, {
  value: DEFAULT_CODE,
  language: ZLANG_ID,
  theme: "zlang-light",
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

function execute() {
  const source = editor.getValue();

  try {
    const { segments, errors } = run(source);
    renderEngine.renderSegments(segments, errors, output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    output.innerHTML = "";
    const errDiv = document.createElement("div");
    errDiv.className = "render-error-item";
    errDiv.textContent = message;
    output.appendChild(errDiv);
  }
}

function switchRenderer(key: string) {
  if (key === currentRendererKey) return;

  const factory = factories[key];
  if (!factory) return;

  currentRendererKey = key;
  renderEngine.setFactory(factory);

  const buttons = document.querySelectorAll<HTMLButtonElement>(".toggle-btn");
  for (const btn of buttons) {
    btn.classList.toggle("active", btn.dataset.renderer === key);
  }

  execute();
}

const toggleButtons = document.querySelectorAll<HTMLButtonElement>(".toggle-btn");
for (const btn of toggleButtons) {
  btn.addEventListener("click", () => {
    const key = btn.dataset.renderer;
    if (key) switchRenderer(key);
  });
}

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
