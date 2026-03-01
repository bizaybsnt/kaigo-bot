"use client";

import { useEffect, useState } from "react";
import { Users, AlertCircle, HeartPulse, Activity, Mic, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { CareReport } from "@/lib/types";
import { loadReports } from "@/lib/types";

type Patient = {
    id: string;
    name: string;
    age: number;
    room: string;
    condition: string;
    todayStatus: "Stable" | "Requires Attention" | "Critical";
    lastCheck: string;
    notes: string;
};

const dummyPatients: Patient[] = [
    {
        id: "1",
        name: "Hiroshi Tanaka",
        age: 82,
        room: "A-102",
        condition: "Hypertension, Mild Dementia",
        todayStatus: "Stable",
        lastCheck: "10:30 AM",
        notes: "Ate full breakfast. Complained of minor joint pain.",
    },
    {
        id: "2",
        name: "Yoko Sato",
        age: 78,
        room: "B-205",
        condition: "Post-surgery recovery (Hip)",
        todayStatus: "Requires Attention",
        lastCheck: "09:45 AM",
        notes: "Refused morning medication. Seems agitated.",
    },
    {
        id: "3",
        name: "Kenji Watanabe",
        age: 85,
        room: "A-105",
        condition: "Type 2 Diabetes",
        todayStatus: "Stable",
        lastCheck: "11:00 AM",
        notes: "Blood sugar levels normal. Walked in the garden.",
    },
    {
        id: "4",
        name: "Kumiko Takahashi",
        age: 91,
        room: "C-301",
        condition: "Severe Alzheimer's",
        todayStatus: "Stable",
        lastCheck: "08:15 AM",
        notes: "Slept well. Needs assistance with feeding.",
    },
];

function statusColors(status: Patient["todayStatus"]) {
    if (status === "Stable") return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
    if (status === "Requires Attention") return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
}

function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return isToday ? `Today ${time}` : d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`;
}

export default function PatientsPage() {
    const [reportMap, setReportMap] = useState<Record<string, CareReport>>({});

    useEffect(() => {
        const reports = loadReports();
        // Build a map: patientId → most recent report
        const map: Record<string, CareReport> = {};
        for (const r of reports) {
            const key = r.patientId ?? r.patientName;
            if (!map[key]) map[key] = r; // loadReports returns newest-first
        }
        setReportMap(map);
    }, []);

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Patients</h1>
                    <p className="text-gray-500">You have {dummyPatients.length} patients assigned today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 dark:border-white/10">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Shift Started: 08:00 AM</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dummyPatients.map(patient => {
                    const recordUrl = `/record?patientId=${patient.id}&name=${encodeURIComponent(patient.name)}&room=${encodeURIComponent(patient.room)}`;
                    const lastReport = reportMap[patient.id] ?? reportMap[patient.name] ?? null;

                    return (
                        <div key={patient.id} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col gap-4">
                            {/* Patient header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                        <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{patient.name}</h3>
                                        <p className="text-sm text-gray-500">Room {patient.room} · {patient.age} yrs</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColors(patient.todayStatus)}`}>
                                    {patient.todayStatus === "Requires Attention" && <AlertCircle className="w-3 h-3" />}
                                    {patient.todayStatus}
                                </span>
                            </div>

                            {/* Condition */}
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Condition</span>
                                <span className="text-sm text-gray-800 dark:text-gray-200">{patient.condition}</span>
                            </div>

                            {/* Last logged report OR default notes */}
                            {lastReport ? (
                                <div className="flex flex-col bg-green-50/60 dark:bg-green-500/5 p-3 rounded-xl border border-green-100 dark:border-green-500/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Last Report
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {formatTime(lastReport.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                                        {lastReport.observations ?? lastReport.foodIntake ?? lastReport.transcript ?? "Report saved."}
                                    </p>
                                    <Link
                                        href="/reports"
                                        className="text-xs text-indigo-500 hover:text-indigo-700 mt-1.5 self-end font-medium"
                                    >
                                        View full report →
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                                    <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <HeartPulse className="w-3 h-3" /> Today&apos;s Notes
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{patient.notes}</span>
                                    <span className="text-xs text-gray-400 mt-2 text-right">Last checked: {patient.lastCheck}</span>
                                </div>
                            )}

                            {/* Log Visit button */}
                            <Link
                                href={recordUrl}
                                className="mt-auto flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20 text-white font-semibold text-base"
                            >
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Mic className="w-4 h-4" />
                                </div>
                                {lastReport ? "Log Another Visit" : "Log Visit"}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
