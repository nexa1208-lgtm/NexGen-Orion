import React, { useEffect, useState } from 'react';
import {
  User,
  ShieldAlert,
  Truck,
  Shield,
  Bell,
  RefreshCw,
  Clock,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { useResQNet } from '../context/ResQNetContext';
import { UserRole } from '../types/resqnet';

export const RoleSwitcherBar: React.FC = () => {
  const { role, setRole, notifications, markNotificationRead, resetDemoData, stats } = useResQNet();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const rolesConfig: { id: UserRole; label: string; icon: React.ReactNode; userLabel: string }[] = [
    {
      id: 'citizen',
      label: 'Citizen',
      icon: <User className="w-3.5 h-3.5" />,
      userLabel: 'Priya Sharma (Caller)'
    },
    {
      id: 'admin',
      label: 'Administrator',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      userLabel: 'Chief Dispatcher S. Kumar'
    },
    {
      id: 'team',
      label: 'Response Team',
      icon: <Truck className="w-3.5 h-3.5" />,
      userLabel: 'Apollo Rapid EMS Unit 1'
    },
    {
      id: 'police',
      label: 'Police Authority',
      icon: <Shield className="w-3.5 h-3.5" />,
      userLabel: 'Inspector R. Selvan'
    }
  ];

  return (
    <div className="bg-[#080D18] border-b border-[#223552] text-[#F3F6FA] text-xs px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Role Switching Segmented Control */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-mono text-[#A7B3C5] uppercase font-bold shrink-0 hidden sm:inline">
            Active Role:
          </span>

          <div className="flex items-center p-0.5 bg-[#14243D] rounded-lg border border-[#223552]">
            {rolesConfig.map((r) => {
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#3986D8] text-white font-bold shadow-md'
                      : 'text-[#A7B3C5] hover:text-[#F3F6FA] hover:bg-[#19283D]'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-[#38BDF8] ml-2 shrink-0 hidden lg:inline">
            · {rolesConfig.find((r) => r.id === role)?.userLabel}
          </span>
        </div>

        {/* Right: Telemetry, Notifications & Demo Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          {/* Live Clock */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#14243D] border border-[#223552] font-mono text-[11px] text-[#A7B3C5]">
            <span className="w-2 h-2 rounded-full bg-[#25B875] animate-pulse" />
            <span className="tabular-nums font-bold text-[#F3F6FA]">{currentTime || '00:00:00'}</span>
            <span>IST</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-1.5 bg-[#14243D] hover:bg-[#19283D] border border-[#223552] rounded-md transition-colors text-[#A7B3C5] hover:text-[#F3F6FA]"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5484D] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[#14243D] border border-[#223552] rounded-xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#223552]">
                  <span className="font-bold text-xs text-[#F3F6FA]">Real-Time Notifications</span>
                  <span className="text-[10px] text-[#A7B3C5] font-mono">
                    {unreadNotifs.length} unread
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        n.read ? 'bg-[#080D18]/50 text-[#A7B3C5]' : 'bg-[#19283D] text-[#F3F6FA] border border-[#223552]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#A7B3C5] mb-0.5">
                        <span className="font-semibold text-[#3986D8]">{n.title}</span>
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            title="Reset to initial 10 incidents & 8 teams seed records"
            className="px-2 py-1 rounded bg-[#14243D] hover:bg-[#19283D] border border-[#223552] text-[11px] text-[#A7B3C5] hover:text-[#F3F6FA] flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-[#A7B3C5]" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Emergency helpline badge */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono font-bold text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/30 px-2 py-0.5 rounded">
            <PhoneCall className="w-3 h-3" />
            <span>112 / 108</span>
          </div>
        </div>
      </div>
    </div>
  );
};
