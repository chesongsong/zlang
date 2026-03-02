import type { ComponentRenderer, Disposable, PendingData } from "@z-lang/render";

export class PendingRenderer implements ComponentRenderer<PendingData> {
  render(data: PendingData, container: HTMLElement): Disposable {
    const wrapper = document.createElement("div");
    wrapper.className = "zlang-pending";

    const header = document.createElement("div");
    header.className = "pending-header";

    const indicator = document.createElement("span");
    indicator.className = "pending-indicator";
    header.appendChild(indicator);

    const label = document.createElement("span");
    label.className = "pending-label";
    label.textContent = `${data.language} 执行中...`;
    header.appendChild(label);

    wrapper.appendChild(header);

    const skeleton = document.createElement("div");
    skeleton.className = "pending-skeleton";

    for (let i = 0; i < 3; i++) {
      const line = document.createElement("div");
      line.className = "skeleton-line";
      line.style.width = `${60 + Math.random() * 30}%`;
      line.style.animationDelay = `${i * 0.15}s`;
      skeleton.appendChild(line);
    }

    wrapper.appendChild(skeleton);
    container.appendChild(wrapper);
    return { dispose: () => wrapper.remove() };
  }
}
