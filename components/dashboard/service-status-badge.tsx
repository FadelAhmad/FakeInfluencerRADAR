"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getServiceStatus, type ServiceStatus } from "@/lib/api";

export function ServiceStatusBadge() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await getServiceStatus();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
        <XCircle className="h-3 w-3" />
        <span>API Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-risk-low/10 text-risk-low text-xs border border-risk-low/20">
      <CheckCircle className="h-3 w-3" />
      <span>API Online</span>
      {status.version && (
        <span className="text-muted-foreground">v{status.version}</span>
      )}
    </div>
  );
}
