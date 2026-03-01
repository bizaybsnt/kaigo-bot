"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, Mic, Search, Inbox } from "lucide-react";
import type { CareReport } from "@/lib/types";
import { loadReports } from "@/lib/types";

const FIELD_MAP: { key: keyof CareReport; label: string; style: "default" | "purple" | "amber" | "rose" | "green" }[] = [
    { key: "foodIntake",    label: "Food Details",       style: "green" },
    { key: "hydration",     label: "Hydration",          style: "green" },
    { key: "medication",    label: "Medication",         style: "default" },
    { key: "vitalSigns",    label: "Vital Signs",        style: "rose" },
    { key: "mobility",      label: "Mobility / Activity",style: "amber" },
    { key: "mood",          label: "Mood / Mental State",style: "amber" },
    { key: "skinCondition", label: "Skin Condition",     style: "rose" },
    { key: "toileting",     label: "Toileting",          style: "default" },
    { key: "observations",  label: "Observations",       style: "purple" },
    { key: "followUp",      label: "Follow-up Actions",  style: "rose" },
];

const cellStyles = {
    default: "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500",
    purple:  "bg-purple-50/50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/10 text-purple-600 dark:text-purple-400",
    amber:   "bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-600 dark:text-amber-400",
    rose:    "bg-rose-50/50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-600 dark:text-rose-400",
    green:   "bg-green-50/50 dark:bg-green-500/5 border-green-100 dark:border-green-500/10 text-green-600 dark:text-green-400",
};

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return isToday ? `Today, ${time}` : `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<CareReport[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setReports(loadReports());
    }, []);

    const filtered = reports.filter(r =>
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (r.observations ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-24 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports Archive</h1>
                    <p className="text-gray-500">
                        {reports.length === 0
                            ? "No reports yet — start a recording from the Patients page."
                            : `${reports.length} AI-generated care report${reports.length !== 1 ? "s" : ""}.`}
                    </p>
                </div>
                <div className="relative max-w-xs w-full">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by patient or notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/70 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-400 gap-4">
                    <Inbox className="w-16 h-16 opacity-30" />
                    <p className="font-medium">{search ? "No reports match your search." : "No reports saved yet."}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(report => {
                        const visibleFields = FIELD_MAP.filter(f => report[f.key]);
                        return (
                            <div key={report.id} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-white/5 gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg shrink-0">
                                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{report.patientName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> {formatDate(report.timestamp)}
                                                </span>
                                                {report.patientRoom && (
                                                    <span className="text-gray-400">· Room {report.patientRoom}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 w-fit">
                                        <Mic className="w-3.5 h-3.5" /> Voice Assistant
                                    </span>
                                </div>

                                {/* Fields grid */}
                                {visibleFields.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {visibleFields.map(f => (
                                            <div key={f.key} className={`rounded-xl p-3 border ${cellStyles[f.style]}`}>
                                                <p className="text-xs font-semibold uppercase tracking-wider mb-1">{f.label}</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                                    {String(report[f.key])}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No structured data — see raw transcript.</p>
                                )}

                                {/* Raw transcript */}
                                {report.transcript && (
                                    <details className="mt-3 group">
                                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none">
                                            Raw transcript ›
                                        </summary>
                                        <p className="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-100 dark:border-white/5">
                                            {report.transcript}
                                        </p>
                                    </details>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
