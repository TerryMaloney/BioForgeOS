import type { UserPlan, Phase, PlanBlock } from "./types";
import { seedData } from "./seedData";

export interface ProtocolPhase {
  name: string;
  weekRange: string;
  blocks: ProtocolBlock[];
  doses: string[];
  evidence: string[];
  risks: string[];
  synergies: string[];
}

export interface ProtocolBlock {
  label: string;
  type: string;
  form?: string;
  notes?: string;
}

export interface GeneratedProtocol {
  planName: string;
  phases: ProtocolPhase[];
  doctorScripts: string[];
  biomarkerGates: string[];
  updatedAt: string;
}

function getPeptide(refId: string) {
  return seedData.peptides.find((p) => p.id === refId);
}

export function generateProtocol(plan: UserPlan | null): GeneratedProtocol | null {
  if (!plan) return null;

  const biomarkerList = [
    ...seedData.biomarkerHierarchy.tier1,
    ...seedData.biomarkerHierarchy.tier2,
  ];
  const doctorScripts: string[] = [];
  const biomarkerGates: string[] = [];

  const phases: ProtocolPhase[] = plan.phases.map((phase, phaseIndex) => {
    const blocks: ProtocolBlock[] = phase.blocks.map((b) => ({
      label: b.label,
      type: b.type,
      form: getPeptide(b.refId)?.form,
      notes: b.notes,
    }));

    const doses: string[] = [];
    const evidence: string[] = [];
    const risks: string[] = [];
    const synergies: string[] = [];

    phase.blocks.forEach((b) => {
      const pep = getPeptide(b.refId);
      if (pep) {
        if (pep.form) doses.push(`${pep.name}: ${pep.form}`);
        evidence.push(pep.moa);
        if (pep.warning) risks.push(pep.warning);
        if (pep.synergies?.length)
          synergies.push(...pep.synergies.map((s) => `${pep.name} + ${s}`));
        doctorScripts.push(
          `Request: ${pep.name} for [indication]. Form: ${pep.form ?? "per protocol"}.`
        );
      }
    });

    const weekRange = `Week ${phase.weekStart}-${phase.weekEnd}`;
    biomarkerList.forEach((bm, i) => {
      const week = phase.weekStart + Math.floor((phase.weekEnd - phase.weekStart) / 2);
      biomarkerGates.push(`Re-test ${bm} at week ${week}`);
    });

    return {
      name: phase.name,
      weekRange,
      blocks,
      doses: [...new Set(doses)],
      evidence: [...new Set(evidence)],
      risks: [...new Set(risks)],
      synergies: [...new Set(synergies)],
    };
  });

  return {
    planName: plan.name,
    phases,
    doctorScripts: [...new Set(doctorScripts)],
    biomarkerGates: [...new Set(biomarkerGates)],
    updatedAt: plan.updatedAt,
  };
}

export function generateDoctorScriptForPeptide(peptideId: string): string {
  const pep = seedData.peptides.find((p) => p.id === peptideId);
  if (!pep) return "";
  return `Request: ${pep.name} for [indication]. Form: ${pep.form ?? "per protocol"}. Mechanism: ${pep.moa}`;
}
