import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Send, RotateCcw, TrendingUp, DollarSign,
    CheckCircle2, AlertCircle, Loader2, ChevronRight, Mic, MicOff,
    Star, Trophy, Target, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/interview-api";
import type { Message } from "@/lib/interview-api";

// ─── Scenario setup ────────────────────────────────────────────────────────────
interface Scenario {
    id: string;
    title: string;
    company: string;
    role: string;
    offered: string;
    target: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    context: string;
    tips: string[];
}

const SCENARIOS: Scenario[] = [
    {
        id: "entry",
        title: "First Job Offer",
        company: "TechCorp Inc.",
        role: "Junior Software Engineer",
        offered: "$72,000",
        target: "$82,000",
        difficulty: "Beginner",
        context: "You just received your first job offer. The salary is $72k but the market rate for this role is $80–85k. This is your first negotiation — keep it professional and confident.",
        tips: ["Research market rates beforehand", "Express enthusiasm first", "Counter with a specific number"],
    },
    {
        id: "promo",
        title: "Promotion Negotiation",
        company: "Current Employer",
        role: "Senior Developer → Lead Engineer",
        offered: "$5,000 raise",
        target: "$15,000 raise",
        difficulty: "Intermediate",
        context: "Your manager offered a $5k raise with your promotion to Lead Engineer. Your new responsibilities doubled. You've delivered 3 major projects this year.",
        tips: ["Anchor to your impact metrics", "Compare to market lead engineer salaries", "Don't accept on the spot"],
    },
    {
        id: "exec",
        title: "Executive Counteroffer",
        company: "Global Finance Co.",
        role: "VP of Engineering",
        offered: "$180,000",
        target: "$220,000 + equity",
        difficulty: "Advanced",
        context: "You have a competing offer at $200k. This company wants you badly. Negotiate total comp: base, bonus, equity, and benefits. High stakes, senior audience.",
        tips: ["Negotiate total comp, not just base", "Use the competing offer as leverage", "Ask for equity vesting schedule"],
    },
];

// ─── Scoring logic ──────────────────────────────────────────────────────────────
interface ScoreBreakdown {
    confidence: number;
    strategy: number;
    communication: number;
    outcome: number;
    overall: number;
}

function estimateScore(messages: Message[]): ScoreBreakdown {
    const userMessages = messages.filter(m => m.role === "candidate").map(m => m.content.toLowerCase());
    const full = userMessages.join(" ");

    const confidence = Math.min(100,
        50 +
        (full.includes("i believe") || full.includes("i'm confident") ? 15 : 0) +
        (/\$[\d,]+/.test(full) ? 20 : 0) +
        (full.includes("research") || full.includes("market") ? 15 : 0)
    );

    const strategy = Math.min(100,
        40 +
        (full.includes("competing") || full.includes("other offer") ? 20 : 0) +
        (full.includes("value") || full.includes("contributed") || full.includes("delivered") ? 20 : 0) +
        (full.includes("flexible") || full.includes("package") || full.includes("equity") ? 20 : 0)
    );

    const communication = Math.min(100,
        50 +
        (userMessages.length >= 3 ? 15 : 0) +
        (userMessages.some(m => m.length > 80) ? 20 : 0) +
        (!full.includes("sorry") && !full.includes("just") ? 15 : 0)
    );

    const outcome = Math.min(100,
        40 +
        (full.includes("agree") || full.includes("accept") ? -10 : 0) +
        (/\$[\d,]+/.test(full) ? 30 : 0) +
        (full.includes("thank") ? 10 : 0) +
        (userMessages.length >= 4 ? 20 : 0)
    );

    return {
        confidence,
        strategy,
        communication,
        outcome,
        overall: Math.round((confidence + strategy + communication + outcome) / 4),
    };
}

// ─── Component ─────────────────────────────────────────────────────────────────
type Stage = "pick" | "brief" | "chat" | "result";

export default function SalaryNegotiator() {
    const navigate = useNavigate();
    const [stage, setStage] = useState<Stage>("pick");
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [score, setScore] = useState<ScoreBreakdown | null>(null);
    const [validation, setValidation] = useState<{ ok: boolean | null; hint: string }>({ ok: null, hint: "" });
    const bottomRef = useRef<HTMLDivElement>(null);
    const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const startSession = useCallback(async (sc: Scenario) => {
        setLoading(true);
        try {
            const context = `SALARY NEGOTIATION SCENARIO:\n${sc.context}\n\nOffered: ${sc.offered} | Target: ${sc.target}\nRole: ${sc.role} at ${sc.company}\n\nYou are the hiring manager / employer. Roleplay this salary negotiation. Be realistic — push back but be open to reasonable counters. Keep responses concise (2–3 sentences max). Start by presenting the offer.`;
            const res = await api.startInterview("salary_negotiation", context);
            setSessionId(res.session_id);
            setMessages([{ role: "interviewer", content: res.interviewer_message, timestamp: new Date() }]);
            setStage("chat");
        } catch {
            toast.error("Failed to start session. Check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSend = useCallback(async () => {
        if (!input.trim() || !sessionId || loading || finished) return;
        const userMsg: Message = { role: "candidate", content: input.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setValidation({ ok: null, hint: "" });
        setLoading(true);

        try {
            const res = await api.sendMessage(sessionId, userMsg.content);
            setMessages(prev => [...prev, { role: "interviewer", content: res.interviewer_message, timestamp: new Date() }]);
            if (res.is_finished) {
                setFinished(true);
                const fb = await api.getFeedback(sessionId);
                setFeedback(fb.feedback);
                setScore(estimateScore([...messages, userMsg]));
                setStage("result");
            }
        } catch {
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }, [input, sessionId, loading, finished, messages]);

    const handleInputChange = useCallback((val: string) => {
        setInput(val);
        if (!sessionId || val.length < 10) { setValidation({ ok: null, hint: "" }); return; }
        if (validationTimer.current) clearTimeout(validationTimer.current);
        validationTimer.current = setTimeout(async () => {
            try {
                const res = await api.validateResponse(sessionId, val);
                setValidation({ ok: res.is_valid, hint: res.suggestions || res.message || "" });
            } catch { /* silent */ }
        }, 800);
    }, [sessionId]);

    const reset = () => {
        setStage("pick");
        setScenario(null);
        setMessages([]);
        setInput("");
        setSessionId(null);
        setLoading(false);
        setFinished(false);
        setFeedback(null);
        setScore(null);
        setValidation({ ok: null, hint: "" });
    };

    const diffColor = (d: Scenario["difficulty"]) =>
        d === "Beginner" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
            : d === "Intermediate" ? "text-amber-600 bg-amber-50 border-amber-200"
                : "text-red-600 bg-red-50 border-red-200";

    // ── PICK SCENARIO ──────────────────────────────────────────────────────────
    if (stage === "pick") return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
                <button type="button" onClick={() => navigate("/ai-mentor")} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-[11px] font-black uppercase tracking-widest mb-12 transition-all">
                    <ArrowLeft className="h-4 w-4" /> Back to Matrix
                </button>

                <div className="mb-14" data-tour="salary-header">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 mb-6 shadow-sm">
                        <DollarSign className="h-3 w-3" /> Negotiation Protocol
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase mb-4">Capital Leverage</h1>
                    <p className="text-lg font-medium text-gray-500 max-w-2xl leading-relaxed">Multimodal simulation suite for high-stakes compensation engineering. Master the art of the counter-offer.</p>
                </div>

                <div className="grid gap-4" data-tour="salary-scenarios">
                    {SCENARIOS.map((sc, i) => (
                        <motion.button
                            key={sc.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            type="button"
                            onClick={() => { setScenario(sc); setStage("brief"); }}
                            className="w-full text-left rounded-2xl border border-gray-200 bg-white p-6 hover:bg-gray-50 hover:border-teal-400 transition-all group shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor(sc.difficulty)}`}>
                                            {sc.difficulty}
                                        </span>
                                        <span className="text-xs text-gray-400">{sc.company} · {sc.role}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{sc.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{sc.context.slice(0, 100)}…</p>
                                    <div className="flex gap-6 mt-3">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Offered</p>
                                            <p className="text-sm font-bold text-gray-700">{sc.offered}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your Target</p>
                                            <p className="text-sm font-bold text-orange-600">{sc.target}</p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors mt-1 shrink-0" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );

    // ── BRIEF ──────────────────────────────────────────────────────────────────
    if (stage === "brief" && scenario) return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <button type="button" onClick={() => setStage("pick")} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-10 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Choose scenario
                </button>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                    </span>
                    <h1 className="text-3xl font-black mt-4 mb-2 text-gray-900">{scenario.title}</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">{scenario.context}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Company</p>
                            <p className="font-bold text-gray-900">{scenario.company}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Role</p>
                            <p className="font-bold text-gray-900">{scenario.role}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Their Offer</p>
                            <p className="font-bold text-gray-700">{scenario.offered}</p>
                        </div>
                        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                            <p className="text-[10px] text-orange-600 uppercase tracking-wider mb-1">Your Target</p>
                            <p className="font-bold text-orange-600">{scenario.target}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 mb-8 shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                            <Target className="h-3.5 w-3.5" /> Negotiation Tips
                        </p>
                        <ul className="space-y-2">
                            {scenario.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        type="button"
                        onClick={() => startSession(scenario)}
                        disabled={loading}
                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Starting…</> : "Start Negotiation"}
                    </button>
                </motion.div>
            </div>
        </div>
    );

    // ── CHAT ───────────────────────────────────────────────────────────────────
    if (stage === "chat" && scenario) return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={reset} aria-label="Back to scenarios" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{scenario.title}</p>
                        <p className="text-xs text-gray-400">{scenario.company} · {scenario.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Target</p>
                        <p className="text-sm font-bold text-orange-600">{scenario.target}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                    </span>
                </div>
            </header>

            {/* Context bar */}
            <div className="shrink-0 bg-orange-50 border-b border-orange-200 px-6 py-2 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-700/80">{scenario.context}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.role === "candidate"
                                    ? "bg-orange-500 text-white rounded-br-md"
                                    : "bg-gray-50 border border-gray-200 text-gray-700 rounded-bl-md"
                            }`}>
                                {msg.role === "interviewer" && (
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                        {scenario.company} HR
                                    </p>
                                )}
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                {([
                                    "animate-bounce",
                                    "animate-bounce [animation-delay:150ms]",
                                    "animate-bounce [animation-delay:300ms]",
                                ] as const).map((cls, i) => (
                                    <span key={i} className={`w-1.5 h-1.5 rounded-full bg-gray-400 ${cls}`} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                {validation.ok !== null && validation.hint && (
                    <div className={`flex items-start gap-2 mb-2 text-xs px-3 py-1.5 rounded-lg ${
                        validation.ok ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                    }`}>
                        {validation.ok ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                        {validation.hint}
                    </div>
                )}
                <div className="flex gap-3 items-end">
                    <Textarea
                        value={input}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Type your response… (Enter to send, Shift+Enter for new line)"
                        className="flex-1 resize-none bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl min-h-[60px] max-h-[120px] text-sm focus:border-orange-400 focus:ring-orange-500/20"
                        rows={2}
                        disabled={finished || loading}
                    />
                    <Button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || loading || finished}
                        aria-label="Send message"
                        className="h-[60px] w-[60px] shrink-0 bg-orange-500 hover:bg-orange-600 rounded-xl"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Respond as you would in a real negotiation. Be professional, confident, and specific.
                </p>
            </div>
        </div>
    );

    // ── RESULT ─────────────────────────────────────────────────────────────────
    if (stage === "result" && scenario && score) return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full border border-orange-200 bg-orange-50 mb-4">
                            {score.overall >= 70
                                ? <Trophy className="h-9 w-9 text-orange-500" />
                                : <TrendingUp className="h-9 w-9 text-orange-500" />}
                        </div>
                        <h1 className="text-3xl font-black mb-2 text-gray-900">Negotiation Complete</h1>
                        <p className="text-gray-500">{scenario.title} · {scenario.company}</p>
                    </div>

                    {/* Overall score */}
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 mb-6 text-center">
                        <p className="text-[10px] text-orange-600 uppercase tracking-widest mb-1">Overall Score</p>
                        <p className="text-6xl font-black text-orange-600">{score.overall}</p>
                        <p className="text-gray-400 text-sm mt-1">out of 100</p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {([
                            { label: "Confidence", val: score.confidence, icon: Star },
                            { label: "Strategy", val: score.strategy, icon: Target },
                            { label: "Communication", val: score.communication, icon: MessageSquare },
                            { label: "Outcome", val: score.outcome, icon: TrendingUp },
                        ] as const).map(({ label, val, icon: Icon }) => (
                            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className="text-2xl font-black text-gray-900">{val}</p>
                                    <div className="flex-1 mb-1">
                                        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${val}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 }}
                                                className="h-full rounded-full bg-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Feedback */}
                    {feedback && (
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">AI Coach Feedback</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{feedback}</p>
                        </div>
                    )}

                    {/* Transcript */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-8 max-h-64 overflow-y-auto shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Conversation Transcript</p>
                        <div className="space-y-3">
                            {messages.map((m, i) => (
                                <div key={i}>
                                    <p className="text-[10px] text-gray-400 mb-0.5">
                                        {m.role === "interviewer" ? scenario.company + " HR" : "You"}
                                    </p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{m.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={reset}
                            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" /> Try Again
                        </button>
                        <Button
                            onClick={() => { setScenario(null); setStage("pick"); }}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 font-bold"
                        >
                            New Scenario
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );

    return null;
}
