export type RawSegmentType = "markdown" | "zlang" | "pending";

export interface RawSegment {
  readonly type: RawSegmentType;
  readonly content: string;
  readonly language?: string;
}

const ZLANG_LANGUAGES = new Set(["z-lang", "zlang", "z"]);

export class SourceSplitter {
  split(source: string): RawSegment[] {
    const segments: RawSegment[] = [];
    const fence = "```";
    const parts = source.split(fence);
    const isUnclosed = parts.length % 2 === 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isLastPart = i === parts.length - 1;
      const isInsideCodeBlock = i % 2 === 1;

      if (!isInsideCodeBlock) {
        this.pushMarkdown(segments, part);
      } else {
        const isPending = isUnclosed && isLastPart;
        const classified = this.classifyCodeBlock(part, isPending);

        if (classified.type === "markdown") {
          this.pushMarkdown(segments, classified.content);
        } else {
          segments.push(classified);
        }
      }
    }

    return segments;
  }

  private pushMarkdown(segments: RawSegment[], content: string): void {
    const trimmed = content.trim();
    if (!trimmed) return;

    const last = segments[segments.length - 1];
    if (last?.type === "markdown") {
      segments[segments.length - 1] = {
        type: "markdown",
        content: last.content + "\n\n" + trimmed,
      };
    } else {
      segments.push({ type: "markdown", content: trimmed });
    }
  }

  private classifyCodeBlock(
    content: string,
    isPending: boolean,
  ): RawSegment {
    const firstNewline = content.indexOf("\n");
    const langTag = firstNewline === -1
      ? ""
      : content.slice(0, firstNewline).trim();
    const codeContent = firstNewline === -1
      ? content.trim()
      : content.slice(firstNewline + 1);

    const isZlang = ZLANG_LANGUAGES.has(langTag.toLowerCase());

    if (isPending && isZlang) {
      return { type: "pending", language: langTag, content: codeContent };
    }

    if (isZlang) {
      return { type: "zlang", content: codeContent };
    }

    const fenceTag = langTag ? "```" + langTag : "```";
    return {
      type: "markdown",
      content: fenceTag + "\n" + codeContent + "```",
    };
  }
}
