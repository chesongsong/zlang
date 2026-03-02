export type RawSegmentType = "markdown" | "zlang" | "codeblock" | "pending";

export interface RawSegment {
  readonly type: RawSegmentType;
  readonly content: string;
  readonly language?: string;
}

const ZLANG_LANGUAGES = new Set(["z-lang", "zlang", "z", ""]);

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
        const trimmed = part.trim();
        if (trimmed) {
          segments.push({ type: "markdown", content: trimmed });
        }
      } else {
        const isPending = isUnclosed && isLastPart;
        const parsed = this.parseCodeBlock(part, isPending);
        segments.push(parsed);
      }
    }

    return segments;
  }

  private parseCodeBlock(content: string, isPending: boolean): RawSegment {
    const firstNewline = content.indexOf("\n");

    if (firstNewline === -1) {
      return this.classifyCodeBlock("", content.trim(), isPending);
    }

    const firstLine = content.slice(0, firstNewline).trim();
    const codeContent = content.slice(firstNewline + 1);

    return this.classifyCodeBlock(firstLine, codeContent, isPending);
  }

  private classifyCodeBlock(
    langTag: string,
    content: string,
    isPending: boolean,
  ): RawSegment {
    const lang = langTag.toLowerCase();
    const isZlang = !lang || ZLANG_LANGUAGES.has(lang);

    if (isPending && isZlang) {
      return {
        type: "pending",
        language: langTag || "z-lang",
        content,
      };
    }

    if (isZlang) {
      return { type: "zlang", content };
    }

    if (isPending) {
      return {
        type: "codeblock",
        language: langTag || "text",
        content,
      };
    }

    return {
      type: "codeblock",
      language: langTag || "text",
      content,
    };
  }
}
