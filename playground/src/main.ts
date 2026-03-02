import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { run } from "@z-lang/core";
import { RenderEngine } from "@z-lang/render";
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

const renderEngine = new RenderEngine(new ElementComponentFactory());

const DEFAULT_CODE = `# z-lang Playground

欢迎使用 z-lang，支持混合 Markdown 和代码。

## 执行 z-lang 代码

使用空语言标记或 \`z-lang\` 标记的代码块会被执行：

\`\`\`z-lang
名字 = "World"
问候 = "Hello, " + 名字 + "!"
问候
\`\`\`

## 普通代码块（仅展示）

其他语言标记的代码块会保留原样展示：

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

## rtable 渲染表格

\`\`\`
records = [{ 姓名: "Alice", 年龄: 25 }, { 姓名: "Bob", 年龄: 30 }, { 姓名: "Charlie", 年龄: 28 }]
rtable(records, 姓名 = 自己.姓名, 年龄 = 自己.年龄)
\`\`\`

## 骨架屏演示

当 z-lang 代码块未闭合时，会显示骨架屏（模拟流式输出）：

\`\`\`z-lang
数据 = [1, 2, 3, 4, 5]
总和 = 0
// 模拟 AI 正在生成更多代码...
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
