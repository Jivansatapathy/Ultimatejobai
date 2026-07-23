import { useState } from "react";
import {
  ContentBlock,
  FaqItem,
  CalloutStyle,
  ImageFitMode,
} from "./blockTypes";
import { CKEditorComponent } from "./CKEditorComponent";
import { adminUploadImage } from "@/services/blogService";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Quote as QuoteIcon,
  Code as CodeIcon,
  Upload,
} from "lucide-react";

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const generateId = () => "block-" + Math.random().toString(36).substring(2, 9);

  const addBlock = (type: ContentBlock["type"]) => {
    let newBlock: ContentBlock;
    const id = generateId();

    switch (type) {
      case "rich_text":
        newBlock = { id, type: "rich_text", html: "<p>Write text here...</p>" };
        break;
      case "faq":
        newBlock = {
          id,
          type: "faq",
          title: "Frequently Asked Questions",
          items: [{ question: "Sample Question?", answer: "Sample Answer" }],
        };
        break;
      case "image":
        newBlock = { id, type: "image", url: "", caption: "", alt: "", image_fit: "fill" };
        break;
      case "video":
        newBlock = { id, type: "video", url: "", caption: "" };
        break;
      case "callout":
        newBlock = { id, type: "callout", text: "Important notice...", style: "info" };
        break;
      case "quote":
        newBlock = { id, type: "quote", text: "Quote text...", author: "" };
        break;
      case "code":
        newBlock = { id, type: "code", code: "// code here", language: "javascript" };
        break;
      case "toc":
        newBlock = { id, type: "toc", title: "Table of Contents" };
        break;
      default:
        return;
    }

    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updated: ContentBlock) => {
    onChange(blocks.map((b) => (b.id === id ? updated : b)));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    onChange(newBlocks);
  };

  const handleImageFileUpload = async (blockId: string, file: File) => {
    try {
      setUploadingBlockId(blockId);
      const url = await adminUploadImage(file);
      const target = blocks.find((b) => b.id === blockId);
      if (target && target.type === "image") {
        updateBlock(blockId, { ...target, url });
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingBlockId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 w-full mb-1">
          Add Content Block
        </span>
        <button
          type="button"
          onClick={() => addBlock("rich_text")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition"
        >
          <FileText className="h-3.5 w-3.5 text-blue-600" /> Rich Text
        </button>
        <button
          type="button"
          onClick={() => addBlock("faq")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 transition"
        >
          <HelpCircle className="h-3.5 w-3.5 text-purple-600" /> FAQ Accordion
        </button>
        <button
          type="button"
          onClick={() => addBlock("image")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 transition"
        >
          <ImageIcon className="h-3.5 w-3.5 text-emerald-600" /> Image
        </button>
        <button
          type="button"
          onClick={() => addBlock("callout")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition"
        >
          <MessageSquare className="h-3.5 w-3.5 text-amber-600" /> Callout
        </button>
        <button
          type="button"
          onClick={() => addBlock("quote")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:border-sky-300 transition"
        >
          <QuoteIcon className="h-3.5 w-3.5 text-sky-600" /> Quote
        </button>
        <button
          type="button"
          onClick={() => addBlock("video")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 transition"
        >
          <VideoIcon className="h-3.5 w-3.5 text-red-600" /> Video
        </button>
        <button
          type="button"
          onClick={() => addBlock("code")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 transition"
        >
          <CodeIcon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" /> Code Block
        </button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 shadow-sm p-4 md:p-5 relative space-y-4"
          >
            {/* Block Controls Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded px-1.5 py-0.5 text-[10px]">
                  #{idx + 1}
                </span>
                {block.type.replace("_", " ")} Block
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveBlock(idx, "up")}
                  className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === blocks.length - 1}
                  onClick={() => moveBlock(idx, "down")}
                  className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Block Body Editor */}
            {block.type === "rich_text" && (
              <CKEditorComponent
                value={block.html}
                onChange={(html) => updateBlock(block.id, { ...block, html })}
              />
            )}

            {block.type === "image" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={block.url}
                      onChange={(e) => updateBlock(block.id, { ...block, url: e.target.value })}
                      placeholder="https://example.com/image.png"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Or Upload Image
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 transition">
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span>{uploadingBlockId === block.id ? "Uploading..." : "Choose File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(block.id, file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      value={block.caption || ""}
                      onChange={(e) => updateBlock(block.id, { ...block, caption: e.target.value })}
                      placeholder="Photo description"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Image Fit Display
                    </label>
                    <select
                      value={block.image_fit || "fill"}
                      onChange={(e) =>
                        updateBlock(block.id, { ...block, image_fit: e.target.value as ImageFitMode })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      <option value="fill">Fill Width (Cover)</option>
                      <option value="fit">Fit Container (Contain)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {block.type === "faq" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    FAQ Section Title
                  </label>
                  <input
                    type="text"
                    value={block.title || ""}
                    onChange={(e) => updateBlock(block.id, { ...block, title: e.target.value })}
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>

                <div className="space-y-3">
                  {block.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Q#{itemIdx + 1}</span>
                        {block.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = block.items.filter((_, i) => i !== itemIdx);
                              updateBlock(block.id, { ...block, items: newItems });
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove Question
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[itemIdx].question = e.target.value;
                          updateBlock(block.id, { ...block, items: newItems });
                        }}
                        placeholder="Question text"
                        className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[itemIdx].answer = e.target.value;
                          updateBlock(block.id, { ...block, items: newItems });
                        }}
                        placeholder="Answer text"
                        className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      updateBlock(block.id, {
                        ...block,
                        items: [...block.items, { question: "", answer: "" }],
                      });
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Question & Answer
                  </button>
                </div>
              </div>
            )}

            {block.type === "callout" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Callout Style
                  </label>
                  <select
                    value={block.style || "info"}
                    onChange={(e) =>
                      updateBlock(block.id, { ...block, style: e.target.value as CalloutStyle })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                    <option value="tip">Tip (Purple)</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Text
                  </label>
                  <textarea
                    rows={2}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { ...block, text: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            {block.type === "quote" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Quote Content
                  </label>
                  <textarea
                    rows={2}
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { ...block, text: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Author / Citation
                  </label>
                  <input
                    type="text"
                    value={block.author || ""}
                    onChange={(e) => updateBlock(block.id, { ...block, author: e.target.value })}
                    placeholder="Steve Jobs"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            {block.type === "video" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Embed Video URL (YouTube / Vimeo embed)
                  </label>
                  <input
                    type="url"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { ...block, url: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(block.id, { ...block, caption: e.target.value })}
                    placeholder="Video description"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            {block.type === "code" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={block.language || ""}
                    onChange={(e) => updateBlock(block.id, { ...block, language: e.target.value })}
                    placeholder="python / javascript / html"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Code Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={block.code}
                    onChange={(e) => updateBlock(block.id, { ...block, code: e.target.value })}
                    className="w-full p-3 font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-950 text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
