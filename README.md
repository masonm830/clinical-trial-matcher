# Clinical Trial Matcher

**AI-powered patient-to-trial matching using Anthropic's Claude API**

 **[Live Demo](https://clinical-trial-matcher-rho.vercel.app)** &nbsp;|&nbsp; [Backend API Docs](https://clinical-trial-matcher-production.up.railway.app/docs)

---

A healthcare AI system that matches patients to recruiting clinical trials using natural language. Patients describe their medical profile in plain English — the system extracts structured data via LLM, evaluates eligibility against 1,555 real trials from ClinicalTrials.gov, and returns ranked results with human-readable explanations.

---

## Demo

Type a description like:

> *"I am a 42-year-old woman diagnosed with stage 2 breast cancer. I'm currently taking tamoxifen and am allergic to sulfa drugs. I live in Phoenix, Arizona."*

The system returns each trial labeled as **Qualified**, **Likely Qualified**, **Unknown**, or **Excluded** — with specific reasons for each classification.

---

## How It Works

```
Patient description (free text)
        │
        ▼
┌─────────────────────────┐
│   Patient Profile Parser │  ← Claude API (tool-use, structured extraction)
│   parse_patient_profile()│     Extracts: age, sex, conditions, medications,
└────────────┬────────────┘     allergies, location
             │
             ▼
┌─────────────────────────┐
│    Matching Engine       │  ← Pure Python, zero LLM calls at match time
│  match_patient_to_trial()│     Evaluates: age, sex, excluded conditions,
└────────────┬────────────┘     excluded medications, excluded allergies,
             │                  required inclusion conditions
             ▼
┌─────────────────────────┐
│   1,555 Parsed Trials    │  ← Pre-processed via batch LLM extraction
│   ParsedEligibility DB   │     Stored in PostgreSQL as structured JSON
└────────────┬────────────┘
             │
             ▼
     Ranked Results
  qualified / likely_qualified
     / unknown / excluded
    + human-readable reasons
```

**Key design decision:** Trial eligibility is parsed once in a background batch job (not at query time), so patient matching runs in milliseconds with no LLM calls — just in-memory Python logic against pre-structured data.

---

## Features

- **Smart Match (AI)** — natural language patient input parsed by Claude into structured profile; matched against 1,555 real recruiting trials
- **Classic Search** — keyword search by condition, location, and age (original functionality preserved)
- **4-tier match classification** — Qualified, Likely Qualified, Unknown, Excluded with transparent reasoning
- **Human-readable explanations** — every match decision surfaces a specific reason ("Excluded: patient is 42 years old; trial requires 65+")
- **Status filtering** — filter results by match tier; defaults to "Qualifying" (hides the ~96% of excluded trials)
- **Patient profile display** — shows parsed profile so users can verify extraction accuracy
- **Summary dashboard** — instant count across all four match categories

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript), plain CSS, Axios |
| Backend API | Python 3.12, FastAPI, Pydantic |
| Database | PostgreSQL (Railway), SQLAlchemy ORM |
| AI / LLM | Anthropic Claude API (claude-haiku-4-5, tool-use) |
| Deployment | Railway (backend + DB), Vercel (frontend) |
| Data Source | ClinicalTrials.gov public API v2 |

---

## AI Design Details

### Structured Extraction via Tool-Use

Rather than asking Claude to "return JSON," the system uses Anthropic's **tool-use API** to force schema-compliant structured output. A tool schema is defined for each extraction task; Claude is forced to "call" the tool, guaranteeing the response matches the schema exactly.

```python
response = client.messages.create(
    model="claude-haiku-4-5",
    temperature=0,          # deterministic extraction
    tools=[{"name": tool_name, "input_schema": schema}],
    tool_choice={"type": "tool", "name": tool_name},  # force tool call
    ...
)
```

### Conservative Extraction

The patient profile parser is deliberately conservative — it refuses to infer unstated information. Initial testing showed the model would infer `sex: "female"` from tamoxifen use and `country: "United States"` from a US state name. The system prompt was iteratively refined with **concrete negative examples** to eliminate silent inference:

> *"Do NOT infer sex from medications, conditions, or pronouns. Only extract sex if the patient explicitly states it."*

### Batch Preprocessing

All 1,555 trial eligibility criteria (free-text paragraphs like "Inclusion Criteria: adults 18-75 with histologically confirmed...") are parsed once into structured JSON via a background batch job. This makes patient matching instant — no LLM calls at query time, just Python logic.

Total batch cost: **~$4-5 in API credits** for all 1,555 trials.

### Matching Logic

The matching engine (`matcher.py`) applies rules in priority order:

1. **Age check** — hard exclusion if patient age outside trial range
2. **Sex check** — hard exclusion if trial is sex-restricted and patient doesn't match
3. **Excluded conditions** — symmetric substring match (handles "stage 2 breast cancer" matching trial's "breast cancer")
4. **Excluded medications** — same pattern
5. **Excluded allergies** — same pattern
6. **Included conditions** — patient must match at least one required condition

Status assignment:
- Any exclusion → `excluded` (score: 0)
- Any uncertainty (unknown age, sex, or unstructured inclusion criteria) → `unknown` (score: 40)
- All checks pass but unstructured `other_notes` exist → `likely_qualified` (score: 75)
- All checks pass cleanly → `qualified` (score: 100)

---

## Project Structure

```
clinical-trial-matcher/
├── backend/
│   ├── main.py                    # FastAPI app, routes, /api/match endpoint
│   ├── database.py                # SQLAlchemy models (ClinicalTrial, ParsedEligibility)
│   ├── parsers.py                 # LLM-powered extraction (patient profile + trial eligibility)
│   ├── matcher.py                 # Pure-Python matching engine (no LLM at match time)
│   ├── llm.py                     # Anthropic API client, call_claude(), extract_structured()
│   ├── seed.py                    # ClinicalTrials.gov API seeder
│   └── parse_eligibility_batch.py # One-time batch LLM parser for all trials
└── frontend/
    └── src/
        └── App.js                 # React single-file app, Smart Match + Classic Search
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/match` | AI patient-to-trial matching (main endpoint) |
| `GET` | `/api/trials` | Classic keyword search |
| `GET` | `/api/trials/{nct_id}` | Single trial by NCT ID |
| `POST` | `/api/seed` | Seed database from ClinicalTrials.gov |

### POST /api/match

```json
// Request
{
  "description": "I am a 42-year-old woman with stage 2 breast cancer..."
}

// Response
{
  "patient_profile": { "age": 42, "sex": "female", "conditions": [...], ... },
  "total_before_filter": 1555,
  "summary": { "qualified": 0, "likely_qualified": 6, "unknown": 32, "excluded": 1517 },
  "returned": 38,
  "results": [
    {
      "nct_id": "NCT05972343",
      "title": "COOL-IT-PRO: Cryoablation of Breast Cancer...",
      "status": "likely_qualified",
      "score": 75,
      "reasons": ["Trial has additional criteria requiring manual review: ..."],
      "matched_conditions": ["breast cancer"],
      "trial": { ... }
    }
  ]
}
```

---

## Data & Privacy Notice

This is a **portfolio demonstration** using exclusively public data from [ClinicalTrials.gov](https://clinicaltrials.gov). No patient data is stored — descriptions entered in the UI are processed transiently and never persisted.

In a production healthcare deployment, this system would require:
- HIPAA-compliant infrastructure (BAA-covered cloud services)
- Encryption at rest and in transit for any PHI
- Audit logging for all data access
- De-identification or consent workflows for patient input

---

## Local Setup

```bash
# 1. Clone
git clone https://github.com/masonm830/clinical-trial-matcher.git
cd clinical-trial-matcher

# 2. Backend
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Environment variables — create .env in project root
DATABASE_URL=postgresql://localhost:5432/clinical_trials
ANTHROPIC_API_KEY=your_key_here

# 4. Seed and parse
python seed.py
python parse_eligibility_batch.py   # ~50 min, ~$3-5 in API credits

# 5. Start backend
uvicorn main:app --reload

# 6. Frontend (new terminal)
cd ../frontend
npm install && npm start
```

---

## Built With

- [Anthropic Claude API](https://docs.anthropic.com) — structured extraction via tool-use
- [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api) — trial data source
- [FastAPI](https://fastapi.tiangolo.com) — Python backend framework
- [SQLAlchemy](https://sqlalchemy.org) — ORM and database abstraction
- [React](https://react.dev) — frontend UI