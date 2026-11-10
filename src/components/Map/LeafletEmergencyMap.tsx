import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  EmergencyCategory,
  Incident,
  PriorityLevel,
  ResponseTeam,
  RouteDetail,
  TeamAvailability
} from '../../types/resqnet';
import {
  Navigation,
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  Clock,
  Phone,
  Maximize2
} from 'lucide-react';
import { PriorityBadge, TeamAvailabilityBadge } from '../StatusBadges';

interface LeafletMapProps {
  incidents: Incident[];
  teams: ResponseTeam[];
  activeRoute: RouteDetail | null;
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  onSelectTeam?: (id: string) => void;
  showRoutePanel?: boolean;
}

export const LeafletEmergencyMap: React.FC<LeafletMapProps> = ({
  incidents,
  teams,
  activeRoute,
  selectedIncidentId,
  onSelectIncident,
  onSelectTeam,
  showRoutePanel = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [showTeams, setShowTeams] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Chennai South / Guduvancheri / Tambaram corridor
    const map = L.map(mapContainerRef.current, {
      center: [12.855, 80.08],
      zoom: 12,
      zoomControl: false
    });

    // Dark Matter tile layer for premium dark navy appearance
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Plot Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        if (filterCategory !== 'ALL' && inc.category !== filterCategory) return;
        if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return;

        const isCritical = inc.priority === 'CRITICAL';
        const isResolved = inc.status === 'Resolved';
        const isSelected = inc.id === selectedIncidentId;

        // Custom marker color based on priority
        let markerBg = '#3986D8';
        if (isResolved) markerBg = '#25B875';
        else if (inc.priority === 'CRITICAL') markerBg = '#E5484D';
        else if (inc.priority === 'HIGH') markerBg = '#FF922E';

        const incidentIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: `
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: ${markerBg};
              border: 2px solid #F3F6FA;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 ${isCritical ? '14px #E5484D' : '8px rgba(0,0,0,0.6)'};
              cursor: pointer;
              transition: transform 0.2s;
            ">
              <span style="color: ${markerBg === '#3986D8' ? '#080D18' : 'white'}; font-size: 11px; font-weight: bold;">!</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], { icon: incidentIcon });

        const popupContent = `
          <div style="color: #F3F6FA; font-family: sans-serif; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 11px; color: #A7B3C5; font-weight: bold;">${inc.id}</span>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${markerBg}20; color: ${markerBg}; border: 1px solid ${markerBg}40;">${inc.priority}</span>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px; line-height: 1.3;">${inc.title}</div>
            <div style="font-size: 11px; color: #A7B3C5; margin-bottom: 6px;">${inc.location}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #CBD5E1; border-top: 1px solid #223552; padding-top: 6px;">
              <span>Affected: <strong>${inc.peopleAffected}</strong></span>
              <span>Status: <strong style="color: #3986D8;">${inc.status}</strong></span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectIncident) onSelectIncident(inc.id);
        });

        markersLayer.addLayer(marker);
      });
    }

    // 2. Plot Teams
    if (showTeams) {
      teams.forEach((team) => {
        let teamBg = '#25B875'; // Available
        if (team.availability === 'Assigned') teamBg = '#3986D8';
        else if (team.availability === 'Busy') teamBg = '#E5484D';
        else if (team.availability === 'Offline' || team.availability === 'Temporarily Unavailable') teamBg = '#64748B';

        const teamIcon = L.divIcon({
          className: 'custom-team-marker',
          html: `
            <div style="
              width: 26px;
              height: 26px;
              background: #14243D;
              border: 2px solid ${teamBg};
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px ${teamBg}80;
              cursor: pointer;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${teamBg}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([team.currentLocation.lat, team.currentLocation.lng], { icon: teamIcon });

        const popupContent = `
          <div style="color: #F3F6FA; font-family: sans-serif; min-width: 200px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 11px; color: #A7B3C5; font-weight: bold;">${team.id}</span>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${teamBg}20; color: ${teamBg}; border: 1px solid ${teamBg}40;">${team.availability}</span>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 2px;">${team.name}</div>
            <div style="font-size: 11px; color: #A7B3C5; margin-bottom: 4px;">Leader: ${team.leaderName} (${team.contactNumber})</div>
            <div style="font-size: 11px; color: #3986D8; font-weight: 500;">Unit: ${team.vehicleNumber}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectTeam) onSelectTeam(team.id);
        });

        markersLayer.addLayer(marker);
      });
    }

    // 3. Plot Active Road Route if present
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoute && activeRoute.waypoints && activeRoute.waypoints.length > 0) {
      const polyline = L.polyline(activeRoute.waypoints, {
        color: '#38BDF8', // Bright Yellow Route
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      routeLayerRef.current = polyline;
    }
  }, [incidents, teams, activeRoute, filterCategory, filterPriority, showTeams, showIncidents, selectedIncidentId]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([12.855, 80.08], 12);
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#223552] bg-[#080D18] shadow-2xl flex flex-col lg:flex-row">
      {/* Map Viewport */}
      <div className="relative flex-1 h-full min-h-[340px]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Top Bar Controls */}
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Quick Filters */}
          <div className="flex items-center gap-2 pointer-events-auto bg-[#14243D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#223552] shadow-lg text-xs">
            <span className="text-[#A7B3C5] font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#3986D8]" />
              <span>Layers:</span>
            </span>

            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                showIncidents
                  ? 'bg-[#E5484D] text-white'
                  : 'bg-[#19283D] text-[#A7B3C5] hover:text-white'
              }`}
            >
              Incidents ({incidents.length})
            </button>

            <button
              onClick={() => setShowTeams(!showTeams)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                showTeams
                  ? 'bg-[#25B875] text-white'
                  : 'bg-[#19283D] text-[#A7B3C5] hover:text-white'
              }`}
            >
              Teams ({teams.length})
            </button>
          </div>

          {/* Quick Action: Recenter */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleRecenter}
              title="Recenter Map Bounds"
              className="px-2.5 py-1.5 bg-[#14243D]/90 hover:bg-[#19283D] text-[#F3F6FA] text-xs font-medium rounded-xl border border-[#223552] shadow-lg transition-colors flex items-center gap-1.5 backdrop-blur-md"
            >
              <Compass className="w-3.5 h-3.5 text-[#3986D8]" />
              <span>Recenter</span>
            </button>
          </div>
        </div>

        {/* Map Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#14243D]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#223552] shadow-lg text-[10px] space-y-1 pointer-events-auto hidden sm:block text-[#A7B3C5]">
          <div className="font-bold text-[#F3F6FA] uppercase tracking-wider mb-1">Marker Legend</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
            <span>Critical Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF922E]" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25B875]" />
            <span>Available Team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3986D8]" />
            <span>Assigned Team / Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#38BDF8]" />
            <span>Dispatched Road Route</span>
          </div>
        </div>
      </div>

      {/* Side Route Details Panel (Module 6G) */}
      {showRoutePanel && (
        <div className="w-full lg:w-80 bg-[#14243D] border-t lg:border-t-0 lg:border-l border-[#223552] p-4 flex flex-col justify-between overflow-y-auto">
          {activeRoute ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3986D8]">
                  <Navigation className="w-4 h-4 animate-spin text-[#3986D8]" />
                  <span>ACTIVE ROUTE MONITOR</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3986D8]/20 text-[#3986D8] border border-[#3986D8]/40 font-bold">
                  {activeRoute.status}
                </span>
              </div>

              {/* Progress Line */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A7B3C5]">Transit Progress</span>
                  <span className="font-mono font-bold text-[#F3F6FA]">
                    {activeRoute.routeProgressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#080D18] rounded-full overflow-hidden border border-[#223552]">
                  <div
                    className="h-full bg-gradient-to-r from-[#3986D8] to-[#38BDF8] rounded-full transition-all duration-500"
                    style={{ width: `${activeRoute.routeProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#19283D] border border-[#223552]">
                  <span className="text-[10px] text-[#A7B3C5] block">Remaining Dist</span>
                  <span className="text-base font-bold font-mono text-[#F3F6FA]">
                    {activeRoute.remainingDistanceKm} km
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#19283D] border border-[#223552]">
                  <span className="text-[10px] text-[#A7B3C5] block">Estimated Arrival</span>
                  <span className="text-base font-bold font-mono text-[#25B875]">
                    ~{activeRoute.estimatedArrivalMinutes} min
                  </span>
                </div>
              </div>

              {/* Incident & Team Identifiers */}
              <div className="space-y-2 text-xs text-[#A7B3C5]">
                <div className="p-2 rounded-lg bg-[#19283D] border border-[#223552]">
                  <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Target Incident</span>
                  <span className="font-mono font-bold text-[#F3F6FA] text-xs">
                    {activeRoute.incidentId}
                  </span>
                  <div className="text-[11px] truncate text-[#CBD5E1] mt-0.5">
                    {activeRoute.destination}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#19283D] border border-[#223552]">
                  <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Dispatched Unit</span>
                  <span className="font-mono font-bold text-[#3986D8] text-xs">
                    {activeRoute.teamId}
                  </span>
                  <div className="text-[11px] truncate text-[#CBD5E1] mt-0.5">
                    From: {activeRoute.startingPoint}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[#A7B3C5] flex items-center justify-between pt-1">
                <span>GPS Telemetry: Active</span>
                <span>OSRM Routing Mode</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-[#A7B3C5]">
              <Navigation className="w-8 h-8 text-[#223552]" />
              <div className="text-xs font-bold text-[#F3F6FA]">No Active Route Selected</div>
              <p className="text-[11px] text-[#A7B3C5]">
                Assign a response team to an emergency or click an in-progress incident to view road route telemetry.
              </p>
            </div>
          )}

          {/* Quick Helpline Strip */}
          <div className="mt-4 pt-3 border-t border-[#223552] text-[11px] text-[#A7B3C5] flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-[#E5484D]" />
              <span>SOS: 112 / 108</span>
            </span>
            <span className="text-[10px] text-[#A7B3C5]">Leaflet OpenStreetMap</span>
          </div>
        </div>
      )}
    </div>
  );
};
