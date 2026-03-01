import { FileText, Clock, Mic, Search } from "lucide-react";

type ReportLog = {
    id: string;
    patientName: string;
    timestamp: string;
    foodIntake: string;
    medication: string;
    observations: string;
    generatedVia: "Voice Assistant";
};

const dummyReports: ReportLog[] = [
    {
        id: "rep-1",
        patientName: "Hiroshi Tanaka",
        timestamp: "Today, 10:32 AM",
        foodIntake: "100% Breakfast (Rice, Miso Soup, Fish)",
        medication: "Administered morning blood pressure pills.",
        observations: "Patient is in good spirits. Complained of minor joint pain in the left knee during morning walk.",
        generatedVia: "Voice Assistant"
    },
    {
        id: "rep-2",
        patientName: "Yoko Sato",
        timestamp: "Today, 09:47 AM",
        foodIntake: "30% Breakfast",
        medication: "Refused prescribed painkillers.",
        observations: "Patient seems highly agitated and refused to eat most of her meal. Needs a follow-up check by the head nurse.",
        generatedVia: "Voice Assistant"
    },
    {
        id: "rep-3",
        patientName: "Kenji Watanabe",
        timestamp: "Today, 08:30 AM",
        foodIntake: "80% Breakfast",
        medication: "Insulin injected successfully.",
        observations: "Fasting blood sugar was 110 mg/dL. Everything looks completely normal today.",
        generatedVia: "Voice Assistant"
    },
    {
        id: "rep-4",
        patientName: "Kumiko Takahashi",
        timestamp: "Yesterday, 07:15 PM",
        foodIntake: "100% Dinner",
        medication: "Evening supplements given.",
        observations: "Required 30 minutes of assistance with feeding. Very sleepy after dinner.",
        generatedVia: "Voice Assistant"
    }
];

export default function ReportsPage() {
    return (
        <div className="space-y-6 pb-24 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports Archive</h1>
                    <p className="text-gray-500">Historical view of all AI-generated nursing reports.</p>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-white/70 dark:bg-black/40 border border-white/40 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {dummyReports.map((report) => (
                    <div key={report.id} className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg">
                                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{report.patientName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="w-3.5 h-3.5" /> {report.timestamp}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 w-fit">
                                <Mic className="w-3.5 h-3.5" /> {report.generatedVia}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Details</div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{report.foodIntake}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Medication</div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{report.medication}</p>
                            </div>

                            <div className="bg-purple-50/50 dark:bg-purple-500/5 rounded-xl p-4 border border-purple-100 dark:border-purple-500/10">
                                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Observations</div>
                                <p className="text-sm font-medium text-purple-900 dark:text-purple-200 leading-relaxed">{report.observations}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
