import React, { useState } from 'react';
import { ResQNetProvider, useResQNet } from './context/ResQNetContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { NavigationSidebar } from './components/NavigationSidebar';
import { CitizenViews } from './views/citizen/CitizenViews';
import { AdminViews } from './views/admin/AdminViews';
import { TeamViews } from './views/team/TeamViews';
import { PoliceViews } from './views/police/PoliceViews';
import { Menu, X, ShieldAlert, PhoneCall, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role } = useResQNet();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (role) {
      case 'citizen':
        return <CitizenViews />;
      case 'admin':
        return <AdminViews />;
      case 'team':
        return <TeamViews />;
      case 'police':
        return <PoliceViews />;
      default:
        return <AdminViews />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080D18] text-[#F3F6FA]">
      {/* Top Persistent Role Switcher Bar */}
      <RoleSwitcherBar />

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#14243D] border-b border-[#223552]">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg bg-[#080D18] text-[#A7B3C5] hover:text-white border border-[#223552]"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <span className="font-extrabold tracking-tight text-sm text-[#F3F6FA]">
          RESQ<span className="text-[#E5484D]">NET</span> · <span className="uppercase text-[#38BDF8]">{role}</span>
        </span>

        <div className="flex items-center gap-1 font-mono text-[11px] text-[#E5484D]">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>112</span>
        </div>
      </div>

      {/* Main Body: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          isOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Safety Disclaimer Footer */}
      <footer className="bg-[#080D18] border-t border-[#223552] px-4 py-3 text-[11px] text-[#A7B3C5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E5484D] shrink-0" />
            <span>
              <strong className="text-[#F3F6FA]">Code Clash 2026 Academic Demonstration:</strong> Reports submitted in this system are simulated for triage evaluation and not connected to active live 911/112 CAD servers.
            </span>
          </div>
          <span className="font-mono text-[#64748B]">
            ResQNet CAD Engine v3.0 · Tamil Nadu Corridor
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ResQNetProvider>
      <MainLayout />
    </ResQNetProvider>
  );
}
