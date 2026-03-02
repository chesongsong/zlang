import { createApp, defineComponent, h } from "vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import type { ComponentRenderer, Disposable } from "@z-lang/render";

export interface ButtonData {
  readonly text: string;
  readonly type?: "primary" | "success" | "warning" | "danger" | "info";
  readonly size?: "large" | "default" | "small";
  readonly onClick?: string;
}

export class ButtonRenderer implements ComponentRenderer<ButtonData> {
  render(data: ButtonData, container: HTMLElement): Disposable {
    const ButtonWrapper = defineComponent({
      setup() {
        const handleClick = () => {
          if (data.onClick) {
            alert(data.onClick);
          }
        };

        return () =>
          h(
            ElButton,
            {
              type: data.type ?? "primary",
              size: data.size ?? "default",
              onClick: handleClick,
            },
            () => data.text,
          );
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "4px 0";
    container.appendChild(mountEl);

    const app = createApp(ButtonWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  }
}
