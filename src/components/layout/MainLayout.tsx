"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { QuickCheckinModal } from "@/components/attendance/QuickCheckinModal";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isQuickCheckinOpen, setIsQuickCheckinOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenQuickCheckin={() => setIsQuickCheckinOpen(true)} />
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white dark:bg-[#0f1115]">
          {children}
        </div>
        <QuickCheckinModal
          isOpen={isQuickCheckinOpen}
          onClose={() => setIsQuickCheckinOpen(false)}
        />
      </main>
    </div>
  );
};

