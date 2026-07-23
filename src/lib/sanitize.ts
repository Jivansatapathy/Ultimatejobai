import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html || "", {
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "a", "span", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "id"],
  });
}

export function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Anchor-safe slug from rich-text HTML — strips tags first so leftover
 * href/tag fragments never leak into the id (they break TOC + scroll links). */
export function slugifyFromHtml(html: string): string {
  return slugifyText(stripHtml(html));
}
