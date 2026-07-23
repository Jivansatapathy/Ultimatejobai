import { ContentBlock } from "./blockTypes";
import { slugifyText } from "@/lib/sanitize";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2, 3, 4
}

function collectHeadingsFromHtml(html: string): { level: number; text: string }[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("h2, h3, h4"))
    .map((node) => ({ level: Number(node.tagName[1]), text: (node.textContent || "").trim() }))
    .filter((h) => h.text);
}

/** Table-of-contents entries from the post body — walks rich_text blocks (or
 * the legacy single-HTML-blob body when there are no blocks yet) looking for
 * h2/h3/h4 elements. Ids are assigned here and must be attached to the actual
 * rendered DOM afterward (see BlogPost.tsx) since a single rich_text block's
 * HTML can contain multiple headings — there's no per-block id to hang off. */
export function extractHeadings(blocks: ContentBlock[] | undefined, legacyContent?: string): TocItem[] {
  const raw: { level: number; text: string }[] = [];

  if (blocks && blocks.length > 0) {
    for (const block of blocks) {
      if (block.type === "rich_text") {
        raw.push(...collectHeadingsFromHtml(block.html));
      }
    }
  } else if (legacyContent) {
    raw.push(...collectHeadingsFromHtml(legacyContent));
  }

  const seen = new Map<string, number>();
  return raw.map(({ level, text }) => {
    let id = slugifyText(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    return { id, text, level };
  });
}
