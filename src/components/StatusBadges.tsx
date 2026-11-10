import React from 'react';
import {
  Flame,
  Car,
  HeartPulse,
  Waves,
  Building2,
  AlertOctagon,
  UserX,
  Shield,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  EmergencyCategory,
  IncidentStatus,
  PriorityLevel,
  TeamAvailability,
  SuspiciousClassification,
  CitizenStatus
} from '../types/resqnet';

export const getCategoryIcon = (category: EmergencyCategory, className = 'w-4 h-4') => {
  switch (category) {
    case 'Medical Emergency':
      return <HeartPulse className={`${className} text-[#E5484D]`} />;
    case 'Fire':
      return <Flame className={`${className} text-[#FF922E]`} />;
    case 'Road Accident':
      return <Car className={`${className} text-[#3986D8]`} />;
    case 'Flood':
    case 'Natural Disaster':
      return <Waves className={`${className} text-[#38BDF8]`} />;
    case 'Building Collapse':
      return <Building2 className={`${className} text-[#FF922E]`} />;
    case 'Crime or Police Assistance':
      return <Shield className={`${className} text-[#E5484D]`} />;
    case 'Missing Person':
      return <UserX className={`${className} text-[#A7B3C5]`} />;
    case 'Other Emergency':
    default:
      return <AlertOctagon className={`${className} text-[#A7B3C5]`} />;
  }
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  switch (priority) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold text-[#E5484D] bg-[#E5484D]/15 border border-[#E5484D]/40 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-ping" />
          <span>CRITICAL</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold text-[#FF922E] bg-[#FF922E]/15 border border-[#FF922E]/40 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF922E]" />
          <span>HIGH</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-[#3986D8] bg-[#3986D8]/15 border border-[#3986D8]/40 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3986D8]" />
          <span>MEDIUM</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium text-[#27C77A] bg-[#27C77A]/15 border border-[#27C77A]/40 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#27C77A]" />
          <span>LOW</span>
        </span>
      );
  }
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  switch (status) {
    case 'Reported':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3986D8] bg-[#3986D8]/15 border border-[#3986D8]/40 px-2 py-0.5 rounded">
          <Clock className="w-3 h-3 text-[#3986D8]" />
          <span>Reported</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF922E] bg-[#FF922E]/15 border border-[#FF922E]/40 px-2 py-0.5 rounded">
          <Activity className="w-3 h-3 text-[#FF922E]" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25B875] bg-[#25B875]/15 border border-[#25B875]/40 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-[#25B875]" />
          <span>Resolved</span>
        </span>
      );
  }
};

export const TeamAvailabilityBadge: React.FC<{ availability: TeamAvailability }> = ({
  availability
}) => {
  switch (availability) {
    case 'Available':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25B875] bg-[#25B875]/15 border border-[#25B875]/40 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25B875]" />
          <span>Available</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3986D8] bg-[#3986D8]/15 border border-[#3986D8]/40 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3986D8]" />
          <span>Assigned</span>
        </span>
      );
    case 'Busy':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5484D] bg-[#E5484D]/15 border border-[#E5484D]/40 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5484D]" />
          <span>Busy / In Field</span>
        </span>
      );
    case 'Temporarily Unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-[#64748B]/10 border border-[#64748B]/30 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          <span>Temp Unavailable</span>
        </span>
      );
    case 'Offline':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] bg-[#475569]/10 border border-[#475569]/30 px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />
          <span>Offline</span>
        </span>
      );
  }
};

export const SuspiciousBadge: React.FC<{ classification: SuspiciousClassification; score: number }> = ({
  classification,
  score
}) => {
  switch (classification) {
    case 'Escalated to Police':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E5484D] bg-[#E5484D]/15 border border-[#E5484D]/40 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3 text-[#E5484D]" />
          <span>Escalated to Police ({score}%)</span>
        </span>
      );
    case 'Suspicious':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF922E] bg-[#FF922E]/15 border border-[#FF922E]/40 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3 text-[#FF922E]" />
          <span>Suspicious ({score}%)</span>
        </span>
      );
    case 'Needs Verification':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3986D8] bg-[#3986D8]/15 border border-[#3986D8]/40 px-2 py-0.5 rounded">
          <span>Verification Needed ({score}%)</span>
        </span>
      );
    case 'Normal':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#25B875] bg-[#25B875]/15 border border-[#25B875]/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-[#25B875]" />
          <span>Normal</span>
        </span>
      );
  }
};

export const CitizenStatusBadge: React.FC<{ status: CitizenStatus }> = ({ status }) => {
  switch (status) {
    case 'Emergency Active':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5484D] bg-[#E5484D]/15 border border-[#E5484D]/40 px-2.5 py-1 rounded-full animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
          <span>Emergency Active</span>
        </span>
      );
    case 'Need Assistance':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF922E] bg-[#FF922E]/15 border border-[#FF922E]/40 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#FF922E]" />
          <span>Need Assistance</span>
        </span>
      );
    case 'Safe':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#25B875] bg-[#25B875]/15 border border-[#25B875]/40 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#25B875]" />
          <span>Safe</span>
        </span>
      );
  }
};
