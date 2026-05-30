# CarMatch — AI-Powered Car Recommendation Platform

An agentic AI app that takes a confused car buyer from "I don't know what to buy" to "I'm confident about my shortlist."

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v4 + React Flow |
| Backend | FastAPI + LangGraph + LangChain + Azure OpenAI (gpt-4o) |
| Agent | LangGraph StateGraph with 5 nodes |
| Data | 40+ cars in `backend/data/cars.json` |
| Dev | `docker compose up` |

## Quick Start

### 1. Configure environment

```bash
cp backend/.env.example backend/.env
# Fill in your Azure OpenAI credentials in backend/.env
```

### 2. Run with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- API docs: http://localhost:8000/docs

### 3. Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

### LangGraph Agent Pipeline

```
parse_preferences → filter_candidates → score_and_rank → generate_reasoning → format_response
```

1. **parse_preferences** — loads `cars.json`, validates user input
2. **filter_candidates** — hard filters on budget, fuel, use cases
3. **score_and_rank** — pure Python weighted scoring (no LLM), top 8
4. **generate_reasoning** — single GPT-4o call for personalized explanations on top 5
5. **format_response** — finalize and complete trace

### SSE Streaming

The `/api/recommend` endpoint streams Server-Sent Events:
- Each node completion → `data: {"type": "trace", "node": "...", "status": "done", "detail": "..."}`
- Final result → `data: {"type": "result", "recommendations": [...]}`
- Completion → `data: [DONE]`

### Agent Trace Panel

The right-side panel in the Results page renders the LangGraph graph visually using React Flow. Nodes update in real-time as SSE events arrive, showing the agent's reasoning process transparently.

## Test API

```bash
curl -X POST http://localhost:8000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "budget_min_lakh": 10,
      "budget_max_lakh": 20,
      "use_cases": ["daily_commute", "family_trips"],
      "fuel_preference": "petrol",
      "priorities": ["safety", "mileage", "boot_space", "performance", "low_maintenance", "resale_value"]
    }
  }'
```
