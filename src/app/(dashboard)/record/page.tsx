"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, ArrowLeft, Loader2, CheckCircle2, User, FileText, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { agora } from "./stt-message";
import type { CareReport } from "@/lib/types";
import { saveReport } from "@/lib/types";

type ReportField = { label: string; value: string | null; color?: "indigo" | "amber" | "rose" | "green" };

function ReportSection({ label, value, color = "indigo" }: ReportField) {
    if (!value) return null;
    const styles = {
        indigo: "bg-indigo-50/60 dark:bg-indigo-500/5 border-indigo-100 dark:border-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        amber: "bg-amber-50/60 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-600 dark:text-amber-400",
        rose: "bg-rose-50/60 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400",
        green: "bg-green-50/60 dark:bg-green-500/5 border-green-100 dark:border-green-500/10 text-green-600 dark:text-green-400",
    };
    return (
        <div className={`rounded-xl p-3 border ${styles[color]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{value}</p>
        </div>
    );
}

export default function RecordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const patientId = searchParams.get("patientId") ?? null;
    const patientName = searchParams.get("name") ?? null;
    const patientRoom = searchParams.get("room") ?? null;

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [isDone, setIsDone] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [sttError, setSttError] = useState<string | null>(null);
    const [savedReport, setSavedReport] = useState<CareReport | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const micRef = useRef<ILocalAudioTrack | null>(null);
    const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const sttTaskIdRef = useRef<string | null>(null);
    const transcriptRef = useRef("");
    const interimRef = useRef("");

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
    const channel = process.env.NEXT_PUBLIC_AGORA_CHANNEL ?? "test";
    const token = process.env.NEXT_PUBLIC_AGORA_TOKEN ?? null;

    const handleStreamMessage = (uid: number, payload: Uint8Array) => {
        console.log("[STT] stream-message from uid:", uid, "payload bytes:", payload.length);
        try {
            const msg = agora.audio.stt.Text.decode(payload);
            console.log("[STT] decoded msg:", JSON.stringify(msg));
            if (!msg.words || msg.words.length === 0) return;

            let isFinal = false;
            let currentText = "";
            msg.words.forEach(word => {
                if (word.isFinal) isFinal = true;
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
            throw new Error(`STT start failed (${res.status}): ${errorData.details || errorData.error || res.statusText}`);
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
                body: JSON.stringify({ taskId: sttTaskIdRef.current }),
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
        const assignedUid = await clientRef.current.join(appId, channel, token || null, null);
        console.log("[Agora RTC] joined channel, uid:", assignedUid);
        micRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current.publish([micRef.current]);

        volumeIntervalRef.current = setInterval(() => {
            if (micRef.current) {
                const volume = micRef.current.getVolumeLevel();
                if (volume > 0.15) {
                    setIsSpeaking(true);
                    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
                    speakingTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 500);
                }
            }
        }, 100);

        return String(assignedUid);
    };

    const stopAgora = async () => {
        if (volumeIntervalRef.current) { clearInterval(volumeIntervalRef.current); volumeIntervalRef.current = null; }
        if (speakingTimeoutRef.current) { clearTimeout(speakingTimeoutRef.current); speakingTimeoutRef.current = null; }
        setIsSpeaking(false);
        if (clientRef.current) {
            if (micRef.current) {
                try { await clientRef.current.unpublish([micRef.current]); } catch { }
                try { micRef.current.close(); } catch { }
                micRef.current = null;
            }
            try { await clientRef.current.leave(); } catch { }
        }
    };

    const generateAndSaveReport = async (finalTranscript: string) => {
        setProcessingStep("Generating AI care report...");
        const report: CareReport = {
            id: `rep-${Date.now()}`,
            patientId,
            patientName: patientName ?? "Unknown Patient",
            patientRoom,
            timestamp: new Date().toISOString(),
            transcript: finalTranscript,
            foodIntake: null,
            hydration: null,
            medication: null,
            vitalSigns: null,
            mobility: null,
            mood: null,
            skinCondition: null,
            toileting: null,
            observations: null,
            followUp: null,
        };

        try {
            const res = await fetch("/api/minimax/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: finalTranscript,
                    patientName: report.patientName,
                    patientRoom,
                }),
            });

            if (res.ok) {
                const aiFields = await res.json();
                Object.assign(report, aiFields);
            } else {
                const err = await res.json().catch(() => ({}));
                console.error("[MiniMax] report generation failed:", err);
                report.observations = finalTranscript || "No transcript available.";
            }
        } catch (e) {
            console.error("[MiniMax] error:", e);
            report.observations = finalTranscript || "No transcript available.";
        }

        saveReport(report);
        setSavedReport(report);
    };

    const toggleRecording = async () => {
        if (isRecording) {
            setIsRecording(false);
            setIsProcessing(true);
            setProcessingStep("Stopping recording...");
            await stopAgoraSTT();
            await stopAgora();
            await generateAndSaveReport(transcriptRef.current);
            setIsProcessing(false);
            setIsDone(true);
        } else {
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

    // ── DONE SCREEN ──────────────────────────────────────────────────────────
    if (isDone && savedReport) {
        const fields: ReportField[] = [
            { label: "Food Details", value: savedReport.foodIntake, color: "green" },
            { label: "Hydration", value: savedReport.hydration, color: "green" },
            { label: "Medication", value: savedReport.medication, color: "indigo" },
            { label: "Vital Signs", value: savedReport.vitalSigns, color: "rose" },
            { label: "Mobility / Activity", value: savedReport.mobility, color: "amber" },
            { label: "Mood / Mental State", value: savedReport.mood, color: "amber" },
            { label: "Skin Condition", value: savedReport.skinCondition, color: "rose" },
            { label: "Toileting", value: savedReport.toileting, color: "indigo" },
            { label: "Observations", value: savedReport.observations, color: "indigo" },
            { label: "Follow-up Actions", value: savedReport.followUp, color: "rose" },
        ].filter(f => f.value);

        return (
            <div className="max-w-lg mx-auto pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Success header */}
                <div className="flex flex-col items-center text-center pt-6 pb-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Report Saved!</h2>
                    <p className="text-gray-500 text-sm">
                        AI-generated care log for{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{savedReport.patientName}</span>
                    </p>
                    {patientRoom && <p className="text-xs text-gray-400 mt-0.5">Room {patientRoom}</p>}
                </div>

                {/* Report card */}
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-5 shadow-sm mb-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Care Report</span>
                        <span className="ml-auto text-xs text-gray-400">
                            {new Date(savedReport.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {fields.length > 0 ? fields.map(f => (
                            <ReportSection key={f.label} {...f} />
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-4">No structured data extracted.</p>
                        )}
                    </div>
                </div>

                {/* Raw transcript (collapsible feel via small size) */}
                {savedReport.transcript && (
                    <details className="mb-5 group">
                        <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none">
                            Raw Transcript ›
                        </summary>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                            {savedReport.transcript}
                        </p>
                    </details>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.push("/patients")}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        Back to Patients
                    </button>
                    <button
                        onClick={() => router.push("/reports")}
                        className="flex-1 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-2xl font-semibold transition-all active:scale-95 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                        View All Reports
                    </button>
                </div>
            </div>
        );
    }

    // ── RECORD SCREEN ─────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative">
            {/* Back link */}
            <Link
                href={patientName ? "/patients" : "/"}
                className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium mb-6 shrink-0"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {patientName ? "Back to Patients" : "Back"}
            </Link>

            {/* Patient context banner */}
            {patientName && (
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl px-4 py-3 mb-6 shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Recording for</p>
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">{patientName}</p>
                        {patientRoom && <p className="text-xs text-gray-500">Room {patientRoom}</p>}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center pb-20">
                <h2 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-4">
                    {isProcessing ? processingStep : isRecording ? "Listening..." : "Tap to start recording"}
                </h2>

                {isProcessing && (
                    <p className="text-sm text-gray-400 mb-8">Please wait while we generate the care report.</p>
                )}

                {/* Recording Button */}
                <div className="relative mb-12">
                    {isRecording && isSpeaking && (
                        <>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-30"></span>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-20" style={{ animationDelay: "1s" }}></span>
                        </>
                    )}
                    <button
                        onClick={toggleRecording}
                        disabled={isProcessing}
                        className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                            isProcessing
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
                    <div className="w-full mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">{sttError}</p>
                    </div>
                )}

                {/* Live Transcript */}
                <div className="h-28 w-full px-6 overflow-y-auto">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed bg-clip-text text-transparent bg-gradient-to-br from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                        {transcript || (isRecording ? "..." : "")}
                    </p>
                </div>
            </div>
        </div>
    );
}
