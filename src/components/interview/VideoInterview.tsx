import { useInterview } from "@/hooks/use-interview";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { InterviewTypeSelector } from "@/components/interview/InterviewTypeSelector";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InterviewType } from "@/lib/interview-api";
import { UsageMonitor } from "@/components/subscription/UsageMonitor";
import { cn, stripMarkdown } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, ArrowLeft, Mic, MicOff, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FaceDetector = {
    estimateFaces: (input: HTMLVideoElement) => Promise<unknown[]>;
};

const createFaceDetector = async (): Promise<FaceDetector> => {
    await import("@mediapipe/face_detection");
    await import("@tensorflow/tfjs-backend-webgl");
    const faceDetection = await import("@tensorflow-models/face-detection");
    return faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
        runtime: "tfjs",
    } as any);
};

const renderQuestion = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
        const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (codeMatch) {
            return (
                <pre key={i} className="bg-black/50 border border-white/10 rounded-lg p-3 my-3 overflow-x-auto">
                    <code className="text-emerald-300 text-xs font-mono whitespace-pre">{codeMatch[2]}</code>
                </pre>
            );
        }
        return part.trim() ? <p key={i} className="text-white/70 text-sm leading-relaxed mb-2">{part.trim()}</p> : null;
    });
};

export const VideoInterview = ({ onBack, initialJobDescription = "" }: { onBack: () => void; initialJobDescription?: string }) => {
    const { isHealthy, isChecking } = useHealthCheck();
    const {
        state, isTyping, submitLocalAnswer, getFeedback, renderVideo,
        videoUrl, audioUrl, isRenderingVideo, resetInterview, startLocalInterview, exportTranscript,
    } = useInterview();

    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [targetRole, setTargetRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState<"junior" | "mid" | "senior" | "lead" | null>(null);
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [isStarting, setIsStarting] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const speechDetectedRef = useRef(false);
    const micStreamRef = useRef<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const detectorRef = useRef<FaceDetector | null>(null);
    const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const [trackingWarning, setTrackingWarning] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    // Drive audio via ref — avoids Chrome autoplay policy blocking
    useEffect(() => {
        if (!audioUrl || !audioRef.current) return;
        audioRef.current.load();
        audioRef.current.play().catch(() => { /* blocked — user can click Speak */ });
    }, [audioUrl]);

    useEffect(() => {
        return () => { stopListeningNow(); stopTracking(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── VAD: time-since-last-speech (immune to ambient noise floor) ────────────

    const startVAD = (stream: MediaStream) => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx: AudioContext = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        audioCtx.createMediaStreamSource(stream).connect(analyser);

        const buf = new Uint8Array(analyser.frequencyBinCount);
        speechDetectedRef.current = false;

        // Dynamic threshold: calibrate against ambient noise for first 10 samples (1 s),
        // then require rms > (ambient + 14), minimum 28.  This prevents ambient hum from
        // keeping lastSpeechTime alive and blocking auto-submit.
        const SILENCE_MS = 1800;
        const calibrationBuf: number[] = [];
        let SPEECH_ON = 28;          // updated after calibration
        let calibrated = false;
        let lastSpeechTime: number | null = null;

        vadIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(buf);
            const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length);
            setAudioLevel(Math.min(100, rms * 2.5));

            // --- calibration phase (first 1 s) ---
            if (!calibrated) {
                calibrationBuf.push(rms);
                if (calibrationBuf.length >= 10) {
                    const avg = calibrationBuf.reduce((a, b) => a + b, 0) / calibrationBuf.length;
                    SPEECH_ON = Math.max(28, avg + 14);
                    calibrated = true;
                }
                return; // don't detect during calibration
            }

            // --- detection phase ---
            if (rms > SPEECH_ON) {
                speechDetectedRef.current = true;
                lastSpeechTime = Date.now();
            } else if (speechDetectedRef.current && lastSpeechTime !== null) {
                if (Date.now() - lastSpeechTime >= SILENCE_MS) {
                    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
                    vadIntervalRef.current = null;
                    audioCtx.close();
                    audioContextRef.current = null;
                    speechDetectedRef.current = false;
                    setAudioLevel(0);
                    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current!.stop();
                    setIsListening(false);
                }
            }
        }, 100);
    };

    const stopListeningNow = () => {
        if (vadIntervalRef.current) { clearInterval(vadIntervalRef.current); vadIntervalRef.current = null; }
        if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
        speechDetectedRef.current = false;
        setAudioLevel(0);
        if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
        if (micStreamRef.current) { micStreamRef.current.getTracks().forEach((t) => t.stop()); micStreamRef.current = null; }
        setIsListening(false);
    };

    const startListening = async () => {
        if (isListening || state.loading || state.isFinished) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                stream.getTracks().forEach((t) => t.stop());
                micStreamRef.current = null;
                await submitLocalAnswer(blob);
            };
            recorder.start();
            setIsListening(true);
            startVAD(stream);
        } catch {
            toast({ title: "Mic Error", description: "Could not access microphone.", variant: "destructive" });
        }
    };

    // ── Camera ─────────────────────────────────────────────────────────────────

    const startTracking = async (onTerminate: () => void) => {
        if (!navigator.mediaDevices?.getUserMedia) {
            toast({ title: "Camera Required", description: "Camera required. Terminating.", variant: "destructive" });
            setTimeout(onTerminate, 2000); return false;
        }
        try {
            if (!detectorRef.current) detectorRef.current = await createFaceDetector();
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStreamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsTracking(true);
            trackingIntervalRef.current = setInterval(async () => {
                if (videoRef.current && detectorRef.current && videoRef.current.readyState === 4) {
                    try {
                        const faces = await detectorRef.current.estimateFaces(videoRef.current);
                        setTrackingWarning(
                            faces.length === 0 ? "No face detected." :
                            faces.length > 1 ? "Multiple faces detected." : null
                        );
                    } catch { /* ignore */ }
                }
            }, 1500);
            return true;
        } catch (err: any) {
            const denied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
            toast({ title: "Camera Denied", description: denied ? "Camera required — terminating." : "Camera error.", variant: "destructive" });
            setTimeout(onTerminate, 2000); return false;
        }
    };

    const stopTracking = () => {
        if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
        if (cameraStreamRef.current) cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
        setIsTracking(false);
        setTrackingWarning(null);
    };

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleStart = async () => {
        if (!selectedType || !targetRole.trim() || !experienceLevel || isHealthy === false) return;
        // Unlock browser audio while still inside the user-gesture context
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx: AudioContext = new AudioCtx();
            await ctx.resume(); ctx.close();
        } catch { /* ignore */ }
        setIsStarting(true);
        const started = await startLocalInterview(selectedType, jobDescription, targetRole.trim(), experienceLevel);
        setIsStarting(false);
        if (!started) return;
        await startTracking(() => { stopTracking(); resetInterview(); onBack(); });
    };

    const handleRestart = () => {
        stopListeningNow(); stopTracking(); setIsSpeaking(false); resetInterview();
        setSelectedType(null); setTargetRole(""); setExperienceLevel(null); setJobDescription("");
    };

    // ── Derived ────────────────────────────────────────────────────────────────

    const experienceLevels = [
        { value: "junior" as const, label: "Junior", years: "0–2 yrs" },
        { value: "mid" as const, label: "Mid-Level", years: "2–5 yrs" },
        { value: "senior" as const, label: "Senior", years: "5–8 yrs" },
        { value: "lead" as const, label: "Lead / Principal", years: "8+ yrs" },
    ];
    const canStart = !!selectedType && !!targetRole.trim() && !!experienceLevel && isHealthy !== false && !isStarting;
    const isProcessing = state.loading || isTyping;
    const lastInterviewerMsg = [...state.messages].reverse().find((m) => m.role === "interviewer");
    const orbScale = isListening ? 1 + (audioLevel / 100) * 0.2 : 1;
    const showRings = isSpeaking || (isListening && audioLevel > 15);
    const isCoding = state.interviewType === "coding";

    // ── Setup screen ───────────────────────────────────────────────────────────

    if (!state.sessionId) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <button type="button" title="Go back" onClick={onBack} className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="p-2 rounded-xl bg-teal-500"><Sparkles className="h-5 w-5 text-white" /></div>
                        <h1 className="text-xl font-semibold text-gray-900">Audio Interview Setup</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <UsageMonitor
                            featureKey={selectedType === "salary_negotiation" ? "live_salary_negotiation_call" : "video_interview_access"}
                            compact
                        />
                        <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
                    </div>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                    <div className="text-center space-y-3 max-w-lg">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Ready to Speak?</h2>
                        <p className="text-gray-500 text-lg">Tell us the role and your level so we can tailor question difficulty.</p>
                    </div>
                    <div className="w-full max-w-lg space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="targetRoleAudio" className="text-sm font-medium text-gray-700">Target Job Role <span className="text-red-500">*</span></Label>
                            <Input id="targetRoleAudio" placeholder="e.g. Senior Frontend Engineer, Product Manager…" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} disabled={isStarting}
                                className="rounded-xl bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-500/40" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Experience Level <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {experienceLevels.map(({ value, label, years }) => (
                                    <button key={value} type="button" onClick={() => !isStarting && setExperienceLevel(value)} disabled={isStarting}
                                        className={cn("flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                            experienceLevel === value
                                                ? "border-teal-500 bg-teal-50 text-teal-600"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-teal-400 hover:text-gray-900",
                                            isStarting && "opacity-50 cursor-not-allowed")}>
                                        <span>{label}</span>
                                        <span className="text-[10px] font-normal opacity-70 mt-0.5">{years}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <InterviewTypeSelector selectedType={selectedType} onSelect={setSelectedType} disabled={isStarting} />
                    <div className="w-full max-w-lg space-y-2">
                        <Label htmlFor="jdAudio" className="text-sm font-medium text-gray-700">Job Description <span className="text-gray-400 font-normal">(Optional)</span></Label>
                        <Textarea id="jdAudio" placeholder="Paste the job description here…" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isStarting}
                            className="min-h-[100px] resize-none rounded-xl bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal-400 focus:ring-teal-500/40" />
                    </div>
                    <button type="button" onClick={handleStart} disabled={!canStart}
                        className="mt-2 px-8 py-3 rounded-lg bg-teal-500 text-white font-semibold flex items-center gap-2 hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                        {isStarting ? <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</> : "Start Audio Interview"}
                    </button>
                    {(!targetRole.trim() || !experienceLevel) && <p className="text-xs text-gray-400 -mt-4">Fill in your target role and experience level to continue.</p>}
                </main>
            </div>
        );
    }

    // ── Interview screen ───────────────────────────────────────────────────────

    return (
        <div className="h-screen bg-[#080810] flex flex-col overflow-hidden">
            <audio ref={audioRef} key={audioUrl ?? "no-audio"} src={audioUrl ?? undefined}
                onPlay={() => setIsSpeaking(true)}
                onEnded={() => { setIsSpeaking(false); if (!state.isFinished && !isListening && !isProcessing) startListening(); }}
                className="hidden" />

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3">
                <button type="button" title="Go back" onClick={() => { stopListeningNow(); stopTracking(); onBack(); }}
                    className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <span className="text-white/25 text-xs uppercase tracking-widest">
                    {state.interviewType} &nbsp;·&nbsp; Q{state.questionCount} / {state.maxQuestions}
                </span>
                <div className="w-9" />
            </div>

            {state.isFinished ? (
                <div className="flex-1 overflow-y-auto p-4">
                    <FeedbackPanel feedback={state.feedback} isLoading={state.loading} onGetFeedback={getFeedback}
                        onExportTranscript={exportTranscript} onRestart={handleRestart} onRenderVideo={renderVideo}
                        videoUrl={videoUrl} isRenderingVideo={isRenderingVideo} />
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex">

                    {/* ── LEFT: User camera ───────────────────────────────── */}
                    <div className="w-[42%] flex-shrink-0 flex items-center justify-center p-5 border-r border-white/5">
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]" style={{ aspectRatio: "4/3" }}>
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            {!isTracking && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-2">
                                    <MicOff className="h-10 w-10 text-slate-600" />
                                    <p className="text-slate-500 text-sm">No camera</p>
                                </div>
                            )}
                            {/* Status badge overlay — bottom of camera */}
                            <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
                                {isTracking && (
                                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
                                        <ShieldCheck className="h-3 w-3 text-green-400" />
                                        <span className="text-white/60">Tracking active</span>
                                    </div>
                                )}
                                {/* Mic indicator while recording */}
                                {isListening && (
                                    <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 rounded-lg text-xs text-emerald-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Recording
                                    </div>
                                )}
                            </div>
                            {trackingWarning && (
                                <div className="absolute top-2 inset-x-2 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-medium text-white">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    {trackingWarning}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Orb + status + question + controls ───────── */}
                    <div className="flex-1 flex flex-col items-center justify-between py-8 px-8">

                        {/* Center: orb + status + question */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">

                            {/* Orb */}
                            <div className="relative flex items-center justify-center">
                                {showRings && (
                                    <>
                                        <div className={cn("absolute rounded-full animate-ping [animation-duration:2.5s]", isSpeaking ? "w-64 h-64 bg-blue-500/10" : "w-64 h-64 bg-emerald-500/10")} />
                                        <div className={cn("absolute rounded-full animate-ping [animation-duration:1.8s]", isSpeaking ? "w-52 h-52 bg-blue-400/15" : "w-52 h-52 bg-emerald-400/15")} />
                                        <div className={cn("absolute rounded-full animate-ping [animation-duration:1.2s]", isSpeaking ? "w-40 h-40 bg-blue-300/20" : "w-40 h-40 bg-emerald-300/20")} />
                                    </>
                                )}
                                <div
                                    className={cn(
                                        "w-32 h-32 rounded-full flex items-center justify-center",
                                        isSpeaking
                                            ? "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-[0_0_80px_rgba(59,130,246,0.55)]"
                                            : isListening
                                            ? "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 shadow-[0_0_80px_rgba(16,185,129,0.55)]"
                                            : isProcessing
                                            ? "bg-gradient-to-br from-slate-700 to-slate-600 shadow-[0_0_40px_rgba(100,116,139,0.35)]"
                                            : "bg-gradient-to-br from-indigo-500/50 via-violet-600/50 to-purple-700/50 shadow-[0_0_60px_rgba(139,92,246,0.30)] animate-pulse [animation-duration:3s]"
                                    )}
                                    style={{
                                        transform: `scale(${orbScale})`,
                                        transition: isListening ? "transform 0.08s ease-out, box-shadow 0.7s ease" : "all 0.6s ease",
                                    }}
                                >
                                    {isProcessing && <Loader2 className="h-8 w-8 text-white/60 animate-spin" />}
                                </div>
                            </div>

                            {/* State label */}
                            <div className="text-center space-y-1">
                                <p className="text-white/90 text-xl font-light tracking-wide">
                                    {isProcessing ? "Processing…" : isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
                                </p>
                                <p className="text-white/30 text-xs min-h-[1rem]">
                                    {isListening ? "Auto-detecting when you finish"
                                        : isSpeaking ? "Your turn next"
                                        : isProcessing ? "Analyzing response…" : ""}
                                </p>
                            </div>

                            {/* Question */}
                            {lastInterviewerMsg && !isListening && (
                                <div className="w-full max-h-56 overflow-y-auto rounded-xl bg-white/3 border border-white/8 px-4 py-3">
                                    {isCoding
                                        ? renderQuestion(lastInterviewerMsg.content)
                                        : <p className="text-white/50 text-sm text-center leading-relaxed">{stripMarkdown(lastInterviewerMsg.content)}</p>
                                    }
                                </div>
                            )}
                        </div>

                        {/* Control button */}
                        <div className="flex-shrink-0 mt-4">
                            {isListening ? (
                                <button type="button" onClick={stopListeningNow}
                                    className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 font-medium hover:bg-red-500/25 transition-colors">
                                    <MicOff className="h-4 w-4" /> Stop
                                </button>
                            ) : (
                                <button type="button" onClick={startListening} disabled={isProcessing || isSpeaking || state.isFinished}
                                    className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-white/5 text-white/50 border border-white/10 font-medium hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
                                    <Mic className="h-4 w-4" /> Speak
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
