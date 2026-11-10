import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  UserCheck,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  History,
  ShieldCheck
} from 'lucide-react';
import { useResQNet } from '../../context/ResQNetContext';
import { PoliceEscalation, PoliceInvestigationStatus } from '../../types/resqnet';

export const PoliceViews: React.FC = () => {
  const { policeEscalations, updatePoliceInvestigation, incidents } = useResQNet();

  const [selectedEscalationId, setSelectedEscalationId] = useState<string>(
    policeEscalations[0]?.id || ''
  );

  const [outcomeStatus, setOutcomeStatus] = useState<PoliceInvestigationStatus>('Under Investigation');
  const [actionTakenInput, setActionTakenInput] = useState('');
  const [policeNotesInput, setPoliceNotesInput] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const selectedEscalation =
    policeEscalations.find((e) => e.id === selectedEscalationId) || policeEscalations[0];

  const handleCommitOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEscalation) return;

    updatePoliceInvestigation(
      selectedEscalation.id,
      outcomeStatus,
      actionTakenInput.trim() || undefined,
      policeNotesInput.trim() || undefined
    );

    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 2500);
  };

  const statuses: PoliceInvestigationStatus[] = [
    'New Escalation',
    'Pending Verification',
    'Under Investigation',
    'Verified Genuine',
    'Confirmed False Report',
    'Action Taken',
    'Closed'
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Police Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E5484D]/10 border border-[#E5484D]/30 text-[#E5484D] text-xs font-bold font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>SPECIAL POLICE TRIAGE &amp; FRAUD CELL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F6FA] mt-1">
            Police Authority Command Desk
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B3C5]">
            Investigate escalated malicious transmissions, verify evidence, record outcomes, and prosecute false alarm perpetrators.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] bg-[#14243D] px-3 py-1.5 rounded-xl border border-[#223552]">
          <UserCheck className="w-4 h-4" />
          <span>Officer: Inspector R. Selvan (Cyber Division)</span>
        </div>
      </div>

      {/* Police Queue KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#14243D] border border-[#223552] rounded-xl">
          <span className="text-[11px] text-[#A7B3C5] font-semibold block">TOTAL CASES</span>
          <span className="text-2xl font-black font-mono text-[#F3F6FA] mt-1 block">
            {policeEscalations.length}
          </span>
        </div>

        <div className="p-4 bg-[#14243D] border border-[#E5484D]/40 rounded-xl">
          <span className="text-[11px] text-[#E5484D] font-bold block">NEW ESCALATIONS</span>
          <span className="text-2xl font-black font-mono text-[#E5484D] mt-1 block">
            {policeEscalations.filter((p) => p.investigationStatus === 'New Escalation').length}
          </span>
        </div>

        <div className="p-4 bg-[#14243D] border border-[#FF922E]/40 rounded-xl">
          <span className="text-[11px] text-[#FF922E] font-bold block">UNDER INVESTIGATION</span>
          <span className="text-2xl font-black font-mono text-[#FF922E] mt-1 block">
            {policeEscalations.filter((p) => p.investigationStatus === 'Under Investigation').length}
          </span>
        </div>

        <div className="p-4 bg-[#14243D] border border-[#25B875]/40 rounded-xl">
          <span className="text-[11px] text-[#25B875] font-bold block">CLOSED CASES</span>
          <span className="text-2xl font-black font-mono text-[#25B875] mt-1 block">
            {policeEscalations.filter((p) => p.investigationStatus === 'Closed').length}
          </span>
        </div>
      </div>

      {/* Police Escalations Case Selector Bar */}
      {policeEscalations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#A7B3C5]">
            <span>Active Police Escalation Cases ({policeEscalations.length})</span>
            <span className="text-[11px] text-[#38BDF8]">Click case below to inspect dossier &amp; record action</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {policeEscalations.map((esc) => {
              const isSelected = esc.id === (selectedEscalation?.id || selectedEscalationId);
              return (
                <button
                  key={esc.id}
                  onClick={() => {
                    setSelectedEscalationId(esc.id);
                    setOutcomeStatus(esc.investigationStatus);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#19283D] border-[#3986D8] ring-1 ring-[#3986D8] shadow-md'
                      : 'bg-[#14243D] border-[#223552] hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#38BDF8]">{esc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                      Risk {esc.riskScore}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#F3F6FA] truncate">
                    Incident: {esc.incidentId}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A7B3C5]">
                    <span>Caller: {esc.citizenName}</span>
                    <span className="font-semibold text-[#CBD5E1]">{esc.investigationStatus}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Left Case Dossier & Right Outcome Recorder */}
      {selectedEscalation ? (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Escalation Details & Evidence */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#14243D] border border-[#223552] rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#223552]">
                <div>
                  <span className="text-xs font-mono text-[#38BDF8] block">Case Ref: {selectedEscalation.id}</span>
                  <h3 className="text-lg font-bold text-[#F3F6FA]">
                    Incident: {selectedEscalation.incidentId}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                    Risk Score: {selectedEscalation.riskScore}%
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#19283D] text-[#38BDF8] border border-[#223552]">
                    {selectedEscalation.investigationStatus}
                  </span>
                </div>
              </div>

              {/* Citizen caller info */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552]">
                  <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">Reported Identity</span>
                  <div className="font-bold text-[#F3F6FA] text-sm mt-0.5">{selectedEscalation.citizenName}</div>
                  <div className="font-mono text-[#38BDF8]">{selectedEscalation.citizenPhone}</div>
                </div>

                <div className="p-3 bg-[#19283D] rounded-xl border border-[#223552]">
                  <span className="text-[10px] uppercase font-bold text-[#A7B3C5] block">GPS Coordinates</span>
                  <div className="font-mono text-[#F3F6FA] text-xs mt-0.5">{selectedEscalation.gpsLocation}</div>
                  <div className="text-[10px] text-[#A7B3C5]">Timestamp: {new Date(selectedEscalation.escalatedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Suspicious Indicators */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF922E] block">
                  Algorithmic Fraud &amp; Suspicious Indicators:
                </span>
                <ul className="p-3.5 bg-[#19283D] rounded-xl border border-[#223552] text-xs text-[#CBD5E1] space-y-1 list-disc pl-5">
                  {selectedEscalation.suspiciousIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>

              <div className="text-xs text-[#A7B3C5] bg-[#19283D] p-3 rounded-xl border border-[#223552] leading-relaxed">
                <strong className="text-[#F3F6FA]">Escalation Reason: </strong>
                {selectedEscalation.escalationReason}
              </div>

              {/* Quick Status Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#223552]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A7B3C5] block">
                  Quick Police Action Transitions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      updatePoliceInvestigation(
                        selectedEscalation.id,
                        'Verified Genuine',
                        'Field officer physical inspection confirmed real distress scene.',
                        'Authorized by Inspector R. Selvan'
                      );
                      setOutcomeStatus('Verified Genuine');
                    }}
                    className="p-2 rounded-lg bg-[#25B875]/15 hover:bg-[#25B875]/25 border border-[#25B875]/40 text-[#25B875] text-[11px] font-bold text-center transition-colors"
                  >
                    Verify Genuine
                  </button>
                  <button
                    onClick={() => {
                      updatePoliceInvestigation(
                        selectedEscalation.id,
                        'Confirmed False Report',
                        'Subscriber location mismatch; prank transmission verified.',
                        'Sim card tagged for carrier review'
                      );
                      setOutcomeStatus('Confirmed False Report');
                    }}
                    className="p-2 rounded-lg bg-[#E5484D]/15 hover:bg-[#E5484D]/25 border border-[#E5484D]/40 text-[#E5484D] text-[11px] font-bold text-center transition-colors"
                  >
                    Confirm False Alarm
                  </button>
                  <button
                    onClick={() => {
                      updatePoliceInvestigation(
                        selectedEscalation.id,
                        'Action Taken',
                        'Section 182 IPC & Section 66D IT Act summon notice dispatched to subscriber.',
                        'Legal action initiated'
                      );
                      setOutcomeStatus('Action Taken');
                    }}
                    className="p-2 rounded-lg bg-[#FF922E]/15 hover:bg-[#FF922E]/25 border border-[#FF922E]/40 text-[#FF922E] text-[11px] font-bold text-center transition-colors"
                  >
                    Legal Action Taken
                  </button>
                  <button
                    onClick={() => {
                      updatePoliceInvestigation(
                        selectedEscalation.id,
                        'Closed',
                        'Inquest completed and filed in police database.',
                        'Case officially closed'
                      );
                      setOutcomeStatus('Closed');
                    }}
                    className="p-2 rounded-lg bg-[#19283D] hover:bg-[#223552] border border-[#223552] text-[#CBD5E1] text-[11px] font-bold text-center transition-colors"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>

              {/* Immutable Audit Trail */}
              <div className="space-y-2 pt-2 border-t border-[#223552]">
                <h4 className="text-xs font-bold text-[#F3F6FA] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Immutable Police Case Audit Trail</span>
                </h4>
                <div className="space-y-1.5 font-mono text-[11px] text-[#A7B3C5]">
                  {selectedEscalation.auditTrail.map((at, idx) => (
                    <div key={idx} className="p-2 rounded bg-[#080D18] border border-[#223552]">
                      <span className="text-[#38BDF8]">{new Date(at.timestamp).toLocaleTimeString()}:</span>{' '}
                      <strong className="text-[#F3F6FA]">{at.officer}</strong> &rarr; <span className="text-[#CBD5E1]">{at.action}</span> ({at.notes})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Record Action & Verification Outcome Form */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleCommitOutcome}
              className="bg-[#14243D] border border-[#223552] rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="pb-2 border-b border-[#223552]">
                <h3 className="text-base font-bold text-[#F3F6FA]">Record Verification Outcome</h3>
                <span className="text-xs text-[#A7B3C5]">Official police action log</span>
              </div>

              {updateSuccess && (
                <div className="p-3 bg-[#25B875]/20 border border-[#25B875]/40 rounded-xl text-xs text-[#25B875] flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Police outcome recorded and committed to audit log.</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#A7B3C5] uppercase block mb-1">
                  Investigation Status Classification *
                </label>
                <select
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value as PoliceInvestigationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-xs font-bold text-[#F3F6FA] focus:outline-none"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#A7B3C5] uppercase block mb-1">
                  Investigation Findings &amp; Evidence Remarks *
                </label>
                <textarea
                  rows={3}
                  required
                  value={policeNotesInput}
                  onChange={(e) => setPoliceNotesInput(e.target.value)}
                  placeholder="Record CDR records, subscriber verification, and beat patrol findings..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-xs text-[#F3F6FA] focus:outline-none focus:border-[#3986D8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#A7B3C5] uppercase block mb-1">
                  Legal / Police Action Taken (e.g. Warning, Section 66D IT Act)
                </label>
                <input
                  type="text"
                  value={actionTakenInput}
                  onChange={(e) => setActionTakenInput(e.target.value)}
                  placeholder="e.g. Formal notice issued under Section 182 IPC; SIM flagged"
                  className="w-full px-3 py-2 rounded-xl bg-[#080D18] border border-[#223552] text-xs text-[#F3F6FA] focus:outline-none focus:border-[#3986D8]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3986D8] hover:bg-[#38BDF8] text-white font-bold text-xs rounded-xl transition-colors shadow-md"
              >
                Commit Official Police Action
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-[#A7B3C5] bg-[#14243D] rounded-2xl border border-[#223552]">
          No active police escalations logged.
        </div>
      )}
    </div>
  );
};
