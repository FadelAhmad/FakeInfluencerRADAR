"use client";

import { Zap, User, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FastEngager } from "@/lib/api";

interface FastEngagersCardProps {
  data: FastEngager[];
  isLoading: boolean;
}

function getSuspicionBadge(level: string) {
  switch (level.toLowerCase()) {
    case "high":
      return "bg-risk-high/20 text-risk-high border-risk-high/30";
    case "medium":
      return "bg-risk-medium/20 text-risk-medium border-risk-medium/30";
    case "low":
      return "bg-risk-low/20 text-risk-low border-risk-low/30";
    default:
      return "bg-muted/20 text-muted-foreground border-muted/30";
  }
}

function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

export function FastEngagersCard({ data, isLoading }: FastEngagersCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-risk-medium" />
          Fast Engagers
        </CardTitle>
        <CardDescription>
          Users with suspiciously fast engagement times
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Zap className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No fast engagers detected</p>
            <p className="text-xs">Search for a user to analyze their engagers</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-3">
              {data.map((engager, index) => (
                <div
                  key={engager.user_id || index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      @{engager.username}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatResponseTime(engager.avg_response_time_seconds)} avg
                      </span>
                      <span>{engager.engagement_count} engagements</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getSuspicionBadge(engager.suspicion_level)}`}
                  >
                    {engager.suspicion_level}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
