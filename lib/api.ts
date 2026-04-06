// Use local proxy to avoid CORS issues with ngrok
const API_BASE_URL = "/api/proxy";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return response.json();
}

export interface ServiceStatus {
  status: string;
  version?: string;
  message?: string;
}

export interface InfluencerScore {
  user_id: string;
  username?: string;
  fraud_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  followers_count?: number;
  engagement_rate?: number;
  suspicious_indicators?: string[];
}

export interface HighRiskInfluencer {
  user_id: string;
  username: string;
  fraud_score: number;
  risk_level: string;
  flagged_at?: string;
  reason?: string;
}

export interface PodNetwork {
  user_id: string;
  connections: Array<{
    user_id: string;
    username?: string;
    connection_type: string;
    strength?: number;
  }>;
  pod_clusters?: Array<{
    cluster_id: string;
    members: string[];
  }>;
  raw_data?: Record<string, unknown>;
}

export interface FastEngager {
  user_id: string;
  username: string;
  avg_response_time_seconds: number;
  engagement_count: number;
  suspicion_level: string;
}

export interface OverlapResult {
  user_a: string;
  user_b: string;
  overlap_percentage: number;
  shared_followers: number;
  shared_engagers: number;
  suspicious: boolean;
}

export async function getServiceStatus(): Promise<ServiceStatus> {
  const response = await fetch(`${API_BASE_URL}/status`);
  return handleResponse<ServiceStatus>(response);
}

export async function getInfluencerScore(
  userId: string
): Promise<InfluencerScore> {
  const response = await fetch(`${API_BASE_URL}/score/${userId}`);
  return handleResponse<InfluencerScore>(response);
}

export async function getHighRisk(): Promise<HighRiskInfluencer[]> {
  const response = await fetch(`${API_BASE_URL}/influencers/high-risk`);
  const data = await handleResponse<{ count?: number; results?: HighRiskInfluencer[] }>(response);
  return data.results || [];
}

export async function getPodNetwork(userId: string): Promise<PodNetwork> {
  const response = await fetch(`${API_BASE_URL}/pod/${userId}`);
  return handleResponse<PodNetwork>(response);
}

export async function getFastEngagers(userId: string): Promise<FastEngager[]> {
  const response = await fetch(
    `${API_BASE_URL}/influencers/fast-engagers/${userId}`
  );
  const data = await handleResponse<{ count?: number; results?: FastEngager[] }>(response);
  return data.results || [];
}

export async function getOverlap(
  userA: string,
  userB: string
): Promise<OverlapResult | null> {
  const params = new URLSearchParams({ userA, userB });
  const response = await fetch(
    `${API_BASE_URL}/influencers/overlap?${params.toString()}`
  );
  const data = await handleResponse<{ results?: OverlapResult[] }>(response);
  return data.results && data.results.length > 0 ? data.results[0] : null;
}
