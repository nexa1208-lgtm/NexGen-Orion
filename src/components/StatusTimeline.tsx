import React from 'react';
import {
  Clock,
  Activity,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  UserCheck
} from 'lucide-react';
import { IncidentStatus } from '../types/resqnet';

interface StatusTimelineProps {
  currentStatus: IncidentStatus;
  createdAt?: string;
  assignedAt?: string;
  resolvedAt?: string;
  assignedTeamName?: string;
  timelineEvents?: {
    id: string;
    timestamp: string;
    status: IncidentStatus;
    actor: string;
    note: string;
  }[];
  compact?: boolean;
  allowAdminControls?: boolean;
  onStatusChange?: (newStatus: IncidentStatus) => void;
}

interface StageConfig {
  status: IncidentStatus;
  stepNumber: string;
  label: string;
  sublabel: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  icon: React.ReactNode;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  createdAt,
  assignedAt,
  resolvedAt,
  assignedTeamName,
  timelineEvents = [],
  compact = false,
  allowAdminControls = false,
  onStatusChange
}) => {
  const stages: StageConfig[] = [
    {
      status: 'Reported',
      stepNumber: '01',
      label: 'Reported',
      sublabel: 'Emergency Intake & Triage',
      colorHex: '#3986D8', // Professional Golden Yellow
      bgHex: 'bg-[#3986D8]',
      borderHex: 'border-[#3986D8]',
      icon: <Clock className="w-4 h-4" />
    },
    {
      status: 'In Progress',
      stepNumber: '02',
      label: 'In Progress',
      sublabel: assignedTeamName ? `Dispatched: ${assignedTeamName}` : 'Response Unit Allocated',
      colorHex: '#FF922E', // High Priority Orange
      bgHex: 'bg-[#FF922E]',
      borderHex: 'border-[#FF922E]',
      icon: <Activity className="w-4 h-4" />
    },
    {
      status: 'Resolved',
      stepNumber: '03',
      label: 'Resolved',
      sublabel: 'Incident Mitigated & Secured',
      colorHex: '#25B875', // Resolved Green
      bgHex: 'bg-[#25B875]',
      borderHex: 'border-[#25B875]',
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ];

  const statusOrder: IncidentStatus[] = ['Reported', 'In Progress', 'Resolved'];
  const currentStageIndex = statusOrder.indexOf(currentStatus);

  const getStageState = (index: number) => {
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const getStageTimestamp = (status: IncidentStatus): string | undefined => {
    if (status === 'Reported') return createdAt;
    if (status === 'In Progress') return assignedAt || createdAt;
    if (status === 'Resolved') return resolvedAt;
    return undefined;
  };

  if (compact) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A7B3C5] font-semibold">Lifecycle Status</span>
          <span className="font-mono text-[11px] font-bold" style={{ color: stages[currentStageIndex]?.colorHex }}>
            {currentStatus.toUpperCase()}
          </span>
        </div>

        {/* Compact Segmented Progress Bar */}
        <div className="grid grid-cols-3 gap-1.5">
          {stages.map((stage, idx) => {
            const state = getStageState(idx);
            let barStyle = 'bg-[#19283D] border border-[#223552] text-[#64748B]';

            if (state === 'completed') {
              barStyle = 'bg-[#25B875]/20 border border-[#25B875]/60 text-[#25B875]';
            } else if (state === 'current') {
              if (stage.status === 'Reported') barStyle = 'bg-[#3986D8]/20 border-2 border-[#3986D8] text-[#3986D8]';
              else if (stage.status === 'In Progress') barStyle = 'bg-[#FF922E]/20 border-2 border-[#FF922E] text-[#FF922E] animate-pulse';
              else if (stage.status === 'Resolved') barStyle = 'bg-[#25B875]/20 border-2 border-[#25B875] text-[#25B875]';
            }

            return (
              <div
                key={stage.status}
                className={`h-2 rounded-full transition-all duration-300 ${
                  state === 'completed'
                    ? 'bg-[#25B875]'
                    : state === 'current'
                    ? stage.status === 'Reported'
                      ? 'bg-[#3986D8]'
                      : stage.status === 'In Progress'
                      ? 'bg-[#FF922E]'
                      : 'bg-[#25B875]'
                    : 'bg-[#19283D] border border-[#223552]'
                }`}
                title={`${stage.label}: ${state}`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#14243D] border border-[#223552] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#223552]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A7B3C5]">
              Incident Lifecycle Progress
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border"
              style={{
                color: stages[currentStageIndex]?.colorHex,
                backgroundColor: `${stages[currentStageIndex]?.colorHex}15`,
                borderColor: `${stages[currentStageIndex]?.colorHex}40`
              }}
            >
              STAGE {currentStageIndex + 1} OF 3: {currentStatus.toUpperCase()}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#F3F6FA]">
            Reported &rarr; In Progress &rarr; Resolved
          </h3>
        </div>

        {/* Admin Direct Transition Buttons if enabled */}
        {allowAdminControls && onStatusChange && (
          <div className="flex items-center gap-1.5 bg-[#080D18] p-1 rounded-xl border border-[#223552] text-xs">
            {statusOrder.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(st)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentStatus === st
                    ? st === 'Reported'
                      ? 'bg-[#3986D8] text-white shadow-sm'
                      : st === 'In Progress'
                      ? 'bg-[#FF922E] text-white shadow-sm'
                      : 'bg-[#25B875] text-white shadow-sm'
                    : 'text-[#A7B3C5] hover:text-[#F3F6FA]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Lifecycle Visual Track (Reported -> In Progress -> Resolved) */}
      <div className="relative pt-2 pb-4">
        {/* Connecting Progress Track Line Behind Nodes */}
        <div className="absolute top-[36px] left-[10%] right-[10%] h-1 bg-[#19283D] border-t border-[#223552] -z-0">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width:
                currentStageIndex === 0
                  ? '0%'
                  : currentStageIndex === 1
                  ? '50%'
                  : '100%',
              backgroundColor:
                currentStageIndex === 0
                  ? '#3986D8'
                  : currentStageIndex === 1
                  ? '#FF922E'
                  : '#25B875'
            }}
          />
        </div>

        {/* 3 Interactive Milestone Nodes */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {stages.map((stage, index) => {
            const state = getStageState(index);
            const isCompleted = state === 'completed';
            const isCurrent = state === 'current';
            const timestamp = getStageTimestamp(stage.status);

            return (
              <div
                key={stage.status}
                className="flex flex-col items-center text-center space-y-2 group"
              >
                {/* Milestone Node Circle */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm transition-all shadow-lg ${
                    isCurrent
                      ? 'ring-4 ring-offset-2 ring-offset-[#14243D] scale-105'
                      : ''
                  }`}
                  style={{
                    backgroundColor: isCompleted
                      ? '#25B875'
                      : isCurrent
                      ? stage.colorHex
                      : '#19283D',
                    color: isCompleted
                      ? '#F3F6FA'
                      : isCurrent && stage.status === 'Reported'
                      ? '#080D18'
                      : isCurrent
                      ? '#F3F6FA'
                      : '#64748B',
                    border: isCompleted
                      ? '2px solid #25B875'
                      : isCurrent
                      ? `2px solid ${stage.colorHex}`
                      : '2px solid #223552',
                    boxShadow: isCurrent
                      ? `0 0 20px ${stage.colorHex}60`
                      : '0 4px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Label & Details Card */}
                <div
                  className={`p-3 rounded-xl border w-full max-w-[210px] space-y-1 transition-all ${
                    isCurrent
                      ? 'bg-[#19283D] border-[#3986D8]/60 shadow-md'
                      : isCompleted
                      ? 'bg-[#19283D]/80 border-[#25B875]/30'
                      : 'bg-[#19283D]/40 border-[#223552] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#A7B3C5]">
                      {stage.stepNumber}
                    </span>
                    <span
                      className="font-bold text-xs"
                      style={{
                        color: isCompleted
                          ? '#25B875'
                          : isCurrent
                          ? stage.colorHex
                          : '#A7B3C5'
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#A7B3C5] leading-tight line-clamp-2">
                    {stage.sublabel}
                  </p>

                  {timestamp && (
                    <div className="text-[10px] font-mono text-[#38BDF8] pt-1 border-t border-[#223552]/60 truncate">
                      {new Date(timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Detailed Event Log Stream */}
      {timelineEvents.length > 0 && (
        <div className="pt-4 border-t border-[#223552] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#3986D8]" />
              <span>Chronological Event Stream</span>
            </span>
            <span className="text-[11px] font-mono text-[#A7B3C5]">
              {timelineEvents.length} recorded events
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {timelineEvents.map((ev) => {
              let tagColor = '#3986D8';
              if (ev.status === 'In Progress') tagColor = '#FF922E';
              else if (ev.status === 'Resolved') tagColor = '#25B875';

              return (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-[#19283D] border border-[#223552] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                        style={{
                          color: tagColor,
                          backgroundColor: `${tagColor}15`,
                          border: `1px solid ${tagColor}40`
                        }}
                      >
                        {ev.status}
                      </span>
                      <strong className="text-[#F3F6FA] text-[11px]">{ev.actor}</strong>
                    </div>
                    <p className="text-[11px] text-[#A7B3C5] leading-relaxed">{ev.note}</p>
                  </div>

                  <span className="text-[10px] font-mono text-[#A7B3C5] whitespace-nowrap shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
