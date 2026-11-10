import {
  EmergencyCategory,
  GPSCoordinate,
  PriorityLevel,
  ResponseTeam,
  SuspiciousClassification
} from '../types/resqnet';

/**
 * Calculate geographical distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  coord1: GPSCoordinate,
  coord2: GPSCoordinate
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Category compatibility check between Incident and Response Team
 */
export function isCategoryCompatible(
  incidentCategory: EmergencyCategory,
  teamCategory: EmergencyCategory
): boolean {
  if (incidentCategory === teamCategory) return true;
  // Specialized emergency cross-compatibility
  if (teamCategory === 'Disaster Management' || teamCategory === 'Specialized Rescue' || teamCategory === 'Search and Rescue') {
    return true;
  }
  if (incidentCategory === 'Building Collapse' && teamCategory === 'Fire and Rescue') {
    return true;
  }
  if (incidentCategory === 'Road Accident' && (teamCategory === 'Medical Emergency' || teamCategory === 'Police Assistance')) {
    return true;
  }
  if (incidentCategory === 'Crime or Police Assistance' && teamCategory === 'Police Assistance') {
    return true;
  }
  return false;
}

/**
 * Intelligent nearest-team recommendation engine
 */
export interface TeamRecommendation {
  team: ResponseTeam;
  distanceKm: number;
  estimatedMinutes: number;
  compatibilityScore: number;
  matchReason: string;
}

export function recommendNearestTeams(
  incidentCoords: GPSCoordinate,
  incidentCategory: EmergencyCategory,
  allTeams: ResponseTeam[]
): TeamRecommendation[] {
  const recommendations: TeamRecommendation[] = allTeams.map((team) => {
    const distanceKm = calculateHaversineDistance(team.currentLocation, incidentCoords);
    // Estimated travel time: assumes average emergency response speed of 42 km/h plus 2 min prep
    const estimatedMinutes = Math.max(3, Math.round((distanceKm / 42) * 60 + 2));

    let compatibilityScore = 0;
    let matchReason = '';

    const directCategoryMatch = team.category === incidentCategory;
    const compatible = isCategoryCompatible(incidentCategory, team.category);

    if (directCategoryMatch) {
      compatibilityScore += 50;
      matchReason += 'Direct category specialty match. ';
    } else if (compatible) {
      compatibilityScore += 30;
      matchReason += 'Cross-functional rescue capability. ';
    } else {
      compatibilityScore += 10;
      matchReason += 'Secondary auxiliary support. ';
    }

    if (team.availability === 'Available') {
      compatibilityScore += 40;
      matchReason += 'Stationed and immediately available.';
    } else if (team.availability === 'Assigned') {
      compatibilityScore += 15;
      matchReason += 'Assigned but near proximity.';
    } else if (team.availability === 'Busy') {
      compatibilityScore += 5;
      matchReason += 'Currently active on incident.';
    } else {
      compatibilityScore -= 30;
      matchReason += 'Unavailable / Offline.';
    }

    // Distance weighting: closer is higher
    const distancePenalty = Math.min(35, distanceKm * 2);
    compatibilityScore -= distancePenalty;

    return {
      team,
      distanceKm,
      estimatedMinutes,
      compatibilityScore: Math.round(compatibilityScore),
      matchReason
    };
  });

  // Sort by compatibility score descending, then distance ascending
  return recommendations.sort((a, b) => {
    if (a.team.availability === 'Available' && b.team.availability !== 'Available') return -1;
    if (b.team.availability === 'Available' && a.team.availability !== 'Available') return 1;
    return a.distanceKm - b.distanceKm;
  });
}

/**
 * Realistic road route simulation waypoints generator
 * Simulates city road grid navigation between two points
 */
export function generateRoadWaypoints(
  start: GPSCoordinate,
  end: GPSCoordinate
): [number, number][] {
  const points: [number, number][] = [[start.lat, start.lng]];
  const steps = 7;
  const dLat = (end.lat - start.lat) / steps;
  const dLng = (end.lng - start.lng) / steps;

  // Add slight urban street curve offsets
  for (let i = 1; i < steps; i++) {
    const jitterLat = Math.sin(i * 1.3) * 0.0018;
    const jitterLng = Math.cos(i * 1.5) * 0.0022;
    points.push([
      start.lat + dLat * i + jitterLat,
      start.lng + dLng * i + jitterLng
    ]);
  }

  points.push([end.lat, end.lng]);
  return points;
}

/**
 * Intelligent Incident Prioritization Engine
 */
export function calculateIncidentPriority(
  category: EmergencyCategory,
  description: string,
  peopleAffected: number,
  vulnerablePersonsReported: boolean = false
): { priority: PriorityLevel; reason: string } {
  const text = description.toLowerCase();

  const criticalKeywords = [
    'trapped',
    'unconscious',
    'not breathing',
    'cardiac arrest',
    'collapsed building',
    'explosion',
    'massive fire',
    'drowning',
    'chest wound',
    'multiple crushed'
  ];

  const highKeywords = [
    'active fire',
    'bleeding',
    'head trauma',
    'highway crash',
    'flash flood',
    'gas leak',
    'electrical spark',
    'severe fracture',
    'armed'
  ];

  const hasCriticalKeyword = criticalKeywords.some((k) => text.includes(k));
  const hasHighKeyword = highKeywords.some((k) => text.includes(k));

  // 1. CRITICAL
  if (
    category === 'Building Collapse' ||
    peopleAffected >= 10 ||
    hasCriticalKeyword ||
    (vulnerablePersonsReported && peopleAffected >= 4)
  ) {
    let reason = 'Direct life-safety threat: ';
    if (category === 'Building Collapse') reason += 'Structural collapse in progress; ';
    if (peopleAffected >= 10) reason += `Mass casualty threshold (${peopleAffected} affected); `;
    if (hasCriticalKeyword) reason += 'Trapped/unconscious indicators detected; ';
    if (vulnerablePersonsReported) reason += 'Vulnerable persons involved.';
    return { priority: 'CRITICAL', reason: reason.trim() };
  }

  // 2. HIGH
  if (
    category === 'Fire' ||
    category === 'Road Accident' ||
    peopleAffected >= 5 ||
    hasHighKeyword ||
    vulnerablePersonsReported
  ) {
    let reason = 'High urgency active emergency: ';
    if (category === 'Fire') reason += 'Fire suppression required; ';
    if (category === 'Road Accident') reason += 'Vehicular collision rescue needed; ';
    if (peopleAffected >= 5) reason += `${peopleAffected} people impacted; `;
    if (hasHighKeyword) reason += 'Severe injury indicators present; ';
    if (vulnerablePersonsReported) reason += 'Assistance requested for vulnerable individuals.';
    return { priority: 'HIGH', reason: reason.trim() };
  }

  // 3. MEDIUM
  if (peopleAffected >= 1 || category === 'Flood' || category === 'Medical Emergency') {
    return {
      priority: 'MEDIUM',
      reason: `Moderate emergency: ${peopleAffected} person(s) affected requiring dispatched care.`
    };
  }

  // 4. LOW
  return {
    priority: 'LOW',
    reason: 'Property concern or precautionary reporting with 0 immediate casualties reported.'
  };
}

/**
 * Suspicious and False Emergency Report Detection Engine
 */
export function analyzeSuspiciousReport(
  citizenPhone: string,
  description: string,
  coords: GPSCoordinate,
  existingReports: { citizenPhone: string; description: string; coords: GPSCoordinate; createdAt: string }[]
): { score: number; classification: SuspiciousClassification; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const now = Date.now();

  // 1. Check reports from same phone within last 2 hours
  const recentFromSameUser = existingReports.filter(
    (r) =>
      r.citizenPhone === citizenPhone &&
      now - new Date(r.createdAt).getTime() < 2 * 60 * 60 * 1000
  );

  if (recentFromSameUser.length >= 3) {
    score += 45;
    reasons.push(`High submission frequency: ${recentFromSameUser.length} reports logged from same mobile in past 2 hours.`);
  } else if (recentFromSameUser.length >= 2) {
    score += 20;
    reasons.push('Multiple recent reports from same contact identifier.');
  }

  // 2. Exact or near-duplicate description check
  const duplicateDesc = existingReports.some(
    (r) => r.description.trim().toLowerCase() === description.trim().toLowerCase()
  );
  if (duplicateDesc) {
    score += 35;
    reasons.push('Verbatim duplicate report text matches an existing active incident.');
  }

  // 3. Suspicious / prank keywords
  const text = description.toLowerCase();
  const testKeywords = ['prank', 'joke', 'just testing', 'fake', 'asdf', 'test123', 'haha', 'lmao'];
  if (testKeywords.some((k) => text.includes(k))) {
    score += 55;
    reasons.push('Test/prank vocabulary pattern detected in incident description.');
  }

  // 4. Inconsistent or extreme coordinates (outside Chennai / Tamil Nadu perimeter)
  if (coords.lat < 12.0 || coords.lat > 14.0 || coords.lng < 79.0 || coords.lng > 81.0) {
    score += 30;
    reasons.push('GPS coordinates outside authorized operational emergency district bounds.');
  }

  // Classification threshold
  let classification: SuspiciousClassification = 'Normal';
  if (score >= 70) {
    classification = 'Escalated to Police';
  } else if (score >= 40) {
    classification = 'Suspicious';
  } else if (score >= 20) {
    classification = 'Needs Verification';
  }

  return { score, classification, reasons };
}
