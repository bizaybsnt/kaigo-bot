import { Home, Users, FileText, Settings, LogOut, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen sm:flex flex-col hidden bg-white/40 dark:bg-black/40 backdrop-blur-xl border-r border-white/20 dark:border-white/10 p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-12">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/30">
                    <HeartPulse className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
                    Kaigo-Bot
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                <SidebarItem icon={<Home className="w-5 h-5" />} label="Dashboard" active />
                <SidebarItem icon={<Users className="w-5 h-5" />} label="Patients" />
                <SidebarItem icon={<FileText className="w-5 h-5" />} label="Reports" />
                <SidebarItem icon={<Settings className="w-5 h-5" />} label="Settings" />
            </nav>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/10">
                <SidebarItem icon={<LogOut className="w-5 h-5" />} label="Logout" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" />
            </div>
        </aside>
    );
}

function SidebarItem({ icon, label, active, className = "" }: { icon: React.ReactNode, label: string, active?: boolean, className?: string }) {
    return (
        <Link
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                    ? "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5"
                } ${className}`}
        >
            <div className={`${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"}`}>
                {icon}
            </div>
            <span>{label}</span>
        </Link>
    );
}
