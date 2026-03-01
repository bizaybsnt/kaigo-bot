"use client";

import { useState, useEffect } from "react";
import { Mic, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RecordPage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [transcript, setTranscript] = useState("");

    const simulateKaigoBotResponse = () => {
        if (isRecording) {
            // Stop recording, start processing
            setIsRecording(false);
            setIsProcessing(true);

            setTimeout(() => {
                setIsProcessing(false);
                setIsDone(true);
            }, 2500);
        } else {
            // Start recording
            setIsRecording(true);
            setTranscript("");
        }
    };

    // Simulate incoming transcript while recording
    useEffect(() => {
        if (!isRecording) return;

        const words = ["Suzuki-san", "ate", "80%", "of", "lunch", "and", "took", "blood", "pressure", "medication.", "Seems", "a", "bit", "tired", "today."];
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < words.length) {
                setTranscript(prev => prev + (prev ? " " : "") + words[currentIndex]);
                currentIndex++;
            }
        }, 400);

        return () => clearInterval(interval);
    }, [isRecording]);

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
                    {isRecording && (
                        <>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-30"></span>
                            <span className="absolute inset-0 rounded-full bg-rose-500 animate-[ping_2s_ease-out_infinite] opacity-20" style={{ animationDelay: '1s' }}></span>
                        </>
                    )}

                    <button
                        onClick={simulateKaigoBotResponse}
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

                {/* Live Transcript Box */}
                <div className="h-32 w-full px-6">
                    <p className="text-xl md:text-2xl font-medium leading-relaxed bg-clip-text text-transparent bg-gradient-to-br from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                        {transcript || (isRecording ? "..." : "")}
                    </p>
                </div>
            </div>
        </div>
    );
}
