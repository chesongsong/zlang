import type { ComponentRenderer, Disposable, CodeBlockData } from "@z-lang/render";

export class CodeBlockRenderer implements ComponentRenderer<CodeBlockData> {
  render(data: CodeBlockData, container: HTMLElement): Disposable {
    const wrapper = document.createElement("div");
    wrapper.className = "zlang-codeblock";

    const header = document.createElement("div");
    header.className = "codeblock-header";
    header.textContent = data.language;
    wrapper.appendChild(header);

    const pre = document.createElement("pre");
    pre.className = `codeblock-content language-${data.language}`;

    const code = document.createElement("code");
    code.textContent = data.content;
    pre.appendChild(code);

    wrapper.appendChild(pre);
    container.appendChild(wrapper);

    return { dispose: () => wrapper.remove() };
  }
}
