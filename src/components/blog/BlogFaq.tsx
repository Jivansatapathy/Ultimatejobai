import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqItem } from "./blockTypes";

interface BlogFaqProps {
  items: FaqItem[];
  title?: string;
}

export function BlogFaq({ items, title = "Frequently Asked Questions" }: BlogFaqProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  if (!items || items.length === 0) return null;

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Build Schema.org FAQPage JSON-LD object
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="my-10 rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-6 md:p-8 border border-gray-200 dark:border-gray-800">
      {/* Inject Schema.org FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left font-semibold text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 md:px-5 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/50 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
