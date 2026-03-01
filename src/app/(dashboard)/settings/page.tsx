import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-500">Configure your Kaigo-Bot preferences and account details.</p>
            </div>

            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full mb-4">
                    <Settings className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">App Configuration</h2>
                <p className="text-gray-500 max-w-md text-center">Voice assistant sensitivities, language preferences, and notification settings will be available here.</p>
            </div>
        </div>
    );
}
