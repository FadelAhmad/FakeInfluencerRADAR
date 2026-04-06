Fake Influencer Radar — Finalized Repo

Overview
- Frontend: Next.js app (root). Deploy to Vercel.
- Backend: FastAPI app (backend_main.py). Deploy separately (Render/Railway/Heroku) and set API_URL for the frontend.

Before pushing
1. Review and populate .env (do NOT commit secrets). Copy .env.example -> .env and add TG_HOST, TG_GRAPH, TG_TOKEN.
2. Ensure .gitignore contains .env and .env.local (it does).

Local testing
- Backend (Python):
  python -m venv .venv
  .venv\Scripts\activate
  python -m pip install -r requirements-backend.txt
  uvicorn backend_main:app --reload --port 8000

- Frontend (Next.js):
  npm install
  npm run dev

Deploying frontend to Vercel (recommended)
1. Push this repository to GitHub.
2. Go to https://vercel.com, Import Project -> select this GitHub repo.
3. Vercel will auto-detect Next.js. In Project Settings -> Environment Variables, add:
   - API_URL = https://<YOUR_BACKEND_URL> (e.g., https://my-backend.onrender.com)
4. Deploy. Vercel will build and host the frontend.

Deploying backend (example using Render)
1. Go to https://render.com, Create -> New Service -> Web Service.
2. Connect your GitHub repo and pick the branch.
3. Choose "Docker" or "Dockerfile" and use Dockerfile.backend, or choose "Python" and specify a start command:
   uvicorn backend_main:app --host 0.0.0.0 --port 8000
4. Add Environment Variables in the Render UI:
   - TG_HOST, TG_GRAPH, TG_TOKEN
5. Deploy. Note the backend public URL and set it as API_URL in Vercel.

Alternative backend hosts: Railway, Fly.io, Heroku. If you prefer a serverless Python host, a rewrite of the backend as Node serverless functions would be required.

CI / GitHub Actions (optional)
- If you want automated builds, ask and a GitHub Actions workflow can be added to build and deploy images or run tests.

Security
- Do NOT commit .env with secrets. Use the platform environment variables.
- The repository has the notebook sanitized. Remove it locally if you have sensitive history.

If you want, I can:
- Add a GitHub Actions workflow that deploys the frontend to Vercel automatically.
- Create a Render or Railway blueprint (service definition) for one-click backend deploy.

