import { Users, AlertCircle, HeartPulse, Activity } from "lucide-react";

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

export default function PatientsPage() {
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
                {dummyPatients.map((patient) => (
                    <div key={patient.id} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{patient.name}</h3>
                                    <p className="text-sm text-gray-500">Room {patient.room} • {patient.age} yrs</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${patient.todayStatus === "Stable"
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                                    : patient.todayStatus === "Requires Attention"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                                }`}>
                                {patient.todayStatus === "Requires Attention" && <AlertCircle className="w-3 h-3" />}
                                {patient.todayStatus}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Condition</span>
                                <span className="text-sm text-gray-800 dark:text-gray-200">{patient.condition}</span>
                            </div>

                            <div className="flex flex-col bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <HeartPulse className="w-3 h-3" /> Today&apos;s Notes
                                </span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{patient.notes}</span>
                                <span className="text-xs text-gray-400 mt-2 text-right">Last checked: {patient.lastCheck}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
