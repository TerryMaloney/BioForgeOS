"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { seedData } from "@/lib/seedData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import dynamic from "next/dynamic";

const RechartsLine = dynamic(
  () => import("@/components/tracker-chart").then((m) => m.BiomarkerChart),
  { ssr: false }
);

export default function TrackerPage() {
  const currentPlan = useStore((s) => s.currentPlan);
  const doseLogs = useStore((s) => s.doseLogs);
  const logDose = useStore((s) => s.logDose);
  const getDosesForDate = useStore((s) => s.getDosesForDate);
  const biomarkerLogs = useStore((s) => s.biomarkerLogs);
  const addBiomarkerLog = useStore((s) => s.addBiomarkerLog);
  const symptomEntries = useStore((s) => s.symptomEntries);
  const addSymptom = useStore((s) => s.addSymptom);
  const deleteSymptom = useStore((s) => s.deleteSymptom);
  const retestAlerts = useStore((s) => s.retestAlerts);
  const dismissRetestAlert = useStore((s) => s.dismissRetestAlert);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptomText, setSymptomText] = useState("");
  const [newBiomarker, setNewBiomarker] = useState({ name: "", value: "", date: format(new Date(), "yyyy-MM-dd") });

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dosesForDay = getDosesForDate(dateStr);
  const planBlocks = useMemo(() => {
    const blocks: { id: string; refId: string; label: string }[] = [];
    currentPlan?.phases.forEach((p) => {
      p.blocks.forEach((b) => blocks.push({ id: b.id, refId: b.refId, label: b.label }));
    });
    return blocks.filter((b, i, arr) => arr.findIndex((x) => x.refId === b.refId) === i);
  }, [currentPlan]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const activeAlerts = retestAlerts.filter((a) => !a.dismissed);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Tracker</h1>
        <p className="text-[var(--foreground)]/70 text-sm">Log doses, biomarkers, and symptoms. N-of-1 before/after.</p>
      </motion.div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="glass">
          <TabsTrigger value="calendar">Calendar & Doses</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
          <TabsTrigger value="symptoms">Symptom Journal</TabsTrigger>
          <TabsTrigger value="alerts">Re-test Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> Dose logger — {format(selectedDate, "MMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--foreground)]/70">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const dStr = format(day, "yyyy-MM-dd");
                  const count = getDosesForDate(dStr).filter((e) => e.taken).length;
                  return (
                    <button
                      key={dStr}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-lg border text-sm transition-colors ${
                        !isSameMonth(day, selectedDate)
                          ? "border-transparent text-[var(--foreground)]/30"
                          : isToday(day)
                            ? "border-[var(--gut-green)] bg-[var(--gut-green)]/20"
                            : "border-[var(--card-border)] hover:bg-white/5"
                      }`}
                    >
                      {format(day, "d")}
                      {count > 0 && <span className="block text-[10px] text-[var(--gut-green)]">{count} ✓</span>}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-sm font-medium mb-2">Log doses for {format(selectedDate, "MMM d")}</p>
                <div className="flex flex-wrap gap-2">
                  {planBlocks.map((b) => {
                    const entry = dosesForDay.find((e) => e.planBlockId === b.id);
                    const taken = entry?.taken ?? false;
                    return (
                      <Button
                        key={b.id}
                        variant={taken ? "default" : "secondary"}
                        size="sm"
                        onClick={() =>
                          logDose({
                            date: dateStr,
                            planBlockId: b.id,
                            refId: b.refId,
                            label: b.label,
                            taken: !taken,
                          })
                        }
                      >
                        {b.label} {taken ? "✓" : ""}
                      </Button>
                    );
                  })}
                  {planBlocks.length === 0 && (
                    <p className="text-sm text-[var(--foreground)]/60">Add peptides in Builder to log doses.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biomarkers" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Biomarker timeline</CardTitle>
              <p className="text-sm text-[var(--foreground)]/70">N-of-1 before/after</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <RechartsLine data={biomarkerLogs} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add biomarker value</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Input
                placeholder="Biomarker (e.g. HbA1c)"
                value={newBiomarker.name}
                onChange={(e) => setNewBiomarker((s) => ({ ...s, name: e.target.value }))}
                className="max-w-[180px]"
              />
              <Input
                placeholder="Value"
                value={newBiomarker.value}
                onChange={(e) => setNewBiomarker((s) => ({ ...s, value: e.target.value }))}
                className="max-w-[100px]"
              />
              <Input
                type="date"
                value={newBiomarker.date}
                onChange={(e) => setNewBiomarker((s) => ({ ...s, date: e.target.value }))}
                className="max-w-[140px]"
              />
              <Button
                onClick={() => {
                  const v = parseFloat(newBiomarker.value);
                  if (newBiomarker.name && !isNaN(v)) {
                    addBiomarkerLog({
                      date: newBiomarker.date,
                      biomarkerId: newBiomarker.name,
                      biomarkerName: newBiomarker.name,
                      value: v,
                    });
                    setNewBiomarker({ name: "", value: "", date: format(new Date(), "yyyy-MM-dd") });
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Symptom journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="How are you feeling?"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addSymptom({ date: format(new Date(), "yyyy-MM-dd"), text: symptomText });
                      setSymptomText("");
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (symptomText.trim()) {
                      addSymptom({ date: format(new Date(), "yyyy-MM-dd"), text: symptomText.trim() });
                      setSymptomText("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {symptomEntries.slice(-20).reverse().map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm">
                    <span>{e.text}</span>
                    <span className="text-[var(--foreground)]/60 text-xs">{e.date}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSymptom(e.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Re-test alerts</CardTitle>
              <p className="text-sm text-[var(--foreground)]/70">From protocol biomarker gates</p>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-[var(--foreground)]/70">No pending re-tests. Add biomarker gates in your protocol.</p>
              ) : (
                <ul className="space-y-2">
                  {activeAlerts.map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-[var(--card-border)] px-3 py-2">
                      <span className="text-sm">{a.biomarkerName} — due {a.dueDate}</span>
                      <Button variant="ghost" size="sm" onClick={() => dismissRetestAlert(a.id)}>Dismiss</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
