import { ContentBlock, Heading } from "./blockTypes";
import { slugifyFromHtml, stripHtml } from "@/lib/sanitize";

interface ComputedHeading extends Heading {
  blockIndex: number;
}

/** Single source of truth for heading anchor ids — both the on-page anchors
 * (BlockRenderer) and the sidebar TOC read from this same pass, so they can
 * never drift out of sync with each other. Slugifying happens on plain text
 * (not raw HTML), otherwise a heading containing a link leaves stray
 * href/tag fragments in the id. */
function computeHeadings(blocks: ContentBlock[]): ComputedHeading[] {
  const seen = new Map<string, number>();
  const headings: ComputedHeading[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.type !== "heading") return;
    const text = stripHtml(block.html);
    if (!text) return;

    let id = slugifyFromHtml(block.html) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    headings.push({ level: block.level, text, id, blockIndex });
  });

  return headings;
}

/** Heading list for the sidebar table of contents. */
export function extractHeadings(blocks: ContentBlock[]): Heading[] {
  return computeHeadings(blocks).map(({ level, text, id }) => ({ level, text, id }));
}

/** Anchor id for each block index (undefined for non-heading / empty-text blocks) —
 * what BlockRenderer uses so its ids always match the TOC above. */
export function computeAnchorIdsByBlockIndex(blocks: ContentBlock[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const h of computeHeadings(blocks)) {
    map.set(h.blockIndex, h.id);
  }
  return map;
}
