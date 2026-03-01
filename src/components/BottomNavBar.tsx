"use client";

import { Home, Users, Mic } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavBar() {
    const pathname = usePathname();

    // Don't show the bottom nav on the actual record page so it stays distraction-free
    if (pathname === "/record") return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 sm:hidden pb-safe">
            <div className="flex items-center justify-around h-20 px-6 relative">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${pathname === "/" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}
                >
                    <Home className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                {/* Center Floating Action Button (FAB) */}
                <div className="relative -top-6">
                    <Link href="/record">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform hover:scale-105">
                            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center border border-white/20">
                                <Mic className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        </div>
                        {/* Pulsing ring aura */}
                        <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 -z-10"></div>
                    </Link>
                </div>

                <Link
                    href="/patients"
                    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${pathname === "/patients" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}
                >
                    <Users className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium">Patients</span>
                </Link>
            </div>
        </div>
    );
}
