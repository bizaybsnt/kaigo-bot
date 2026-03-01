import { FileText } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports Archive</h1>
                <p className="text-gray-500">Historical view of all AI-generated nursing reports.</p>
            </div>

            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-full mb-4">
                    <FileText className="w-10 h-10 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Report History</h2>
                <p className="text-gray-500 max-w-md text-center">All past reports are securely archived here. Use the search bar to find specific patient logs.</p>
            </div>
        </div>
    );
}
