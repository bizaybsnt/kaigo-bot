"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { agora } from "./stt-message";

export default function RecordPage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [sttError, setSttError] = useState<string | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const micRef = useRef<ILocalAudioTrack | null>(null);
    const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Agora STT Refs
    const sttTaskIdRef = useRef<string | null>(null);

    const transcriptRef = useRef("");
    const interimRef = useRef("");

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "e7f6e9aeecf14b2ba10e3f40be9f56e7";
    const channel = process.env.NEXT_PUBLIC_AGORA_CHANNEL ?? "test";
    const token = process.env.NEXT_PUBLIC_AGORA_TOKEN ?? null;

    const handleStreamMessage = (uid: number, payload: Uint8Array) => {
        console.log("[STT] stream-message from uid:", uid, "payload bytes:", payload.length);
        try {
            const msg = agora.audio.stt.Text.decode(payload);
            console.log("[STT] decoded msg:", JSON.stringify(msg));

            // Wait for words array
            if (!msg.words || msg.words.length === 0) return;

            let isFinal = false;
            let currentText = "";

            // Loop through words in the segment
            msg.words.forEach(word => {
                if (word.isFinal) {
                    isFinal = true;
                }
                currentText += word.text;
            });

            if (isFinal) {
                transcriptRef.current = (transcriptRef.current + " " + currentText).trim();
                interimRef.current = "";
            } else {
                interimRef.current = currentText;
            }

            const full = (transcriptRef.current + " " + interimRef.current).trim();
            console.log("[STT] transcript update:", full);
            setTranscript(full);
        } catch (e) {
            console.error("[STT] stream message decode error:", e);
        }
    };

    const startAgoraSTT = async (userUid: string) => {
        const res = await fetch("/api/agora/stt/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelName: channel, userUid }),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const msg = `STT start failed (${res.status}): ${errorData.details || errorData.error || res.statusText}`;
            throw new Error(msg);
        }
        const data = await res.json();
        sttTaskIdRef.current = data.taskId;
        console.log("[STT] started, taskId:", data.taskId);
    };

    const stopAgoraSTT = async () => {
        if (!sttTaskIdRef.current) return;
        try {
            await fetch("/api/agora/stt/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: sttTaskIdRef.current
                }),
            });
            sttTaskIdRef.current = null;
        } catch (error) {
            console.error("Error stopping Agora STT:", error);
        }
    };

    const startAgora = async (): Promise<string> => {
        const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
        if (!clientRef.current) {
            clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            clientRef.current.on("stream-message", handleStreamMessage);
        }
        // join() returns the assigned UID — needed so we can tell the STT bot which UID to subscribe to
        const assignedUid = await clientRef.current.join(appId, channel, token || null, null);
        console.log("[Agora RTC] joined channel, uid:", assignedUid);
        micRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current.publish([micRef.current]);

        // Start volume detection loop
        volumeIntervalRef.current = setInterval(() => {
            if (micRef.current) {
                const volume = micRef.current.getVolumeLevel();
                // Agora volume is between 0 and 1. Increased threshold to ignore background noise.
                if (volume > 0.15) {
                    setIsSpeaking(true);
                    if (speakingTimeoutRef.current) {
                        clearTimeout(speakingTimeoutRef.current);
                    }
                    // Keep speaking state active for a short decay period after audio drops
                    speakingTimeoutRef.current = setTimeout(() => {
                        setIsSpeaking(false);
                    }, 500);
                }
            }
        }, 100);

        return String(assignedUid);
    };

    const stopAgora = async () => {
        if (volumeIntervalRef.current) {
            clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = null;
        }
        if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = null;
        }
        setIsSpeaking(false);

        if (clientRef.current) {
            if (micRef.current) {
                try {
                    await clientRef.current.unpublish([micRef.current]);
                } catch { }
                try {
                    micRef.current.close();
                } catch { }
                micRef.current = null;
            }
            try {
                await clientRef.current.leave();
            } catch { }
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording, start processing
            setIsRecording(false);
            setIsProcessing(true);
            await stopAgoraSTT();
            await stopAgora();

            setTimeout(() => {
                setIsProcessing(false);
                setIsDone(true);
            }, 2500);
        } else {
            // Start recording
            setTranscript("");
            setSttError(null);
            transcriptRef.current = "";
            interimRef.current = "";
            setIsRecording(true);
            try {
                const uid = await startAgora();
                await startAgoraSTT(uid);
            } catch (e: any) {
                console.error("[STT] setup error:", e);
                setSttError(e?.message ?? "Failed to start recording");
                setIsRecording(false);
                await stopAgora();
            }
        }
    };

    useEffect(() => {
        return () => {
            stopAgoraSTT();
            stopAgora();
        };
    }, []);

    if (isDone) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Logged!</h2>
                <p className="text-gray-500 text-center max-w-sm mb-8">
                    The voice snippet has been processed and saved securely as a structured report for Suzuki-san.
                </p>
                <div className="w-full max-w-sm bg-gray-50 dark:bg-black/30 p-4 rounded-xl border border-gray-100 dark:border-white/10 mb-8 max-h-48 overflow-y-auto">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Final STT Transcript</h3>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{transcript || "No transcript recorded"}</p>
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative">
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium mb-8 shrink-0">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Link>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center pb-20">
                <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-12">
                    {isProcessing ? "Analyzing report..." : isRecording ? "Listening..." : "Tap to start recording"}
                </h2>

                {/* Massive Recording Button */}
                <div className="relative mb-16">
                    {/* Render pinging rings ONLY if speaking */}
                    {isRecording && isSpeaking && (
                        <>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-30"></span>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-20" style={{ animationDelay: '1s' }}></span>
                        </>
                    )}

                    <button
                        onClick={toggleRecording}
                        disabled={isProcessing}
                        className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${isProcessing
                            ? "bg-gray-100 dark:bg-white/10"
                            : isRecording
                                ? "bg-gradient-to-b from-rose-400 to-rose-600 shadow-rose-500/40"
                                : "bg-gradient-to-b from-indigo-500 to-purple-600 shadow-indigo-500/40 hover:scale-[1.05]"
                            }`}
                    >
                        <div className="w-full h-full rounded-full border border-white/20 flex flex-col items-center justify-center text-white">
                            {isProcessing ? (
                                <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
                            ) : (
                                <>
                                    <Mic className={`w-20 h-20 ${isRecording ? "animate-pulse" : ""}`} />
                                    {isRecording && <span className="absolute bottom-8 text-sm font-semibold tracking-widest uppercase">Stop</span>}
                                </>
                            )}
                        </div>
                    </button>
                </div>

                {/* STT Error */}
                {sttError && (
                    <div className="w-full px-4 mb-4">
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300 text-center">
                            {sttError}
                        </div>
                    </div>
                )}

                {/* Live Transcript Box */}
                <div className="h-32 w-full px-6 overflow-y-auto">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed bg-clip-text text-transparent bg-gradient-to-br from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                        {transcript || (isRecording ? "..." : "")}
                    </p>
                </div>
            </div>
        </div>
    );
}
