"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FolderOpen, Trash2, Copy, Loader } from "lucide-react";
import { format } from "date-fns";

export default function PlansPage() {
  const savedPlans = useStore((s) => s.savedPlans);
  const currentPlan = useStore((s) => s.currentPlan);
  const loadPlan = useStore((s) => s.loadPlan);
  const deletePlan = useStore((s) => s.deletePlan);
  const duplicatePlan = useStore((s) => s.duplicatePlan);

  const handleSaveCurrent = () => {
    const name = window.prompt("Plan name?", currentPlan?.name ?? "My Protocol");
    if (name) useStore.getState().saveCurrentPlan(name);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">My Plans</h1>
        <p className="text-[var(--foreground)]/70 text-sm">
          Saved protocols. Create new from Builder, duplicate, or load into Builder.
        </p>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Current plan</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/builder">Open in Builder</Link>
            </Button>
            <Button size="sm" onClick={handleSaveCurrent}>
              Save as new plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <p className="text-sm text-[var(--foreground)]/80">
              {currentPlan.name} — {currentPlan.phases.reduce((a, p) => a + p.blocks.length, 0)} blocks · updated{" "}
              {format(new Date(currentPlan.updatedAt), "MMM d, yyyy")}
            </p>
          ) : (
            <p className="text-sm text-[var(--foreground)]/60">No plan loaded. Build one in Builder.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Saved plans</h2>
        {savedPlans.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/60">No saved plans yet. Save your current plan to see it here.</p>
        ) : (
          <ul className="space-y-2">
            {savedPlans.map((plan) => (
              <motion.li
                key={plan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-xl border border-[var(--card-border)] p-4 flex items-center justify-between flex-wrap gap-2"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-[var(--foreground)]/60">
                    {plan.phases.reduce((a, p) => a + p.blocks.length, 0)} blocks · {format(new Date(plan.updatedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => loadPlan(plan.id)} asChild>
                    <Link href="/builder"><Loader className="h-4 w-4 mr-1" /> Load</Link>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => duplicatePlan(plan.id)}>
                    <Copy className="h-4 w-4 mr-1" /> Duplicate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
