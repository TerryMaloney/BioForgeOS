"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { getCompendiumSeed } from "@/lib/compendiumSeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Search, Plus, Edit2, Trash2, FolderPlus, Upload } from "lucide-react";
import type { CompendiumItem, PlanBlockType } from "@/lib/types";

function CompendiumEditModal({
  item,
  open,
  onOpenChange,
  onSave,
}: {
  item: CompendiumItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<CompendiumItem>) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PlanBlockType>("peptide");
  const [moa, setMoa] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [doseExamplesStr, setDoseExamplesStr] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [evidenceTier, setEvidenceTier] = useState<"S" | "A" | "Frontier">("A");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type);
      setMoa(item.moa ?? "");
      setPersonalNotes(item.personalNotes ?? "");
      setDoseExamplesStr((item.doseExamples ?? []).join(", "));
      setTagsStr((item.tags ?? []).join(", "));
      setEvidenceTier(item.evidenceTier ?? "A");
    }
  }, [item]);

  const handleSave = () => {
    onSave({
      name,
      type,
      moa: moa || undefined,
      personalNotes: personalNotes || undefined,
      doseExamples: doseExamplesStr ? doseExamplesStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      tags: tagsStr ? tagsStr.split(",").map((s) => s.trim()).filter(Boolean) : [],
      evidenceTier,
    });
    onOpenChange(false);
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit compendium item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as PlanBlockType)}
              >
                {(["goal", "test", "5r", "peptide", "diet", "monitoring"] as const).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">MOA / Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm"
              value={moa}
              onChange={(e) => setMoa(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Dose examples (comma-separated)</label>
            <Input value={doseExamplesStr} onChange={(e) => setDoseExamplesStr(e.target.value)} placeholder="500mg daily, 12 weeks" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Evidence tier</label>
            <select
              className="flex h-10 w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm"
              value={evidenceTier}
              onChange={(e) => setEvidenceTier(e.target.value as "S" | "A" | "Frontier")}
            >
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="Frontier">Frontier</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Personal notes</label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm"
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
            <Input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CompendiumPage() {
  const compendiumItems = useStore((s) => s.compendiumItems);
  const setCompendiumItems = useStore((s) => s.setCompendiumItems);
  const addCompendiumItemToPlan = useStore((s) => s.addCompendiumItemToPlan);
  const updateCompendiumItem = useStore((s) => s.updateCompendiumItem);
  const removeCompendiumItem = useStore((s) => s.removeCompendiumItem);
  const addSavedModule = useStore((s) => s.addSavedModule);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CompendiumItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saveModuleOpen, setSaveModuleOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [dropActive, setDropActive] = useState(false);

  const openKnowledgeImport = () => useStore.getState().setUI({ knowledgeImportOpen: true });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (["pdf", "json", "txt", "md"].includes(ext)) {
      openKnowledgeImport();
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent("knowledge-import-file", { detail: file }));
      }, 100);
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDropActive(true); };
  const handleDragLeave = () => setDropActive(false);

  useEffect(() => {
    if (compendiumItems.length === 0) {
      setCompendiumItems(getCompendiumSeed());
    }
  }, [compendiumItems.length, setCompendiumItems]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return compendiumItems;
    return compendiumItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        (i.moa?.toLowerCase().includes(q)) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [compendiumItems, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAsModule = () => {
    if (selectedIds.size === 0 || !newModuleName.trim()) return;
    addSavedModule({ name: newModuleName.trim(), itemIds: Array.from(selectedIds) });
    setNewModuleName("");
    setSaveModuleOpen(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Compendium</h1>
        <p className="text-[var(--foreground)]/70 text-sm">
          Searchable repository of peptides, tests, 5R, diets, and custom blocks. Add to plan or save as module.
        </p>
      </motion.div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant="default"
          size="sm"
          onClick={openKnowledgeImport}
          title="Paste or upload PDF, JSON, TXT, MD to extract items"
          className="bg-[var(--gut-green)] hover:opacity-90"
        >
          <Upload className="h-4 w-4 mr-1" /> Feed the OS — Import Knowledge
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => useStore.getState().setUI({ quickAddOpen: true })}
          title="Quick add (Ctrl+Shift+A)"
        >
          <Plus className="h-4 w-4 mr-1" /> Quick add
        </Button>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mb-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dropActive ? "border-[var(--gut-green)] bg-[var(--gut-green)]/10" : "border-[var(--card-border)] bg-white/5"}`}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--foreground)]/50" />
        <p className="text-sm text-[var(--foreground)]/70">Drop a PDF, JSON, TXT, or MD file here to import</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground)]/50" />
            <Input
              placeholder="Search by name, type, MOA, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSaveModuleOpen(true)}
              disabled={selectedIds.size === 0}
              title="Save selected as module"
            >
              <FolderPlus className="h-4 w-4 mr-1" /> Save as module ({selectedIds.size})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Dose / MOA</TableHead>
                  <TableHead className="w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-[var(--card-border)]"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                    <TableCell>{item.evidenceTier ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-[var(--foreground)]/80">
                      {item.doseExamples?.[0] ?? item.moa?.slice(0, 50) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Add to current plan (Phase 0)"
                          onClick={() => addCompendiumItemToPlan(0, item)}
                          aria-label="Add to current plan"
                        >
                          Add to Plan
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(item)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCompendiumItem(item.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <CompendiumEditModal
        item={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={(patch) => editing && updateCompendiumItem(editing.id, patch)}
      />

      <Dialog open={saveModuleOpen} onOpenChange={setSaveModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as module</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Module name"
            value={newModuleName}
            onChange={(e) => setNewModuleName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSaveModuleOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAsModule} disabled={!newModuleName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
