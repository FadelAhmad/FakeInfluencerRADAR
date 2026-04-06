import os
from typing import Any, Dict, List
import requests as req
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Optional: load .env file when present (do not commit secrets to repo)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

TG_HOST = os.getenv("TG_HOST")
TG_GRAPH = os.getenv("TG_GRAPH")
TG_TOKEN = os.getenv("TG_TOKEN") or os.getenv("TOKEN")

TG_HEADERS = {"Authorization": f"Bearer {TG_TOKEN}"} if TG_TOKEN else {}

app = FastAPI(title="FIR Backend - Real Logic")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_config():
    missing = []
    if not TG_HOST:
        missing.append("TG_HOST")
    if not TG_GRAPH:
        missing.append("TG_GRAPH")
    if not TG_TOKEN:
        missing.append("TG_TOKEN")
    if missing:
        raise HTTPException(status_code=500, detail=f"Missing required environment variables: {', '.join(missing)}")


def call_tg_query(query_name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
    if params is None:
        params = {}
    ensure_config()
    url = f"{TG_HOST}/restpp/query/{TG_GRAPH}/{query_name}"
    try:
        resp = req.get(url, headers=TG_HEADERS, params=params, timeout=15)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Request to TigerGraph failed: {e}")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"TigerGraph error: {resp.status_code} - {resp.text}")
    return resp.json()


def compute_fraud_score(post_count: int, repeat_engager_count: int, total_repeat_engagements: int) -> float:
    if post_count == 0:
        return 0.0
    repeat_ratio = repeat_engager_count / max(post_count, 1)
    engagement_density = (total_repeat_engagements / repeat_engager_count) if repeat_engager_count > 0 else 0
    score = min(1.0, ((repeat_ratio * 0.6) + (engagement_density * 0.4)) / 10)
    return round(score, 3)


def risk_level(score: float) -> str:
    # Accepts score as a percentage (0-100) or 0-1 depending on caller; normalize if needed
    try:
        s = float(score)
    except Exception:
        return "low"
    # if 0 <= s <= 1, scale to 0-100
    if s <= 1:
        s = s * 100
    if s >= 90:
        return "critical"
    if s >= 70:
        return "high"
    if s >= 40:
        return "medium"
    return "low"


@app.get("/", summary="Verify API service status")
def root():
    return {"status": "Fake Influencer Radar is running"}


@app.get("/status", summary="Service status")
def status():
    return {"status": "ok", "version": "0.1.0", "message": "Backend running"}


@app.get("/score/{user_id}", summary="Get influencer profile and fraud risk")
def score_influencer(user_id: str):
    ensure_config()
    url = f"{TG_HOST}/restpp/graph/{TG_GRAPH}/vertices/User/{user_id}"
    try:
        resp = req.get(url, headers=TG_HEADERS, timeout=10)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    data = resp.json()
    if data.get("error") or not data.get("results"):
        raise HTTPException(status_code=404, detail="User not found")
    attrs = data["results"][0].get("attributes", {})
    return {
        "user_id":            user_id,
        "username":           attrs.get("username"),
        "fraud_score":        attrs.get("risk_score"),
        "authenticity_score": attrs.get("authenticity_score"),
        "account_type":       attrs.get("account_type"),
        "risk_level":         risk_level(attrs.get("risk_score", 0)),
        "follower_count":     attrs.get("follower_count"),
        "platform":           attrs.get("platform"),
        "country":            attrs.get("country"),
    }


@app.get("/influencers/high-risk", summary="Get high-risk influencers")
def high_risk_influencers(min_risk_score: float = Query(70.0), limit: int = Query(10)):
    raw = call_tg_query("find_active_influencers", {})
    results = raw.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No data found")
    users = results[0].get("Active", [])
    high_risk = [
        {
            "user_id":            u["v_id"],
            "username":           u["attributes"].get("username"),
            "fraud_score":        u["attributes"].get("risk_score"),
            "authenticity_score": u["attributes"].get("authenticity_score"),
            "account_type":       u["attributes"].get("account_type"),
            "risk_level":         risk_level(u["attributes"].get("risk_score", 0)),
            "follower_count":     u["attributes"].get("follower_count", 0),
            "post_count":         u["attributes"].get("@postCount", 0),
            "engagement_count":   u["attributes"].get("@engagementCount", 0),
        }
        for u in users
        if u["attributes"].get("risk_score", 0) >= min_risk_score
    ]
    high_risk.sort(key=lambda x: x.get("fraud_score", 0), reverse=True)
    return {"count": len(high_risk), "results": high_risk[:limit]}


@app.get("/pod/{user_id}", summary="Get engagement pod network")
def pod_network(user_id: str):
    raw = call_tg_query("visualize_pod_network", {"targetUser": user_id})
    results = raw.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No data found for this user/post")
    parsed = {item_key: item_val for r in results for item_key, item_val in r.items()}
    return {
        "suspicious_count": len(parsed.get("Suspicious", [])),
        "pod_edge_count":   len(parsed.get("PodEdges", [])),
        "suspicious":  [{"user_id": u["v_id"], "risk_score": u["attributes"].get("risk_score"), "account_type": u["attributes"].get("account_type")} for u in parsed.get("Suspicious", [])],
        "pod_edges":   [{"user_id": u["v_id"]} for u in parsed.get("PodEdges", [])]
    }


@app.get("/influencers/fast-engagers/{user_id}", summary="Detect fast engagers")
def fast_engagers(user_id: str, max_seconds: int = 86400, min_touches: int = 1):
    raw = call_tg_query("detect_fast_engagers", {
        "targetUser": user_id,
        "maxSecondsAfterPost": max_seconds,
        "minFastTouches": min_touches
    })
    results = raw.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No data found for this user/post")
    users = results[0].get("Result", [])
    return {
        "count": len(users),
        "results": [
            {
                "user_id": u.get("v_id"),
                "username": u.get("attributes", {}).get("username"),
                "fraud_score": u.get("attributes", {}).get("risk_score"),
                "authenticity_score": u.get("attributes", {}).get("authenticity_score"),
                "account_type": u.get("attributes", {}).get("account_type"),
                "risk_level": risk_level(u.get("attributes", {}).get("risk_score", 0)),
                "follower_count": u.get("attributes", {}).get("follower_count"),
                "fast_touch_count": u.get("attributes", {}).get("@fastTouchCount", 0)
            }
            for u in users
        ]
    }


@app.get("/influencers/overlap", summary="Compare influencer audience overlap")
def influencer_overlap(userA: str = Query(...), userB: str = Query(...)):
    raw = call_tg_query("compare_influencer_overlap", {"userA": userA, "userB": userB})
    return {"results": raw.get("results", [])}
