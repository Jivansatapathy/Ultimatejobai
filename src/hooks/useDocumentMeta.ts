import { useEffect } from "react";

const DEFAULTS = {
  title: "Hizorex",
  description: "AI-powered platform for resume optimization, job matching, and career coaching",
  ogImage: "/ai_avatar.png",
  ogImageAlt: "Hizorex",
  ogType: "website",
};

interface DocumentMetaOptions {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets document.title + description/Open Graph/Twitter Card meta tags for
 * the current page, and restores the site-wide defaults on unmount — this is
 * an SPA, so <head> is shared across routes and would otherwise leak the
 * last-visited blog post's title/image onto whatever page comes next.
 *
 * This only helps crawlers that execute JS (Google does). Bots that read
 * static HTML only (most social-share unfurlers) will still see the
 * index.html defaults — that would need server-side rendering to fix, which
 * this app doesn't have. */
export function useDocumentMeta({ title, description, image, imageAlt, url, type }: DocumentMetaOptions) {
  useEffect(() => {
    if (!title) return;
    document.title = title;
    setMetaTag("name", "description", description || DEFAULTS.description);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description || DEFAULTS.description);
    setMetaTag("property", "og:type", type || DEFAULTS.ogType);
    setMetaTag("property", "og:image", image || DEFAULTS.ogImage);
    setMetaTag("property", "og:image:alt", imageAlt || DEFAULTS.ogImageAlt);
    if (url) setMetaTag("property", "og:url", url);
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description || DEFAULTS.description);
    setMetaTag("name", "twitter:image", image || DEFAULTS.ogImage);

    return () => {
      document.title = DEFAULTS.title;
      setMetaTag("name", "description", DEFAULTS.description);
      setMetaTag("property", "og:title", DEFAULTS.title);
      setMetaTag("property", "og:description", DEFAULTS.description);
      setMetaTag("property", "og:type", DEFAULTS.ogType);
      setMetaTag("property", "og:image", DEFAULTS.ogImage);
      setMetaTag("property", "og:image:alt", DEFAULTS.ogImageAlt);
      setMetaTag("name", "twitter:title", DEFAULTS.title);
      setMetaTag("name", "twitter:description", DEFAULTS.description);
      setMetaTag("name", "twitter:image", DEFAULTS.ogImage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, imageAlt, url, type]);
}
