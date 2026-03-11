/**
 * D-ID Real-Time Streaming Avatar — via Vite Proxy
 *
 * Key insight: D-ID keeps the video track "muted" until you send a /talk command.
 * We must NOT wait for onunmute. Instead we call onStream as soon as:
 *   - video track is received via ontrack  AND
 *   - ICE connection state reaches "connected" or "completed"
 * whichever happens last.
 */

import { API_BASE_URL } from "../config";

const BACKEND = API_BASE_URL; // Routes /did/* to Railway backend

async function backendFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BACKEND}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Backend ${res.status}: ${res.statusText}`);
    }
    if (res.status === 204) return {} as T;
    return res.json();
}

export interface DIDStreamSession {
    streamId: string;
    sessionId: string;
    pc: RTCPeerConnection;
}

let activeDIDSession: DIDStreamSession | null = null;

export async function initDIDStream(
    onStream: (stream: MediaStream) => void,
    onStateChange?: (state: string) => void
): Promise<DIDStreamSession | null> {
    if (activeDIDSession) await destroyDIDStream();

    // 1. Backend creates D-ID stream → returns WebRTC offer + ICE servers
    const streamData = await backendFetch<{
        id: string;
        session_id: string;
        offer: RTCSessionDescriptionInit;
        ice_servers: RTCIceServer[];
    }>("POST", "/api/interviews/did/stream/create/");

    const { id: streamId, session_id: sessionId, offer, ice_servers: iceServers } = streamData;
    console.log("[D-ID] Session created:", streamId);

    const pc = new RTCPeerConnection({ iceServers });

    // ── State shared between handlers ─────────────────────────────────────
    let videoStream: MediaStream | null = null;
    let iceConnected = false;
    let streamDelivered = false;

    function tryDeliverStream() {
        // Deliver the stream once we have BOTH the video track AND ICE connected
        if (videoStream && iceConnected && !streamDelivered) {
            streamDelivered = true;
            console.log("[D-ID] Delivering stream to UI");
            onStream(videoStream);
        }
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── ALL handlers set BEFORE setLocalDescription (critical for ICE) ───

    pc.ontrack = (ev) => {
        console.log("[D-ID] ontrack:", ev.track.kind, "streams:", ev.streams.length);
        if (ev.track.kind === "video") {
            videoStream = ev.streams?.[0] ?? new MediaStream([ev.track]);
            tryDeliverStream();
        }
    };

    pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log("[D-ID] ICE state:", state);
        onStateChange?.(state);
        if (state === "connected" || state === "completed") {
            iceConnected = true;
            tryDeliverStream();
        }
        if (state === "failed" || state === "disconnected") {
            onStateChange?.("disconnected");
        }
    };

    // ICE candidate handler MUST be before setLocalDescription
    pc.onicecandidate = async (ev) => {
        if (!ev.candidate) return;
        try {
            await backendFetch("POST", `/api/interviews/did/stream/${streamId}/ice/`, {
                candidate: ev.candidate.candidate,
                sdpMid: ev.candidate.sdpMid,
                sdpMLineIndex: ev.candidate.sdpMLineIndex,
                session_id: sessionId,
            });
        } catch (e) {
            console.warn("[D-ID] ICE send failed:", e);
        }
    };

    // ── SDP exchange ──────────────────────────────────────────────────────
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer); // ICE gathering starts here — handler already set
    await backendFetch("POST", `/api/interviews/did/stream/${streamId}/sdp/`, {
        answer: pc.localDescription,
        session_id: sessionId,
    });

    activeDIDSession = { streamId, sessionId, pc };
    console.log("[D-ID] WebRTC setup complete — waiting for ICE + video track");
    return activeDIDSession;
}

/**
 * Make the avatar speak — D-ID starts streaming avatar video frames immediately.
 */
export async function sendTalkToDID(text: string): Promise<void> {
    if (!activeDIDSession) return;
    const { streamId, sessionId } = activeDIDSession;
    await backendFetch("POST", `/api/interviews/did/stream/${streamId}/talk/`, {
        text: text.substring(0, 500),
        session_id: sessionId,
    });
}

export async function destroyDIDStream(): Promise<void> {
    if (!activeDIDSession) return;
    const { streamId, sessionId, pc } = activeDIDSession;
    activeDIDSession = null;
    pc.close();
    try {
        await backendFetch("DELETE", `/api/interviews/did/stream/${streamId}/delete/?session_id=${sessionId}`);
    } catch (e) {
        console.warn("[D-ID] destroy failed:", e);
    }
}

export function isDIDConfigured(): boolean {
    return true;
}
