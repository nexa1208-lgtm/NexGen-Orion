import React from 'react';
import {
  LayoutDashboard,
  Flame,
  Layers,
  Sparkles,
  Users,
  Compass,
  Map,
  Navigation,
  Clock,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Home,
  User,
  PhoneCall,
  CheckCircle2,
  FileText,
  Truck,
  Activity,
  History,
  Shield,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useResQNet } from '../context/ResQNetContext';
import { ResQNetLogo } from './ResQNetLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export const NavigationSidebar: React.FC<{
  isOpen: boolean;
  onCloseMobile?: () => void;
}> = ({ isOpen, onCloseMobile }) => {
  const { role, activeNavTab, setActiveNavTab, setRole, stats, notifications, policeEscalations } = useResQNet();

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const newPoliceCases = policeEscalations.filter((p) => p.investigationStatus === 'New Escalation').length;

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'emergency-reports', label: 'Emergency Reports', icon: <Flame className="w-4 h-4" />, badge: stats.criticalIncidents, badgeColor: 'bg-[#E5484D] text-white' },
          { id: 'all-incidents', label: 'All Incidents', icon: <Layers className="w-4 h-4" />, badge: stats.totalIncidents },
          { id: 'incident-prioritization', label: 'Prioritization Engine', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'team-management', label: 'Team Management', icon: <Users className="w-4 h-4" /> },
          { id: 'smart-team-assignment', label: 'Smart Assignment', icon: <Compass className="w-4 h-4" /> },
          { id: 'live-gps-map', label: 'Live GPS Map', icon: <Map className="w-4 h-4" /> },
          { id: 'route-monitoring', label: 'Route Monitoring', icon: <Navigation className="w-4 h-4" /> },
          { id: 'incident-tracking', label: 'Incident Tracking', icon: <Clock className="w-4 h-4" /> },
          { id: 'suspicious-reports', label: 'Suspicious Reports', icon: <AlertTriangle className="w-4 h-4" />, badge: stats.suspiciousCount, badgeColor: 'bg-[#FF922E] text-white' },
          { id: 'police-escalations', label: 'Police Escalations', icon: <ShieldAlert className="w-4 h-4" />, badge: stats.policeEscalationsCount },
          { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
          { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> }
        ];

      case 'citizen':
        return [
          { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
          { id: 'report-emergency', label: 'Report Emergency', icon: <Flame className="w-4 h-4 text-[#E5484D]" /> },
          { id: 'my-reports', label: 'My Reports', icon: <FileText className="w-4 h-4" /> },
          { id: 'track-emergency', label: 'Track Emergency', icon: <Clock className="w-4 h-4" /> },
          { id: 'assigned-team', label: 'Assigned Team', icon: <Truck className="w-4 h-4" /> },
          { id: 'my-profile', label: 'Citizen Profile', icon: <User className="w-4 h-4" /> },
          { id: 'emergency-contacts', label: 'Emergency Contacts', icon: <PhoneCall className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifs > 0 ? unreadNotifs : undefined }
        ];

      case 'team':
        return [
          { id: 'team-dashboard', label: 'Team Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'assigned-incidents', label: 'Assigned Incidents', icon: <Layers className="w-4 h-4" /> },
          { id: 'live-navigation', label: 'Live Road Navigation', icon: <Navigation className="w-4 h-4" /> },
          { id: 'gps-location', label: 'GPS Location Telemetry', icon: <Map className="w-4 h-4" /> },
          { id: 'update-status', label: 'Update Incident Status', icon: <Activity className="w-4 h-4" /> },
          { id: 'team-availability', label: 'Team Availability', icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'assignment-history', label: 'Assignment History', icon: <History className="w-4 h-4" /> }
        ];

      case 'police':
        return [
          { id: 'police-dashboard', label: 'Police Dashboard', icon: <Shield className="w-4 h-4" /> },
          { id: 'new-escalations', label: 'New Escalations', icon: <AlertTriangle className="w-4 h-4" />, badge: newPoliceCases, badgeColor: 'bg-[#E5484D] text-white' },
          { id: 'suspicious-reports', label: 'Suspicious Feed', icon: <Search className="w-4 h-4" /> },
          { id: 'verification', label: 'Verification & Case File', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'action-taken', label: 'Action Taken Records', icon: <FileText className="w-4 h-4" /> },
          { id: 'closed-cases', label: 'Closed Cases Archive', icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'audit-history', label: 'Audit History Logs', icon: <History className="w-4 h-4" /> }
        ];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    setActiveNavTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#14243D] border-r border-[#223552] flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#223552]">
        <ResQNetLogo size="md" showTagline />
      </div>

      {/* Role Title Banner */}
      <div className="px-4 py-2 bg-[#080D18]/80 border-b border-[#223552] flex items-center justify-between text-xs font-mono">
        <span className="text-[#A7B3C5] uppercase font-bold text-[10px]">Portal Context</span>
        <span className="text-[#3986D8] font-bold uppercase text-[11px]">{role}</span>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {navItems.map((item) => {
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-[#3986D8] text-white shadow-md font-bold'
                  : 'text-[#A7B3C5] hover:bg-[#19283D] hover:text-[#F3F6FA]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-white' : 'text-[#3986D8]'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor || 'bg-[#19283D] text-[#3986D8] border border-[#3986D8]/30'
                  } ${isActive ? 'bg-[#080D18] text-[#3986D8] border-none' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#223552] space-y-2 text-xs">
        <div className="p-2.5 rounded-xl bg-[#19283D] border border-[#223552] space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-[#A7B3C5]">
            <span className="font-semibold text-[#F3F6FA]">Jurisdiction</span>
            <span className="font-mono text-[#3986D8]">SEC-2026</span>
          </div>
          <p className="text-[10px] text-[#A7B3C5] leading-tight">
            Chengalpattu · Tambaram · Guduvancheri Dispatch Corridor
          </p>
        </div>

        <button
          onClick={() => setRole(role === 'admin' ? 'citizen' : 'admin')}
          className="w-full py-2 px-3 rounded-lg bg-[#080D18] hover:bg-[#19283D] text-[#A7B3C5] hover:text-[#F3F6FA] border border-[#223552] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Context</span>
        </button>
      </div>
    </aside>
  );
};
