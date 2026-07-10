# RideFare 🚖

**Global AI Hackathon with Qwen Cloud — Track 3: Agent Society**

RideFare is a multi-agent ride-hailing negotiation system. Instead of one algorithm sorting prices, RideFare models each ride provider — Uber, Lyft, Waymo, Robotaxi — as an independent agent with its own pricing logic. A **Coordinator Agent** powered by Qwen Cloud negotiates across their competing bids against a rider's stated needs and produces a ranked, explainable recommendation.

## Architecture

Please see `docs/RideFare_PRD.md` for full details. 

*(Note: The final architecture diagram in `docs/architecture-diagram.png` will visually match the structure laid out in PRD Section 5).*

## Repository Structure

- `frontend/`: Next.js web application recreating the Uber.com-style input flow and live negotiation trace.
- `backend/`: FastAPI Python backend hosting the Provider, Constraint, and Coordinator Agents.
- `infra/`: Alibaba Cloud ECS deployment scripts and instructions.
- `docs/`: PRD, Architecture Diagram, and Benchmark Results.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file at the root of the project with your Qwen Cloud (DashScope) API Key:
```env
QWEN_API_KEY=your_key_here
```

### 2. Backend (FastAPI)
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic requests

# Run the server
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Access the application at [http://localhost:3000](http://localhost:3000).

## Benchmark

A benchmark harness evaluates the RideFare Multi-Agent Coordinator against a Single-Agent Baseline.
To run the benchmark (requires a valid `QWEN_API_KEY`):

```bash
export $(grep -v '^#' .env | xargs) && python3 backend/benchmark/run.py
```
This will output results to `docs/benchmark_results.md`.

*Currently, the generated results demonstrate that the multi-agent system produces zero constraint violations compared to the baseline single-agent LLM.*
