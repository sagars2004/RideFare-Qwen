# RideFare

**Global AI Hackathon with Qwen Cloud — Track 3: Agent Society**

RideFare is a multi-agent ride-hailing negotiation system. Instead of one algorithm sorting prices, RideFare models each ride provider — Uber, Lyft, Waymo, Robotaxi — as an independent agent with its own pricing logic. A **Coordinator Agent** powered by Qwen Cloud negotiates across their competing bids against a rider's stated needs and produces a ranked, explainable recommendation.

---

## Live Demo & User Walkthrough

**For demo account credentials and live app URL, please refer to the **Testing Instructions** provided in my hackathon submission form for documentation.**

### How to test the full user flow:
1. **Log In:** Enter the demo credentials to access the active session.
2. **Submit Intent:** On the home screen, type an origin address (e.g., `4876 Norris Road, Fremont CA 94536`), a destination address (`780 S Airport Blvd, San Francisco, CA 94128`), and optionally, a complex natural language ride request (e.g., `"Under $40"`).
3. **Watch the Negotiation:** Click **"Find Ride"** and watch the right-hand **Negotiation Trace Panel**. You will see the Provider Agents submit bids, and the Coordinator Agent reject/rank them based on your constraints in real-time. Choose the recommended ride option or click on another of your choice that's available.
4. **View History:** Once a ride is booked, navigate to the account dashboard by clicking the top right corner tab (Demo User). On the left sidebar, click **"Recent Rides"** to see past rides and how previous manual overrides slowly influence the system's current recommendations.

---

## Tech Stack

### Languages & Core Web
* **Python** (Backend orchestration logic)
* **TypeScript** (Frontend component logic and types)
* **JavaScript / HTML5 / CSS3**

### Frameworks & Libraries
* **Next.js & React** (Frontend framework & UI library)
* **Tailwind CSS** (Utility-first styling framework)
* **FastAPI** (High-performance Python backend framework)
* **Framer Motion & Lucide React** (Animations & Icons)
* **Pydantic** (Data validation and schemas)
* **DashScope Python SDK** (Official Alibaba Cloud SDK for Qwen)
* **HTTPX / Requests / Websockets** (HTTP Clients & Real-time communication)

### AI Models & APIs
* **Qwen Cloud API (Qwen-Max / Qwen-Plus)** (Foundational models powering the Constraint and Coordinator agents)

### Cloud Platforms & Deployment
* **Alibaba Cloud ECS** (Elastic Compute Service)
* **Docker & Docker Compose** (Containerization and orchestration)

### Databases & Runtimes
* **Redis** (Memory database for session tracking)
* **Node.js & Uvicorn** (Frontend & Backend runtimes)

### Testing & Tooling
* **Playwright** (End-to-end testing)
* **ESLint** (Linting)
* **python-dotenv** (Environment variables)

---

## Architecture

Please see `docs/RideFare_PRD.md` for full details on how the multi-agent system orchestrates bids and constraints.

## Repository Structure

- `frontend/`: Next.js web application recreating the Uber.com-style input flow and live negotiation trace.
- `backend/`: FastAPI Python backend hosting the Provider, Constraint, and Coordinator Agents.
- `infra/`: Alibaba Cloud ECS deployment scripts and instructions.
- `docs/`: PRD, Architecture Diagram, and Benchmark Results.

---

## Local Setup Instructions

### 1. Environment Variables
Create a `.env` file at the root of the project with your Qwen Cloud (DashScope) API Key:
```env
QWEN_API_KEY=your_key_here
```

### 2. Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

### 3. Manual Setup (Alternative)

**Backend (FastAPI)**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev
```

---

## Benchmark

A benchmark harness evaluates the RideFare Multi-Agent Coordinator against a Single-Agent Baseline.
To run the benchmark (requires a valid `QWEN_API_KEY`):

```bash
export $(grep -v '^#' .env | xargs) && python3 backend/benchmark/run.py
```
This will output results to `docs/benchmark_results.md`.

*Currently, the generated results demonstrate that the multi-agent system produces zero constraint violations compared to the baseline single-agent LLM.*
