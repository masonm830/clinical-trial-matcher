from database import SessionLocal, ClinicalTrial, ParsedEligibility
import json

db = SessionLocal()

count = db.query(ParsedEligibility).count()
print(f"Total ParsedEligibility rows: {count}")
print()

# Show 2 sample rows with their raw trial for comparison
rows = db.query(ParsedEligibility).limit(2).all()
for row in rows:
    trial = db.query(ClinicalTrial).filter_by(id=row.trial_id).first()
    print("=" * 60)
    print(f"Trial: {trial.nct_id} — {trial.title[:60]}")
    print(f"Raw age fields: min={trial.min_age}, max={trial.max_age}")
    print()
    print("Parsed:")
    print(json.dumps({
        "min_age": row.min_age,
        "max_age": row.max_age,
        "sex_restriction": row.sex_restriction,
        "included_conditions": row.included_conditions,
        "excluded_conditions": row.excluded_conditions,
        "excluded_medications": row.excluded_medications,
        "excluded_allergies": row.excluded_allergies,
        "other_notes": row.other_notes,
        "parsed_at": row.parsed_at.isoformat() if row.parsed_at else None,
    }, indent=2))
    print()

db.close()