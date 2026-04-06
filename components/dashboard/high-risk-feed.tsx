"use client";

import { AlertTriangle, User, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HighRiskInfluencer } from "@/lib/api";

interface HighRiskFeedProps {
  data: HighRiskInfluencer[];
  isLoading: boolean;
  onRefresh: () => void;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getRiskBadgeClass(score: number): string {
  if (score >= 90) return "bg-risk-critical/20 text-risk-critical border-risk-critical/30";
  if (score >= 75) return "bg-risk-high/20 text-risk-high border-risk-high/30";
  if (score >= 50) return "bg-risk-medium/20 text-risk-medium border-risk-medium/30";
  return "bg-risk-low/20 text-risk-low border-risk-low/30";
}

export function HighRiskFeed({ data, isLoading, onRefresh }: HighRiskFeedProps) {
  return (
    <Card className="border-border/50 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-risk-high" />
            High-Risk Feed
          </CardTitle>
          <CardDescription>
            Recently flagged suspicious accounts
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh high-risk feed</span>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No high-risk influencers detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((influencer, index) => (
                <div
                  key={influencer.user_id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        @{influencer.username}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getRiskBadgeClass(influencer.fraud_score)}`}
                      >
                        {influencer.fraud_score.toFixed(0)}%
                      </span>
                    </div>
                    {influencer.reason && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {influencer.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">{influencer.user_id}</span>
                      {influencer.flagged_at && (
                        <>
                          <span>•</span>
                          <span>{formatTimeAgo(influencer.flagged_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
