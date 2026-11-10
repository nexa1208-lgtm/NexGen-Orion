import React, { useState } from 'react';
import {
  Flame,
  MapPin,
  Users,
  Shield,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  PhoneCall,
  UserCheck,
  Fingerprint,
  Truck,
  RefreshCw,
  Copy,
  Navigation
} from 'lucide-react';
import { useResQNet } from '../../context/ResQNetContext';
import { EmergencyCategory, GPSCoordinate, PriorityLevel } from '../../types/resqnet';
import { calculateHaversineDistance, calculateIncidentPriority } from '../../utils/geoRouting';
import {
  CitizenStatusBadge,
  getCategoryIcon,
  IncidentStatusBadge,
  PriorityBadge,
  TeamAvailabilityBadge
} from '../../components/StatusBadges';
import { LeafletEmergencyMap } from '../../components/Map/LeafletEmergencyMap';
import { StatusTimeline } from '../../components/StatusTimeline';

export const CitizenViews: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    citizenProfile,
    updateCitizenProfile,
    incidents,
    teams,
    activeRoute,
    submitEmergencyReport
  } = useResQNet();

  // Citizen-specific reported incidents
  const myIncidents = incidents.filter(
    (i) => i.citizenPhone === citizenProfile.mobileNumber || i.citizenId === citizenProfile.id
  );

  // Active reported incident being tracked
  const [trackingIncidentId, setTrackingIncidentId] = useState<string>(
    myIncidents[0]?.id || 'INC-2026-0003'
  );

  const currentTrackedIncident = incidents.find((i) => i.id === trackingIncidentId) || myIncidents[0] || incidents[2];

  // Assigned team for the tracked incident
  const assignedTeam = teams.find((t) => t.id === currentTrackedIncident?.assignedTeamId);

  // Emergency Form State
  const [formCategory, setFormCategory] = useState<EmergencyCategory>('Medical Emergency');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCasualties, setFormCasualties] = useState<number>(1);
  const [formLocation, setFormLocation] = useState(citizenProfile.currentLocation?.address || 'Guduvancheri Bus Stand, NH-45');
  const [formCoords, setFormCoords] = useState<GPSCoordinate>(
    citizenProfile.currentLocation || { lat: 12.8465, lng: 80.0617 }
  );
  const [formVulnerable, setFormVulnerable] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessId, setSubmitSuccessId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Geolocation trigger
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setFormCoords(coords);
        setFormLocation(`GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (Device Auto-Location)`);
      },
      (err) => {
        setFormError(`GPS Detection error: ${err.message}. Please enter address manually.`);
      }
    );
  };

  const handlePhotoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEvidencePhoto(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      setFormError('Please enter both incident title and details.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    setTimeout(() => {
      const created = submitEmergencyReport({
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        location: formLocation,
        coordinates: formCoords,
        peopleAffected: Number(formCasualties) || 0,
        citizenName: citizenProfile.fullName,
        citizenPhone: citizenProfile.mobileNumber,
        emergencyContact: `${citizenProfile.emergencyContactName} (${citizenProfile.emergencyContactPhone})`,
        evidencePhotoUrl: evidencePhoto || undefined,
        vulnerablePersonsReported: formVulnerable
      });

      setSubmitting(false);
      setSubmitSuccessId(created.id);
      setTrackingIncidentId(created.id);
      // Automatically switch citizen status to Emergency Active
      updateCitizenProfile({ availabilityStatus: 'Emergency Active' });
    }, 400);
  };

  const categories: EmergencyCategory[] = [
    'Medical Emergency',
    'Road Accident',
    'Fire',
    'Flood',
    'Natural Disaster',
    'Building Collapse',
    'Missing Person',
    'Crime or Police Assistance',
    'Other Emergency'
  ];

  /* ------------------- VIEW: REPORT EMERGENCY ------------------- */
  if (activeNavTab === 'report-emergency') {
    if (submitSuccessId) {
      return (
        <div className="max-w-2xl mx-auto py-10 space-y-6">
          <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-[#25B875]/20 text-[#25B875] border border-[#25B875]/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#F3F6FA]">Emergency Report Transmitted</h2>
            <p className="text-xs sm:text-sm text-[#A7B3C5]">
              Your distress beacon is now active in the Central Command queue. Triage calculation and nearest response team allocation are underway.
            </p>

            <div className="p-4 bg-[#19283D] border border-[#223552] rounded-xl flex items-center justify-between font-mono text-sm">
              <span className="text-[#A7B3C5]">Reference Incident ID:</span>
              <strong className="text-[#38BDF8] text-base">{submitSuccessId}</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={() => {
                  setSubmitSuccessId(null);
                  setActiveNavTab('track-emergency');
                }}
                className="flex-1 py-3 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span>Track Live Dispatch Status</span>
              </button>

              <button
                onClick={() => {
                  setSubmitSuccessId(null);
                  setFormTitle('');
                  setFormDesc('');
                }}
                className="px-4 py-3 bg-[#19283D] text-[#A7B3C5] hover:text-white rounded-xl text-xs font-semibold"
              >
                Submit Additional Details
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#E5484D] text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5" />
            <span>CITIZEN EMERGENCY REPORTING (FAST INTAKE)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Report an Emergency
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Submitting immediately notifies municipal response commanders and calculates nearest specialized units.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-[#14243D] border border-[#223552] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {formError && (
            <div className="p-3 bg-[#E5484D]/15 border border-[#E5484D]/40 rounded-xl text-xs text-[#E5484D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block">
              1. Select Emergency Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = formCategory === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFormCategory(cat)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#3986D8]/20 border-[#3986D8] text-[#F3F6FA] ring-1 ring-[#3986D8]'
                        : 'bg-[#19283D] border-[#223552] text-[#A7B3C5] hover:text-[#F3F6FA]'
                    }`}
                  >
                    {getCategoryIcon(cat, 'w-4 h-4 shrink-0')}
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Title & Description */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block mb-1">
                2. Incident Summary Title *
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Minibus overturned on flyover with trapped passengers"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D18] border border-[#223552] text-sm text-[#F3F6FA] placeholder:text-[#64748B] focus:outline-none focus:border-[#3986D8]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block mb-1">
                3. Detailed Emergency Description & Conditions *
              </label>
              <textarea
                rows={3}
                required
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Mention visible injuries, smoke, trapped individuals, water level, or active hazards..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D18] border border-[#223552] text-sm text-[#F3F6FA] placeholder:text-[#64748B] focus:outline-none focus:border-[#3986D8]"
              />
            </div>
          </div>

          {/* 3. Location with GPS Detection */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider">
                4. Location &amp; Coordinates *
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-semibold"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Detect Device GPS</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="Landmark, building name, intersection..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080D18] border border-[#223552] text-sm text-[#F3F6FA] focus:outline-none focus:border-[#3986D8]"
            />
            <div className="text-[11px] font-mono text-[#64748B]">
              Lat: {formCoords.lat.toFixed(4)}, Lng: {formCoords.lng.toFixed(4)}
            </div>
          </div>

          {/* 4. Casualties & Vulnerable Persons */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block mb-1">
                People Impacted / Casualties
              </label>
              <input
                type="number"
                min={0}
                value={formCasualties}
                onChange={(e) => setFormCasualties(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-sm font-mono text-[#F3F6FA] focus:outline-none focus:border-[#3986D8]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="vulnerable-check"
                checked={formVulnerable}
                onChange={(e) => setFormVulnerable(e.target.checked)}
                className="w-4 h-4 rounded text-[#3986D8] bg-[#080D18] border-[#223552]"
              />
              <label htmlFor="vulnerable-check" className="text-xs text-[#A7B3C5] font-medium cursor-pointer">
                Children / Elderly / Mobility Impaired Involved
              </label>
            </div>
          </div>

          {/* 5. Photo Upload Simulation */}
          <div className="pt-2 space-y-2">
            <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block">
              Optional Incident Photo / Evidence
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="px-4 py-2.5 rounded-xl bg-[#19283D] hover:bg-[#223552] border border-[#223552] text-xs font-semibold text-[#A7B3C5] hover:text-white cursor-pointer transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Snapshot</span>
                <input type="file" accept="image/*" onChange={handlePhotoUploadSim} className="hidden" />
              </label>

              {evidencePhoto && (
                <div className="flex items-center gap-3 p-2 bg-[#19283D] rounded-xl border border-[#223552]">
                  <img
                    src={evidencePhoto}
                    alt="Evidence Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-[#3986D8]"
                  />
                  <div>
                    <span className="text-xs text-[#25B875] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Snapshot Attached</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEvidencePhoto(null)}
                      className="text-[11px] text-[#E5484D] hover:underline block text-left mt-0.5"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#E5484D] hover:bg-[#E5484D]/90 active:bg-rose-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transmitting to ResQNet Command...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>TRANSMIT EMERGENCY REPORT (112 DISPATCH)</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  /* ------------------- VIEW: TRACK EMERGENCY & ASSIGNED TEAM ------------------- */
  if (activeNavTab === 'track-emergency' || activeNavTab === 'assigned-team') {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>INSTANT INCIDENT LIFECYCLE TRACKER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Track Emergency &amp; Response Unit
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Real-time status, road navigation route, and assigned emergency response team contact dossier.
          </p>
        </div>

        {/* Tracked Incident Selector if multiple */}
        {myIncidents.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[#A7B3C5] font-semibold">Select Incident:</span>
            {myIncidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setTrackingIncidentId(inc.id)}
                className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                  inc.id === currentTrackedIncident?.id
                    ? 'bg-[#3986D8] text-white font-bold border-[#3986D8]'
                    : 'bg-[#14243D] text-[#A7B3C5] border-[#223552]'
                }`}
              >
                {inc.id}
              </button>
            ))}
          </div>
        )}

        {currentTrackedIncident ? (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Lifecycle Timeline & Assigned Team Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Incident Header Card */}
              <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#223552]">
                  <div>
                    <span className="text-xs font-mono text-[#A7B3C5] block">{currentTrackedIncident.id}</span>
                    <h3 className="text-lg font-bold text-[#F3F6FA]">{currentTrackedIncident.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={currentTrackedIncident.priority} />
                    <IncidentStatusBadge status={currentTrackedIncident.status} />
                  </div>
                </div>

                {/* 3-Stage Primary Lifecycle: REPORTED -> IN PROGRESS -> RESOLVED */}
                <StatusTimeline
                  currentStatus={currentTrackedIncident.status}
                  createdAt={currentTrackedIncident.createdAt}
                  assignedAt={currentTrackedIncident.assignedAt}
                  resolvedAt={currentTrackedIncident.resolvedAt}
                  assignedTeamName={assignedTeam?.name}
                  timelineEvents={currentTrackedIncident.timeline}
                />

                <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552] text-xs text-[#A7B3C5] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#CBD5E1]">
                    <MapPin className="w-3.5 h-3.5 text-[#E5484D]" />
                    <span className="font-semibold">{currentTrackedIncident.location}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pt-1">{currentTrackedIncident.description}</p>
                </div>
              </div>

              {/* MANDATORY MODULE 8: ASSIGNED TEAM DETAILS */}
              <div className="bg-[#14243D] border-2 border-[#3986D8]/40 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#223552]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#38BDF8]" />
                    <div>
                      <h4 className="text-base font-bold text-[#F3F6FA]">Assigned Emergency Response Team</h4>
                      <span className="text-[11px] text-[#A7B3C5]">Dedicated unit responding to your call</span>
                    </div>
                  </div>
                  {assignedTeam && <TeamAvailabilityBadge availability={assignedTeam.availability} />}
                </div>

                {assignedTeam ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#19283D] border border-[#223552]">
                        <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Team Name &amp; ID</span>
                        <div className="text-sm font-bold text-[#F3F6FA] mt-0.5">{assignedTeam.name}</div>
                        <span className="text-[11px] font-mono text-[#38BDF8]">{assignedTeam.id}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#19283D] border border-[#223552]">
                        <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Team Leader</span>
                        <div className="text-sm font-bold text-[#F3F6FA] mt-0.5">{assignedTeam.leaderName}</div>
                        <span className="text-[11px] font-mono text-[#A7B3C5]">{assignedTeam.leaderPhone}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#19283D] border border-[#223552]">
                        <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Vehicle &amp; Capability</span>
                        <div className="text-xs font-semibold text-[#F3F6FA] mt-0.5">{assignedTeam.vehicleNumber}</div>
                        <span className="text-[11px] text-[#25B875]">{assignedTeam.category}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#19283D] border border-[#223552]">
                        <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">ETA &amp; Proximity</span>
                        <div className="text-sm font-bold font-mono text-[#25B875] mt-0.5">
                          ~{activeRoute?.estimatedArrivalMinutes || 5} min (~{calculateHaversineDistance(assignedTeam.currentLocation, currentTrackedIncident.coordinates)} km away)
                        </div>
                        <span className="text-[11px] text-[#A7B3C5]">Sirens active on green corridor</span>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={`tel:${assignedTeam.contactNumber}`}
                        className="flex-1 py-3 bg-[#25B875] hover:bg-[#25B875]/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Direct Call Response Team Leader</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#19283D] rounded-xl text-center space-y-2 text-[#A7B3C5]">
                    <Clock className="w-6 h-6 text-[#3986D8] mx-auto animate-pulse" />
                    <div className="text-xs font-bold text-[#F3F6FA]">Nearest Unit Allocation in Progress</div>
                    <p className="text-[11px] text-[#A7B3C5] max-w-sm mx-auto">
                      Automated algorithm is querying active EMS and rescue depots within 5km radius.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 cols: Live GPS Map with Route */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#223552]">
                  <span className="font-bold text-[#F3F6FA] flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#38BDF8]" />
                    <span>Live GPS Response Map</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#25B875]">GPS Sync Active</span>
                </div>

                <LeafletEmergencyMap
                  incidents={[currentTrackedIncident]}
                  teams={assignedTeam ? [assignedTeam] : []}
                  activeRoute={activeRoute}
                  selectedIncidentId={currentTrackedIncident.id}
                  showRoutePanel={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-[#A7B3C5] bg-[#14243D] rounded-2xl border border-[#223552]">
            No active emergency reported.
          </div>
        )}
      </div>
    );
  }

  /* ------------------- VIEW: CITIZEN PROFILE & IDENTITY VERIFICATION ------------------- */
  if (activeNavTab === 'my-profile' || activeNavTab === 'emergency-contacts') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#3986D8]/10 border border-[#3986D8]/30 text-[#3986D8] text-xs font-bold font-mono">
            <UserCheck className="w-3.5 h-3.5" />
            <span>IDENTITY VERIFICATION &amp; SAFETY PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Citizen Profile &amp; Emergency Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Manage verified contact information, biometric authentication, and location sharing permissions.
          </p>
        </div>

        <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Identity Verification Strip */}
          <div className="p-4 bg-[#19283D] border border-[#223552] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#080D18] border border-[#3986D8] shrink-0">
                <img
                  src={citizenProfile.profilePhotoUrl}
                  alt={citizenProfile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#F3F6FA]">{citizenProfile.fullName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#25B875]/15 text-[#25B875] border border-[#25B875]/30">
                    ID VERIFIED
                  </span>
                </div>
                <div className="text-xs font-mono text-[#A7B3C5] mt-0.5">{citizenProfile.mobileNumber}</div>
              </div>
            </div>

            {/* Availability Status Badge */}
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] uppercase font-bold text-[#A7B3C5]">Current Status:</span>
              <CitizenStatusBadge status={citizenProfile.availabilityStatus} />
            </div>
          </div>

          {/* Quick Status Control */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#F3F6FA] uppercase tracking-wider block">
              Update Availability Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Safe', 'Need Assistance', 'Emergency Active'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => updateCitizenProfile({ availabilityStatus: st })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    citizenProfile.availabilityStatus === st
                      ? 'bg-[#3986D8] text-white font-bold border-[#3986D8] shadow-sm'
                      : 'bg-[#19283D] text-[#A7B3C5] border-[#223552] hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Biometric & Permission Controls (Module 10) */}
          <div className="space-y-3 pt-3 border-t border-[#223552]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B3C5]">
              Device Security &amp; Permissions
            </h4>

            <div className="flex items-center justify-between p-3.5 bg-[#19283D] rounded-xl border border-[#223552]">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-[#38BDF8]" />
                <div>
                  <div className="text-xs font-bold text-[#F3F6FA]">Biometric Authentication (Device-based)</div>
                  <div className="text-[11px] text-[#A7B3C5]">Use WebAuthn fingerprint / face unlock on this phone</div>
                </div>
              </div>
              <button
                onClick={() =>
                  updateCitizenProfile({ biometricAuthEnabled: !citizenProfile.biometricAuthEnabled })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  citizenProfile.biometricAuthEnabled ? 'bg-[#3986D8]' : 'bg-[#080D18]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    citizenProfile.biometricAuthEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#19283D] rounded-xl border border-[#223552]">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#25B875]" />
                <div>
                  <div className="text-xs font-bold text-[#F3F6FA]">Permission-based GPS Location Sharing</div>
                  <div className="text-[11px] text-[#A7B3C5]">Only shared with authorized responders during active calls</div>
                </div>
              </div>
              <button
                onClick={() =>
                  updateCitizenProfile({
                    locationPermissionGranted: !citizenProfile.locationPermissionGranted
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  citizenProfile.locationPermissionGranted ? 'bg-[#25B875]' : 'bg-[#080D18]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    citizenProfile.locationPermissionGranted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-3 pt-3 border-t border-[#223552]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B3C5]">
              Personal Emergency Contact
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552]">
                <span className="text-[10px] text-[#A7B3C5] block">Next of Kin Contact Name</span>
                <span className="font-bold text-[#F3F6FA] text-sm mt-0.5 block">{citizenProfile.emergencyContactName}</span>
              </div>
              <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552]">
                <span className="text-[10px] text-[#A7B3C5] block">Emergency Mobile</span>
                <span className="font-bold font-mono text-[#F3F6FA] text-sm mt-0.5 block">{citizenProfile.emergencyContactPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------- VIEW: DEFAULT CITIZEN HOME ------------------- */
  return (
    <div className="space-y-8 pb-16">
      {/* Big Distress Hero Banner */}
      <div className="bg-gradient-to-br from-[#14243D] via-[#101F36] to-[#080D18] border border-[#223552] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#E5484D] text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#E5484D] animate-ping" />
            <span>24/7 CENTRALIZED EMERGENCY COORDINATION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F3F6FA] tracking-tight leading-tight">
            One Report. One Response.{' '}
            <span className="text-[#38BDF8]">Every Life Matters.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A7B3C5] leading-relaxed">
            Report emergencies with instant GPS detection, automated triage prioritization, and real-time response team dispatch across Chengalpattu, Tambaram, and Guduvancheri.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveNavTab('report-emergency')}
              className="px-6 py-3.5 bg-[#E5484D] hover:bg-[#E5484D]/90 text-white font-extrabold rounded-xl shadow-lg shadow-rose-900/40 text-sm flex items-center gap-2 transition-transform active:scale-95"
            >
              <Flame className="w-5 h-5" />
              <span>Report an Emergency Now</span>
            </button>

            <button
              onClick={() => setActiveNavTab('track-emergency')}
              className="px-5 py-3.5 bg-[#14243D] hover:bg-[#19283D] text-[#F3F6FA] font-bold rounded-xl border border-[#223552] text-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#3986D8]" />
              <span>Track Active Reports ({myIncidents.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Category Quick Intake Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F6FA]">
          Quick Emergency Dispatch Categories
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat}
              onClick={() => {
                setFormCategory(cat);
                setActiveNavTab('report-emergency');
              }}
              className="p-4 rounded-xl bg-[#14243D] border border-[#223552] hover:border-[#3986D8] transition-all cursor-pointer group space-y-2"
            >
              <div className="w-10 h-10 rounded-lg bg-[#19283D] flex items-center justify-center">
                {getCategoryIcon(cat, 'w-5 h-5')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F3F6FA] group-hover:text-[#38BDF8] transition-colors">
                  {cat}
                </h4>
                <p className="text-[11px] text-[#A7B3C5] mt-0.5">Click for instant dispatch</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
