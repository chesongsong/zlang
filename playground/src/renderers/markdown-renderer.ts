import type { ComponentRenderer, Disposable } from "@z-lang/render";

export class MarkdownRenderer implements ComponentRenderer<string> {
  render(content: string, container: HTMLElement): Disposable {
    const block = document.createElement("div");
    block.className = "zlang-markdown";

    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        block.appendChild(document.createElement("br"));
        continue;
      }

      if (trimmed.startsWith("### ")) {
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
    }

    container.appendChild(block);
    return { dispose: () => block.remove() };
  }
}
