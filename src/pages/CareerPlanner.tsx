import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Send, RotateCcw, Sparkles, TrendingUp,
    Loader2, ChevronRight, User, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getCareerAdvice } from "@/services/aiService";
import { useResume } from "@/hooks/useResume";

interface Message {
    role: "user" | "ai";
    content: string;
    ts: Date;
}

function cleanMarkdown(text: string): string {
    return text
        .replace(/#{1,6}\s*/g, "")           // ## headings
        .replace(/\*\*(.+?)\*\*/g, "$1")     // **bold**
        .replace(/\*(.+?)\*/g, "$1")         // *italic*
        .replace(/`(.+?)`/g, "$1")           // `code`
        .replace(/^[-*]\s+/gm, "• ")         // - bullets → •
        .replace(/^\d+\.\s+/gm, (m) => m)   // keep numbered lists
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")  // [link](url) → text
        .replace(/_{1,2}(.+?)_{1,2}/g, "$1") // _italic_ / __bold__
        .replace(/\n{3,}/g, "\n\n")          // collapse excess blank lines
        .trim();
}

const STARTER_PROMPTS = [
    "I want to move from Software Engineer to Engineering Manager in 18 months. Where do I start?",
    "I'm a mid-level designer. How do I position myself for a Head of Design role in 2 years?",
    "Help me build a 12-month plan to switch from finance into product management.",
    "What skills should I prioritize this year to become a Senior Data Scientist?",
    "I have two job offers — one at a startup, one at a big tech company. Help me think through this.",
];

export default function CareerPlanner() {
    const navigate = useNavigate();
    const { activeResume } = useResume();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const resumeContext = activeResume
        ? `User background — Name: ${activeResume.personalDetails?.fullName || "unknown"}, Target role: ${activeResume.targetJobRole || "not set"}, Experience: ${activeResume.experience?.map(e => `${e.role} at ${e.company}`).join("; ") || "none listed"}, Skills: ${activeResume.skills?.slice(0, 10).join(", ") || "none listed"}.`
        : "";

    const sendMessage = useCallback(async (text: string) => {
        const msg = text.trim();
        if (!msg || loading) return;

        const userMsg: Message = { role: "user", content: msg, ts: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        setStarted(true);

        try {
            // Build conversation history for context (last 6 exchanges)
            const history = messages.slice(-6)
                .map(m => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`)
                .join("\n\n");

            const offerText = [
                "You are an expert career strategist. The user wants direct career roadmap advice — NOT an interview.",
                "DO NOT ask questions back. Give a specific, structured response with:",
                "- A clear 12-24 month roadmap broken into phases",
                "- Concrete skills to build and actions to take",
                "- Realistic timelines and milestones",
                "- Any honest challenges to watch for",
                history ? `\nConversation so far:\n${history}` : "",
                `\nUser's question: ${msg}`,
            ].filter(Boolean).join("\n");

            const reply = await getCareerAdvice(offerText, resumeContext);
            setMessages(prev => [...prev, { role: "ai", content: reply, ts: new Date() }]);
        } catch {
            toast.error("Failed to get response. Try again.");
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [loading, messages, resumeContext]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const reset = () => {
        setMessages([]);
        setInput("");
        setStarted(false);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/ai-mentor")} className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2" data-tour="planner-header">
                        <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold leading-tight text-gray-900">Career Strategic Planner</p>
                            <p className="text-[11px] text-gray-400">AI-powered 12–24 month planning</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {activeResume && (
                        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            Resume loaded
                        </span>
                    )}
                    {started && (
                        <button
                            onClick={reset}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> New session
                        </button>
                    )}
                </div>
            </header>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto">
                {!started ? (
                    /* Landing / prompt picker */
                    <div className="max-w-2xl mx-auto px-6 py-12">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 mb-6">
                                <Sparkles className="h-3 w-3" /> AI Career Advisor
                            </div>
                            <h1 className="text-3xl font-black tracking-tight mb-3 text-gray-900">
                                Plan your next career move
                            </h1>
                            <p className="text-gray-500 mb-10 leading-relaxed">
                                Have a real strategic conversation with your AI career advisor. Get a concrete 12–24 month roadmap tailored to your goals, skills, and current situation.
                            </p>

                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                                Start with a question, or pick one below
                            </p>

                            <div className="space-y-2 mb-10" data-tour="planner-prompts">
                                {STARTER_PROMPTS.map((p, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        onClick={() => sendMessage(p)}
                                        disabled={loading}
                                        className="w-full text-left flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:border-teal-400 hover:text-gray-900 transition-all group shadow-sm"
                                    >
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600 shrink-0 transition-colors" />
                                        {p}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* Messages */
                    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                >
                                    {/* Avatar */}
                                    <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                        msg.role === "ai"
                                            ? "bg-teal-50 border border-teal-200"
                                            : "bg-gray-100 border border-gray-200"
                                    }`}>
                                        {msg.role === "ai"
                                            ? <Bot className="h-4 w-4 text-teal-600" />
                                            : <User className="h-4 w-4 text-gray-500" />
                                        }
                                    </div>

                                    {/* Bubble */}
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-teal-500 text-white rounded-tr-md"
                                            : "bg-gray-50 border border-gray-200 text-gray-700 rounded-tl-md"
                                    }`}>
                                        {msg.role === "ai" ? (
                                            <div className="whitespace-pre-wrap">{cleanMarkdown(msg.content)}</div>
                                        ) : (
                                            msg.content
                                        )}
                                        <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-white/50 text-right" : "text-gray-400"}`}>
                                            {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing indicator */}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-teal-600" />
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3">
                                    <div className="flex gap-1 items-center h-5">
                                        {[0, 1, 2].map(i => (
                                            <span
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-teal-500/60 animate-bounce"
                                                style={{ animationDelay: `${i * 0.18}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4" data-tour="planner-input">
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={started ? "Ask a follow-up question…" : "Type your career question…"}
                            className="flex-1 resize-none bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl min-h-[52px] max-h-[140px] text-sm focus:border-teal-400 focus:ring-teal-500/20"
                            rows={1}
                            disabled={loading}
                        />
                        <Button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || loading}
                            className="h-[52px] w-[52px] shrink-0 bg-teal-500 hover:bg-teal-600 rounded-xl"
                        >
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Send className="h-4 w-4" />
                            }
                        </Button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Enter to send · Shift+Enter for new line · Your resume is used as context
                    </p>
                </div>
            </div>
        </div>
    );
}
