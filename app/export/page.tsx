"use client";

import { useStore } from "@/lib/store";
import { generateProtocol } from "@/lib/protocolGenerator";
import { getFilteredPlan, getFilteredPhases } from "@/lib/focusFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { FileDown, FileJson, FolderPlus } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { format } from "date-fns";
import type { PlanBlock } from "@/lib/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const currentPlan = useStore((s) => s.currentPlan);
  const focusMode = useStore((s) => s.focusMode);
  const focusModuleId = useStore((s) => s.focusModuleId);
  const savedModules = useStore((s) => s.savedModules);
  const savedPlans = useStore((s) => s.savedPlans);
  const loadPlan = useStore((s) => s.loadPlan);
  const createPlanFromBlocks = useStore((s) => s.createPlanFromBlocks);
  const appendBlocksToPlan = useStore((s) => s.appendBlocksToPlan);
  const doseLogs = useStore((s) => s.doseLogs);
  const biomarkerLogs = useStore((s) => s.biomarkerLogs);
  const symptomEntries = useStore((s) => s.symptomEntries);

  const getModuleItemIds = (id: string) => savedModules.find((m) => m.id === id)?.itemIds ?? [];
  const filteredPlan = useMemo(
    () => getFilteredPlan(currentPlan, focusMode, focusModuleId, getModuleItemIds),
    [currentPlan, focusMode, focusModuleId, savedModules]
  );
  const filteredPhases = useMemo(
    () => getFilteredPhases(currentPlan, focusMode, focusModuleId, getModuleItemIds),
    [currentPlan, focusMode, focusModuleId, savedModules]
  );
  const filteredBlocks: PlanBlock[] = useMemo(
    () => filteredPhases.flatMap((p) => p.blocks),
    [filteredPhases]
  );
  const protocol = generateProtocol(currentPlan ?? null);
  const subsetProtocol = filteredPlan ? generateProtocol(filteredPlan) : null;

  const [addToPlanOpen, setAddToPlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const handleExportSubsetPDF = useCallback(async () => {
    if (!subsetProtocol || subsetProtocol.phases.every((p) => p.blocks.length === 0)) return;
    const { ProtocolPDF } = await import("@/components/protocol-pdf");
    const blob = await ProtocolPDF({ protocol: subsetProtocol });
    downloadBlob(blob, `bioforgeos-subset-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }, [subsetProtocol]);

  const handleAddToNewPlan = () => {
    if (!newPlanName.trim()) return;
    const blocksWithPhase: PlanBlock[] = filteredBlocks.map((b) => ({
      ...b,
      phaseIndex: 0,
      weekIndex: 0,
    }));
    createPlanFromBlocks(blocksWithPhase, newPlanName.trim());
    setAddToPlanOpen(false);
    setNewPlanName("");
  };

  const handleAddToExistingPlan = (planId: string) => {
    const blocksToAdd = filteredBlocks.map(({ id, type, refId, label, notes }) => ({
      id,
      type,
      refId,
      label,
      notes,
    }));
    appendBlocksToPlan(planId, blocksToAdd, 0);
    setAddToPlanOpen(false);
    loadPlan(planId);
  };

  const handleExportPDF = useCallback(async () => {
    if (!protocol) return;
    const { ProtocolPDF } = await import("@/components/protocol-pdf");
    const blob = await ProtocolPDF({ protocol });
    downloadBlob(blob, `bioforgeos-protocol-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }, [protocol]);

  const handleExportJSON = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      plan: currentPlan,
      doseLogs,
      biomarkerLogs,
      symptomEntries,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadBlob(blob, `bioforgeos-backup-${format(new Date(), "yyyy-MM-dd")}.json`);
  }, [currentPlan, doseLogs, biomarkerLogs, symptomEntries]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-[var(--foreground)]/70 text-sm">
          One-click PDF plan and JSON backup.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileDown className="h-5 w-5" /> PDF Plan
            </CardTitle>
            <p className="text-sm text-[var(--foreground)]/70">
              Beautiful PDF with phases, doses, evidence, doctor script, and biomarker gates.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPDF} disabled={!protocol || protocol.phases.every((p) => p.blocks.length === 0)} title="Download full protocol as PDF" aria-label="Download full protocol PDF">
              Download PDF
            </Button>
            {focusMode !== "full" && (
              <Button
                variant="secondary"
                className="mt-2 block"
                onClick={handleExportSubsetPDF}
                disabled={!subsetProtocol || subsetProtocol.phases.every((p) => p.blocks.length === 0)}
                title="Export current view (filtered) as PDF"
                aria-label="Export subset PDF (filtered view)"
              >
                Export Subset PDF
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderPlus className="h-5 w-5" /> Add to Another Plan
            </CardTitle>
            <p className="text-sm text-[var(--foreground)]/70">
              Add current view (filtered) blocks to an existing plan or create a new plan.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => setAddToPlanOpen(true)}
              disabled={filteredBlocks.length === 0}
              title="Add filtered blocks to another plan"
            >
              Add to Another Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileJson className="h-5 w-5" /> JSON Backup
            </CardTitle>
            <p className="text-sm text-[var(--foreground)]/70">
              Full backup of plan, dose logs, biomarkers, and symptoms.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={handleExportJSON}>
              Download JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addToPlanOpen} onOpenChange={setAddToPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to plan</DialogTitle>
            <p className="text-sm text-[var(--foreground)]/70">
              {filteredBlocks.length} block(s) will be added.
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Create new plan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Plan name"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="flex h-10 flex-1 rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm"
                />
                <Button onClick={handleAddToNewPlan} disabled={!newPlanName.trim()}>
                  Create
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Or add to existing plan</label>
              <div className="flex flex-col gap-1">
                {savedPlans.map((p) => (
                  <Button
                    key={p.id}
                    variant="secondary"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleAddToExistingPlan(p.id)}
                  >
                    {p.name}
                  </Button>
                ))}
                {savedPlans.length === 0 && (
                  <p className="text-sm text-[var(--foreground)]/60">No saved plans yet.</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
