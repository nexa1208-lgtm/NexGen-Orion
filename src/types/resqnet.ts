export type UserRole = 'citizen' | 'admin' | 'team' | 'police';

export type EmergencyCategory =
  | 'Medical Emergency'
  | 'Road Accident'
  | 'Fire'
  | 'Fire and Rescue'
  | 'Flood'
  | 'Natural Disaster'
  | 'Building Collapse'
  | 'Missing Person'
  | 'Crime or Police Assistance'
  | 'Police Assistance'
  | 'Disaster Management'
  | 'Search and Rescue'
  | 'Specialized Rescue'
  | 'Other Emergency';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'Reported' | 'In Progress' | 'Resolved';

export type TeamAvailability =
  | 'Available'
  | 'Assigned'
  | 'Busy'
  | 'Temporarily Unavailable'
  | 'Offline';

export type CitizenStatus = 'Safe' | 'Need Assistance' | 'Emergency Active';

export type SuspiciousClassification =
  | 'Normal'
  | 'Needs Verification'
  | 'Suspicious'
  | 'Escalated to Police';

export type PoliceInvestigationStatus =
  | 'New Escalation'
  | 'Pending Verification'
  | 'Under Investigation'
  | 'Verified Genuine'
  | 'Confirmed False Report'
  | 'Action Taken'
  | 'Closed';

export interface GPSCoordinate {
  lat: number;
  lng: number;
  address?: string;
  timestamp?: string;
}

export interface IncidentPriorityAudit {
  id: string;
  timestamp: string;
  previousPriority: PriorityLevel;
  newPriority: PriorityLevel;
  actor: string;
  reason: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: EmergencyCategory;
  location: string;
  coordinates: GPSCoordinate;
  peopleAffected: number;
  priority: PriorityLevel;
  calculatedPriority: PriorityLevel;
  priorityReason: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  
  // Citizen Reporter Info
  citizenName: string;
  citizenPhone: string;
  citizenId: string;
  emergencyContact?: string;
  evidencePhotoUrl?: string;
  vulnerablePersonsReported?: boolean;

  // Assignment info
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedAt?: string;

  // Suspicious report evaluation
  suspiciousScore: number; // 0 - 100
  suspiciousStatus: SuspiciousClassification;
  suspiciousReasons: string[];
  isFlaggedByTeam?: boolean;
  aiExplanation?: string;

  // History & Audits
  priorityAudits: IncidentPriorityAudit[];
  timeline: {
    id: string;
    timestamp: string;
    status: IncidentStatus;
    actor: string;
    note: string;
  }[];
}

export interface ResponseTeam {
  id: string; // e.g. "TEAM-MED-01"
  name: string;
  leaderName: string;
  leaderPhone: string;
  contactNumber: string;
  category: EmergencyCategory;
  currentLocation: GPSCoordinate;
  availability: TeamAvailability;
  assignedIncidentId?: string;
  memberCount: number;
  vehicleNumber: string;
  baseStation: string;
  assignmentHistory: {
    incidentId: string;
    assignedAt: string;
    resolvedAt?: string;
    status: string;
  }[];
}

export interface PoliceEscalation {
  id: string; // e.g. "ESC-2026-001"
  incidentId: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  reportDetails: string;
  suspiciousIndicators: string[];
  riskScore: number;
  evidenceNotes: string;
  gpsLocation: string;
  reportedAt: string;
  escalatedAt: string;
  escalatedBy: string;
  escalationReason: string;
  investigationStatus: PoliceInvestigationStatus;
  policeRemarks?: string;
  actionTaken?: string;
  investigatingOfficer?: string;
  auditTrail: {
    timestamp: string;
    officer: string;
    action: string;
    notes: string;
  }[];
}

export interface CitizenProfile {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  isIdentityVerified: boolean;
  biometricAuthEnabled: boolean;
  locationPermissionGranted: boolean;
  availabilityStatus: CitizenStatus;
  profilePhotoUrl?: string;
  currentLocation?: GPSCoordinate;
  lastLocationUpdate?: string;
}

export interface ResQNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'HIGH' | 'ASSIGNMENT' | 'STATUS' | 'POLICE' | 'SYSTEM';
  incidentId?: string;
  read: boolean;
}

export interface RouteDetail {
  incidentId: string;
  teamId: string;
  startingPoint: string;
  destination: string;
  startCoords: GPSCoordinate;
  destCoords: GPSCoordinate;
  roadDistanceKm: number;
  remainingDistanceKm: number;
  estimatedArrivalMinutes: number;
  routeProgressPercent: number;
  waypoints: [number, number][];
  currentTeamPosition: GPSCoordinate;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED';
  lastGpsUpdate: string;
}
