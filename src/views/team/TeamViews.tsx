import React, { useState } from 'react';
import {
  Truck,
  Navigation,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { useResQNet } from '../../context/ResQNetContext';
import { TeamAvailability } from '../../types/resqnet';
import {
  getCategoryIcon,
  IncidentStatusBadge,
  PriorityBadge,
  TeamAvailabilityBadge
} from '../../components/StatusBadges';
import { LeafletEmergencyMap } from '../../components/Map/LeafletEmergencyMap';

export const TeamViews: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    teams,
    activeTeamId,
    setActiveTeamId,
    currentActiveTeam,
    incidents,
    activeRoute,
    acceptAssignment,
    updateIncidentStatus,
    updateTeamAvailability,
    updateTeamLocation
  } = useResQNet();

  const team = currentActiveTeam || teams[0];

  // Incidents assigned to this specific team
  const assignedIncidents = incidents.filter((i) => i.assignedTeamId === team.id);
  const activeIncident = assignedIncidents.find((i) => i.status !== 'Resolved') || assignedIncidents[0];

  // Simulating team moving along the road
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);

  const handleSimulateGPSMove = () => {
    if (!activeIncident) return;
    setIsSimulatingMove(true);

    // Intermediate step towards incident
    const newLat = (team.currentLocation.lat + activeIncident.coordinates.lat) / 2;
    const newLng = (team.currentLocation.lng + activeIncident.coordinates.lng) / 2;

    setTimeout(() => {
      updateTeamLocation(team.id, {
        lat: newLat,
        lng: newLng,
        address: `En route NH-45 corridor towards ${activeIncident.location.split(',')[0]}`
      });
      setIsSimulatingMove(false);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Unit Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#25B875]/10 border border-[#25B875]/30 text-[#25B875] text-xs font-bold font-mono">
            <Truck className="w-3.5 h-3.5" />
            <span>EMERGENCY FIELD UNIT CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            {team.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Unit ID: <span className="font-mono text-[#38BDF8]">{team.id}</span> · Base Station: {team.baseStation}
          </p>
        </div>

        {/* Unit Selector Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A7B3C5] font-semibold">Switch Unit:</span>
          <select
            value={team.id}
            onChange={(e) => setActiveTeamId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#14243D] border border-[#223552] text-xs font-bold text-[#F3F6FA] focus:outline-none"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.availability})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Status & Availability Strip */}
      <div className="p-4 bg-[#14243D] border border-[#223552] rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <TeamAvailabilityBadge availability={team.availability} />
          <span className="text-xs text-[#A7B3C5]">
            Vehicle: <strong className="text-[#F3F6FA] font-mono">{team.vehicleNumber}</strong> ({team.memberCount} members)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A7B3C5]">Change Operational Status:</span>
          {(['Available', 'Busy', 'Temporarily Unavailable'] as TeamAvailability[]).map((st) => (
            <button
              key={st}
              onClick={() => updateTeamAvailability(team.id, st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                team.availability === st
                  ? 'bg-[#3986D8] text-white font-bold'
                  : 'bg-[#19283D] text-[#A7B3C5] hover:text-white border border-[#223552]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Active Assignment Section */}
      {activeIncident ? (
        <div className="bg-[#14243D] border-2 border-[#3986D8]/40 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#223552]">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] block">Assigned Emergency Target</span>
              <h3 className="text-lg font-bold text-[#F3F6FA]">{activeIncident.id}: {activeIncident.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={activeIncident.priority} />
              <IncidentStatusBadge status={activeIncident.status} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#19283D] border border-[#223552] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Location Landmark</span>
              <div className="text-sm font-semibold text-[#F3F6FA]">{activeIncident.location}</div>
              <div className="text-[11px] font-mono text-[#64748B]">
                GPS: {activeIncident.coordinates.lat.toFixed(4)}, {activeIncident.coordinates.lng.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#19283D] border border-[#223552] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Citizen Caller</span>
              <div className="text-sm font-semibold text-[#F3F6FA]">{activeIncident.citizenName}</div>
              <div className="text-xs font-mono text-[#38BDF8]">{activeIncident.citizenPhone}</div>
            </div>
          </div>

          <p className="text-xs text-[#CBD5E1] bg-[#19283D] p-3 rounded-xl border border-[#223552] leading-relaxed">
            <strong>Incident Details: </strong>{activeIncident.description}
          </p>

          {/* Action Buttons: Accept / In Progress / Resolve */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {team.availability === 'Assigned' && (
              <button
                onClick={() => acceptAssignment(team.id, activeIncident.id)}
                className="px-5 py-2.5 bg-[#25B875] hover:bg-[#25B875]/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Assignment &amp; Roll Wheels (Busy)</span>
              </button>
            )}

            <button
              onClick={handleSimulateGPSMove}
              disabled={isSimulatingMove}
              className="px-4 py-2.5 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{isSimulatingMove ? 'Transmitting GPS...' : 'Simulate GPS Movement Towards Scene'}</span>
            </button>

            {activeIncident.status !== 'Resolved' && (
              <button
                onClick={() => updateIncidentStatus(activeIncident.id, 'Resolved', 'Field rescue finalized and patient stabilized.')}
                className="px-4 py-2.5 bg-[#19283D] hover:bg-[#223552] text-[#25B875] border border-[#25B875]/40 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Emergency Resolved &amp; Clear Unit</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[#14243D] border border-[#223552] rounded-2xl text-center space-y-2 text-[#A7B3C5]">
          <CheckCircle2 className="w-8 h-8 text-[#25B875] mx-auto" />
          <h3 className="text-base font-bold text-[#F3F6FA]">Unit Stationed &amp; Available</h3>
          <p className="text-xs text-[#A7B3C5]">
            No pending dispatches assigned to {team.name}. Unit is on standby at {team.baseStation}.
          </p>
        </div>
      )}

      {/* Road Navigation Map Viewport */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#38BDF8]" />
          <span>Live Field Road Route Guidance (OSRM)</span>
        </h3>
        <LeafletEmergencyMap
          incidents={activeIncident ? [activeIncident] : []}
          teams={[team]}
          activeRoute={activeRoute}
          showRoutePanel={true}
        />
      </div>
    </div>
  );
};
