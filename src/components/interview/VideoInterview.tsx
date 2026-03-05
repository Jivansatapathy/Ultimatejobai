import { useInterview } from "@/hooks/use-interview";
import { useHealthCheck } from "@/hooks/use-health-check";
import { useTheme } from "@/hooks/use-theme";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { InterviewTypeSelector } from "@/components/interview/InterviewTypeSelector";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { ThemeToggle } from "@/components/interview/ThemeToggle";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InterviewType } from "@/lib/interview-api";
import { speakWithElevenLabs, stopSpeaking } from "@/lib/elevenlabs";
import { initDIDStream, sendTalkToDID, destroyDIDStream, isDIDConfigured } from "@/lib/did-streaming";
import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, ArrowLeft, Mic, MicOff, Volume2, AlertTriangle, ShieldCheck, Wifi } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as faceDetection from "@tensorflow-models/face-detection";
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-backend-webgl";

export const VideoInterview = ({ onBack }: { onBack: () => void }) => {
    const { isHealthy, isChecking } = useHealthCheck();
    const { theme, toggleTheme } = useTheme();
    const {
        state,
        isTyping,
        startInterview,
        sendMessage,
        getFeedback,
        renderVideo,
        videoUrl,
        isRenderingVideo,
        resetInterview,
        exportTranscript,
    } = useInterview();

    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    // Speech Recognition state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    // Video & Tracking state
    const videoRef = useRef<HTMLVideoElement>(null);
    const detectorRef = useRef<faceDetection.FaceDetector | null>(null);
    const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [trackingWarning, setTrackingWarning] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // D-ID avatar state
    const didVideoRef = useRef<HTMLVideoElement>(null);
    const didStreamRef = useRef<MediaStream | null>(null); // holds the WebRTC stream
    const [didReady, setDidReady] = useState(false);
    const [didConnecting, setDidConnecting] = useState(false);

    // When D-ID stream becomes ready: wire video + trigger first talk to show the avatar
    useEffect(() => {
        if (!didReady || !didVideoRef.current || !didStreamRef.current) return;

        const vid = didVideoRef.current;
        vid.srcObject = didStreamRef.current;
        vid.play().catch((e) => console.warn("[D-ID] play() blocked:", e));

        // D-ID only sends video frames when speaking.
        // Re-send the last interviewer message so the avatar appears immediately.
        const lastMsg = [...state.messages].reverse().find(m => m.role === "interviewer");
        if (lastMsg) {
            sendTalkToDID(lastMsg.content).catch(e =>
                console.warn("[D-ID] initial talk failed:", e)
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [didReady]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error !== 'no-speech') {
                    setIsListening(false);
                    toast({
                        title: "Microphone Error",
                        description: `Could not access microphone: ${event.error}`,
                        variant: "destructive"
                    });
                }
            };

            recognitionRef.current.onend = () => {
                // Auto restart if still supposed to be listening
                if (isListening && recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        setIsListening(false);
                    }
                } else {
                    setIsListening(false);
                }
            };
        } else {
            toast({
                title: "Not Supported",
                description: "Your browser does not support Speech Recognition.",
                variant: "destructive"
            });
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            stopSpeaking();
        };
    }, [isListening]);

    // Initialize Face Detection
    useEffect(() => {
        const initDetector = async () => {
            try {
                const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detectorConfig = {
                    runtime: 'tfjs',
                } as any;
                detectorRef.current = await faceDetection.createDetector(model, detectorConfig);
            } catch (error) {
                console.error("Failed to initialize face detector:", error);
            }
        };
        initDetector();

        return () => {
            stopTracking();
        };
    }, []);

    const startTracking = async () => {
        // navigator.mediaDevices requires a secure context (HTTPS or localhost)
        if (!navigator.mediaDevices?.getUserMedia) {
            console.warn("[Camera] navigator.mediaDevices unavailable — not a secure context or camera not supported.");
            toast({
                title: "Camera Unavailable",
                description: "Camera requires a secure connection (HTTPS). Interview will continue without camera tracking.",
                variant: "destructive",
            });
            return; // continue interview without camera
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsTracking(true);

            // Start detection loop
            trackingIntervalRef.current = setInterval(async () => {
                if (videoRef.current && detectorRef.current && videoRef.current.readyState === 4) {
                    try {
                        const faces = await detectorRef.current.estimateFaces(videoRef.current);
                        if (faces.length === 0) {
                            setTrackingWarning("No face detected. Please ensure you are visible on camera.");
                        } else if (faces.length > 1) {
                            setTrackingWarning("Multiple faces detected. Please ensure you are alone.");
                        } else {
                            setTrackingWarning(null); // Clear warning
                        }
                    } catch (err) {
                        console.error("Error estimating faces:", err);
                    }
                }
            }, 1000); // Check every second
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast({
                title: "Camera Error",
                description: "Could not access the camera. Interview will continue without tracking.",
                variant: "destructive"
            });
        }
    };

    const stopTracking = () => {
        if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsTracking(false);
        setTrackingWarning(null);
    };

    // Make AI speak when a new message arrives from AI
    useEffect(() => {
        if (state.messages.length > 0) {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage.role === "interviewer" && !state.isFinished && !isTyping) {
                speak(lastMessage.content);
            }
        }
    }, [state.messages, isTyping, state.isFinished]);


    // Speak AI questions — D-ID avatar if ready, silent if connecting, ElevenLabs otherwise
    const speak = async (text: string) => {
        if (didReady) {
            // D-ID is live — speak through the avatar
            try {
                await sendTalkToDID(text);
                setIsSpeaking(true);
                const wordCount = text.split(" ").length;
                setTimeout(() => setIsSpeaking(false), wordCount * 400 + 1000);
            } catch (e) {
                console.warn("[D-ID talk] failed, falling back to ElevenLabs:", e);
                speakWithElevenLabs(text, setIsSpeaking);
            }
        } else if (!didConnecting) {
            // D-ID not configured / not connecting — use ElevenLabs
            speakWithElevenLabs(text, setIsSpeaking);
        }
        // If didConnecting=true, stay silent — useEffect([didReady]) will speak when ready
    };

    const handleStart = async () => {
        if (!selectedType || !isHealthy) return;
        setIsStarting(true);
        await startInterview(selectedType, jobDescription);
        setIsStarting(false);
        // Start camera tracking
        startTracking();
        // Initialize D-ID avatar stream
        if (isDIDConfigured()) {
            setDidConnecting(true);
            try {
                await initDIDStream(
                    (mediaStream) => {
                        // Store stream in ref; useEffect will wire it to the video element
                        didStreamRef.current = mediaStream;
                        setDidConnecting(false);
                        setDidReady(true);
                    },
                    (iceState) => {
                        if (iceState === "failed" || iceState === "disconnected") {
                            setDidReady(false);
                            setDidConnecting(false);
                        }
                    }
                );
            } catch (err) {
                console.error("[D-ID] Stream init failed:", err);
                toast({
                    title: "D-ID Avatar unavailable",
                    description: "Falling back to animated avatar.",
                });
                setDidConnecting(false);
            }
        }
    };

    const handleRestart = () => {
        stopTracking();
        destroyDIDStream().catch(() => { });
        setDidReady(false);
        setDidConnecting(false);
        setIsSpeaking(false);
        resetInterview();
        setSelectedType(null);
        setJobDescription("");
        setTranscript("");
        if (isListening) toggleListening();
        stopSpeaking();
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                setTranscript(""); // Clear old transcript
                recognitionRef.current.start();
                setIsListening(true);
                stopSpeaking(); // Stop AI talking if user interrupts
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSendSpokenResponse = () => {
        if (!transcript.trim()) return;
        sendMessage(transcript);
        setTranscript("");
        if (isListening) {
            toggleListening(); // Stop listening while AI thinks
        }
    };


    // Landing screen - before interview starts
    if (!state.sessionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 rounded-md hover:bg-muted transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="p-2 rounded-xl bg-primary">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-semibold">Video Interview Setup</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                    <div className="text-center space-y-3 max-w-lg">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Ready to Speak?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Select an interview type below for a realistic voice-to-voice mock session.
                        </p>
                    </div>

                    <InterviewTypeSelector
                        selectedType={selectedType}
                        onSelect={setSelectedType}
                        disabled={isStarting}
                    />

                    <div className="w-full max-w-lg space-y-2">
                        <Label htmlFor="jd" className="text-sm font-medium">
                            Job Description (Optional)
                        </Label>
                        <Textarea
                            id="jd"
                            placeholder="Paste the job description here to help the AI tailor the questions..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={isStarting}
                            className="min-h-[120px] resize-none rounded-xl"
                        />
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!selectedType || !isHealthy || isStarting}
                        className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Connecting Audio/Video...
                            </>
                        ) : (
                            "Start Video Interview"
                        )}
                    </button>
                </main>
            </div>
        );
    }

    // Interview Video screen
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex items-center px-4 relative">
                <button onClick={() => {
                    window.speechSynthesis.cancel();
                    if (isListening) toggleListening();
                    stopTracking();
                    onBack();
                }} className="absolute left-4 top-4 z-10 p-2 rounded-md hover:bg-muted transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-full pl-12">
                    <InterviewHeader
                        interviewType={state.interviewType!}
                        questionCount={state.questionCount}
                        maxQuestions={state.maxQuestions}
                        theme={theme}
                        onThemeToggle={toggleTheme}
                    />
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full p-4 flex flex-col gap-6">
                {state.isFinished ? (
                    <FeedbackPanel
                        feedback={state.feedback}
                        isLoading={state.loading}
                        onGetFeedback={getFeedback}
                        onExportTranscript={exportTranscript}
                        onRestart={handleRestart}
                        onRenderVideo={renderVideo}
                        videoUrl={videoUrl}
                        isRenderingVideo={isRenderingVideo}
                    />
                ) : (
                    <>
                        {/* Main Video Frame */}
                        <div className="flex-1 w-full relative bg-black/5 dark:bg-black rounded-2xl overflow-hidden border-4 border-border/50 shadow-xl flex items-center justify-center">

                            {/* AI Interviewer — D-ID WebRTC video if ready, animated orb fallback */}
                            <div className="h-full w-full max-w-3xl flex items-center justify-center relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                                {isTyping && (
                                    <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 backdrop-blur-sm animate-pulse">
                                        <Volume2 className="h-4 w-4" /> Reading your answer...
                                    </div>
                                )}

                                {/* D-ID video — hidden until stream is ready */}
                                <video
                                    ref={didVideoRef}
                                    autoPlay
                                    playsInline
                                    className={`w-full h-full object-cover transition-opacity duration-700 ${didReady ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}
                                />

                                {/* Loading screen — shown while D-ID is connecting */}
                                {didConnecting && !didReady && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-20">
                                        {/* Spinner ring */}
                                        <div className="relative w-28 h-28 mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                                            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center">
                                                    <Wifi className="h-6 w-6 text-white animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-white font-semibold text-lg mb-2">Connecting AI Avatar</p>
                                        <p className="text-slate-400 text-sm mb-4">Setting up your video interviewer…</p>
                                        {/* Animated progress dots */}
                                        <div className="flex gap-2">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2 h-2 rounded-full bg-violet-400"
                                                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback orb — only shown when D-ID is NOT connecting (pure audio mode) */}
                                {!didConnecting && !didReady && (
                                    <div className="flex flex-col items-center gap-6 z-10">
                                        <div className="relative flex items-center justify-center">
                                            {(isSpeaking || didConnecting) && (
                                                <>
                                                    <div className="absolute w-52 h-52 rounded-full border-2 border-violet-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                                                    <div className="absolute w-44 h-44 rounded-full border-2 border-violet-400/50 animate-ping" style={{ animationDuration: '1s' }} />
                                                </>
                                            )}
                                            <div className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${didConnecting
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_40px_rgba(251,146,60,0.5)]'
                                                : isSpeaking
                                                    ? 'bg-gradient-to-br from-violet-600 via-blue-500 to-indigo-600 shadow-[0_0_60px_rgba(139,92,246,0.7)]'
                                                    : isTyping
                                                        ? 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-[0_0_30px_rgba(100,100,200,0.3)]'
                                                        : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-[0_0_40px_rgba(99,102,241,0.5)]'
                                                }`}>
                                                {didConnecting
                                                    ? <Wifi className="h-12 w-12 text-white animate-pulse" />
                                                    : <Volume2 className={`h-12 w-12 text-white transition-all duration-300 ${isSpeaking ? 'scale-110' : 'scale-100 opacity-70'}`} />
                                                }
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-1 h-10">
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 rounded-full transition-all ${isSpeaking ? 'bg-violet-400' : didConnecting ? 'bg-amber-400' : 'bg-slate-600'
                                                        }`}
                                                    style={{
                                                        height: (isSpeaking || didConnecting) ? `${20 + (i % 5) * 15}%` : '20%',
                                                        animation: (isSpeaking || didConnecting) ? `pulse ${0.3 + i * 0.07}s ease-in-out infinite alternate` : 'none',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${didReady ? 'bg-green-400' : didConnecting ? 'bg-amber-400 animate-pulse' : isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                                    {didConnecting ? 'Connecting avatar…' : didReady ? 'AI Interviewer ✦ Live' : isSpeaking ? 'AI Speaking…' : 'AI Recruiter'}
                                </div>
                            </div>

                            {/* Self View — live camera feed */}
                            <div className="absolute bottom-4 right-4 w-48 h-32 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-border/50">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />
                                {!isTracking && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground bg-secondary">
                                        <MicOff className="h-8 w-8" />
                                        <span className="text-xs">No Camera</span>
                                    </div>
                                )}
                                {isTracking && (
                                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3 text-green-400" /> Tracking
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Suspicious Activity Warning Banner */}
                        {trackingWarning && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-400 p-3 rounded-xl animate-pulse">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium">{trackingWarning}</span>
                            </div>
                        )}

                        {/* Subtitles & Controls */}
                        <div className="h-48 flex flex-col gap-4">
                            {/* Assistant Subtitle Box */}
                            {state.messages.length > 0 && !isTyping && state.messages[state.messages.length - 1].role === "interviewer" && (
                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center shadow-inner">
                                    <p className="font-medium text-lg leading-relaxed max-w-3xl mx-auto">
                                        &ldquo;{state.messages[state.messages.length - 1].content}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Spoken Response Preview */}
                            {isListening && transcript && (
                                <div className="bg-secondary p-4 rounded-xl shadow-inner border border-border">
                                    <p className="text-muted-foreground">{transcript}</p>
                                </div>
                            )}

                            {/* Controls */}
                            <div className="mt-auto flex items-center justify-center gap-4">
                                <button
                                    onClick={toggleListening}
                                    disabled={state.loading || isTyping}
                                    className={`w-48 h-14 rounded-full flex items-center justify-center gap-2 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isListening
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        }`}
                                >
                                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                    {isListening ? "Stop Recording" : "Speak Answer"}
                                </button>

                                {transcript && !isListening && (
                                    <button
                                        onClick={handleSendSpokenResponse}
                                        className="h-14 rounded-full px-8 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                    >
                                        Submit Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

    );
};
