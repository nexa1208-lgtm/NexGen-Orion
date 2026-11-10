import {
  CitizenProfile,
  Incident,
  PoliceEscalation,
  ResponseTeam,
  ResQNotification
} from '../types/resqnet';

export const SEED_CITIZEN_PROFILE: CitizenProfile = {
  id: 'CIT-2026-8812',
  fullName: 'Priya Sharma',
  mobileNumber: '+91 98401 22849',
  email: 'priya.sharma@sairamtap.edu.in',
  emergencyContactName: 'K. Ramesh (Father)',
  emergencyContactPhone: '+91 94440 91823',
  isIdentityVerified: true,
  biometricAuthEnabled: true,
  locationPermissionGranted: true,
  availabilityStatus: 'Emergency Active',
  profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  currentLocation: {
    lat: 12.8465,
    lng: 80.0617,
    address: 'Guduvancheri Bus Stand Junction, NH-45, Chengalpattu Dist'
  },
  lastLocationUpdate: new Date().toISOString()
};

export const SEED_RESPONSE_TEAMS: ResponseTeam[] = [
  {
    id: 'TEAM-MED-01',
    name: 'Apollo Rapid EMS Unit 1',
    leaderName: 'Dr. A. Vasanth',
    leaderPhone: '+91 98840 11029',
    contactNumber: '+91 44 2829 0200',
    category: 'Medical Emergency',
    currentLocation: { lat: 12.8421, lng: 80.0578, address: 'SRM Hospital Road, Potheri Base' },
    availability: 'Assigned',
    assignedIncidentId: 'INC-2026-0003',
    memberCount: 4,
    vehicleNumber: 'TN-01-G-4412 (ALS Ambulance)',
    baseStation: 'Potheri Medical Emergency Hub',
    assignmentHistory: [
      { incidentId: 'INC-2026-0003', assignedAt: '2026-11-10T08:15:00.000Z', status: 'In Progress' }
    ]
  },
  {
    id: 'TEAM-FIRE-04',
    name: 'Tambaram Fire & Heavy Rescue Squad',
    leaderName: 'Station Officer S. Balan',
    leaderPhone: '+91 94441 55032',
    contactNumber: '+91 44 2226 0101',
    category: 'Fire and Rescue',
    currentLocation: { lat: 12.9265, lng: 80.1211, address: 'Tambaram Fire Station, GST Road' },
    availability: 'Busy',
    assignedIncidentId: 'INC-2026-0002',
    memberCount: 8,
    vehicleNumber: 'TN-22-F-1004 (Water Bowser 5000L)',
    baseStation: 'Tambaram Division Fire Command',
    assignmentHistory: [
      { incidentId: 'INC-2026-0002', assignedAt: '2026-11-10T07:45:00.000Z', status: 'In Progress' }
    ]
  },
  {
    id: 'TEAM-ACC-02',
    name: 'NHAI Highway Patrol & Extrication Unit',
    leaderName: 'Sub-Inspector M. Dinesh',
    leaderPhone: '+91 98404 88310',
    contactNumber: '+91 44 2841 0103',
    category: 'Road Accident',
    currentLocation: { lat: 12.8711, lng: 80.1034, address: 'Vandalur Flyover Toll Post' },
    availability: 'Available',
    memberCount: 5,
    vehicleNumber: 'TN-09-P-2026 (Rescue Rig with Hydraulic Spreaders)',
    baseStation: 'Vandalur Outer Ring Patrol Depot',
    assignmentHistory: []
  },
  {
    id: 'TEAM-POL-03',
    name: 'Guduvancheri Police Interceptor QRT',
    leaderName: 'Inspector K. Ramanathan',
    leaderPhone: '+91 94440 99120',
    contactNumber: '+91 44 2746 5100',
    category: 'Police Assistance',
    currentLocation: { lat: 12.8495, lng: 80.0652, address: 'NH-45 Police Checkpost, Guduvancheri' },
    availability: 'Available',
    memberCount: 4,
    vehicleNumber: 'TN-21-G-7703 (Intercept Sedan)',
    baseStation: 'Guduvancheri Law & Order Station',
    assignmentHistory: []
  },
  {
    id: 'TEAM-DIS-01',
    name: 'TN-SDRF Flood Inundation Taskforce',
    leaderName: 'Commander Rajesh Narayanan',
    leaderPhone: '+91 97900 44102',
    contactNumber: '+91 44 2855 1077',
    category: 'Disaster Management',
    currentLocation: { lat: 12.9152, lng: 80.0984, address: 'Mudichur Lake Sluice Point' },
    availability: 'Available',
    memberCount: 12,
    vehicleNumber: 'TN-02-D-9901 (Inflatable Gemini Boats + 4x4)',
    baseStation: 'Mudichur Flood Defense Outpost',
    assignmentHistory: []
  },
  {
    id: 'TEAM-SAR-01',
    name: 'Chengalpattu Urban Search & Structural Rescue',
    leaderName: 'Capt. C. Arumugam',
    leaderPhone: '+91 98412 77011',
    contactNumber: '+91 44 2742 0108',
    category: 'Building Collapse',
    currentLocation: { lat: 12.9324, lng: 80.1256, address: 'Sanatorium Heavy Equipment Depot' },
    availability: 'Busy',
    assignedIncidentId: 'INC-2026-0001',
    memberCount: 10,
    vehicleNumber: 'TN-19-R-5544 (Heavy Crane & Sonic Detectors)',
    baseStation: 'Tambaram Sanatorium Disaster Wing',
    assignmentHistory: [
      { incidentId: 'INC-2026-0001', assignedAt: '2026-11-10T06:30:00.000Z', status: 'In Progress' }
    ]
  },
  {
    id: 'TEAM-MED-02',
    name: 'Chengalpattu Govt Trauma Support Unit',
    leaderName: 'Dr. Meena Swaminathan',
    leaderPhone: '+91 94443 22108',
    contactNumber: '+91 44 2742 2222',
    category: 'Medical Emergency',
    currentLocation: { lat: 12.6922, lng: 79.9754, address: 'Chengalpattu Medical College Campus' },
    availability: 'Available',
    memberCount: 3,
    vehicleNumber: 'TN-19-G-1108 (Basic Life Support Van)',
    baseStation: 'Chengalpattu General Hospital',
    assignmentHistory: []
  },
  {
    id: 'TEAM-SPEC-01',
    name: 'Industrial HAZMAT Chemical Hazard Response',
    leaderName: 'Engineer Selva Murugan',
    leaderPhone: '+91 98402 33490',
    contactNumber: '+91 44 2745 2888',
    category: 'Other Emergency',
    currentLocation: { lat: 12.7938, lng: 80.0245, address: 'SIPCOT Industrial Park Phase 2, Maraimalai Nagar' },
    availability: 'Temporarily Unavailable',
    memberCount: 6,
    vehicleNumber: 'TN-11-H-8001 (Chemical Neutralizer Rig)',
    baseStation: 'Maraimalai Nagar Industrial Fire Command',
    assignmentHistory: []
  }
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-0001',
    title: 'Commercial Complex Roof Collapse during Heavy Rainfall',
    description: 'Third floor roof slab collapsed over ground-floor shops during welding work and heavy rain. Multiple workers trapped under structural concrete debris.',
    category: 'Building Collapse',
    location: 'GST Road near Tambaram Sanatorium Railway Station, Tambaram',
    coordinates: { lat: 12.9324, lng: 80.1256, address: 'GST Road, Tambaram Sanatorium' },
    peopleAffected: 14,
    priority: 'CRITICAL',
    calculatedPriority: 'CRITICAL',
    priorityReason: 'Direct life-safety threat: Structural collapse in progress; Mass casualty threshold (14 affected); Trapped/unconscious indicators detected.',
    status: 'In Progress',
    createdAt: '2026-11-10T06:15:00.000Z',
    updatedAt: '2026-11-10T07:20:00.000Z',
    citizenName: 'Rajesh Sundaram (Shop Owner)',
    citizenPhone: '+91 98400 11920',
    citizenId: 'CIT-2026-1002',
    emergencyContact: 'Kavitha R (+91 98400 11921)',
    assignedTeamId: 'TEAM-SAR-01',
    assignedTeamName: 'Chengalpattu Urban Search & Structural Rescue',
    assignedAt: '2026-11-10T06:30:00.000Z',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2026-11-10T06:15:00.000Z',
        status: 'Reported',
        actor: 'Citizen App',
        note: 'High-severity structural collapse distress submitted with GPS location.'
      },
      {
        id: 'tl-2',
        timestamp: '2026-11-10T06:30:00.000Z',
        status: 'In Progress',
        actor: 'Chief Dispatcher S. Kumar',
        note: 'Team SAR-01 dispatched with sonic detectors and concrete cutters.'
      }
    ]
  },
  {
    id: 'INC-2026-0002',
    title: 'Chemical Solvent Warehouse Active Blaze & Toxic Fumes',
    description: 'Thick dark smoke and active chemical blaze originating from solvent storage shed. Flames spreading towards adjacent packaging warehouse.',
    category: 'Fire',
    location: 'SIPCOT Industrial Park Phase 2, Maraimalai Nagar',
    coordinates: { lat: 12.7938, lng: 80.0245, address: 'SIPCOT Phase 2, Maraimalai Nagar' },
    peopleAffected: 7,
    priority: 'HIGH',
    calculatedPriority: 'HIGH',
    priorityReason: 'High urgency active emergency: Fire suppression required; 7 people impacted; Severe injury indicators present.',
    status: 'In Progress',
    createdAt: '2026-11-10T07:10:00.000Z',
    updatedAt: '2026-11-10T07:55:00.000Z',
    citizenName: 'Security Desk Officer Selvam',
    citizenPhone: '+91 94440 88201',
    citizenId: 'CIT-2026-1044',
    assignedTeamId: 'TEAM-FIRE-04',
    assignedTeamName: 'Tambaram Fire & Heavy Rescue Squad',
    assignedAt: '2026-11-10T07:45:00.000Z',
    suspiciousScore: 5,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-3',
        timestamp: '2026-11-10T07:10:00.000Z',
        status: 'Reported',
        actor: 'Citizen Portal',
        note: 'Industrial fire alarm verified by plant supervisor.'
      },
      {
        id: 'tl-4',
        timestamp: '2026-11-10T07:45:00.000Z',
        status: 'In Progress',
        actor: 'Admin Dispatcher',
        note: 'Foam tenders en route. Surrounding workers evacuated.'
      }
    ]
  },
  {
    id: 'INC-2026-0003',
    title: 'Multi-Vehicle Highway Collision with Overturned Minibus',
    description: 'Private transport bus overturned after collision with container truck on NH-45 flyover descent. Multiple passengers unconscious and pinned in seats.',
    category: 'Road Accident',
    location: 'NH-45 Flyover Junction near Guduvancheri Bus Stand',
    coordinates: { lat: 12.8465, lng: 80.0617, address: 'NH-45 Guduvancheri Flyover' },
    peopleAffected: 18,
    priority: 'CRITICAL',
    calculatedPriority: 'CRITICAL',
    priorityReason: 'Direct life-safety threat: Mass casualty threshold (18 affected); Trapped/unconscious indicators detected.',
    status: 'In Progress',
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-10T08:20:00.000Z',
    citizenName: 'Priya Sharma (Eyewitness)',
    citizenPhone: '+91 98401 22849',
    citizenId: 'CIT-2026-8812',
    emergencyContact: 'K. Ramesh (+91 94440 91823)',
    assignedTeamId: 'TEAM-MED-01',
    assignedTeamName: 'Apollo Rapid EMS Unit 1',
    assignedAt: '2026-11-10T08:15:00.000Z',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-5',
        timestamp: '2026-11-10T08:00:00.000Z',
        status: 'Reported',
        actor: 'Citizen Priya Sharma',
        note: 'Distress broadcast sent with verified live GPS coordinates.'
      },
      {
        id: 'tl-6',
        timestamp: '2026-11-10T08:15:00.000Z',
        status: 'In Progress',
        actor: 'Dispatcher S. Kumar',
        note: 'Apollo Rapid EMS Unit 1 accepted assignment. Green corridor opened.'
      }
    ]
  },
  {
    id: 'INC-2026-0004',
    title: 'Surplus Canal Breached with Flash Waterlogging in Mudichur Ward',
    description: 'Adyar river feeder canal overflowed into residential ground floors. 25 elderly and children stranded with 4 feet standing water.',
    category: 'Flood',
    location: 'Krishna Nagar 4th Main Road, Mudichur near Tambaram West',
    coordinates: { lat: 12.9152, lng: 80.0984, address: 'Krishna Nagar, Mudichur' },
    peopleAffected: 25,
    priority: 'CRITICAL',
    calculatedPriority: 'CRITICAL',
    priorityReason: 'Direct life-safety threat: Mass casualty threshold (25 affected); Flash flood with vulnerable stranded residents.',
    status: 'Reported',
    createdAt: '2026-11-10T08:30:00.000Z',
    updatedAt: '2026-11-10T08:30:00.000Z',
    citizenName: 'Welfare Association President Mohan',
    citizenPhone: '+91 97900 12890',
    citizenId: 'CIT-2026-1088',
    vulnerablePersonsReported: true,
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-7',
        timestamp: '2026-11-10T08:30:00.000Z',
        status: 'Reported',
        actor: 'Citizen Mohan',
        note: 'Urgent boat evacuation requested for flooded ground floors.'
      }
    ]
  },
  {
    id: 'INC-2026-0005',
    title: 'Elderly Male Cardiac Arrest at Community Gathering',
    description: '68-year-old male collapsed, unresponsive, no palpable pulse. Immediate bystander CPR initiated; automated external defibrillator needed.',
    category: 'Medical Emergency',
    location: 'Community Hall, Padappai Main Road near Tambaram',
    coordinates: { lat: 12.8794, lng: 80.0211, address: 'Community Hall, Padappai' },
    peopleAffected: 1,
    priority: 'CRITICAL',
    calculatedPriority: 'CRITICAL',
    priorityReason: 'Direct life-safety threat: Trapped/unconscious indicators detected: cardiac arrest.',
    status: 'Reported',
    createdAt: '2026-11-10T08:45:00.000Z',
    updatedAt: '2026-11-10T08:45:00.000Z',
    citizenName: 'Dr. Kavitha (Volunteer Medic)',
    citizenPhone: '+91 94441 78912',
    citizenId: 'CIT-2026-1110',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-8',
        timestamp: '2026-11-10T08:45:00.000Z',
        status: 'Reported',
        actor: 'Volunteer Medic',
        note: 'Code Blue cardiac arrest reported. Defibrillator requested immediately.'
      }
    ]
  },
  {
    id: 'INC-2026-0006',
    title: 'Repeated Prank Fire Alert with Fabricated Coordinates',
    description: 'Fake fire reported at empty construction lot with claims of nuclear explosion. Repeated 4 times from newly created unverified account.',
    category: 'Fire',
    location: 'Uninhabited plot behind Chengalpattu Railway Yard',
    coordinates: { lat: 12.6850, lng: 79.9650, address: 'Plot 4, Rail Yard Outer' },
    peopleAffected: 0,
    priority: 'LOW',
    calculatedPriority: 'LOW',
    priorityReason: 'Property concern or precautionary reporting with 0 immediate casualties reported.',
    status: 'Reported',
    createdAt: '2026-11-10T07:00:00.000Z',
    updatedAt: '2026-11-10T07:05:00.000Z',
    citizenName: 'Unknown Caller (Anonymous)',
    citizenPhone: '+91 99999 00000',
    citizenId: 'CIT-2026-FAKE01',
    suspiciousScore: 85,
    suspiciousStatus: 'Escalated to Police',
    suspiciousReasons: [
      'High submission frequency: 4 reports logged from same mobile in past 2 hours.',
      'Test/prank vocabulary pattern detected in incident description.',
      'Contradictory explosion claims refuted by nearby railway station police.'
    ],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-9',
        timestamp: '2026-11-10T07:00:00.000Z',
        status: 'Reported',
        actor: 'Automated Fraud Engine',
        note: 'Flagged as high-risk malicious transmission. Escalated to Police Cyber Cell.'
      }
    ]
  },
  {
    id: 'INC-2026-0007',
    title: 'Two-Wheeler Highway Skid on Diesel Slick',
    description: 'Motorcycle lost traction on fuel spill. Rider sustained minor arm abrasions and wrist sprain. Vehicles moved to shoulder.',
    category: 'Road Accident',
    location: 'Guduvancheri Roundabout, NH-45',
    coordinates: { lat: 12.8398, lng: 80.0712, address: 'NH-45 Roundabout, Guduvancheri' },
    peopleAffected: 1,
    priority: 'MEDIUM',
    calculatedPriority: 'MEDIUM',
    priorityReason: 'Moderate emergency: 1 person(s) affected requiring dispatched care.',
    status: 'Resolved',
    createdAt: '2026-11-10T05:30:00.000Z',
    updatedAt: '2026-11-10T06:45:00.000Z',
    resolvedAt: '2026-11-10T06:45:00.000Z',
    citizenName: 'Traffic Patrol Officer Anand',
    citizenPhone: '+91 98404 99182',
    citizenId: 'CIT-2026-0982',
    assignedTeamId: 'TEAM-ACC-02',
    assignedTeamName: 'NHAI Highway Patrol & Extrication Unit',
    assignedAt: '2026-11-10T05:40:00.000Z',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-10',
        timestamp: '2026-11-10T05:30:00.000Z',
        status: 'Reported',
        actor: 'Patrol Anand',
        note: 'Minor skid reported.'
      },
      {
        id: 'tl-11',
        timestamp: '2026-11-10T06:45:00.000Z',
        status: 'Resolved',
        actor: 'NHAI Highway Patrol',
        note: 'Diesel spill sanded, rider provided first aid and released.'
      }
    ]
  },
  {
    id: 'INC-2026-0008',
    title: 'High-Voltage Cable Snapped & Dangling across Pedestrian Walkway',
    description: '11kV overhead electrical wire severed by fallen tree branch, sparking intermittently on wet pavement outside primary school gate.',
    category: 'Other Emergency',
    location: 'Near Vandalur Zoo East Gate Road, Vandalur',
    coordinates: { lat: 12.8885, lng: 80.0823, address: 'Zoo East Gate Road, Vandalur' },
    peopleAffected: 0,
    priority: 'HIGH',
    calculatedPriority: 'HIGH',
    priorityReason: 'High urgency active emergency: Severe hazard indicators present: electrical spark near public school.',
    status: 'Reported',
    createdAt: '2026-11-10T08:50:00.000Z',
    updatedAt: '2026-11-10T08:50:00.000Z',
    citizenName: 'School Headmaster S. Narayanan',
    citizenPhone: '+91 98412 11984',
    citizenId: 'CIT-2026-1140',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-12',
        timestamp: '2026-11-10T08:50:00.000Z',
        status: 'Reported',
        actor: 'Headmaster S. Narayanan',
        note: 'Urgent electricity board power cutoff requested.'
      }
    ]
  },
  {
    id: 'INC-2026-0009',
    title: 'Missing Elderly Alzheimer Patient from Residential Colony',
    description: '74-year-old male wearing blue shirt and white veshti walked away from home at 6 AM. Disoriented and lacks phone or identification.',
    category: 'Missing Person',
    location: 'Radha Nagar 2nd Street, Chromepet',
    coordinates: { lat: 12.9511, lng: 80.1389, address: 'Radha Nagar, Chromepet' },
    peopleAffected: 1,
    priority: 'MEDIUM',
    calculatedPriority: 'MEDIUM',
    priorityReason: 'Moderate emergency: 1 person(s) affected requiring dispatched care.',
    status: 'Reported',
    createdAt: '2026-11-10T07:50:00.000Z',
    updatedAt: '2026-11-10T07:50:00.000Z',
    citizenName: 'Geetha R (Daughter)',
    citizenPhone: '+91 98405 22091',
    citizenId: 'CIT-2026-1122',
    vulnerablePersonsReported: true,
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-13',
        timestamp: '2026-11-10T07:50:00.000Z',
        status: 'Reported',
        actor: 'Citizen Geetha R',
        note: 'Missing person bulletin registered with police alert broadcast.'
      }
    ]
  },
  {
    id: 'INC-2026-0010',
    title: 'Attempted Armed Robbery at Commercial Jewellery Vault',
    description: 'Alarm triggered; two armed individuals entered commercial complex. Security guards cordoned the entrance from outside.',
    category: 'Crime or Police Assistance',
    location: 'Grand Southern Trunk Road, Chromepet Commercial Center',
    coordinates: { lat: 12.9517, lng: 80.1412, address: 'GST Road, Chromepet' },
    peopleAffected: 3,
    priority: 'HIGH',
    calculatedPriority: 'HIGH',
    priorityReason: 'High urgency active emergency: Severe hazard indicators present: armed.',
    status: 'Reported',
    createdAt: '2026-11-10T08:52:00.000Z',
    updatedAt: '2026-11-10T08:52:00.000Z',
    citizenName: 'Mall Security Controller Vignesh',
    citizenPhone: '+91 91760 33412',
    citizenId: 'CIT-2026-1152',
    suspiciousScore: 0,
    suspiciousStatus: 'Normal',
    suspiciousReasons: [],
    priorityAudits: [],
    timeline: [
      {
        id: 'tl-14',
        timestamp: '2026-11-10T08:52:00.000Z',
        status: 'Reported',
        actor: 'Security Controller',
        note: 'Police QRT armed backup requested urgently.'
      }
    ]
  }
];

export const SEED_POLICE_ESCALATIONS: PoliceEscalation[] = [
  {
    id: 'ESC-2026-001',
    incidentId: 'INC-2026-0006',
    citizenId: 'CIT-2026-FAKE01',
    citizenName: 'Unknown Caller (Anonymous)',
    citizenPhone: '+91 99999 00000',
    reportDetails: 'Repeated fabricated reports of radioactive explosion at Chengalpattu Rail Yard.',
    suspiciousIndicators: [
      'High submission frequency: 4 reports within 45 minutes',
      'Test/prank vocabulary pattern detected in incident description',
      'Location verified empty by local railway beat patrol'
    ],
    riskScore: 85,
    evidenceNotes: 'IP address originating from VPN exit node. SIM registered under fictitious name.',
    gpsLocation: '12.6850, 79.9650 (Chengalpattu Rail Yard Outer)',
    reportedAt: '2026-11-10T07:00:00.000Z',
    escalatedAt: '2026-11-10T07:15:00.000Z',
    escalatedBy: 'Admin Chief Dispatcher S. Kumar',
    escalationReason: 'Willful obstruction of public emergency dispatch channels under Section 66D IT Act.',
    investigationStatus: 'Under Investigation',
    investigatingOfficer: 'Inspector R. Selvan, Cyber & Triage Division',
    policeRemarks: 'CDRs requested from telecom service provider. IMEI tracking initiated.',
    auditTrail: [
      {
        timestamp: '2026-11-10T07:15:00.000Z',
        officer: 'Dispatcher S. Kumar',
        action: 'Case Escalated to Police Authority',
        notes: 'Automated algorithm score 85 exceeded threshold of 70.'
      },
      {
        timestamp: '2026-11-10T07:30:00.000Z',
        officer: 'Inspector R. Selvan',
        action: 'Investigation Opened',
        notes: 'Assigned to Cyber Crime Cell Chengalpattu District.'
      }
    ]
  }
];

export const SEED_NOTIFICATIONS: ResQNotification[] = [
  {
    id: 'notif-1',
    timestamp: '2026-11-10T08:45:00.000Z',
    title: 'CRITICAL Emergency Reported',
    message: 'Cardiac arrest logged at Padappai Community Hall. Zero-delay medical team dispatch required.',
    type: 'CRITICAL',
    incidentId: 'INC-2026-0005',
    read: false
  },
  {
    id: 'notif-2',
    timestamp: '2026-11-10T08:15:00.000Z',
    title: 'Team Dispatched to Highway Crash',
    message: 'Apollo Rapid EMS Unit 1 has accepted assignment for INC-2026-0003.',
    type: 'ASSIGNMENT',
    incidentId: 'INC-2026-0003',
    read: false
  },
  {
    id: 'notif-3',
    timestamp: '2026-11-10T07:15:00.000Z',
    title: 'Police Escalation Registered',
    message: 'Malicious report INC-2026-0006 forwarded to Cyber Police Division for investigation.',
    type: 'POLICE',
    incidentId: 'INC-2026-0006',
    read: true
  }
];
