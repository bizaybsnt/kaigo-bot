import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNavBar from "@/components/BottomNavBar";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <div className="flex min-h-[100dvh]">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-black dark:to-purple-950/20 pb-28 sm:pb-6">
                        <div className="max-w-6xl mx-auto h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <BottomNavBar />
        </SidebarProvider>
    );
}
