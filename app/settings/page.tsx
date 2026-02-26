"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Smartphone, Database } from "lucide-react";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);

  const handlePWAInstall = () => {
    if (typeof window !== "undefined" && "BeforeInstallPromptEvent" in window) {
      (window as unknown as { deferredPrompt?: { prompt: () => Promise<void> } }).deferredPrompt?.prompt();
      setSettings({ pwaInstalled: true });
    } else {
      alert(
        "Add to Home Screen: On iOS Safari, tap Share → Add to Home Screen. On Android Chrome, tap menu (⋮) → Add to Home screen."
      );
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--foreground)]/70 text-sm">
          Supabase sync and PWA install.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" /> Supabase sync
          </CardTitle>
          <p className="text-sm text-[var(--foreground)]/70">
            When ON, plans and tracker data sync to Supabase. Add env vars in .env.local.
          </p>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Switch
            id="supabase-sync"
            checked={settings.supabaseSync}
            onCheckedChange={(checked) => setSettings({ supabaseSync: checked })}
          />
          <Label htmlFor="supabase-sync">Enable Supabase sync</Label>
        </CardContent>
        <CardContent className="pt-0">
          <p className="text-xs text-[var(--foreground)]/60">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local. Create a project at supabase.com, then copy the keys from Settings → API.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> PWA — Add to Home Screen
          </CardTitle>
          <p className="text-sm text-[var(--foreground)]/70">
            Install BioForgeOS on your phone for quick access and offline use.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={handlePWAInstall}>
            Add to Home Screen
          </Button>
          <p className="text-xs text-[var(--foreground)]/60 mt-2">
            iOS: Safari → Share → Add to Home Screen. Android: Chrome → menu (⋮) → Add to Home screen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
