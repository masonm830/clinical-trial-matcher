from database import SessionLocal, ClinicalTrial
from parsers import parse_trial_eligibility
import json

db = SessionLocal()

# Get 3 trials with non-empty eligibility criteria, varying conditions
trials = (
    db.query(ClinicalTrial)
    .filter(ClinicalTrial.eligibility_criteria.isnot(None))
    .filter(ClinicalTrial.eligibility_criteria != "")
    .limit(3)
    .all()
)

for t in trials:
    print("=" * 70)
    print(f"NCT: {t.nct_id}")
    print(f"Title: {t.title}")
    print(f"Condition: {t.condition}")
    print(f"Age range (raw): {t.min_age} - {t.max_age}")
    print()
    print("ELIGIBILITY TEXT (first 500 chars):")
    print(t.eligibility_criteria[:500])
    print("...")
    print()
    print("PARSED:")
    parsed = parse_trial_eligibility(t.eligibility_criteria)
    print(json.dumps(parsed, indent=2))
    print()

db.close()