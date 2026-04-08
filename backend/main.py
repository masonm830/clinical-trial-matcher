from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db, ClinicalTrial, init_db
from seed import seed as run_seed

app = FastAPI(title="Clinical Trial Matcher")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def score_trial(trial: ClinicalTrial, condition: str, age: str, location: str) -> int:
    """
    Score a trial 0-100 based on how well it matches the search criteria.
    - Condition match:  up to 50 points
    - Location match:  up to 30 points
    - Age match:       up to 20 points
    Higher score = better match.
    """
    score = 0

    # --- Condition (50 pts) ---
    if condition:
        cond_lower = condition.lower()
        trial_cond = (trial.condition or "").lower()
        trial_title = (trial.title or "").lower()
        trial_desc = (trial.description or "").lower()

        if cond_lower in trial_cond:
            score += 50
        elif cond_lower in trial_title:
            score += 35
        elif cond_lower in trial_desc:
            score += 20

    # --- Location (30 pts) ---
    if location:
        loc_lower = location.lower()
        city = (trial.location_city or "").lower()
        state = (trial.location_state or "").lower()
        country = (trial.location_country or "").lower()

        if loc_lower in city:
            score += 30
        elif loc_lower in state:
            score += 25
        elif loc_lower in country:
            score += 15

    # --- Age (20 pts) ---
    if age:
        try:
            age_int = int(age)
            min_age = _parse_age(trial.min_age)
            max_age = _parse_age(trial.max_age)

            within_min = min_age is None or age_int >= min_age
            within_max = max_age is None or age_int <= max_age

            if within_min and within_max:
                score += 20
            elif within_min or within_max:
                score += 10
        except (ValueError, TypeError):
            pass

    return score


def _parse_age(age_str: str):
    """Extract integer years from strings like '18 Years', '65 Years', 'N/A'."""
    if not age_str:
        return None
    parts = age_str.lower().split()
    if parts and parts[0].isdigit():
        return int(parts[0])
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/trials")
def search_trials(
    condition: str = Query(None),
    age: str = Query(None),
    location: str = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(ClinicalTrial)

    # Broad filter: at least one field must be loosely relevant
    filters = []
    if condition:
        filters.append(
            or_(
                ClinicalTrial.condition.ilike(f"%{condition}%"),
                ClinicalTrial.title.ilike(f"%{condition}%"),
                ClinicalTrial.description.ilike(f"%{condition}%"),
            )
        )
    if location:
        filters.append(
            or_(
                ClinicalTrial.location_city.ilike(f"%{location}%"),
                ClinicalTrial.location_state.ilike(f"%{location}%"),
                ClinicalTrial.location_country.ilike(f"%{location}%"),
            )
        )

    if filters:
        for f in filters:
            query = query.filter(f)

    trials = query.all()

    # Score and sort
    scored = sorted(
        [{"trial": t, "score": score_trial(t, condition, age, location)} for t in trials],
        key=lambda x: x["score"],
        reverse=True,
    )

    results = []
    for item in scored[:limit]:
        t = item["trial"]
        results.append({
            "id": t.id,
            "nct_id": t.nct_id,
            "title": t.title,
            "status": t.status,
            "condition": t.condition,
            "description": t.description,
            "eligibility_criteria": t.eligibility_criteria,
            "min_age": t.min_age,
            "max_age": t.max_age,
            "location_city": t.location_city,
            "location_state": t.location_state,
            "location_country": t.location_country,
            "phase": t.phase,
            "sponsor": t.sponsor,
            "last_updated": t.last_updated.isoformat() if t.last_updated else None,
            "relevance_score": item["score"],
        })

    return {"total": len(results), "trials": results}


@app.get("/api/trials/{nct_id}")
def get_trial(nct_id: str, db: Session = Depends(get_db)):
    trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == nct_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    return {
        "id": trial.id,
        "nct_id": trial.nct_id,
        "title": trial.title,
        "status": trial.status,
        "condition": trial.condition,
        "description": trial.description,
        "eligibility_criteria": trial.eligibility_criteria,
        "min_age": trial.min_age,
        "max_age": trial.max_age,
        "location_city": trial.location_city,
        "location_state": trial.location_state,
        "location_country": trial.location_country,
        "phase": trial.phase,
        "sponsor": trial.sponsor,
        "last_updated": trial.last_updated.isoformat() if trial.last_updated else None,
    }


@app.post("/api/seed")
def seed_database():
    try:
        run_seed()
        return {"message": "Database seeded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
