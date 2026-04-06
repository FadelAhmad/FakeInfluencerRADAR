"use client";

import { Network, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PodNetwork } from "@/lib/api";

interface PodNetworkCardProps {
  data: PodNetwork | null;
  isLoading: boolean;
}

export function PodNetworkCard({ data, isLoading }: PodNetworkCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 border-accent/30 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-accent" />
          Engagement Pod Network
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Engagement pods are groups of users who artificially boost
                  each other&apos;s content through coordinated likes and comments.
                  This visualization shows detected pod relationships.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          TigerGraph-powered relationship analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-secondary/30 border border-border/30 p-4">
          <div className="mb-4 p-3 rounded-md bg-accent/10 border border-accent/20">
            <h4 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
              <Network className="h-4 w-4" />
              Graph Relationship Logic
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Vertices:</strong> User accounts represented as nodes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Edges:</strong> Engagement patterns (likes, comments, follows)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Clusters:</strong> Groups with abnormally high mutual engagement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Strength:</strong> Edge weight based on interaction frequency
                </span>
              </li>
            </ul>
          </div>

          {!data ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Network className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Search for a user to view their pod network</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">
                  Network Data for{" "}
                  <span className="font-mono text-primary">{data.user_id}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {data.connections?.length || 0} connections
                </span>
              </div>
              <ScrollArea className="h-[280px]">
                <pre className="text-xs font-mono p-3 rounded-md bg-background/50 border border-border/50 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </ScrollArea>
              {data.pod_clusters && data.pod_clusters.length > 0 && (
                <div className="mt-4 p-3 rounded-md bg-risk-high/10 border border-risk-high/20">
                  <p className="text-xs font-semibold text-risk-high mb-1">
                    {data.pod_clusters.length} Pod Cluster(s) Detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This user appears to be part of coordinated engagement groups.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
