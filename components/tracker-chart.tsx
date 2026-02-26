"use client";

import type { BiomarkerLog } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: BiomarkerLog[];
}

function groupByBiomarker(logs: BiomarkerLog[]) {
  const byName: Record<string, { date: string; value: number }[]> = {};
  logs.forEach((l) => {
    if (!byName[l.biomarkerName]) byName[l.biomarkerName] = [];
    byName[l.biomarkerName].push({ date: l.date, value: l.value });
  });
  const dates = [...new Set(logs.map((l) => l.date))].sort();
  return dates.map((date) => {
    const point: Record<string, number | string> = { date };
    Object.keys(byName).forEach((name) => {
      const entry = byName[name].find((e) => e.date === date);
      point[name] = entry?.value ?? "";
    });
    return point;
  });
}

export function BiomarkerChart({ data }: Props) {
  const chartData = groupByBiomarker(data);
  const names = [...new Set(data.map((d) => d.biomarkerName))];
  const colors = ["#22c55e", "#3b82f6", "#f97316", "#a855f7"];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--foreground)]/50 text-sm">
        Add biomarker values in Tracker to see your timeline.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "var(--card-glass)", border: "1px solid var(--card-border)" }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend />
        {names.slice(0, 4).map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
