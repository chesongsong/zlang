import type { ComponentRenderer, Disposable } from "@z-lang/render";

export interface TlinkData {
  readonly text: string;
  readonly url: string;
}

export class TlinkRenderer implements ComponentRenderer<TlinkData> {
  render(data: TlinkData, container: HTMLElement): Disposable {
    const link = document.createElement("a");
    link.href = data.url;
    link.textContent = data.text;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "zlang-tlink";
    container.appendChild(link);

    return { dispose: () => link.remove() };
  }
}
