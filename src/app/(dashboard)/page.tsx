"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Activity, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import type { IAgoraRTCClient, ILocalAudioTrack } from "agora-rtc-sdk-ng";
import { agora } from "./record/stt-message";

type Report = {
  id: string;
  patientName: string;
  time: string;
  foodIntake: string;
  medication: string;
  observations: string;
};

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const micRef = useRef<ILocalAudioTrack | null>(null);

  // Agora STT Refs
  const sttTaskIdRef = useRef<string | null>(null);

  const transcriptRef = useRef("");
  const interimRef = useRef("");

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "e7f6e9aeecf14b2ba10e3f40be9f56e7";
  const channel = process.env.NEXT_PUBLIC_AGORA_CHANNEL ?? "test";
  const token = process.env.NEXT_PUBLIC_AGORA_TOKEN ?? null;
  const [reports] = useState<Report[]>([
    {
      id: "1",
      patientName: "Tanaka-san",
      time: "10:30 AM",
      foodIntake: "100%",
      medication: "Blood pressure meds taken",
      observations: "In good spirits, participated in morning exercises.",
    },
    {
      id: "2",
      patientName: "Kobayashi-san",
      time: "09:15 AM",
      foodIntake: "50%",
      medication: "Painkillers (as needed) given",
      observations: "Complained of mild back pain, resting in bed.",
    },
  ]);

  const handleStreamMessage = (uid: number, payload: Uint8Array) => {
    try {
      const msg = agora.audio.stt.Text.decode(payload);
      if (!msg.words || msg.words.length === 0) return;

      let isFinal = false;
      let currentText = "";

      msg.words.forEach(word => {
        if (word.isFinal) {
          isFinal = true;
        }
        currentText += word.text;
      });

      if (isFinal) {
        transcriptRef.current = (transcriptRef.current + currentText).trim();
        interimRef.current = "";
      } else {
        interimRef.current = currentText;
      }

      setTranscript((transcriptRef.current + " " + interimRef.current).trim());
    } catch (e) {
      console.error("Stream message decode error:", e);
    }
  };

  const startAgoraSTT = async () => {
    try {
      const res = await fetch("/api/agora/stt/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: channel }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to start STT: ${res.status} - ${errorData.details || res.statusText}`);
      }
      const data = await res.json();
      sttTaskIdRef.current = data.taskId;
    } catch (error) {
      console.error("Error starting Agora STT:", error);
    }
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

  const startAgora = async () => {
    const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current.on("stream-message", handleStreamMessage);
    }
    await clientRef.current.join(appId, channel, token || null, null);
    micRef.current = await AgoraRTC.createMicrophoneAudioTrack();
    await clientRef.current.publish([micRef.current]);
  };

  const stopAgora = async () => {
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
      setIsRecording(false);
      await stopAgoraSTT();
      await stopAgora();
    } else {
      setTranscript("");
      transcriptRef.current = "";
      interimRef.current = "";
      setIsRecording(true);
      try {
        await startAgora();
        await startAgoraSTT();
      } catch (e) {
        console.error(e);
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

  return (
    <div className="space-y-8 pb-32">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Good morning, Kumiko
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          You have 12 patients assigned today. 2 reports pending.
        </p>
      </div>

      {/* Voice Assistant Widget */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shadow-2xl shadow-indigo-500/20 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-900/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center md:justify-start gap-2">
              <Mic className="w-6 h-6" /> Kaigo-Bot Auto Report
            </h2>
            <p className="text-indigo-100 max-w-lg mb-6 leading-relaxed">
              Just tap the mic and speak naturally. For example: &quot;Suzuki-san ate 80% of his lunch and took his blood pressure medication...&quot;
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={toggleRecording}
                className={`relative group bg-white text-indigo-600 rounded-full pl-4 pr-6 py-3 font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:scale-105 active:scale-95 disabled:opacity-80 disabled:hover:scale-100 ${isRecording ? "ring-4 ring-rose-500/50" : ""
                  }`}
              >
                {isRecording && (
                  <span className="absolute -inset-1 rounded-full border-2 border-rose-500 animate-ping opacity-30"></span>
                )}

                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRecording ? "bg-rose-100 text-rose-500" : "bg-indigo-50 text-indigo-500"
                  }`}>
                  <Mic className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`} />
                </div>
                {isRecording
                  ? "Listening... Tap to stop"
                  : "Tap to Speak"
                }
              </button>

              {isRecording && (
                <div className="flex items-center gap-1.5 h-6">
                  <span className="w-1.5 h-3 bg-rose-400 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                  <span className="w-1.5 h-5 bg-rose-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                  <span className="w-1.5 h-6 bg-rose-400 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                  <span className="w-1.5 h-4 bg-rose-400 rounded-full animate-[bounce_1s_infinite_600ms]"></span>
                  <span className="w-1.5 h-2 bg-rose-400 rounded-full animate-[bounce_1s_infinite_800ms]"></span>
                </div>
              )}
            </div>
            {transcript && (
              <div className="mt-6 bg-white/10 rounded-xl p-4 border border-white/20 text-white">
                <div className="text-sm font-medium mb-2">Transcript</div>
                <div className="text-white/90 whitespace-pre-wrap">{transcript}</div>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col items-center bg-black/20 backdrop-blur-md rounded-2xl p-4 min-w-[200px] border border-white/10">
            <Activity className="w-8 h-8 text-white/80 mb-2" />
            <span className="text-sm font-medium text-white/90">System Status</span>
            <span className="text-xs text-green-300 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" /> Online & Ready
            </span>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Today&apos;s Reports</h3>
          <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center hover:text-indigo-700 transition-colors">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {report.patientName}
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-xs font-medium">Logged</span>
          </h4>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Clock className="w-3.5 h-3.5 mr-1" /> {report.time}
          </div>
        </div>
        <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2 bg-gray-50 dark:bg-white/5 rounded-full opacity-0 group-hover:opacity-100">
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Details</div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{report.foodIntake} consumed</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/5">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medication</div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{report.medication}</p>
        </div>

        <div className="bg-indigo-50/50 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-500/20">
          <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Observations</div>
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{report.observations}</p>
        </div>
      </div>
    </div>
  );
}
