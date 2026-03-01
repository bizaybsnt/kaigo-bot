"use client";

import { Bell, Search, Menu, Mic } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Header() {
    const { toggle } = useSidebar();

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={toggle}
                    className="p-2 -ml-2 sm:hidden rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 max-w-md relative hidden md:block">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patients, reports..."
                        className="w-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-400 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 ml-auto">
                <button className="relative p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-black"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Kumiko T.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Head Caregiver</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-200 to-orange-400 p-0.5 shadow-sm">
                        <img
                            src="https://api.dicebear.com/7.x/notionists/svg?seed=Kumiko&backgroundColor=transparent"
                            alt="Profile"
                            className="w-full h-full rounded-full bg-white/90 object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
