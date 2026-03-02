import { defineComponent } from "@z-lang/core";

interface TlinkData {
  readonly text: string;
  readonly url: string;
}

export const tlink = defineComponent<TlinkData>("tlink", {
  setup: (args) => ({
    text: args[0] as string,
    url: args[1] as string,
  }),

  render(data, container) {
    const link = document.createElement("a");
    link.href = data.url;
    link.textContent = data.text;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "zlang-tlink";
    container.appendChild(link);

    return { dispose: () => link.remove() };
  },
});
