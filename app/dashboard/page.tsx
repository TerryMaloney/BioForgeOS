"use client";

import Link from "next/link";
import { seedData } from "@/lib/seedData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const currentPlan = useStore((s) => s.currentPlan);
  const blockCount = currentPlan?.phases.reduce((acc, p) => acc + p.blocks.length, 0) ?? 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Gut Command Center
        </h1>
        <p className="text-[var(--foreground)]/80">
          Build and track your personalized biohacking protocol. Gut = CPU, peptides = software upgrades.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seedData.missionModes.map((mode, i) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full transition-colors hover:border-[var(--gut-green)]/40">
              <CardHeader className="pb-2">
                <span className="text-2xl" role="img" aria-hidden>{mode.icon}</span>
                <CardTitle className="text-lg">{mode.name}</CardTitle>
                <CardDescription>Mission mode</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/builder">
                  <Button variant="secondary" size="sm" className="w-full">
                    Use in Builder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl border border-[var(--card-border)] p-6"
      >
        <h2 className="mb-4 text-xl font-semibold">Quick stats</h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-2xl font-bold text-[var(--gut-green)]">{blockCount}</p>
            <p className="text-sm text-[var(--foreground)]/70">Blocks in current plan</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--energy-blue)]">{seedData.peptides.length}</p>
            <p className="text-sm text-[var(--foreground)]/70">Peptides in library</p>
          </div>
        </div>
        <Link href="/builder" className="mt-4 inline-block">
          <Button size="lg">Open Builder Canvas</Button>
        </Link>
      </motion.section>
    </div>
  );
}
