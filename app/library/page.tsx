"use client";

import { useState } from "react";
import { seedData } from "@/lib/seedData";
import { generateDoctorScriptForPeptide } from "@/lib/protocolGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [scriptPeptide, setScriptPeptide] = useState<(typeof seedData.peptides)[number] | null>(null);

  const filtered = seedData.peptides.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.moa.toLowerCase().includes(search.toLowerCase()) ||
      p.tier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-[var(--foreground)]/70 text-sm">
          Full searchable table of every peptide with 2026 status, MOA, and doctor script generator.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
            <Input
              placeholder="Search by name, MOA, tier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>MOA</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Synergies</TableHead>
                  <TableHead className="w-[100px]">Script</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help border-b border-dotted border-[var(--foreground)]/40">
                            {p.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs font-medium text-[var(--gut-green)]">2026 science note</p>
                          <p className="text-xs mt-1">{p.moa}</p>
                          {p.warning && <p className="text-xs mt-1 text-[var(--accent-orange)]">{p.warning}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{p.tier}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-[var(--foreground)]/90">{p.moa}</TableCell>
                    <TableCell className="text-[var(--foreground)]/80">{p.form ?? "—"}</TableCell>
                    <TableCell className="text-[var(--foreground)]/80 text-sm">{p.status ?? "—"}</TableCell>
                    <TableCell className="text-sm text-[var(--foreground)]/80">
                      {p.synergies?.join(", ") ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setScriptPeptide(p)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> Script
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Dialog open={!!scriptPeptide} onOpenChange={(open) => !open && setScriptPeptide(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doctor script request</DialogTitle>
            <DialogDescription>
              {scriptPeptide?.name} — copy and customize for your provider.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-[var(--card-border)] bg-white/5 p-4 font-mono text-sm whitespace-pre-wrap">
            {scriptPeptide ? generateDoctorScriptForPeptide(scriptPeptide.id) : ""}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
