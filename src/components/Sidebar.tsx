"use client";

import { Home, Users, FileText, Settings, LogOut, HeartPulse, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
    const { isOpen, setIsOpen } = useSidebar();
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out sm:translate-x-0 sm:static sm:flex flex-col bg-white/90 sm:bg-white/40 dark:bg-black/90 sm:dark:bg-black/40 backdrop-blur-xl border-r border-white/20 dark:border-white/10 p-6 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/30">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
                            Kaigo-Bot
                        </h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem href="/" icon={<Home className="w-5 h-5" />} label="Dashboard" active={pathname === "/"} onClick={() => setIsOpen(false)} />
                    <SidebarItem href="/patients" icon={<Users className="w-5 h-5" />} label="Patients" active={pathname === "/patients"} onClick={() => setIsOpen(false)} />
                    <SidebarItem href="/reports" icon={<FileText className="w-5 h-5" />} label="Reports" active={pathname === "/reports"} onClick={() => setIsOpen(false)} />
                    <SidebarItem href="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/settings"} onClick={() => setIsOpen(false)} />
                </nav>

                <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/10">
                    <SidebarItem href="/login" icon={<LogOut className="w-5 h-5" />} label="Logout" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => setIsOpen(false)} />
                </div>
            </aside>
        </>
    );
}

function SidebarItem({ icon, label, href, active, className = "", onClick }: { icon: React.ReactNode, label: string, href: string, active?: boolean, className?: string, onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
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
