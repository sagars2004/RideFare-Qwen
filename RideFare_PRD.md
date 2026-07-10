# RideFare — Product Requirements Document

**Global AI Hackathon with Qwen Cloud — Track 3: Agent Society**

---

## 1. Elevator Pitch

RideFare is a multi-agent ride-hailing negotiation system. Instead of one algorithm sorting prices, RideFare models each ride provider — Uber, Lyft, Waymo, Robotaxi — as an independent agent with its own pricing logic, confidence, and constraints. A Coordinator Agent negotiates across their competing bids against a rider's stated needs (arrival deadline, comfort preferences, trust in autonomous vehicles) and produces a ranked, explainable recommendation — resolving disagreements between agents the way a human dispatcher would, not just picking the lowest number in a column.

**One-liner:** *Riding fair — a society of agents that argue over your ride so you don't have to check four apps.*

---

## 2. Product Overview

### 2.1 Problem

Riders comparing Uber, Lyft, Waymo, and Robotaxi today have to open four separate apps, mentally normalize price/ETA/vehicle-type differences, and make a judgment call — usually under time pressure. Existing aggregator apps (e.g., Hackney) solve the *display* problem — showing all four side by side — but still leave the *decision* to the human, and treat every quote as static and non-negotiable.

### 2.2 Solution

RideFare treats ride selection as a multi-agent coordination problem:

- Each provider is represented by an autonomous **Provider Agent** that owns its own quote logic, can flag uncertainty (e.g., "high service demand," "quote may be stale"), and argues for itself.
- A **Constraint Agent** translates natural-language rider intent ("I need to be there by 7:15, don't put me in a Robotaxi at night") into structured hard/soft constraints.
- A **Coordinator Agent** runs an actual negotiation round: collecting bids, checking them against constraints, detecting conflicts (stale quotes, tied bids under different framings, surge spikes), and producing a final decision with a visible, human-readable justification trace.
- A lightweight **Memory Agent** logs accepted vs. overridden recommendations across sessions, so RideFare's picks get quietly more aligned with the rider's revealed preferences over time.

### 2.3 Why This Matters for Track 3

Track 3 asks for: task decomposition & role assignment, disagreement/conflict resolution, and a measurable efficiency gain over a single-agent baseline. RideFare is architected explicitly around these three asks rather than bolting them on after the fact — see Section 6.

---

## 3. Target Users & Use Cases

**Primary persona:** Urban 20s–30s professional/commuter (NJ/NYC-style), price- and time-sensitive, uses multiple ride apps already, values transparency over blind automation.

### Use Cases

1. **Everyday commute** — Rider is running slightly late for work; wants the fastest option that still fits budget. Coordinator weights ETA over price.
2. **Late-night ride home** — Rider has stated they don't trust Robotaxi/AV options after dark. Constraint Agent enforces this as a hard constraint even if Robotaxi is cheapest.
3. **Budget-conscious weekend trip** — Rider explicitly wants cheapest regardless of wait time. Coordinator deprioritizes ETA.
4. **Group ride** — 4 riders, need a vehicle type that fits; Provider Agents that can't satisfy capacity are excluded from bidding entirely.
5. **Surge/conflict scenario** — Two providers appear tied as "best" under different framings (Lyft cheapest overall, Waymo cheapest per comfort tier); Coordinator must arbitrate and explain the tie-break.
6. **Returning rider** — On a rider's 5th session, RideFare has learned they consistently override "cheapest" picks in favor of Uber before 9am; Memory Agent surfaces this as a soft prior without being asked.

---

## 4. Features

### 4.1 Core (MVP — must ship)

- Uber.com-style input flow: pickup/dropoff address entry, "Now" vs. scheduled time, rider count.
- Simulated live quote feed for 4 providers (Uber, Lyft, Waymo, Robotaxi), each with price, ETA, vehicle type, and a confidence/demand flag.
- Constraint Agent: parses free-text rider intent into structured constraints (arrival deadline, AV trust, budget ceiling, comfort tier).
- Coordinator Agent: runs the negotiation, ranks options, returns a recommendation + natural-language rationale.
- **Visible negotiation trace UI** — a running log of agent "arguments" (e.g., "Waymo Agent: flagging high demand, price may increase"; "Coordinator: overriding Robotaxi bid, violates AV-trust constraint") shown to the user, not hidden in logs. This is the single most important demo asset for Track 3 judging.
- Ranked ride list UI replicating Uber.com's layout (Share / Taxi / Wait & Save / Standard tier with radio-button provider selection / Electric / XL).

### 4.2 Secondary (stretch, time-permitting)

- Memory Agent: persists accepted/overridden picks across sessions, adjusts soft-preference weights.
- Efficiency benchmark dashboard: side-by-side RideFare vs. single-agent-baseline results over N synthetic scenarios, with $ saved / min saved / constraint-violation-rate metrics displayed in-app.
- "Re-negotiate" button: forces Coordinator to re-run when a quote is user-flagged as stale.
- One-tap booking confirmation (light Track-4-flavored touch, not a pivot).

### 4.3 Explicitly Out of Scope

- Real Uber/Lyft/Waymo API integration (gated/enterprise-only) — quotes are realistically simulated.
- Payment processing.
- Real-time GPS routing (mocked ETAs based on distance heuristics).

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│   Uber.com-style input flow + ranked results + negotiation  │
│   trace panel                                                │
└───────────────────────┬───────────────────────────────────────┘
                         │ REST/WebSocket
┌───────────────────────▼───────────────────────────────────────┐
│              Orchestration Service (Python, FastAPI)         │
│              Deployed on Alibaba Cloud ECS                    │
│                                                                │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│   │Uber Agent  │  │Lyft Agent  │  │Waymo Agent │  │Robotaxi│ │
│   │(bid gen)   │  │(bid gen)   │  │(bid gen)   │  │Agent   │ │
│   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └───┬────┘ │
│         └────────────────┴──────┬─────────┴─────────────┘    │
│                                  ▼                             │
│                    ┌─────────────────────────┐                │
│                    │   Constraint Agent       │                │
│                    │ (NL → structured rules)  │                │
│                    └─────────────┬────────────┘                │
│                                  ▼                             │
│                    ┌─────────────────────────┐                │
│                    │   Coordinator Agent      │                │
│                    │ (negotiate, rank,        │                │
│                    │  resolve conflicts,      │                │
│                    │  emit trace + rationale) │                │
│                    └─────────────┬────────────┘                │
│                                  ▼                             │
│                    ┌─────────────────────────┐                │
│                    │   Memory Agent (opt.)    │                │
│                    │ (session prefs, Redis/   │                │
│                    │  lightweight KV store)   │                │
│                    └─────────────────────────┘                │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │     Qwen Cloud       │
              │ (Qwen models power   │
              │  Constraint Agent    │
              │  parsing + Coordinator│
              │  negotiation/reasoning)│
              └──────────────────────┘
```

*(Build an actual visual diagram from this structure for submission — this text version is the blueprint.)*

---

## 6. Technical Stack & Implementation

### 6.1 Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js + Tailwind | Replicate Uber.com input/results UI |
| Orchestration | Python (FastAPI) | Hosts all agent logic, exposes REST/WebSocket endpoints |
| LLM reasoning | Qwen Cloud (Qwen-Max or Qwen-Plus for reasoning steps) | Constraint parsing, Coordinator negotiation & rationale generation |
| Provider bid simulation | Python (rule-based + randomized realistic variance) | Generates surge, ETA variance, stale-quote scenarios deliberately, so conflicts are guaranteed to arise |
| Memory store | Redis or SQLite (lightweight) | Session preference logging |
| Deployment | Alibaba Cloud ECS instance running the FastAPI orchestration service | Required proof-of-deployment artifact |
| Diagramming | Excalidraw / Mermaid | For architecture diagram submission |

### 6.2 Qwen Cloud Integration Points

1. **Constraint Agent** — sends rider free-text input to a Qwen model with a system prompt instructing structured JSON output (hard constraints, soft weights). This is a genuine use of Qwen's reasoning for ambiguous natural-language parsing, not just templated regex.
2. **Coordinator Agent** — sends the full set of provider bids + structured constraints to Qwen, prompted to (a) rank options, (b) explicitly flag and resolve any detected conflicts, (c) output a natural-language rationale trace. This is the core "sophisticated use of Qwen Cloud APIs" judges are scoring.
3. **Provider Agent "arguments"** (optional depth) — each Provider Agent can make a short Qwen call to generate its own framing/justification for its bid ("Lyft Agent: I'm cheapest overall, but my ETA is 8 minutes — worth it if price matters more than speed to you"), giving the negotiation trace real personality and making the multi-agent framing legible on screen.

### 6.3 Implementation Steps (1-week build)

**Day 1 — Foundations**
- Scaffold Next.js frontend (Uber.com-style UI shell) and FastAPI backend.
- Set up Alibaba Cloud ECS instance, confirm deployment pipeline works end-to-end with a hello-world endpoint.
- Design bid object schema and constraint schema (see Section 7).

**Day 2 — Provider Agents**
- Build the 4 Provider Agents with simulated pricing/ETA logic, deliberately engineered to produce realistic conflicts (surge spikes, stale quotes, tied bids under different framings).
- Unit test that each agent independently returns a well-formed bid.

**Day 3 — Constraint Agent + Qwen integration**
- Wire up Qwen Cloud API calls for constraint parsing.
- Build the free-text rider intent input UI and confirm structured constraint output.

**Day 4 — Coordinator Agent (core negotiation logic)**
- Build the negotiation loop: bid collection → constraint check → conflict detection → resolution → ranked output + rationale.
- This is the highest-value engineering day — spend the most time here.

**Day 5 — Negotiation trace UI + frontend polish**
- Build the visible "agents debating" trace panel.
- Wire ranked results into the Uber.com-style results list.

**Day 6 — Efficiency benchmark**
- Build the single-agent baseline (one LLM call, all bids, pick one).
- Run both systems over ~20-30 synthetic scenarios; compute $ saved, time saved, constraint-violation rate.
- Surface results in a small in-app or README dashboard.

**Day 7 — Memory Agent (if time allows), demo video, documentation, submission**
- Record 3-minute demo video.
- Finalize architecture diagram, README, license file, Alibaba Cloud deployment proof link.

---

## 7. Data Schemas

### 7.1 Bid Object (Provider Agent output)

```json
{
  "provider": "waymo",
  "price_usd": 16.41,
  "eta_pickup_min": 4,
  "eta_total_min": 9,
  "vehicle_type": "standard",
  "capacity": 4,
  "confidence": 0.72,
  "flags": ["high_service_demand"],
  "quote_timestamp": "2026-07-10T10:35:00Z",
  "agent_note": "Demand is elevated in this area; price may increase if not booked within 2 minutes."
}
```

### 7.2 Constraint Object (Constraint Agent output)

```json
{
  "hard_constraints": {
    "arrival_deadline": "2026-07-10T19:15:00Z",
    "excluded_providers": ["robotaxi"],
    "excluded_reason": "no_av_at_night"
  },
  "soft_preferences": {
    "price_weight": 0.4,
    "eta_weight": 0.6
  },
  "rider_count": 1
}
```

### 7.3 Coordinator Decision Object

```json
{
  "recommended_provider": "uber",
  "rank": ["uber", "lyft", "electric", "xl"],
  "excluded": [
    {"provider": "robotaxi", "reason": "violates hard constraint: no_av_at_night"}
  ],
  "conflicts_detected": [
    {
      "type": "tied_bid_different_framing",
      "providers": ["lyft", "waymo"],
      "resolution": "Lyft selected — cheaper overall despite Waymo being cheaper per comfort-tier, since rider's soft preference weights price over comfort."
    }
  ],
  "rationale": "Uber best satisfies your 7:15 PM deadline given current ETA, and Robotaxi was excluded per your stated preference against AV rides at night.",
  "negotiation_trace": [
    "Waymo Agent: flagging high demand, price may increase.",
    "Constraint Agent: excluding Robotaxi — hard constraint violation (no AV at night).",
    "Coordinator: Lyft vs Waymo tied under different framings — resolving in favor of price weight (0.4 > comfort).",
    "Coordinator: final recommendation — Uber, best ETA/price balance under deadline."
  ]
}
```

---

## 8. Judging Criteria Alignment (Track 3)

| Criterion | How RideFare Addresses It |
|---|---|
| Task decomposition & role assignment | 4 independent Provider Agents + Constraint Agent + Coordinator Agent + optional Memory Agent, each with a distinct, non-overlapping responsibility |
| Disagreement/conflict resolution | Deliberately engineered conflict scenarios (stale quotes, tied bids under different framings, hard-constraint violations) with a visible negotiation trace showing real-time resolution |
| Measurable efficiency gain | Explicit benchmark: RideFare (multi-agent) vs. single-agent baseline across ~20-30 synthetic scenarios, scored on $ saved, time saved, and constraint-violation rate |
| Technical depth (Qwen Cloud usage) | Qwen powers both ambiguous NL constraint parsing and the Coordinator's negotiation/rationale generation — not just a single wrapper call |
| Presentation | Visible negotiation trace + Uber.com-familiar UI makes the multi-agent reasoning legible to judges in a 3-minute demo |

---

## 9. Submission Checklist

- [ ] Public GitHub repo with OSI license visible in About section
- [ ] Alibaba Cloud deployment proof (link to deployment config/code in repo)
- [ ] Architecture diagram (visual version of Section 5)
- [ ] ~3 min demo video (YouTube/Vimeo/Facebook, public)
- [ ] Text description of features/functionality
- [ ] Track identified: Track 3 — Agent Society
- [ ] (Optional) Blog/social post about the build journey for Blog Post Prize eligibility

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Real provider APIs unavailable | Use realistic simulated bid generation with deliberate variance/conflict injection — judges care about agent reasoning, not live data accuracy |
| Negotiation trace feels like theater, not real reasoning | Make Coordinator's Qwen prompt actually receive raw bids and constraints, not pre-scripted outcomes — let genuine conflicts emerge from randomized simulation, not fixed to guarantee a rehearsed drama |
| Time overrun on Memory Agent | Treat it as Day 7 stretch only; MVP (Sections 4.1) is fully scoped without it |
| Efficiency benchmark feels hand-wavy | Predefine the metric and scenario set on Day 1 so the whole build targets producing clean, defensible numbers |
