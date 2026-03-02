import type { ComponentRenderer, Disposable } from "@z-lang/render";

export class MarkdownRenderer implements ComponentRenderer<string> {
  render(content: string, container: HTMLElement): Disposable {
    const block = document.createElement("div");
    block.className = "zlang-markdown";

    const lines = content.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i]!;
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
          codeLines.push(lines[i]!);
          i++;
        }
        i++;

        const wrapper = document.createElement("div");
        wrapper.className = "md-codeblock";

        if (lang) {
          const header = document.createElement("div");
          header.className = "md-codeblock-header";
          header.textContent = lang;
          wrapper.appendChild(header);
        }

        const pre = document.createElement("pre");
        pre.className = "md-codeblock-content";
        const code = document.createElement("code");
        code.textContent = codeLines.join("\n");
        pre.appendChild(code);
        wrapper.appendChild(pre);

        block.appendChild(wrapper);
        continue;
      }

      if (!trimmed) {
        block.appendChild(document.createElement("br"));
      } else if (trimmed.startsWith("### ")) {
        const el = document.createElement("h4");
        el.className = "md-h3";
        el.textContent = trimmed.slice(4);
        block.appendChild(el);
      } else if (trimmed.startsWith("## ")) {
        const el = document.createElement("h3");
        el.className = "md-h2";
        el.textContent = trimmed.slice(3);
        block.appendChild(el);
      } else if (trimmed.startsWith("# ")) {
        const el = document.createElement("h2");
        el.className = "md-h1";
        el.textContent = trimmed.slice(2);
        block.appendChild(el);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const el = document.createElement("div");
        el.className = "md-li";
        el.textContent = trimmed.slice(2);
        block.appendChild(el);
      } else {
        const el = document.createElement("p");
        el.className = "md-p";
        el.textContent = trimmed;
        block.appendChild(el);
      }

      i++;
    }

    container.appendChild(block);
    return { dispose: () => block.remove() };
  }
}
