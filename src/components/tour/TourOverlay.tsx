import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTour } from "./TourContext";

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 12;

function getRect(selector?: string): Rect | null {
    if (!selector) return null;
    try {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
    } catch { return null; }
}

function positionCard(rect: Rect | null, position: string, cardW = 320, cardH = 180) {
    if (!rect || position === "center") return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 16;

    if (position === "bottom") {
        let top = rect.top + rect.height + margin;
        let left = rect.left + rect.width / 2 - cardW / 2;
        left = Math.max(margin, Math.min(left, vw - cardW - margin));
        if (top + cardH > vh - margin) top = rect.top - cardH - margin;
        return { top, left };
    }
    if (position === "top") {
        let top = rect.top - cardH - margin;
        let left = rect.left + rect.width / 2 - cardW / 2;
        left = Math.max(margin, Math.min(left, vw - cardW - margin));
        if (top < margin) top = rect.top + rect.height + margin;
        return { top, left };
    }
    if (position === "right") {
        let left = rect.left + rect.width + margin;
        let top = rect.top + rect.height / 2 - cardH / 2;
        top = Math.max(margin, Math.min(top, vh - cardH - margin));
        if (left + cardW > vw - margin) left = rect.left - cardW - margin;
        return { top, left };
    }
    if (position === "left") {
        let left = rect.left - cardW - margin;
        let top = rect.top + rect.height / 2 - cardH / 2;
        top = Math.max(margin, Math.min(top, vh - cardH - margin));
        if (left < margin) left = rect.left + rect.width + margin;
        return { top, left };
    }
    return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
}

export default function TourOverlay() {
    const { active, steps, currentStep, next, prev, end } = useTour();
    const [rect, setRect] = useState<Rect | null>(null);
    const step = steps[currentStep];
    const rafRef = useRef<number>();

    useEffect(() => {
        if (!active || !step) { setRect(null); return; }

        const update = () => {
            const r = getRect(step.target);
            setRect(r);
            // scroll target into view
            if (step.target) {
                try {
                    document.querySelector(step.target)?.scrollIntoView({ behavior: "smooth", block: "center" });
                } catch { /* ignore */ }
            }
        };

        update();
        rafRef.current = requestAnimationFrame(update);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [active, step, currentStep]);

    if (!active || !step) return null;

    const pos = positionCard(rect, step.position || (rect ? "bottom" : "center"));
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {active && (
                <>
                    {/* Dark overlay */}
                    <div className="fixed inset-0 z-[9000] pointer-events-none">
                        <svg className="absolute inset-0 w-full h-full" style={{ display: "block" }}>
                            <defs>
                                <mask id="tour-mask">
                                    <rect width="100%" height="100%" fill="white" />
                                    {rect && (
                                        <rect
                                            x={rect.left} y={rect.top}
                                            width={rect.width} height={rect.height}
                                            rx="12" fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
                        </svg>

                        {/* Highlight ring */}
                        {rect && (
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute rounded-xl border-2 border-violet-400 shadow-[0_0_0_4px_rgba(139,92,246,0.2)]"
                                style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, pointerEvents: "none" }}
                            />
                        )}
                    </div>

                    {/* Click-blocker (lets users only click tour card buttons) */}
                    <div className="fixed inset-0 z-[9001] pointer-events-auto" onClick={e => e.stopPropagation()} />

                    {/* Tour card */}
                    <motion.div
                        key={`card-${currentStep}`}
                        initial={{ opacity: 0, scale: 0.93, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        className="fixed z-[9002] w-80 pointer-events-auto"
                        style={typeof pos.top === "string"
                            ? { top: pos.top, left: pos.left, transform: (pos as any).transform }
                            : { top: pos.top, left: pos.left }
                        }
                    >
                        <div className="rounded-2xl bg-[#0e0e1a] border border-white/[0.1] shadow-2xl overflow-hidden">
                            {/* Top accent */}
                            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-sky-400 to-violet-500" />

                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                                            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400">
                                            Step {currentStep + 1} of {steps.length}
                                        </p>
                                    </div>
                                    <button onClick={end} className="text-slate-600 hover:text-white transition-colors mt-0.5">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Progress dots */}
                                <div className="flex gap-1 mb-4">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                i === currentStep ? "bg-violet-400 w-6" : i < currentStep ? "bg-violet-400/40 w-2" : "bg-white/10 w-2"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
                                <p className="text-[13px] text-slate-400 leading-relaxed">{step.description}</p>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-5">
                                    <button
                                        onClick={end}
                                        className="text-xs text-slate-600 hover:text-slate-300 transition-colors"
                                    >
                                        Skip tour
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {!isFirst && (
                                            <button
                                                onClick={prev}
                                                className="h-8 w-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4 text-white" />
                                            </button>
                                        )}
                                        <button
                                            onClick={next}
                                            className="h-8 px-4 rounded-lg bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                        >
                                            {isLast ? "Done" : "Next"}
                                            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
