"use client";

import { useStore } from "@/lib/store";
import { generateProtocol } from "@/lib/protocolGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileDown, FileJson } from "lucide-react";
import { useCallback } from "react";
import { format } from "date-fns";

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
  const doseLogs = useStore((s) => s.doseLogs);
  const biomarkerLogs = useStore((s) => s.biomarkerLogs);
  const symptomEntries = useStore((s) => s.symptomEntries);
  const protocol = generateProtocol(currentPlan ?? null);

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
            <Button onClick={handleExportPDF} disabled={!protocol || protocol.phases.every((p) => p.blocks.length === 0)}>
              Download PDF
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
    </div>
  );
}
