import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CitizenProfile,
  EmergencyCategory,
  GPSCoordinate,
  Incident,
  IncidentStatus,
  PoliceEscalation,
  PoliceInvestigationStatus,
  PriorityLevel,
  ResponseTeam,
  ResQNotification,
  RouteDetail,
  TeamAvailability,
  UserRole
} from '../types/resqnet';
import {
  SEED_CITIZEN_PROFILE,
  SEED_INCIDENTS,
  SEED_NOTIFICATIONS,
  SEED_POLICE_ESCALATIONS,
  SEED_RESPONSE_TEAMS
} from '../data/resqnetSeedData';
import {
  analyzeSuspiciousReport,
  calculateHaversineDistance,
  calculateIncidentPriority,
  generateRoadWaypoints
} from '../utils/geoRouting';

interface ResQNetContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  
  citizenProfile: CitizenProfile;
  updateCitizenProfile: (updates: Partial<CitizenProfile>) => void;
  
  activeTeamId: string;
  setActiveTeamId: (id: string) => void;
  currentActiveTeam: ResponseTeam | undefined;

  incidents: Incident[];
  teams: ResponseTeam[];
  policeEscalations: PoliceEscalation[];
  notifications: ResQNotification[];
  activeRoute: RouteDetail | null;
  setActiveRoute: (route: RouteDetail | null) => void;

  submitEmergencyReport: (data: {
    title: string;
    description: string;
    category: EmergencyCategory;
    location: string;
    coordinates: GPSCoordinate;
    peopleAffected: number;
    citizenName: string;
    citizenPhone: string;
    emergencyContact?: string;
    evidencePhotoUrl?: string;
    vulnerablePersonsReported?: boolean;
  }) => Incident;

  assignTeamToIncident: (incidentId: string, teamId: string) => void;
  acceptAssignment: (teamId: string, incidentId: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, note?: string) => void;
  overrideIncidentPriority: (incidentId: string, newPriority: PriorityLevel, reason: string) => void;
  updateTeamAvailability: (teamId: string, availability: TeamAvailability) => void;
  updateTeamLocation: (teamId: string, coords: GPSCoordinate) => void;
  escalateToPolice: (incidentId: string, reason: string, remarks?: string) => PoliceEscalation;
  updatePoliceInvestigation: (
    escalationId: string,
    status: PoliceInvestigationStatus,
    actionTaken?: string,
    remarks?: string
  ) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetDemoData: () => void;

  stats: {
    totalIncidents: number;
    criticalIncidents: number;
    highIncidents: number;
    inProgressIncidents: number;
    resolvedIncidents: number;
    availableTeamsCount: number;
    busyTeamsCount: number;
    suspiciousCount: number;
    policeEscalationsCount: number;
    avgResponseMinutes: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
}

const ResQNetContext = createContext<ResQNetContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'resqnet_v3_role',
  NAV: 'resqnet_v3_nav',
  INCIDENTS: 'resqnet_v3_incidents',
  TEAMS: 'resqnet_v3_teams',
  CITIZEN: 'resqnet_v3_citizen',
  ESCALATIONS: 'resqnet_v3_escalations',
  NOTIFICATIONS: 'resqnet_v3_notifs',
  ACTIVE_TEAM: 'resqnet_v3_active_team'
};

export const ResQNetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved && ['citizen', 'admin', 'team', 'police'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return 'admin';
  });

  const [activeNavTab, setActiveNavTab] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.NAV) || 'overview';
  });

  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CITIZEN);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_CITIZEN_PROFILE;
  });

  const [activeTeamId, setActiveTeamId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TEAM) || 'TEAM-MED-01';
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_INCIDENTS;
  });

  const [teams, setTeams] = useState<ResponseTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_RESPONSE_TEAMS;
  });

  const [policeEscalations, setPoliceEscalations] = useState<PoliceEscalation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ESCALATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_POLICE_ESCALATIONS;
  });

  const [notifications, setNotifications] = useState<ResQNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_NOTIFICATIONS;
  });

  const [activeRoute, setActiveRoute] = useState<RouteDetail | null>(() => {
    // Default initial simulated route for INC-2026-0003 & TEAM-MED-01
    const inc = SEED_INCIDENTS.find((i) => i.id === 'INC-2026-0003');
    const team = SEED_RESPONSE_TEAMS.find((t) => t.id === 'TEAM-MED-01');
    if (inc && team) {
      const dist = calculateHaversineDistance(team.currentLocation, inc.coordinates);
      const waypoints = generateRoadWaypoints(team.currentLocation, inc.coordinates);
      return {
        incidentId: inc.id,
        teamId: team.id,
        startingPoint: team.currentLocation.address || 'Potheri Base Station',
        destination: inc.location,
        startCoords: team.currentLocation,
        destCoords: inc.coordinates,
        roadDistanceKm: dist,
        remainingDistanceKm: Math.max(0.4, dist * 0.4),
        estimatedArrivalMinutes: 4,
        routeProgressPercent: 60,
        waypoints,
        currentTeamPosition: {
          lat: (team.currentLocation.lat + inc.coordinates.lat) / 2,
          lng: (team.currentLocation.lng + inc.coordinates.lng) / 2
        },
        status: 'EN_ROUTE',
        lastGpsUpdate: new Date().toISOString()
      };
    }
    return null;
  });

  // Persistent storage hooks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.NAV, activeNavTab);
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEYS.CITIZEN, JSON.stringify(citizenProfile));
      localStorage.setItem(STORAGE_KEYS.ESCALATIONS, JSON.stringify(policeEscalations));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TEAM, activeTeamId);
    } catch (e) {
      console.error('Storage sync error', e);
    }
  }, [role, activeNavTab, incidents, teams, citizenProfile, policeEscalations, notifications, activeTeamId]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    // Switch default tab appropriately
    if (newRole === 'citizen') setActiveNavTab('home');
    else if (newRole === 'admin') setActiveNavTab('overview');
    else if (newRole === 'team') setActiveNavTab('team-dashboard');
    else if (newRole === 'police') setActiveNavTab('police-dashboard');
  };

  const updateCitizenProfile = (updates: Partial<CitizenProfile>) => {
    setCitizenProfile((prev) => ({ ...prev, ...updates }));
  };

  const currentActiveTeam = useMemo(() => {
    return teams.find((t) => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  // Submit emergency report with auto prioritization and suspicious checks
  const submitEmergencyReport = (data: {
    title: string;
    description: string;
    category: EmergencyCategory;
    location: string;
    coordinates: GPSCoordinate;
    peopleAffected: number;
    citizenName: string;
    citizenPhone: string;
    emergencyContact?: string;
    evidencePhotoUrl?: string;
    vulnerablePersonsReported?: boolean;
  }): Incident => {
    const nextNumber = incidents.length + 1;
    const newId = `INC-2026-${nextNumber.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();

    // 1. Prioritization engine
    const { priority, reason } = calculateIncidentPriority(
      data.category,
      data.description,
      data.peopleAffected,
      data.vulnerablePersonsReported
    );

    // 2. Suspicious report detection
    const existingReports = incidents.map((i) => ({
      citizenPhone: i.citizenPhone,
      description: i.description,
      coords: i.coordinates,
      createdAt: i.createdAt
    }));
    const { score, classification, reasons: suspiciousReasons } = analyzeSuspiciousReport(
      data.citizenPhone,
      data.description,
      data.coordinates,
      existingReports
    );

    const newIncident: Incident = {
      ...data,
      id: newId,
      citizenId: citizenProfile.id,
      priority,
      calculatedPriority: priority,
      priorityReason: reason,
      status: 'Reported',
      createdAt: now,
      updatedAt: now,
      suspiciousScore: score,
      suspiciousStatus: classification,
      suspiciousReasons,
      priorityAudits: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: now,
          status: 'Reported',
          actor: `Citizen (${data.citizenName})`,
          note: `Incident registered with priority ${priority}. Automated risk score: ${score} (${classification}).`
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);

    // Asynchronously call server-side Gemini API for deep suspicious report analysis
    fetch('/api/gemini/analyze-suspicious', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newId,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        peopleAffected: data.peopleAffected,
        coordinates: data.coordinates,
        citizenName: data.citizenName
      })
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((aiResult) => {
        if (aiResult && typeof aiResult.suspiciousRiskScore === 'number') {
          setIncidents((current) =>
            current.map((inc) => {
              if (inc.id === newId) {
                return {
                  ...inc,
                  suspiciousScore: aiResult.suspiciousRiskScore,
                  suspiciousStatus: aiResult.riskClassification || inc.suspiciousStatus,
                  suspiciousReasons: aiResult.suspiciousIndicators?.length ? aiResult.suspiciousIndicators : inc.suspiciousReasons,
                  aiExplanation: aiResult.explanation
                };
              }
              return inc;
            })
          );
        }
      })
      .catch((err) => {
        console.warn('Gemini suspicious check offline, using heuristic fallback:', err);
      });

    // Dispatch in-app notification
    const newNotif: ResQNotification = {
      id: `notif-${Date.now()}`,
      timestamp: now,
      title: priority === 'CRITICAL' ? 'CRITICAL Emergency Intake' : 'New Incident Logged',
      message: `${newId} [${data.category}] at ${data.location}`,
      type: priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      incidentId: newId,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // If suspicious threshold reached, automatically propose police escalation
    if (classification === 'Escalated to Police') {
      const escalation: PoliceEscalation = {
        id: `ESC-2026-${(policeEscalations.length + 1).toString().padStart(3, '0')}`,
        incidentId: newId,
        citizenId: citizenProfile.id,
        citizenName: data.citizenName,
        citizenPhone: data.citizenPhone,
        reportDetails: data.description,
        suspiciousIndicators: suspiciousReasons,
        riskScore: score,
        evidenceNotes: 'Automated pattern detection flagged repeated/extreme parameters.',
        gpsLocation: `${data.coordinates.lat.toFixed(4)}, ${data.coordinates.lng.toFixed(4)}`,
        reportedAt: now,
        escalatedAt: now,
        escalatedBy: 'Automated Fraud Guard Engine',
        escalationReason: 'Risk score exceeded critical fraud threshold of 70.',
        investigationStatus: 'New Escalation',
        auditTrail: [
          {
            timestamp: now,
            officer: 'Automated Guard',
            action: 'Automated Escalation Generated',
            notes: `Risk Score: ${score}`
          }
        ]
      };
      setPoliceEscalations((prev) => [escalation, ...prev]);
    }

    return newIncident;
  };

  // Assign team to incident
  const assignTeamToIncident = (incidentId: string, teamId: string) => {
    const now = new Date().toISOString();
    const team = teams.find((t) => t.id === teamId);
    const incident = incidents.find((i) => i.id === incidentId);
    if (!team || !incident) return;

    // Update Incident
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          assignedTeamId: team.id,
          assignedTeamName: team.name,
          assignedAt: now,
          status: 'In Progress',
          updatedAt: now,
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: now,
              status: 'In Progress',
              actor: 'Chief Dispatcher',
              note: `Response Team ${team.name} assigned to incident.`
            }
          ]
        };
      })
    );

    // Update Team availability to Assigned
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          availability: 'Assigned',
          assignedIncidentId: incidentId,
          assignmentHistory: [
            { incidentId, assignedAt: now, status: 'Assigned' },
            ...t.assignmentHistory
          ]
        };
      })
    );

    // Create / Update active road route
    const dist = calculateHaversineDistance(team.currentLocation, incident.coordinates);
    const waypoints = generateRoadWaypoints(team.currentLocation, incident.coordinates);
    const estMinutes = Math.max(3, Math.round((dist / 42) * 60 + 2));

    setActiveRoute({
      incidentId: incident.id,
      teamId: team.id,
      startingPoint: team.currentLocation.address || 'Command Station Depot',
      destination: incident.location,
      startCoords: team.currentLocation,
      destCoords: incident.coordinates,
      roadDistanceKm: dist,
      remainingDistanceKm: dist,
      estimatedArrivalMinutes: estMinutes,
      routeProgressPercent: 0,
      waypoints,
      currentTeamPosition: team.currentLocation,
      status: 'DISPATCHED',
      lastGpsUpdate: now
    });

    // Notify
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: now,
        title: 'Team Allocated',
        message: `${team.name} assigned to ${incident.id}.`,
        type: 'ASSIGNMENT',
        incidentId,
        read: false
      },
      ...prev
    ]);
  };

  // Team accepts assignment and transitions to Busy
  const acceptAssignment = (teamId: string, incidentId: string) => {
    const now = new Date().toISOString();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, availability: 'Busy' } : t))
    );

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          updatedAt: now,
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: now,
              status: 'In Progress',
              actor: `Team Leader (${team.leaderName})`,
              note: 'Assignment accepted. Unit wheels rolling with siren protocol.'
            }
          ]
        };
      })
    );

    if (activeRoute && activeRoute.incidentId === incidentId) {
      setActiveRoute({
        ...activeRoute,
        status: 'EN_ROUTE',
        routeProgressPercent: 25,
        lastGpsUpdate: now
      });
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: now,
        title: 'Team Rolling On-Scene',
        message: `${team.name} accepted dispatch for ${incidentId}.`,
        type: 'STATUS',
        incidentId,
        read: false
      },
      ...prev
    ]);
  };

  // Update incident status
  const updateIncidentStatus = (incidentId: string, status: IncidentStatus, note?: string) => {
    const now = new Date().toISOString();

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const resolvedAt = status === 'Resolved' ? now : inc.resolvedAt;

        // If resolving, free up assigned team
        if (status === 'Resolved' && inc.assignedTeamId) {
          setTeams((teamsPrev) =>
            teamsPrev.map((t) =>
              t.id === inc.assignedTeamId
                ? { ...t, availability: 'Available', assignedIncidentId: undefined }
                : t
            )
          );
        }

        return {
          ...inc,
          status,
          updatedAt: now,
          resolvedAt,
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: now,
              status,
              actor: role === 'admin' ? 'Administrator' : role === 'team' ? 'Response Team' : 'Dispatcher',
              note: note || `Incident status updated to ${status}.`
            }
          ]
        };
      })
    );

    if (status === 'Resolved' && activeRoute && activeRoute.incidentId === incidentId) {
      setActiveRoute(null);
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: now,
        title: status === 'Resolved' ? 'Incident Resolved' : 'Status Updated',
        message: `${incidentId} marked as ${status}.`,
        type: 'STATUS',
        incidentId,
        read: false
      },
      ...prev
    ]);
  };

  // Override priority with reason and audit history
  const overrideIncidentPriority = (incidentId: string, newPriority: PriorityLevel, reason: string) => {
    const now = new Date().toISOString();

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const audit = {
          id: `audit-${Date.now()}`,
          timestamp: now,
          previousPriority: inc.priority,
          newPriority,
          actor: 'Administrator Command',
          reason
        };

        return {
          ...inc,
          priority: newPriority,
          updatedAt: now,
          priorityAudits: [audit, ...inc.priorityAudits],
          timeline: [
            ...inc.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: now,
              status: inc.status,
              actor: 'Administrator Command',
              note: `Priority adjusted from ${inc.priority} to ${newPriority}. Reason: ${reason}`
            }
          ]
        };
      })
    );
  };

  // Team availability update
  const updateTeamAvailability = (teamId: string, availability: TeamAvailability) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, availability } : t))
    );
  };

  // Team GPS location update
  const updateTeamLocation = (teamId: string, coords: GPSCoordinate) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, currentLocation: coords } : t))
    );

    // If active route matches, update progress
    if (activeRoute && activeRoute.teamId === teamId) {
      const remaining = calculateHaversineDistance(coords, activeRoute.destCoords);
      const progress = Math.min(
        100,
        Math.max(10, Math.round(((activeRoute.roadDistanceKm - remaining) / activeRoute.roadDistanceKm) * 100))
      );
      setActiveRoute({
        ...activeRoute,
        remainingDistanceKm: remaining,
        routeProgressPercent: progress,
        currentTeamPosition: coords,
        lastGpsUpdate: new Date().toISOString()
      });
    }
  };

  // Escalate to Police
  const escalateToPolice = (incidentId: string, reason: string, remarks?: string): PoliceEscalation => {
    const inc = incidents.find((i) => i.id === incidentId);
    const now = new Date().toISOString();
    const newEscId = `ESC-2026-${(policeEscalations.length + 1).toString().padStart(3, '0')}`;

    const escalation: PoliceEscalation = {
      id: newEscId,
      incidentId,
      citizenId: inc?.citizenId || 'CIT-UNKNOWN',
      citizenName: inc?.citizenName || 'Unverified Citizen',
      citizenPhone: inc?.citizenPhone || '+91 00000 00000',
      reportDetails: inc?.description || '',
      suspiciousIndicators: inc?.suspiciousReasons || [reason],
      riskScore: inc?.suspiciousScore || 75,
      evidenceNotes: remarks || 'Forwarded by emergency management command for formal verification.',
      gpsLocation: inc ? `${inc.coordinates.lat.toFixed(4)}, ${inc.coordinates.lng.toFixed(4)}` : '',
      reportedAt: inc?.createdAt || now,
      escalatedAt: now,
      escalatedBy: 'Administrator Command Triage',
      escalationReason: reason,
      investigationStatus: 'New Escalation',
      auditTrail: [
        {
          timestamp: now,
          officer: 'Administrator Command',
          action: 'Escalated to Police Authority',
          notes: reason
        }
      ]
    };

    setPoliceEscalations((prev) => [escalation, ...prev]);

    // Mark incident status
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              suspiciousStatus: 'Escalated to Police',
              updatedAt: now,
              timeline: [
                ...i.timeline,
                {
                  id: `tl-${Date.now()}`,
                  timestamp: now,
                  status: i.status,
                  actor: 'Command Desk',
                  note: `Case escalated to Police Authority (Ref: ${newEscId}). Reason: ${reason}`
                }
              ]
            }
          : i
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        timestamp: now,
        title: 'Case Escalated to Police',
        message: `${incidentId} forwarded under ${newEscId}.`,
        type: 'POLICE',
        incidentId,
        read: false
      },
      ...prev
    ]);

    return escalation;
  };

  // Police updates investigation outcome and action taken
  const updatePoliceInvestigation = (
    escalationId: string,
    status: PoliceInvestigationStatus,
    actionTaken?: string,
    remarks?: string
  ) => {
    const now = new Date().toISOString();

    setPoliceEscalations((prev) =>
      prev.map((esc) => {
        if (esc.id !== escalationId) return esc;
        return {
          ...esc,
          investigationStatus: status,
          actionTaken: actionTaken || esc.actionTaken,
          policeRemarks: remarks || esc.policeRemarks,
          auditTrail: [
            ...esc.auditTrail,
            {
              timestamp: now,
              officer: 'Inspector R. Selvan',
              action: `Status: ${status}`,
              notes: actionTaken || remarks || 'Investigation updated.'
            }
          ]
        };
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetDemoData = () => {
    setIncidents(SEED_INCIDENTS);
    setTeams(SEED_RESPONSE_TEAMS);
    setCitizenProfile(SEED_CITIZEN_PROFILE);
    setPoliceEscalations(SEED_POLICE_ESCALATIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setActiveTeamId('TEAM-MED-01');
    localStorage.clear();
  };

  // Calculated stats
  const stats = useMemo(() => {
    const totalIncidents = incidents.length;
    let criticalIncidents = 0;
    let highIncidents = 0;
    let inProgressIncidents = 0;
    let resolvedIncidents = 0;
    let suspiciousCount = 0;

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    incidents.forEach((inc) => {
      if (inc.priority === 'CRITICAL') criticalIncidents++;
      if (inc.priority === 'HIGH') highIncidents++;
      if (inc.status === 'In Progress') inProgressIncidents++;
      if (inc.status === 'Resolved') resolvedIncidents++;
      if (inc.suspiciousStatus === 'Suspicious' || inc.suspiciousStatus === 'Escalated to Police') {
        suspiciousCount++;
      }

      byCategory[inc.category] = (byCategory[inc.category] || 0) + 1;
      byPriority[inc.priority] = (byPriority[inc.priority] || 0) + 1;
    });

    const availableTeamsCount = teams.filter((t) => t.availability === 'Available').length;
    const busyTeamsCount = teams.filter((t) => t.availability === 'Busy' || t.availability === 'Assigned').length;

    return {
      totalIncidents,
      criticalIncidents,
      highIncidents,
      inProgressIncidents,
      resolvedIncidents,
      availableTeamsCount,
      busyTeamsCount,
      suspiciousCount,
      policeEscalationsCount: policeEscalations.length,
      avgResponseMinutes: 8.4,
      byCategory,
      byPriority
    };
  }, [incidents, teams, policeEscalations]);

  return (
    <ResQNetContext.Provider
      value={{
        role,
        setRole,
        activeNavTab,
        setActiveNavTab,
        citizenProfile,
        updateCitizenProfile,
        activeTeamId,
        setActiveTeamId,
        currentActiveTeam,
        incidents,
        teams,
        policeEscalations,
        notifications,
        activeRoute,
        setActiveRoute,
        submitEmergencyReport,
        assignTeamToIncident,
        acceptAssignment,
        updateIncidentStatus,
        overrideIncidentPriority,
        updateTeamAvailability,
        updateTeamLocation,
        escalateToPolice,
        updatePoliceInvestigation,
        markNotificationRead,
        clearAllNotifications,
        resetDemoData,
        stats
      }}
    >
      {children}
    </ResQNetContext.Provider>
  );
};

export const useResQNet = () => {
  const context = useContext(ResQNetContext);
  if (!context) {
    throw new Error('useResQNet must be used within a ResQNetProvider');
  }
  return context;
};
