import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { TocItem } from "./extractHeadings";

interface BlogTocProps {
  items: TocItem[];
  title?: string;
  className?: string;
}

export function BlogToc({ items, title = "Table of Contents", className = "" }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav
      className={`p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 ${className}`}
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <List className="h-4 w-4 text-blue-600" />
        <span>{title}</span>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const indentClass =
            item.level === 3 ? "pl-4 text-xs" : item.level === 4 ? "pl-7 text-xs" : "";
          return (
            <li key={item.id} className={indentClass}>
              <button
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className={`text-left block w-full transition-colors leading-snug py-1 border-l-2 pl-3 ${
                  isActive
                    ? "border-blue-600 font-semibold text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300"
                }`}
              >
                {item.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
