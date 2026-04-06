"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Radar, Shield, AlertTriangle, Activity } from "lucide-react";
import { SearchBar } from "@/components/dashboard/search-bar";
import { FraudRiskCard } from "@/components/dashboard/fraud-risk-card";
import { HighRiskFeed } from "@/components/dashboard/high-risk-feed";
import { PodNetworkCard } from "@/components/dashboard/pod-network-card";
import { FastEngagersCard } from "@/components/dashboard/fast-engagers-card";
import { ServiceStatusBadge } from "@/components/dashboard/service-status-badge";
import {
  getInfluencerScore,
  getFastEngagers,
  getHighRisk,
  getPodNetwork,
  type InfluencerScore,
  type FastEngager,
  type HighRiskInfluencer,
  type PodNetwork,
} from "@/lib/api";

export default function DashboardPage() {
  // State for influencer score
  const [influencerData, setInfluencerData] = useState<InfluencerScore | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // State for fast engagers
  const [fastEngagersData, setFastEngagersData] = useState<FastEngager[]>([]);
  const [isLoadingEngagers, setIsLoadingEngagers] = useState(false);

  // State for high-risk feed
  const [highRiskData, setHighRiskData] = useState<HighRiskInfluencer[]>([]);
  const [isLoadingHighRisk, setIsLoadingHighRisk] = useState(true);

  // State for pod network
  const [podNetworkData, setPodNetworkData] = useState<PodNetwork | null>(null);
  const [isLoadingPodNetwork, setIsLoadingPodNetwork] = useState(false);

  // Current searched user
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch high-risk feed on mount
  const fetchHighRisk = useCallback(async () => {
    setIsLoadingHighRisk(true);
    try {
      const data = await getHighRisk();
      setHighRiskData(data);
    } catch (error) {
      toast.error("Failed to load high-risk feed", {
        description: error instanceof Error ? error.message : "Connection error",
      });
    } finally {
      setIsLoadingHighRisk(false);
    }
  }, []);

  useEffect(() => {
    fetchHighRisk();
  }, [fetchHighRisk]);

  // Handle search
  const handleSearch = async (userId: string) => {
    setCurrentUserId(userId);
    setIsLoadingScore(true);
    setIsLoadingEngagers(true);
    setIsLoadingPodNetwork(true);

    // Fetch influencer score and fast engagers simultaneously
    const scorePromise = getInfluencerScore(userId);
    const engagersPromise = getFastEngagers(userId);
    const podNetworkPromise = getPodNetwork(userId);

    // Handle influencer score
    scorePromise
      .then((data) => {
        setInfluencerData(data);
        if (data.risk_level === "critical" || data.risk_level === "high") {
          toast.warning("High Risk Detected", {
            description: `User ${userId} has a fraud score of ${data.fraud_score.toFixed(0)}%`,
            icon: <AlertTriangle className="h-4 w-4" />,
          });
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch influencer score", {
          description: error instanceof Error ? error.message : "API error",
        });
        setInfluencerData(null);
      })
      .finally(() => {
        setIsLoadingScore(false);
      });

    // Handle fast engagers
    engagersPromise
      .then((data) => {
        setFastEngagersData(data);
      })
      .catch((error) => {
        toast.error("Failed to fetch fast engagers", {
          description: error instanceof Error ? error.message : "API error",
        });
        setFastEngagersData([]);
      })
      .finally(() => {
        setIsLoadingEngagers(false);
      });

    // Handle pod network
    podNetworkPromise
      .then((data) => {
        setPodNetworkData(data);
        if (data.pod_clusters && data.pod_clusters.length > 0) {
          toast.info("Pod Network Detected", {
            description: `Found ${data.pod_clusters.length} engagement pod cluster(s)`,
          });
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch pod network", {
          description: error instanceof Error ? error.message : "API error",
        });
        setPodNetworkData(null);
      })
      .finally(() => {
        setIsLoadingPodNetwork(false);
      });
  };

  const isSearching = isLoadingScore || isLoadingEngagers || isLoadingPodNetwork;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radar className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-risk-high rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Fake Influencer Radar
                </h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Fraud Detection System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ServiceStatusBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Analyze Influencer Authenticity
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Enter an influencer&apos;s user ID to detect fake followers, engagement
              pods, and fraudulent activity patterns.
            </p>
          </div>
          <div className="flex justify-center">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
          {currentUserId && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              Analyzing:{" "}
              <span className="font-mono text-foreground">{currentUserId}</span>
            </p>
          )}
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {highRiskData.length}
              </p>
              <p className="text-xs text-muted-foreground">High Risk Accounts</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-risk-low/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-risk-low" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {influencerData ? `${influencerData.fraud_score.toFixed(0)}%` : "--"}
              </p>
              <p className="text-xs text-muted-foreground">Current Risk Score</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-risk-medium/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-risk-medium" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {fastEngagersData.length}
              </p>
              <p className="text-xs text-muted-foreground">Fast Engagers</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Radar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {podNetworkData?.connections?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Pod Connections</p>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fraud Risk */}
          <div className="lg:col-span-1">
            <FraudRiskCard data={influencerData} isLoading={isLoadingScore} />
          </div>

          {/* Middle Column - High Risk Feed */}
          <div className="lg:col-span-1">
            <HighRiskFeed
              data={highRiskData}
              isLoading={isLoadingHighRisk}
              onRefresh={fetchHighRisk}
            />
          </div>

          {/* Right Column - Fast Engagers */}
          <div className="lg:col-span-1">
            <FastEngagersCard data={fastEngagersData} isLoading={isLoadingEngagers} />
          </div>
        </section>

        {/* Pod Network Section */}
        <section className="mt-6">
          <PodNetworkCard data={podNetworkData} isLoading={isLoadingPodNetwork} />
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            Powered by TigerGraph &amp; Advanced ML Models
          </p>
          <p className="text-xs mt-1">
            Detecting fake influencers, engagement pods, and fraudulent activity
          </p>
        </footer>
      </main>
    </div>
  );
}
