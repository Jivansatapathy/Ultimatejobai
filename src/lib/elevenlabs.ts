const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
const ELEVENLABS_VOICE_ID = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string) || "JBFqnCBsd6RMkjVDRZzb";

let currentAudio: HTMLAudioElement | null = null;
let speakingChangeCallback: ((isSpeaking: boolean) => void) | null = null;

/**
 * Speak text using ElevenLabs TTS. Falls back to browser speechSynthesis if
 * the API key is not configured.
 * @param onSpeakingChange - optional callback fired when speaking starts/ends
 */
export async function speakWithElevenLabs(
    text: string,
    onSpeakingChange?: (isSpeaking: boolean) => void
): Promise<void> {
    stopSpeaking();
    if (onSpeakingChange) speakingChangeCallback = onSpeakingChange;

    // Fall back to browser TTS if no API key is set
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "your_elevenlabs_api_key_here") {
        return speakBrowserFallback(text, onSpeakingChange);
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": ELEVENLABS_API_KEY,
                    Accept: "audio/mpeg",
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.3,
                        use_speaker_boost: true,
                    },
                    optimize_streaming_latency: 2,
                    output_format: "mp3_44100_128",
                }),
            }
        );

        if (!response.ok) {
            console.warn("ElevenLabs TTS failed, falling back to browser TTS:", response.statusText);
            return speakBrowserFallback(text, onSpeakingChange);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        onSpeakingChange?.(true);
        currentAudio.onended = () => {
            URL.revokeObjectURL(url);
            onSpeakingChange?.(false);
            speakingChangeCallback = null;
        };
        await currentAudio.play();
    } catch (error) {
        console.warn("ElevenLabs TTS error, falling back to browser TTS:", error);
        speakBrowserFallback(text, onSpeakingChange);
    }
}

/** Stop any currently playing ElevenLabs or browser TTS audio. */
export function stopSpeaking(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        speakingChangeCallback?.(false);
        speakingChangeCallback = null;
    }
    window.speechSynthesis?.cancel();
}

function speakBrowserFallback(text: string, onSpeakingChange?: (isSpeaking: boolean) => void): void {
    if (!window.speechSynthesis) return;
    if (onSpeakingChange) speakingChangeCallback = onSpeakingChange;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
        (v) =>
            v.name.includes("Google US English") ||
            v.name.includes("Samantha") ||
            v.name.includes("Natural")
    );
    if (preferred) utterance.voice = preferred;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}
