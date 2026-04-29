# Clinical Trial Matcher

A full-stack web application that matches patients to recruiting clinical trials from ClinicalTrials.gov based on their condition, location, and age. Results are ranked by a relevance scoring algorithm so the best-fit trials surface first.

---

## How It Works

1. The user enters a **condition** (e.g. `cancer`), **location** (e.g. `New York`), and/or **age** (e.g. `45`).
2. The React frontend sends the query to the FastAPI backend.
3. The backend filters the local PostgreSQL database of 985+ recruiting trials and scores each result:
   - **Condition match** — up to 50 points (condition field > title > description)
   - **Location match** — up to 30 points (city > state > country)
   - **Age eligibility** — up to 20 points (within trial's min/max age range)
4. Trials are returned ranked by relevance score (0–100) and displayed as cards with color-coded score bars.
5. Clicking **View Details** reveals the full description and eligibility criteria for any trial.

The local database is seeded by calling the ClinicalTrials.gov REST API v2 for five conditions (cancer, diabetes, heart disease, depression, Alzheimer's), fetching up to 200 recruiting trials each, and deduplicating by NCT ID.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI, Uvicorn |
| Data processing | pandas, SQLAlchemy |
| Database | PostgreSQL |
| Data source | ClinicalTrials.gov API v2 |
| Frontend | React, Axios |

---

## Setup

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL running locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd clinical-trial-matcher
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://postgres:<your-password>@localhost/clinical_trials
CLINICALTRIALS_API_URL=https://clinicaltrials.gov/api/v2/studies
```

### 5. Create the database

```sql
CREATE DATABASE clinical_trials;
```

### 6. Seed the database

Fetches 985+ recruiting trials from ClinicalTrials.gov and stores them locally. Takes 1–2 minutes.

```bash
cd backend
python seed.py
```

### 7. Start the backend

```bash
cd backend
uvicorn main:app --reload
```

API available at `http://localhost:8000`.

### 8. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`.

---

## Usage

1. Open `http://localhost:3000`.
2. Enter any combination of **condition**, **location**, and **age**.
3. Click **Search Trials**.
4. Results appear ranked by relevance score — green (≥70), yellow (≥40), red (<40).
5. Click **View Details** on any card to read the full description and eligibility criteria.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trials` | Search trials — accepts `condition`, `location`, `age`, `limit` query params |
| `GET` | `/api/trials/{nct_id}` | Fetch a single trial by NCT ID |
| `POST` | `/api/seed` | Trigger a database re-seed from ClinicalTrials.gov |
