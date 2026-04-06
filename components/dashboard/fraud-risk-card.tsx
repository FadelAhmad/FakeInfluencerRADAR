"use client";

import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { InfluencerScore } from "@/lib/api";

interface FraudRiskCardProps {
  data: InfluencerScore | null;
  isLoading: boolean;
}

function getRiskConfig(riskLevel: string) {
  switch (riskLevel) {
    case "low":
      return {
        color: "text-risk-low",
        bgColor: "bg-risk-low/10",
        borderColor: "border-risk-low/30",
        icon: ShieldCheck,
        label: "Low Risk",
        gaugeColor: "#4ade80",
      };
    case "medium":
      return {
        color: "text-risk-medium",
        bgColor: "bg-risk-medium/10",
        borderColor: "border-risk-medium/30",
        icon: Shield,
        label: "Medium Risk",
        gaugeColor: "#facc15",
      };
    case "high":
      return {
        color: "text-risk-high",
        bgColor: "bg-risk-high/10",
        borderColor: "border-risk-high/30",
        icon: ShieldAlert,
        label: "High Risk",
        gaugeColor: "#f97316",
      };
    case "critical":
      return {
        color: "text-risk-critical",
        bgColor: "bg-risk-critical/10",
        borderColor: "border-risk-critical/30",
        icon: ShieldX,
        label: "Critical Risk",
        gaugeColor: "#ef4444",
      };
    default:
      return {
        color: "text-muted-foreground",
        bgColor: "bg-muted/10",
        borderColor: "border-muted/30",
        icon: Shield,
        label: "Unknown",
        gaugeColor: "#6b7280",
      };
  }
}

function GaugeChart({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const rotation = (percentage / 100) * 180;

  return (
    <div className="relative w-48 h-24 mx-auto">
      {/* Background arc */}
      <svg
        className="w-full h-full"
        viewBox="0 0 200 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinecap="round"
          className="text-secondary"
        />
        {/* Colored progress */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Needle */}
      <div
        className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
      >
        <div
          className="w-1 h-16 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {/* Center circle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <div
          className="w-6 h-6 rounded-full border-4"
          style={{ borderColor: color, backgroundColor: "var(--card)" }}
        />
      </div>
      {/* Score display */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>
          {score.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

export function FraudRiskCard({ data, isLoading }: FraudRiskCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-48 mx-auto rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            Fraud Risk Analysis
          </CardTitle>
          <CardDescription>
            Enter an influencer ID to analyze their fraud risk score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = getRiskConfig(data.risk_level);
  const Icon = config.icon;

  return (
    <Card className={`border-border/50 ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          Fraud Risk Analysis
        </CardTitle>
        <CardDescription>
          User ID: <span className="font-mono text-foreground">{data.user_id}</span>
          {data.username && (
            <span className="ml-2">(@{data.username})</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GaugeChart score={data.fraud_score} color={config.gaugeColor} />
        
        <div className="flex items-center justify-center">
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${config.bgColor} ${config.color}`}
          >
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          {data.followers_count !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold font-mono">
                {data.followers_count.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          )}
          {data.engagement_rate !== undefined && (
            <div className="text-center">
              <p className="text-2xl font-bold font-mono">
                {(data.engagement_rate * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">Engagement Rate</p>
            </div>
          )}
        </div>

        {data.suspicious_indicators && data.suspicious_indicators.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-risk-high" />
              Suspicious Indicators
            </p>
            <ul className="space-y-1">
              {data.suspicious_indicators.map((indicator, index) => (
                <li
                  key={index}
                  className="text-xs text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-risk-high mt-1">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
