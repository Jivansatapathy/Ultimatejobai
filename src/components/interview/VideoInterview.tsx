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
import { activityService } from "@/services/activityService";

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

export const VideoInterview = ({ onBack, initialJobDescription = "" }: { onBack: () => void, initialJobDescription?: string }) => {
    const { isHealthy, isChecking } = useHealthCheck();
    const { theme, toggleTheme } = useTheme();
    const {
        state,
        isTyping,
        sendMessage,
        submitLocalAnswer,
        getFeedback,
        renderVideo,
        videoUrl,
        audioUrl,
        isRenderingVideo,
        resetInterview,
        startInterview,
        startLocalInterview,
        exportTranscript,
    } = useInterview();

    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [isStarting, setIsStarting] = useState(false);

    // Speech Recognition state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    // Video & Tracking state
    const videoRef = useRef<HTMLVideoElement>(null);
    const detectorRef = useRef<FaceDetector | null>(null);
    const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [trackingWarning, setTrackingWarning] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // D-ID avatar state (now unused but keeping refs for minimal breakage)
    const didVideoRef = useRef<HTMLVideoElement>(null);
    const [didReady, setDidReady] = useState(false);
    const [didConnecting, setDidConnecting] = useState(false);

    // Local recording state
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // D-ID logic removed as it is currently unused and using GROQ only
    /*
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
    */

    // Removed Browser SpeechRecognition to use GROQ STT via backend
    useEffect(() => {
        return () => {
            stopSpeaking();
        };
    }, []);

    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);

    const startTracking = async (onTerminate: () => void) => {
        // navigator.mediaDevices requires HTTPS or localhost
        if (!navigator.mediaDevices?.getUserMedia) {
            toast({
                title: "Camera Required",
                description: "Camera access is required for this interview. Terminating session.",
                variant: "destructive",
            });
            setTimeout(onTerminate, 2000);
            return false;
        }
        try {
            if (!detectorRef.current) {
                detectorRef.current = await createFaceDetector();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsTracking(true);

            // Start face-detection loop
            trackingIntervalRef.current = setInterval(async () => {
                if (videoRef.current && detectorRef.current && videoRef.current.readyState === 4) {
                    try {
                        const faces = await detectorRef.current.estimateFaces(videoRef.current);
                        if (faces.length === 0) {
                            setTrackingWarning("No face detected. Please ensure you are visible on camera.");
                        } else if (faces.length > 1) {
                            setTrackingWarning("Multiple faces detected. Please ensure you are alone.");
                        } else {
                            setTrackingWarning(null);
                        }
                    } catch (err) {
                        console.error("Error estimating faces:", err);
                    }
                }
            }, 1000);
            return true;
        } catch (error: any) {
            const isDenied = error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError";
            toast({
                title: "Camera Access Denied",
                description: isDenied
                    ? "Camera permission was denied. Camera is required — terminating interview."
                    : "Could not access the camera. Terminating interview.",
                variant: "destructive",
            });
            setTimeout(onTerminate, 2000);
            return false;
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


    // Speak AI questions
    const speak = async (text: string) => {
        // Audio mode: the backend provides a .wav URL in audioUrl.
        // We handle playback via the <audio> element in the JSX.
        console.log("AI needs to speak:", text);
    };

    const handleStart = async () => {
        if (!selectedType || !isHealthy) return;
        setIsStarting(true);
        await startLocalInterview(selectedType, jobDescription);
        activityService.logActivity({
            activity_type: 'INTERVIEW',
            description: `Started Video/Audio ${selectedType} interview`,
            metadata: { type: selectedType, jobDescription: jobDescription.substring(0, 100) }
        });
        setIsStarting(false);
        // Camera is required — terminate if not available
        await startTracking(() => {
            stopTracking();
            resetInterview();
            onBack();
        });
    };

    const handleRestart = () => {
        stopTracking();
        setIsSpeaking(false);
        resetInterview();
        setSelectedType(null);
        setJobDescription("");
        setTranscript("");
        if (isListening) {
             // stop recording if on
             if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
             setIsListening(false);
        }
    };

    const toggleListening = async () => {
        if (isListening) {
            // Stop recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            setIsListening(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    // The backend processLocalAnswer uses Groq Whisper for STT
                    const resp = await submitLocalAnswer(audioBlob);
                    
                    // Stop tracks to release mic
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsListening(true);
            } catch (err) {
                console.error("Mic access denied:", err);
                toast({ title: "Mic Error", description: "Could not access microphone.", variant: "destructive" });
            }
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
                        <h1 className="text-xl font-semibold">Audio Interview Setup</h1>
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
                                Connecting Audio...
                            </>
                        ) : (
                            "Start Audio Interview"
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

                                {audioUrl && (
                                    <audio
                                        key={audioUrl}
                                        src={audioUrl}
                                        autoPlay
                                        onEnded={() => setIsSpeaking(false)}
                                        onPlay={() => setIsSpeaking(true)}
                                        className="hidden"
                                    />
                                )}

                                {videoUrl && (
                                    <video
                                        key={videoUrl}
                                        ref={didVideoRef}
                                        src={videoUrl}
                                        autoPlay
                                        playsInline
                                        className={`w-full h-full object-cover transition-opacity duration-700 opacity-100`}
                                        onEnded={() => setIsSpeaking(false)}
                                        onPlay={() => setIsSpeaking(true)}
                                    />
                                )}

                                {/* Floating Speaker Icon for Audio Mode indication */}
                                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                                     <div className="bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/30 shadow-lg animate-pulse">
                                         <Volume2 className="h-6 w-6 text-primary" />
                                     </div>
                                     <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1 border border-white/10 uppercase tracking-widest font-bold">
                                         <Sparkles className="h-3 w-3 text-amber-400" />
                                         Groq Powered
                                     </div>
                                </div>

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

                            {/* Response Preview */}
                            {isListening && (
                                <div className="bg-secondary/50 p-6 rounded-xl shadow-inner border border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 animate-pulse">
                                    <div className="flex gap-1 justify-center items-end h-6">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, height: `${40 + Math.random() * 60}%` }} />
                                        ))}
                                    </div>
                                    <p className="text-primary font-medium">Recording Answer with GROQ STT...</p>
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

                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

    );
};
