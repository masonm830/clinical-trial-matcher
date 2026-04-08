# Clinical Trial Matcher

Clinical Trial Matcher helps patients, caregivers, and researchers find relevant recruiting clinical trials from ClinicalTrials.gov based on their condition, location, and age. By applying a relevance scoring algorithm to a local database of 985+ real trials, it surfaces the most applicable studies first — making it easier to connect people with potentially life-changing research opportunities.

---

## Features

- **Condition, location, and age-based search** — filter trials across all three dimensions simultaneously
- **Relevance scoring algorithm** — each result is scored 0–100 based on how closely it matches your search criteria, with the best matches ranked first
- **985+ real trials from ClinicalTrials.gov** — seeded from the official v2 API across cancer, diabetes, heart disease, depression, and Alzheimer's
- **Expandable trial details** — click "View Details" to reveal full descriptions and eligibility criteria
- **Color-coded relevance scores** — green (≥70%), yellow (≥40%), and red (<40%) bars for at-a-glance matching quality
- **PostgreSQL database** — fast local queries with deduplication across seeding runs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI |
| Database | PostgreSQL, SQLAlchemy |
| Data Source | ClinicalTrials.gov API v2 |
| Frontend | React, Axios |

---

## Setup

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

### 4. Set up PostgreSQL

Create the database using `psql` or your preferred PostgreSQL client:

```sql
CREATE DATABASE clinical_trials;
```

Confirm your `.env` file in the project root contains the correct connection string:

```
DATABASE_URL=postgresql://postgres:<your-password>@localhost/clinical_trials
CLINICALTRIALS_API_URL=https://clinicaltrials.gov/api/v2/studies
```

### 5. Seed the database

This fetches 985+ recruiting trials from ClinicalTrials.gov and stores them locally. Expect it to take 1–2 minutes.

```bash
cd backend
python seed.py
```

### 6. Start the backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 7. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## Usage

1. Open `http://localhost:3000` in your browser.
2. Enter any combination of:
   - **Condition** — the disease or condition you're interested in (e.g. `cancer`, `diabetes`, `depression`)
   - **Location** — a city, state, or country (e.g. `New York`, `Texas`, `United States`)
   - **Age** — the patient's age in years (e.g. `45`)
3. Click **Search Trials**.
4. Results appear ranked by relevance score. Trials matching all three criteria score highest.
5. Click **View Details** on any card to read the full description and eligibility criteria.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trials` | Search trials by `condition`, `location`, `age` query params |
| `GET` | `/api/trials/{nct_id}` | Retrieve a single trial by its NCT ID |
| `POST` | `/api/seed` | Trigger a database seed from the ClinicalTrials.gov API |
