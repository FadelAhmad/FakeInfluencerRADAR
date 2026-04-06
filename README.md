🛡️ Fake Influencer Radar (FIR)
Graph-Powered Fraud Detection for the Creator Economy
Fake Influencer Radar is an advanced analytics platform designed to detect fraudulent activity in social media ecosystems. Unlike traditional tools that only look at follower counts, FIR analyzes the underlying network topology to identify automated bot networks and engagement pods.

🚀 The Problem
The influencer marketing industry is built on a foundation of trust that is being eroded. Brands lose millions every year to:

* Engagement Pods: Closed-loop groups that artificially boost each other's metrics.

* Bot Networks: Automated accounts providing "Fast Engagement" (likes/comments within seconds).

* Network Manipulation: Fraudulent accounts that have no organic connection to an influencer's niche.

🧠 The Tech Stack
Frontend: Next.js (Tailwind CSS + v0) — A high-performance, dark-themed security dashboard.

Backend: FastAPI (Python) — Asynchronous API for real-time fraud scoring.

Database: TigerGraph — The core engine. We use GSQL for deep-link analysis to find "cliques" and hidden relationship patterns.

Deployment: Vercel (Frontend) & Railway (Backend).

📊 TigerGraph & Graph Logic
We leverage TigerGraph's massive parallel processing to move beyond surface-level data. Our system treats every interaction as a weighted relationship:

Vertices: User accounts represented as nodes in a global network.

Edges: Engagement patterns (likes, comments, follows) between those nodes.

Cluster Detection: We identify "Closed Communities" where a group of users only interacts with each other.

Edge Strength: We calculate "Risk Scores" based on interaction frequency and the speed of engagement.

🏆 Key Features
Real-time Fraud Score: Instant risk calculation for any influencer ID.

Engagement Pod Radar: Mapping the "hidden" relationships that prove collusion.

Fast Engager Detection: Identifying bots based on suspiciously rapid interaction times.

Live Network Insights: Direct visualization of the sub-graph data fetched from the TigerGraph engine.

Built with ❤️ for the TigerGraph Hackathon.