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

const jsData = {
  用户列表: [
    { 姓名: "张三", 部门: "工程部", 薪资: 25000 },
    { 姓名: "李四", 部门: "设计部", 薪资: 22000 },
    { 姓名: "王五", 部门: "产品部", 薪资: 28000 },
    { 姓名: "赵六", 部门: "工程部", 薪资: 30000 },
  ],
  公司名: "Z-Lang 科技",
};

const DEFAULT_CODE = `# z-lang Playground

欢迎使用 z-lang，只有标记 \`z-lang\` 的代码块会被执行。

## 执行 z-lang 代码

\`\`\`z-lang
名字 = "World"
问候 = "Hello, " + 名字 + "!"
问候
\`\`\`

## 普通代码块（Markdown 渲染）

没有 \`z-lang\` 标记的代码块按 Markdown 原样展示：

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## JS 注入变量 → z-lang 渲染

以下变量由 JS 注入：\`公司名\`、\`用户列表\`

\`\`\`z-lang
标题 = 公司名 + " - 员工花名册"
标题
\`\`\`

自动推断所有列：

\`\`\`z-lang
rtable(用户列表)
\`\`\`

选择部分列：

\`\`\`z-lang
rtable(用户列表, 姓名, 薪资)
\`\`\`
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
    const { segments, errors } = run(source, { variables: jsData });
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
