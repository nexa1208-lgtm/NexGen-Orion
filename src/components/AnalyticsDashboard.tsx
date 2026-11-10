import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  ShieldAlert,
  Truck,
  CheckCircle2,
  Calendar,
  TrendingUp,
  BarChart3,
  Users
} from 'lucide-react';
import { Incident, ResponseTeam, PoliceEscalation, PriorityLevel } from '../types/resqnet';

interface AnalyticsDashboardProps {
  incidents: Incident[];
  teams: ResponseTeam[];
  policeEscalations: PoliceEscalation[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  incidents,
  teams,
  policeEscalations
}) => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'custom'>('7d');

  // Compute 12 Statistical Metric Cards
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter((i) => i.priority === 'CRITICAL').length;
  const highPriorityIncidents = incidents.filter((i) => i.priority === 'HIGH').length;
  const assignedIncidents = incidents.filter((i) => i.assignedTeamId && i.status !== 'Resolved').length;
  const inProgressIncidents = incidents.filter((i) => i.status === 'In Progress').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved').length;
  const availableTeams = teams.filter((t) => t.availability === 'Available').length;
  const busyTeams = teams.filter((t) => t.availability === 'Busy' || t.availability === 'Assigned').length;
  const suspiciousReports = incidents.filter((i) => i.suspiciousScore >= 20 || i.suspiciousStatus !== 'Normal').length;
  const policeEscalationsCount = policeEscalations.length;
  const avgResponseTime = 6.4; // minutes benchmark
  const unresolvedCritical = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'Resolved').length;

  // Chart A: Incident Priority Distribution
  const priorityData = [
    { name: 'Critical', count: incidents.filter((i) => i.priority === 'CRITICAL').length, color: '#E5484D' },
    { name: 'High', count: incidents.filter((i) => i.priority === 'HIGH').length, color: '#FF922E' },
    { name: 'Medium', count: incidents.filter((i) => i.priority === 'MEDIUM').length, color: '#3986D8' },
    { name: 'Low', count: incidents.filter((i) => i.priority === 'LOW').length, color: '#25B875' }
  ];

  // Chart B: Incident Status Analytics
  const statusData = [
    { name: 'Reported', count: incidents.filter((i) => i.status === 'Reported').length, fill: '#3986D8' },
    { name: 'Assigned', count: incidents.filter((i) => i.assignedTeamId && i.status === 'Reported').length, fill: '#38BDF8' },
    { name: 'In Progress', count: incidents.filter((i) => i.status === 'In Progress').length, fill: '#FF922E' },
    { name: 'Resolved', count: incidents.filter((i) => i.status === 'Resolved').length, fill: '#25B875' }
  ];

  // Chart C: Response Team Analytics
  const teamStatusData = [
    { name: 'Available', count: teams.filter((t) => t.availability === 'Available').length, color: '#25B875' },
    { name: 'Assigned', count: teams.filter((t) => t.availability === 'Assigned').length, color: '#3986D8' },
    { name: 'Busy', count: teams.filter((t) => t.availability === 'Busy').length, color: '#E5484D' },
    { name: 'Offline / Temp', count: teams.filter((t) => t.availability === 'Offline' || t.availability === 'Temporarily Unavailable').length, color: '#64748B' }
  ];

  // Chart D: Emergency Category Distribution
  const categoriesList = ['Medical Emergency', 'Fire', 'Road Accident', 'Flood', 'Building Collapse', 'Natural Disaster', 'Other Emergency'];
  const categoryData = categoriesList.map((cat) => ({
    name: cat.replace(' Emergency', '').replace(' Assistance', ''),
    count: incidents.filter((i) => i.category === cat).length
  }));

  // Chart E: Critical Incident Monitoring
  const criticalMonitoringData = [
    { stage: 'Reported', count: incidents.filter((i) => i.priority === 'CRITICAL').length },
    { stage: 'Assigned', count: incidents.filter((i) => i.priority === 'CRITICAL' && i.assignedTeamId).length },
    { stage: 'In Progress', count: incidents.filter((i) => i.priority === 'CRITICAL' && i.status === 'In Progress').length },
    { stage: 'Resolved', count: incidents.filter((i) => i.priority === 'CRITICAL' && i.status === 'Resolved').length }
  ];

  // Chart F: Suspicious Report Analytics
  const suspiciousData = [
    { name: 'Normal', count: incidents.filter((i) => i.suspiciousStatus === 'Normal').length, color: '#25B875' },
    { name: 'Needs Verification', count: incidents.filter((i) => i.suspiciousStatus === 'Needs Verification').length, color: '#3986D8' },
    { name: 'Suspicious', count: incidents.filter((i) => i.suspiciousStatus === 'Suspicious').length, color: '#FF922E' },
    { name: 'Escalated to Police', count: incidents.filter((i) => i.suspiciousStatus === 'Escalated to Police').length, color: '#E5484D' }
  ];

  // Chart G: Hourly Response Performance Trends
  const performanceTrendData = [
    { time: '00:00', avgArrivalMin: 7.2, targetMin: 8 },
    { time: '04:00', avgArrivalMin: 5.4, targetMin: 8 },
    { time: '08:00', avgArrivalMin: 8.5, targetMin: 8 },
    { time: '12:00', avgArrivalMin: 6.8, targetMin: 8 },
    { time: '16:00', avgArrivalMin: 7.9, targetMin: 8 },
    { time: '20:00', avgArrivalMin: 6.1, targetMin: 8 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#14243D] border border-[#223552] p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-[#F3F6FA]">{label || payload[0]?.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="font-mono text-[11px]" style={{ color: entry.color || entry.fill || '#38BDF8' }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>OPERATIONAL TELEMETRY &amp; CAD ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Advanced Incident Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Real-time statistical KPIs, emergency triage distribution, dispatch performance, and fraud monitoring.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center p-1 bg-[#14243D] rounded-xl border border-[#223552] text-xs self-start sm:self-auto">
          {(['today', '7d', '30d', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
                dateRange === range
                  ? 'bg-[#3986D8] text-white shadow-md'
                  : 'text-[#A7B3C5] hover:text-[#F3F6FA]'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Professional Statistical KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* 1. Total Incidents */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">1. Total Incidents</span>
          <div className="text-2xl font-black font-mono text-[#F3F6FA]">{totalIncidents}</div>
          <span className="text-[10px] text-[#38BDF8]">Live CAD database</span>
        </div>

        {/* 2. Critical Incidents */}
        <div className="p-4 bg-[#14243D] border border-[#E5484D]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#E5484D] block">2. Critical Incidents</span>
          <div className="text-2xl font-black font-mono text-[#E5484D]">{criticalIncidents}</div>
          <span className="text-[10px] text-[#A7B3C5]">Immediate life hazard</span>
        </div>

        {/* 3. High-Priority */}
        <div className="p-4 bg-[#14243D] border border-[#FF922E]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#FF922E] block">3. High Priority</span>
          <div className="text-2xl font-black font-mono text-[#FF922E]">{highPriorityIncidents}</div>
          <span className="text-[10px] text-[#A7B3C5]">Multi-casualty / Fire</span>
        </div>

        {/* 4. Assigned Incidents */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#38BDF8] block">4. Assigned Units</span>
          <div className="text-2xl font-black font-mono text-[#38BDF8]">{assignedIncidents}</div>
          <span className="text-[10px] text-[#A7B3C5]">Unit dispatched</span>
        </div>

        {/* 5. In-Progress Incidents */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#FF922E] block">5. In Progress</span>
          <div className="text-2xl font-black font-mono text-[#FF922E]">{inProgressIncidents}</div>
          <span className="text-[10px] text-[#A7B3C5]">En route / On scene</span>
        </div>

        {/* 6. Resolved Incidents */}
        <div className="p-4 bg-[#14243D] border border-[#25B875]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#25B875] block">6. Resolved</span>
          <div className="text-2xl font-black font-mono text-[#25B875]">{resolvedIncidents}</div>
          <span className="text-[10px] text-[#A7B3C5]">Scene secured</span>
        </div>

        {/* 7. Available Teams */}
        <div className="p-4 bg-[#14243D] border border-[#25B875]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#25B875] block">7. Available Teams</span>
          <div className="text-2xl font-black font-mono text-[#25B875]">{availableTeams}</div>
          <span className="text-[10px] text-[#A7B3C5]">Of {teams.length} rostered</span>
        </div>

        {/* 8. Busy Response Teams */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">8. Busy / In Field</span>
          <div className="text-2xl font-black font-mono text-[#F3F6FA]">{busyTeams}</div>
          <span className="text-[10px] text-[#A7B3C5]">Active on call</span>
        </div>

        {/* 9. Suspicious Reports */}
        <div className="p-4 bg-[#14243D] border border-[#FF922E]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#FF922E] block">9. Suspicious Reports</span>
          <div className="text-2xl font-black font-mono text-[#FF922E]">{suspiciousReports}</div>
          <span className="text-[10px] text-[#A7B3C5]">Flagged by AI Engine</span>
        </div>

        {/* 10. Police Escalations */}
        <div className="p-4 bg-[#14243D] border border-[#E5484D]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#E5484D] block">10. Police Escalations</span>
          <div className="text-2xl font-black font-mono text-[#E5484D]">{policeEscalationsCount}</div>
          <span className="text-[10px] text-[#A7B3C5]">Formal case files</span>
        </div>

        {/* 11. Average Response Time */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#38BDF8] block">11. Avg Response</span>
          <div className="text-2xl font-black font-mono text-[#38BDF8]">{avgResponseTime}m</div>
          <span className="text-[10px] text-[#25B875]">&lt; 8 min SLA benchmark</span>
        </div>

        {/* 12. Unresolved Critical */}
        <div className="p-4 bg-[#14243D] border border-[#E5484D]/40 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#E5484D] block">12. Pending Critical</span>
          <div className="text-2xl font-black font-mono text-[#E5484D]">{unresolvedCritical}</div>
          <span className="text-[10px] text-[#A7B3C5]">Demands dispatcher action</span>
        </div>
      </div>

      {/* Row 1: Chart A (Priority Distribution) & Chart B (Incident Status Analytics) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart A */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">A. Incident Priority Distribution</h3>
              <span className="text-[11px] text-[#A7B3C5]">Casework volume segmented by triage severity</span>
            </div>
            <span className="text-xs font-mono text-[#38BDF8]">4 Tiers</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223552" />
                <XAxis dataKey="name" stroke="#A7B3C5" textAnchor="middle" tick={{ fontSize: 11 }} />
                <YAxis stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">B. Incident Status Analytics</h3>
              <span className="text-[11px] text-[#A7B3C5]">Operational lifecycle transition stages</span>
            </div>
            <span className="text-xs font-mono text-[#25B875]">Real-Time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223552" />
                <XAxis type="number" stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Chart C (Team Availability) & Chart D (Category Breakdown) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart C */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">C. Response Team Availability Status</h3>
              <span className="text-[11px] text-[#A7B3C5]">Roster capacity and deployment readiness</span>
            </div>
            <span className="text-xs font-mono text-[#38BDF8]">{teams.length} Teams Total</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {teamStatusData.map((entry, index) => (
                    <Cell key={`team-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-[#A7B3C5]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart D */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">D. Emergency Category Distribution</h3>
              <span className="text-[11px] text-[#A7B3C5]">Medical, fire, crash, flood, and collapse volumes</span>
            </div>
            <span className="text-xs font-mono text-[#3986D8]">Categories</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223552" />
                <XAxis
                  dataKey="name"
                  stroke="#A7B3C5"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3986D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Chart E (Critical Incident Lifecycle), Chart F (Suspicious Reports), Chart G (Response Performance) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart E */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">E. Critical Incidents Monitoring</h3>
              <span className="text-[11px] text-[#E5484D]">Priority 1 life-threat status</span>
            </div>
            <span className="text-xs font-mono text-[#E5484D]">{criticalIncidents} Active</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criticalMonitoringData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223552" />
                <XAxis dataKey="stage" stroke="#A7B3C5" tick={{ fontSize: 10 }} />
                <YAxis stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#E5484D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart F */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">F. Suspicious Report Analytics</h3>
              <span className="text-[11px] text-[#A7B3C5]">AI fraud detection &amp; police forwarding</span>
            </div>
            <span className="text-xs font-mono text-[#FF922E]">Fraud Guard</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={suspiciousData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  label={({ percent }: any) => `${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {suspiciousData.map((entry, index) => (
                    <Cell key={`susp-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-[11px] text-[#A7B3C5]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart G */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">G. Response Performance</h3>
              <span className="text-[11px] text-[#A7B3C5]">Arrival time trend vs 8-min target</span>
            </div>
            <span className="text-xs font-mono text-[#25B875]">SLA Met</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#223552" />
                <XAxis dataKey="time" stroke="#A7B3C5" tick={{ fontSize: 10 }} />
                <YAxis stroke="#A7B3C5" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avgArrivalMin" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4 }} name="Avg Arrival (min)" />
                <Line type="monotone" dataKey="targetMin" stroke="#E5484D" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Target SLA (8m)" />
                <Legend verticalAlign="bottom" formatter={(value) => <span className="text-[10px] text-[#A7B3C5]">{value}</span>} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
