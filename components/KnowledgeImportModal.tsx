"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Library, FolderPlus, PlusCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  parseKnowledgeImportText,
  parseKnowledgeImportJson,
  type ParsedImportItem,
} from "@/lib/knowledgeImportParser";
import type { CompendiumItem, PlanBlockType } from "@/lib/types";

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  if (typeof window !== "undefined" && (pdfjs as unknown as { GlobalWorkerOptions?: { workerSrc?: string } }).GlobalWorkerOptions) {
    try {
      (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjs as unknown as { version?: string }).version ?? "3.11.174"}/pdf.worker.min.js`;
    } catch {
      // ignore
    }
  }
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument(buf).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((it: unknown) => (it && typeof (it as { str?: string }).str === "string" ? (it as { str: string }).str : ""))
      .join(" ") + "\n";
  }
  return text;
}

export function KnowledgeImportModal() {
  const open = useStore((s) => s.ui.knowledgeImportOpen ?? false);
  const setUI = useStore((s) => s.setUI);
  const addCompendiumItem = useStore((s) => s.addCompendiumItem);
  const addCompendiumItemToPlan = useStore((s) => s.addCompendiumItemToPlan);
  const addSavedModule = useStore((s) => s.addSavedModule);

  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<ParsedImportItem[]>([]);
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleName, setModuleName] = useState("");
  const [showModuleInput, setShowModuleInput] = useState(false);

  const toggleIncluded = (index: number) => {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const setAllIncluded = (value: boolean) => {
    if (value) setIncluded(new Set(parsed.map((_, i) => i)));
    else setIncluded(new Set());
  };

  const handleParsePaste = useCallback(() => {
    setError(null);
    const items = parseKnowledgeImportText(pasteText);
    setParsed(items);
    setIncluded(new Set(items.map((_, i) => i)));
  }, [pasteText]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      let text: string;
      if (ext === "pdf") {
        text = await extractTextFromPdf(file);
      } else if (ext === "json") {
        const raw = await file.text();
        const items = parseKnowledgeImportJson(raw);
        setParsed(items);
        setIncluded(new Set(items.map((_, i) => i)));
        setLoading(false);
        return;
      } else {
        text = await file.text();
      }
      const items = parseKnowledgeImportText(text);
      setParsed(items);
      setIncluded(new Set(items.map((_, i) => i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read file");
      setParsed([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toCompendiumItem = (p: ParsedImportItem): CompendiumItem => ({
    id: crypto.randomUUID(),
    name: p.name,
    type: p.type,
    refId: p.refId,
    doseExamples: p.doseExamples,
    moa: p.moa,
    personalNotes: p.personalNotes,
    tags: p.tags ?? [],
    versionHistory: [{ at: new Date().toISOString(), note: "Knowledge Import" }],
    links: [],
  });

  const includedItems = parsed.filter((_, i) => included.has(i));

  const handleAddToCompendium = () => {
    includedItems.forEach((p) => addCompendiumItem(toCompendiumItem(p)));
    setParsed([]);
    setUI({ knowledgeImportOpen: false });
  };

  const handleAddToPlan = () => {
    includedItems.forEach((p) => {
      const item = toCompendiumItem(p);
      addCompendiumItem(item);
      addCompendiumItemToPlan(0, item);
    });
    setParsed([]);
    setUI({ knowledgeImportOpen: false });
  };

  const handleSaveAsModule = () => {
    if (!moduleName.trim() || includedItems.length === 0) return;
    const items = includedItems.map(toCompendiumItem);
    items.forEach((it) => addCompendiumItem(it));
    addSavedModule({ name: moduleName.trim(), itemIds: items.map((i) => i.id) });
    setModuleName("");
    setShowModuleInput(false);
    setParsed([]);
    setUI({ knowledgeImportOpen: false });
  };

  const updateParsed = (index: number, patch: Partial<ParsedImportItem>) => {
    setParsed((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const onOpenChange = (open: boolean) => setUI({ knowledgeImportOpen: open });

  useEffect(() => {
    const handler = (e: Event) => {
      const file = (e as CustomEvent<File>).detail;
      if (file && open) handleFile(file);
    };
    document.addEventListener("knowledge-import-file", handler);
    return () => document.removeEventListener("knowledge-import-file", handler);
  }, [open, handleFile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Feed the OS — Import Knowledge
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="paste" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Paste Text
            </TabsTrigger>
            <TabsTrigger value="upload">Upload File (PDF, JSON, TXT, MD)</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
            <textarea
              placeholder="Paste case studies, paper excerpts, notes… Peptide names, doses, and durations will be detected."
              className="min-h-[120px] w-full rounded-md border border-[var(--card-border)] bg-white/5 px-3 py-2 text-sm resize-y"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button onClick={handleParsePaste} disabled={!pasteText.trim()} className="w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> Parse & Preview
            </Button>
          </TabsContent>
          <TabsContent value="upload" className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
            <label className="flex flex-col items-center justify-center gap-2 min-h-[140px] rounded-xl border-2 border-dashed border-[var(--card-border)] bg-white/5 p-6 cursor-pointer hover:bg-white/10 transition-colors">
              <Upload className="h-10 w-10 text-[var(--foreground)]/60" />
              <span className="text-sm text-[var(--foreground)]/80">Drop a file here or tap to browse</span>
              <input
                type="file"
                accept=".pdf,.json,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
            {loading && <p className="text-sm text-[var(--foreground)]/70">Extracting text…</p>}
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {parsed.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Preview — edit and select items</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAllIncluded(true)}>Select all</Button>
                <Button variant="outline" size="sm" onClick={() => setAllIncluded(false)}>Clear</Button>
              </div>
            </div>
            <ScrollArea className="flex-1 min-h-[200px] max-h-[280px] rounded-md border border-[var(--card-border)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Add</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Type</TableHead>
                    <TableHead>Dose / MOA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={included.has(i)}
                          onChange={() => toggleIncluded(i)}
                          className="rounded border-[var(--card-border)]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={p.name}
                          onChange={(e) => updateParsed(i, { name: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          className="flex h-8 w-full rounded border border-[var(--card-border)] bg-white/5 px-2 text-sm"
                          value={p.type}
                          onChange={(e) => updateParsed(i, { type: e.target.value as PlanBlockType })}
                        >
                          {(["peptide", "test", "5r", "diet", "monitoring", "goal"] as const).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <Input
                          value={p.doseExamples?.join(", ") ?? p.moa?.slice(0, 40) ?? ""}
                          onChange={(e) => updateParsed(i, { doseExamples: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : undefined })}
                          placeholder="Dose or MOA"
                          className="h-8 text-sm truncate"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <DialogFooter className="flex-wrap gap-2">
              <Button onClick={handleAddToCompendium} disabled={included.size === 0}>
                <Library className="h-4 w-4 mr-2" /> Add to Compendium ({included.size})
              </Button>
              <Button onClick={handleAddToPlan} disabled={included.size === 0} variant="secondary">
                <PlusCircle className="h-4 w-4 mr-2" /> Add to Current Plan
              </Button>
              {showModuleInput ? (
                <div className="flex gap-2 items-center flex-1">
                  <Input
                    placeholder="Module name"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="max-w-[180px]"
                  />
                  <Button onClick={handleSaveAsModule} disabled={!moduleName.trim()}>Save as Module</Button>
                  <Button variant="ghost" onClick={() => setShowModuleInput(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowModuleInput(true)} disabled={included.size === 0}>
                  <FolderPlus className="h-4 w-4 mr-2" /> Save as New Module
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
