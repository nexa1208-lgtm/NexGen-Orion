import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Layers,
  Sparkles,
  Users,
  Compass,
  Map,
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Truck,
  Phone,
  CheckCircle2,
  X,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useResQNet } from '../../context/ResQNetContext';
import {
  EmergencyCategory,
  GPSCoordinate,
  Incident,
  IncidentStatus,
  PriorityLevel,
  ResponseTeam,
  TeamAvailability
} from '../../types/resqnet';
import {
  getCategoryIcon,
  IncidentStatusBadge,
  PriorityBadge,
  SuspiciousBadge,
  TeamAvailabilityBadge
} from '../../components/StatusBadges';
import { LeafletEmergencyMap } from '../../components/Map/LeafletEmergencyMap';
import { StatusTimeline } from '../../components/StatusTimeline';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';
import { calculateHaversineDistance, recommendNearestTeams } from '../../utils/geoRouting';

export const AdminViews: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    incidents,
    teams,
    activeRoute,
    stats,
    assignTeamToIncident,
    updateIncidentStatus,
    overrideIncidentPriority,
    updateTeamAvailability,
    updateTeamLocation,
    escalateToPolice,
    policeEscalations,
    resetDemoData
  } = useResQNet();

  // Search & Filter state for All Incidents view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [filterPri, setFilterPri] = useState<string>('ALL');
  const [filterStat, setFilterStat] = useState<string>('ALL');

  // Selected incident for detail inspect or assignment
  const [selectedIncId, setSelectedIncId] = useState<string | null>(null);

  // Prioritization Override Modal
  const [overrideModalInc, setOverrideModalInc] = useState<Incident | null>(null);
  const [overridePriorityChoice, setOverridePriorityChoice] = useState<PriorityLevel>('CRITICAL');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Police Escalation Modal
  const [escalateModalInc, setEscalateModalInc] = useState<Incident | null>(null);
  const [escalateReasonInput, setEscalateReasonInput] = useState('');
  const [escalateRemarksInput, setEscalateRemarksInput] = useState('');

  // Analytics Date Filter
  const [analyticsDateRange, setAnalyticsDateRange] = useState<'today' | '7d' | '30d' | 'custom'>('7d');

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCat !== 'ALL' && inc.category !== filterCat) return false;
    if (filterPri !== 'ALL' && inc.priority !== filterPri) return false;
    if (filterStat !== 'ALL' && inc.status !== filterStat) return false;
    return true;
  });

  const handleApplyPriorityOverride = () => {
    if (overrideModalInc && overrideReasonInput.trim()) {
      overrideIncidentPriority(overrideModalInc.id, overridePriorityChoice, overrideReasonInput.trim());
      setOverrideModalInc(null);
      setOverrideReasonInput('');
    }
  };

  const handleConfirmEscalation = () => {
    if (escalateModalInc && escalateReasonInput.trim()) {
      escalateToPolice(escalateModalInc.id, escalateReasonInput.trim(), escalateRemarksInput.trim());
      setEscalateModalInc(null);
      setEscalateReasonInput('');
      setEscalateRemarksInput('');
      setActiveNavTab('police-escalations');
    }
  };

  /* ------------------- VIEW: OVERVIEW & EMERGENCY REPORTS ------------------- */
  if (activeNavTab === 'overview' || activeNavTab === 'emergency-reports') {
    const criticalList = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'Resolved');

    return (
      <div className="space-y-6 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-[#25B875] animate-pulse" />
              <span>CENTRAL EMERGENCY COMMAND CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
              Command Overview &amp; Live Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B3C5]">
              Real-time emergency intake, nearest unit allocation, road routing, and fraud risk monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveNavTab('smart-team-assignment')}
              className="px-3.5 py-2 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Dispatcher</span>
            </button>
            <button
              onClick={resetDemoData}
              className="px-3 py-2 bg-[#14243D] hover:bg-[#19283D] text-[#A7B3C5] hover:text-white border border-[#223552] text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Seed Data
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm">
            <div className="flex justify-between items-center text-xs text-[#A7B3C5]">
              <span>TOTAL INCIDENTS</span>
              <Layers className="w-4 h-4 text-[#3986D8]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#F3F6FA] mt-2">
              {stats.totalIncidents}
            </div>
            <span className="text-[11px] text-[#A7B3C5]">Active queue: {stats.inProgressIncidents}</span>
          </div>

          <div className="p-4 bg-[#14243D] border border-[#E5484D]/40 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center text-xs text-[#E5484D] font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
                CRITICAL EMERGENCY
              </span>
              <ShieldAlert className="w-4 h-4 text-[#E5484D]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#E5484D] mt-2">
              {stats.criticalIncidents}
            </div>
            <span className="text-[11px] text-[#E5484D]/80">Zero-delay protocol</span>
          </div>

          <div className="p-4 bg-[#14243D] border border-[#25B875]/40 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center text-xs text-[#25B875] font-bold">
              <span>AVAILABLE TEAMS</span>
              <Truck className="w-4 h-4 text-[#25B875]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#25B875] mt-2">
              {stats.availableTeamsCount} / {teams.length}
            </div>
            <span className="text-[11px] text-[#A7B3C5]">Busy in field: {stats.busyTeamsCount}</span>
          </div>

          <div className="p-4 bg-[#14243D] border border-[#FF922E]/40 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center text-xs text-[#FF922E] font-bold">
              <span>SUSPICIOUS FLAGS</span>
              <AlertTriangle className="w-4 h-4 text-[#FF922E]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF922E] mt-2">
              {stats.suspiciousCount}
            </div>
            <span className="text-[11px] text-[#A7B3C5]">Police escalations: {stats.policeEscalationsCount}</span>
          </div>
        </div>

        {/* Live GPS Map & Route Monitoring */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
              <Map className="w-4 h-4 text-[#38BDF8]" />
              <span>Live Emergency GIS &amp; Road Route Tracking (Leaflet + OpenStreetMap)</span>
            </h3>
            <button
              onClick={() => setActiveNavTab('live-gps-map')}
              className="text-[#38BDF8] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Expand Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LeafletEmergencyMap
            incidents={incidents}
            teams={teams}
            activeRoute={activeRoute}
            selectedIncidentId={selectedIncId}
            onSelectIncident={(id) => setSelectedIncId(id)}
            onSelectTeam={(id) => {}}
            showRoutePanel={true}
          />
        </div>

        {/* Active Emergency Feed Table */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">Active Incident Dispatch Queue</h3>
              <span className="text-[11px] text-[#A7B3C5]">Sorted by calculated priority and casualty impact</span>
            </div>
            <button
              onClick={() => setActiveNavTab('all-incidents')}
              className="text-xs text-[#38BDF8] hover:underline font-semibold"
            >
              View All {incidents.length} Incidents &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#A7B3C5] uppercase text-[10px] tracking-wider border-b border-[#223552]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Emergency Title &amp; Landmark</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Casualties</th>
                  <th className="py-2.5 px-3">Assigned Team</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Quick Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223552]">
                {incidents.slice(0, 7).map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#19283D]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#38BDF8] whitespace-nowrap">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-bold text-[#F3F6FA] truncate">{inc.title}</div>
                      <div className="text-[11px] text-[#A7B3C5] truncate">{inc.location}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-[#CBD5E1]">
                        {getCategoryIcon(inc.category, 'w-3.5 h-3.5')}
                        <span>{inc.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PriorityBadge priority={inc.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-[#F3F6FA] whitespace-nowrap">
                      {inc.peopleAffected > 0 ? inc.peopleAffected : '0'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                      {inc.assignedTeamName ? (
                        <span className="text-[#38BDF8] font-semibold">{inc.assignedTeamName}</span>
                      ) : (
                        <span className="text-[#E5484D] font-bold">Unallocated</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedIncId(inc.id);
                          setActiveNavTab('smart-team-assignment');
                        }}
                        className="px-2.5 py-1 rounded bg-[#3986D8]/20 hover:bg-[#3986D8] text-[#3986D8] hover:text-white border border-[#3986D8]/40 text-xs font-bold transition-all"
                      >
                        {inc.assignedTeamId ? 'Reassign' : 'Allocate Team'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: ALL INCIDENTS & SEARCH ------------------- */
  if (activeNavTab === 'all-incidents') {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA]">
            Master Incident Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Complete searchable database of all reported emergencies, triage assessments, and assigned units.
          </p>
        </div>

        {/* Filters bar */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, road..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-[#F3F6FA] focus:outline-none focus:border-[#3986D8]"
            />
          </div>

          <div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-[#F3F6FA] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Fire">Fire</option>
              <option value="Flood">Flood</option>
              <option value="Building Collapse">Building Collapse</option>
              <option value="Crime or Police Assistance">Police Assistance</option>
            </select>
          </div>

          <div>
            <select
              value={filterPri}
              onChange={(e) => setFilterPri(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-[#F3F6FA] focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <select
              value={filterStat}
              onChange={(e) => setFilterStat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-[#F3F6FA] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#19283D] text-[#A7B3C5] uppercase text-[10px] tracking-wider border-b border-[#223552]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title &amp; Landmark</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Team</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#223552]">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#19283D]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#38BDF8] whitespace-nowrap">
                      {inc.id}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-bold text-[#F3F6FA]">{inc.title}</div>
                      <div className="text-[11px] text-[#A7B3C5] truncate">{inc.location}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-[#CBD5E1]">
                        {getCategoryIcon(inc.category, 'w-3.5 h-3.5')}
                        <span>{inc.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={inc.priority} size="sm" />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                      {inc.assignedTeamName ? (
                        <span className="text-[#38BDF8] font-semibold">{inc.assignedTeamName}</span>
                      ) : (
                        <span className="text-[#E5484D] font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setOverrideModalInc(inc);
                            setOverridePriorityChoice(inc.priority);
                          }}
                          className="px-2 py-1 bg-[#19283D] hover:bg-[#223552] text-[#A7B3C5] hover:text-white rounded border border-[#223552] text-[11px]"
                          title="Override Priority"
                        >
                          Triage
                        </button>

                        <button
                          onClick={() => {
                            setSelectedIncId(inc.id);
                            setActiveNavTab('smart-team-assignment');
                          }}
                          className="px-2.5 py-1 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold rounded text-[11px]"
                        >
                          Dispatch
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: INCIDENT PRIORITIZATION ENGINE (Module 3) ------------------- */
  if (activeNavTab === 'incident-prioritization') {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTELLIGENT SEVERITY &amp; RISK CALCULATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Incident Prioritization Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Evaluates casualty thresholds, life-safety threat vocabulary, structural hazards, and vulnerable individuals.
          </p>
        </div>

        {/* Priority Engine Rules Card */}
        <div className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-[#F3F6FA]">Prioritization Matrix Parameters</h3>
          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#19283D] border border-[#E5484D]/30 space-y-1">
              <strong className="text-[#E5484D] font-bold block">CRITICAL (Red)</strong>
              <p className="text-[11px] text-[#A7B3C5]">
                &ge; 10 casualties, structural building collapse, cardiac arrest, asphyxiation, or trapped indicators.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#19283D] border border-[#FF922E]/30 space-y-1">
              <strong className="text-[#FF922E] font-bold block">HIGH (Orange)</strong>
              <p className="text-[11px] text-[#A7B3C5]">
                Active fire blaze, highway multivehicle collision, 5–9 affected, armed crime, or flash flood inundation.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#19283D] border border-[#3986D8]/30 space-y-1">
              <strong className="text-[#3986D8] font-bold block">MEDIUM (Blue)</strong>
              <p className="text-[11px] text-[#A7B3C5]">
                1–4 casualties, minor road skid, localized medical distress, or waterlogging without immediate life threat.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#19283D] border border-[#25B875]/30 space-y-1">
              <strong className="text-[#25B875] font-bold block">LOW (Green)</strong>
              <p className="text-[11px] text-[#A7B3C5]">
                Precautionary reports, 0 people affected, property monitoring, or resolved situation.
              </p>
            </div>
          </div>
        </div>

        {/* Incident Triage List with Audit History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#F3F6FA]">Active Incident Prioritization Records</h3>
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl shadow-md space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#38BDF8]">{inc.id}</span>
                    <span className="font-bold text-[#F3F6FA] text-sm">{inc.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={inc.priority} />
                    <button
                      onClick={() => {
                        setOverrideModalInc(inc);
                        setOverridePriorityChoice(inc.priority);
                      }}
                      className="px-3 py-1 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold rounded-lg text-xs"
                    >
                      Override
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552] text-xs text-[#A7B3C5] space-y-1">
                  <div>
                    <strong className="text-[#F3F6FA]">Algorithmic Evaluation Rationale: </strong>
                    <span>{inc.priorityReason}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B]">
                    Calculated: {inc.calculatedPriority} · People Impacted: {inc.peopleAffected}
                  </div>
                </div>

                {/* Audit trail */}
                {inc.priorityAudits.length > 0 && (
                  <div className="pt-2 text-xs text-[#A7B3C5] space-y-1">
                    <span className="font-semibold text-[#F3F6FA] text-[11px]">Override Audit Trail:</span>
                    {inc.priorityAudits.map((a) => (
                      <div key={a.id} className="text-[11px] font-mono p-1.5 bg-[#080D18] rounded border border-[#223552]">
                        {new Date(a.timestamp).toLocaleTimeString()}: {a.actor} shifted {a.previousPriority} &rarr; {a.newPriority} (Reason: {a.reason})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Priority Override Modal */}
        {overrideModalInc && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#14243D] border border-[#223552] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#223552]">
                <h3 className="text-base font-bold text-[#F3F6FA]">
                  Override Incident Priority ({overrideModalInc.id})
                </h3>
                <button onClick={() => setOverrideModalInc(null)} className="text-[#A7B3C5] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-[#A7B3C5] uppercase">Select New Priority Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as PriorityLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setOverridePriorityChoice(lvl)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        overridePriorityChoice === lvl
                          ? 'bg-[#3986D8] text-white font-bold border-[#3986D8]'
                          : 'bg-[#19283D] text-[#A7B3C5] border-[#223552]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#A7B3C5] uppercase block mb-1">
                    Operational Justification (Mandatory Audit) *
                  </label>
                  <textarea
                    rows={2}
                    value={overrideReasonInput}
                    onChange={(e) => setOverrideReasonInput(e.target.value)}
                    placeholder="e.g. Verified by on-scene police patrol that fire is contained to outdoor yard."
                    className="w-full px-3 py-2 bg-[#080D18] border border-[#223552] text-xs text-[#F3F6FA] rounded-xl focus:outline-none focus:border-[#3986D8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#223552]">
                <button
                  onClick={() => setOverrideModalInc(null)}
                  className="px-3 py-1.5 text-xs text-[#A7B3C5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={!overrideReasonInput.trim()}
                  onClick={handleApplyPriorityOverride}
                  className="px-4 py-2 bg-[#3986D8] hover:bg-[#3986D8]/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
                >
                  Confirm &amp; Log Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------- VIEW: SMART NEAREST-TEAM ASSIGNMENT (Module 5) ------------------- */
  if (activeNavTab === 'smart-team-assignment') {
    const targetIncident = incidents.find((i) => i.id === selectedIncId) || incidents[0];
    const recommendations = recommendNearestTeams(targetIncident.coordinates, targetIncident.category, teams);

    return (
      <div className="space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>HAVERSINE DISTANCE &amp; CAPABILITY MATCHING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Smart Team Assignment Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Ranks nearest emergency response teams by road proximity, category specialty, vehicle equipment, and availability.
          </p>
        </div>

        {/* Selected Incident Banner */}
        <div className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] block">Dispatch Target:</span>
              <h3 className="text-base font-bold text-[#F3F6FA]">{targetIncident.id}: {targetIncident.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={targetIncident.priority} />
              <IncidentStatusBadge status={targetIncident.status} />
            </div>
          </div>

          <div className="text-xs text-[#A7B3C5] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E5484D]" />
            <span>{targetIncident.location}</span>
          </div>

          {/* Quick switcher if multiple incidents */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 text-xs border-t border-[#223552]">
            <span className="text-[#A7B3C5] font-semibold">Switch Target:</span>
            {incidents.slice(0, 6).map((i) => (
              <button
                key={i.id}
                onClick={() => setSelectedIncId(i.id)}
                className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  i.id === targetIncident.id
                    ? 'bg-[#3986D8] text-white font-bold border-[#3986D8]'
                    : 'bg-[#19283D] text-[#A7B3C5] border-[#223552]'
                }`}
              >
                {i.id}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Teams List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider">
            Recommended Response Teams (Ranked by Proximity &amp; Specialty)
          </h3>

          <div className="grid gap-3">
            {recommendations.map(({ team, distanceKm, estimatedMinutes, compatibilityScore, matchReason }, index) => {
              const isBestMatch = index === 0 && team.availability === 'Available';
              const isCurrentlyAssigned = targetIncident.assignedTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isBestMatch
                      ? 'bg-[#14243D] border-[#25B875]/50 ring-1 ring-[#25B875]/40 shadow-lg'
                      : 'bg-[#14243D] border-[#223552]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#38BDF8]">{team.id}</span>
                      <h4 className="font-bold text-[#F3F6FA] text-sm">{team.name}</h4>
                      <TeamAvailabilityBadge availability={team.availability} />
                      {isBestMatch && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#25B875]/20 text-[#25B875] border border-[#25B875]/40">
                          BEST MATCH
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2 text-xs text-[#A7B3C5]">
                      <div>
                        Leader: <strong className="text-[#F3F6FA]">{team.leaderName}</strong> ({team.contactNumber})
                      </div>
                      <div>
                        Category: <strong className="text-[#CBD5E1]">{team.category}</strong>
                      </div>
                      <div>
                        Vehicle: <span className="font-mono text-[#F3F6FA]">{team.vehicleNumber}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A7B3C5] leading-relaxed">
                      <strong>Suitability: </strong>{matchReason}
                    </p>
                  </div>

                  {/* Distance & Allocate Action */}
                  <div className="flex sm:flex-col md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#223552]">
                    <div className="text-left md:text-right">
                      <div className="text-lg font-bold font-mono text-[#F3F6FA]">
                        {distanceKm} km
                      </div>
                      <div className="text-[11px] text-[#25B875] font-semibold">
                        ~{estimatedMinutes} min ETA
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        assignTeamToIncident(targetIncident.id, team.id);
                        setActiveNavTab('route-monitoring');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                        isCurrentlyAssigned
                          ? 'bg-[#25B875] text-white'
                          : 'bg-[#3986D8] hover:bg-[#38BDF8] text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{isCurrentlyAssigned ? 'Assigned (View Route)' : 'Allocate & Dispatch'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: TEAM MANAGEMENT (Module 4) ------------------- */
  if (activeNavTab === 'team-management') {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA]">
              Emergency Response Team Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B3C5]">
              Real-time unit roster, availability toggle, GPS stations, and response vehicle assignments.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {teams.map((t) => (
            <div
              key={t.id}
              className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#19283D] border border-[#223552]">
                    <Truck className="w-4 h-4 text-[#3986D8]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F3F6FA] text-sm">{t.name}</h3>
                    <span className="font-mono text-xs text-[#A7B3C5]">{t.id} · Base: {t.baseStation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TeamAvailabilityBadge availability={t.availability} />

                  {/* Availability Dropdown Control */}
                  <select
                    value={t.availability}
                    onChange={(e) => updateTeamAvailability(t.id, e.target.value as TeamAvailability)}
                    className="px-2.5 py-1 text-xs bg-[#080D18] border border-[#223552] text-[#F3F6FA] rounded-lg focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Busy">Busy</option>
                    <option value="Temporarily Unavailable">Temp Unavailable</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-2 text-xs text-[#A7B3C5] pt-1">
                <div>
                  Leader: <strong className="text-[#F3F6FA]">{t.leaderName}</strong>
                </div>
                <div>
                  Contact: <span className="font-mono text-[#F3F6FA]">{t.contactNumber}</span>
                </div>
                <div>
                  Category: <span className="text-[#CBD5E1]">{t.category}</span>
                </div>
                <div>
                  Members: <span className="font-mono text-[#F3F6FA]">{t.memberCount} personnel</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#19283D] rounded-xl border border-[#223552] flex items-center justify-between text-xs text-[#A7B3C5]">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="truncate">{t.currentLocation.address}</span>
                </div>
                <span className="font-mono text-[11px] text-[#64748B] shrink-0">
                  {t.currentLocation.lat.toFixed(4)}, {t.currentLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: ROUTE MONITORING & LIVE GPS MAP (Modules 6 & 8) ------------------- */
  if (activeNavTab === 'live-gps-map' || activeNavTab === 'route-monitoring') {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA]">
            Live GPS Route Monitoring &amp; Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Real-time visual map tracking active response units, road route paths, and dynamic ETA recalculations.
          </p>
        </div>

        <LeafletEmergencyMap
          incidents={incidents}
          teams={teams}
          activeRoute={activeRoute}
          selectedIncidentId={selectedIncId}
          onSelectIncident={(id) => setSelectedIncId(id)}
          showRoutePanel={true}
        />
      </div>
    );
  }

  /* ------------------- VIEW: INCIDENT TRACKING MODULE (Module 7) ------------------- */
  if (activeNavTab === 'incident-tracking') {
    const trackedIncident = incidents.find((i) => i.id === selectedIncId) || incidents[0];

    return (
      <div className="space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>CENTRAL INCIDENT LIFECYCLE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Incident Tracking &amp; Status Timeline
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Visualizes primary emergency lifecycle milestones (Reported &rarr; In Progress &rarr; Resolved), dispatcher transitions, and operational audit streams.
          </p>
        </div>

        {/* Incident Selector Bar */}
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[#A7B3C5] font-semibold shrink-0">Track Incident:</span>
            {incidents.slice(0, 8).map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncId(inc.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 border ${
                  inc.id === trackedIncident.id
                    ? 'bg-[#3986D8] text-white font-bold border-[#3986D8] shadow-sm'
                    : 'bg-[#19283D] text-[#A7B3C5] border-[#223552] hover:text-[#F3F6FA]'
                }`}
              >
                {inc.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={trackedIncident.priority} />
            <IncidentStatusBadge status={trackedIncident.status} />
          </div>
        </div>

        {/* Primary StatusTimeline Component */}
        <StatusTimeline
          currentStatus={trackedIncident.status}
          createdAt={trackedIncident.createdAt}
          assignedAt={trackedIncident.assignedAt}
          resolvedAt={trackedIncident.resolvedAt}
          assignedTeamName={trackedIncident.assignedTeamName}
          timelineEvents={trackedIncident.timeline}
          allowAdminControls={true}
          onStatusChange={(newStatus) => updateIncidentStatus(trackedIncident.id, newStatus)}
        />

        {/* Selected Incident Overview Dossier */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F3F6FA] flex items-center justify-between">
              <span>{trackedIncident.id}: {trackedIncident.title}</span>
              <span className="font-mono text-xs text-[#38BDF8]">{trackedIncident.category}</span>
            </h3>
            <p className="text-xs text-[#CBD5E1] bg-[#19283D] p-3 rounded-xl border border-[#223552] leading-relaxed">
              {trackedIncident.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#A7B3C5]">
              <div className="p-2.5 rounded-lg bg-[#19283D] border border-[#223552]">
                <span className="text-[10px] uppercase font-bold block text-[#A7B3C5]">Location</span>
                <span className="text-[#F3F6FA] font-semibold truncate block mt-0.5">{trackedIncident.location}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#19283D] border border-[#223552]">
                <span className="text-[10px] uppercase font-bold block text-[#A7B3C5]">Casualties</span>
                <span className="text-[#F3F6FA] font-mono font-bold block mt-0.5">{trackedIncident.peopleAffected}</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#F3F6FA]">Active Allocation &amp; Unit Logistics</h3>
            {trackedIncident.assignedTeamId ? (
              <div className="p-4 bg-[#19283D] rounded-xl border border-[#3986D8]/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#38BDF8]">{trackedIncident.assignedTeamId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#25B875]/20 text-[#25B875] border border-[#25B875]/40 font-bold">
                    UNIT ALLOCATED
                  </span>
                </div>
                <div className="text-sm font-bold text-[#F3F6FA]">{trackedIncident.assignedTeamName}</div>
                <div className="text-[#A7B3C5] text-[11px]">
                  Assigned at: {trackedIncident.assignedAt ? new Date(trackedIncident.assignedAt).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#19283D] rounded-xl border border-[#223552] text-center space-y-2 text-xs text-[#A7B3C5]">
                <AlertTriangle className="w-6 h-6 text-[#FF922E] mx-auto" />
                <div className="font-bold text-[#F3F6FA]">No Field Unit Allocated</div>
                <p className="text-[11px]">Deploy the nearest specialized team to begin In-Progress operations.</p>
                <button
                  onClick={() => {
                    setSelectedIncId(trackedIncident.id);
                    setActiveNavTab('smart-team-assignment');
                  }}
                  className="px-3 py-1.5 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold rounded-lg text-xs"
                >
                  Allocate Nearest Unit &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Multi-Incident Lifecycle Summary Table */}
        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA]">All Active Incidents Lifecycle Stream</h3>
              <span className="text-[11px] text-[#A7B3C5]">Monitor multi-incident progression across all 3 lifecycle stages</span>
            </div>
            <span className="text-xs font-mono text-[#38BDF8]">{incidents.length} Records</span>
          </div>

          <div className="space-y-2.5">
            {incidents.slice(0, 6).map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncId(inc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  inc.id === trackedIncident.id
                    ? 'bg-[#19283D] border-[#3986D8]'
                    : 'bg-[#14243D] border-[#223552] hover:bg-[#19283D]/60'
                }`}
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#38BDF8]">{inc.id}</span>
                    <PriorityBadge priority={inc.priority} size="sm" />
                    <span className="text-[#A7B3C5]">·</span>
                    <span className="text-[#CBD5E1] font-semibold">{inc.category}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#F3F6FA] truncate">{inc.title}</h4>
                </div>

                {/* Embedded Compact StatusTimeline */}
                <div className="w-full md:w-64 shrink-0">
                  <StatusTimeline currentStatus={inc.status} compact={true} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: SUSPICIOUS REPORTS & POLICE ESCALATIONS (Modules 9 & 10) ------------------- */
  if (activeNavTab === 'suspicious-reports' || activeNavTab === 'police-escalations') {
    const suspiciousIncidents = incidents.filter(
      (i) => i.suspiciousScore >= 20 || i.suspiciousStatus !== 'Normal'
    );

    return (
      <div className="space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FF922E]/10 border border-[#FF922E]/30 text-[#FF922E] text-xs font-bold font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>MALICIOUS PATTERN &amp; FRAUD GUARD SYSTEM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Suspicious Incident Reports &amp; Police Escalation
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Identifies spam, prank, duplicate, or high-risk malicious emergency transmissions before dispatching units.
          </p>
        </div>

        <div className="grid gap-3">
          {suspiciousIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 bg-[#14243D] border border-[#223552] rounded-2xl shadow-md space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#38BDF8]">{inc.id}</span>
                  <h4 className="font-bold text-[#F3F6FA] text-sm">{inc.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <SuspiciousBadge classification={inc.suspiciousStatus} score={inc.suspiciousScore} />
                  {inc.suspiciousStatus !== 'Escalated to Police' && (
                    <button
                      onClick={() => {
                        setEscalateModalInc(inc);
                        setEscalateReasonInput(inc.suspiciousReasons[0] || 'Suspicious reporting indicators detected.');
                      }}
                      className="px-3 py-1 bg-[#E5484D] hover:bg-[#E5484D]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Forward to Police</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">{inc.description}</p>

              <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552] text-xs space-y-1">
                <span className="font-bold text-[#FF922E] block text-[11px] uppercase">
                  Automated Algorithmic Fraud Indicators:
                </span>
                <ul className="list-disc pl-4 text-[11px] text-[#A7B3C5] space-y-0.5">
                  {inc.suspiciousReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1">
                <span>Reporter: {inc.citizenName} ({inc.citizenPhone})</span>
                <span>Coordinates: {inc.coordinates.lat.toFixed(4)}, {inc.coordinates.lng.toFixed(4)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Police Escalation Modal */}
        {escalateModalInc && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#14243D] border border-[#223552] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#223552]">
                <h3 className="text-base font-bold text-[#F3F6FA] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#E5484D]" />
                  <span>Escalate to Police Authority ({escalateModalInc.id})</span>
                </h3>
                <button onClick={() => setEscalateModalInc(null)} className="text-[#A7B3C5] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#A7B3C5] uppercase block mb-1">
                    Formal Escalation Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={escalateReasonInput}
                    onChange={(e) => setEscalateReasonInput(e.target.value)}
                    placeholder="e.g. Willful submission of fabricated mass explosion alarm"
                    className="w-full px-3 py-2 bg-[#080D18] border border-[#223552] text-[#F3F6FA] rounded-xl focus:outline-none focus:border-[#3986D8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#A7B3C5] uppercase block mb-1">
                    Administrator Supporting Remarks &amp; Evidence
                  </label>
                  <textarea
                    rows={3}
                    value={escalateRemarksInput}
                    onChange={(e) => setEscalateRemarksInput(e.target.value)}
                    placeholder="Document CDR verification, IP patterns, or field officer report..."
                    className="w-full px-3 py-2 bg-[#080D18] border border-[#223552] text-[#F3F6FA] rounded-xl focus:outline-none focus:border-[#3986D8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#223552]">
                <button
                  onClick={() => setEscalateModalInc(null)}
                  className="px-3 py-1.5 text-xs text-[#A7B3C5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={!escalateReasonInput.trim()}
                  onClick={handleConfirmEscalation}
                  className="px-4 py-2 bg-[#E5484D] hover:bg-[#E5484D]/90 disabled:opacity-50 text-white font-bold text-xs rounded-xl"
                >
                  Submit to Police Desk
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------- VIEW: ANALYTICS DASHBOARD (Module 12 / Recharts) ------------------- */
  return (
    <AnalyticsDashboard
      incidents={incidents}
      teams={teams}
      policeEscalations={policeEscalations}
    />
  );
};
