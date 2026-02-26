"use client";

import dynamic from "next/dynamic";

const ClientBuilder = dynamic(() => import("@/components/ClientBuilder"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-[var(--foreground)]/70">Loading builder...</p>
    </div>
  ),
});

export default function ClientBuilderWrapper() {
  return <ClientBuilder />;
}
