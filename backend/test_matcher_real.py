from database import SessionLocal, ClinicalTrial, ParsedEligibility
from matcher import match_patient_to_trial
import json
from collections import Counter

# Our canonical test patient
patient = {
    "age": 42,
    "sex": None,
    "conditions": ["stage 2 breast cancer"],
    "medications": ["tamoxifen"],
    "allergies": ["sulfa drugs"],
    "location": {"city": "Phoenix", "state": "Arizona", "country": None},
}

db = SessionLocal()

# Load all parsed eligibilities joined with their trials
rows = db.query(ParsedEligibility, ClinicalTrial).join(
    ClinicalTrial, ParsedEligibility.trial_id == ClinicalTrial.id
).all()

print(f"Matching patient against {len(rows)} parsed trials...\n")

results = []
for eligibility_row, trial in rows:
    eligibility = {
        "min_age": eligibility_row.min_age,
        "max_age": eligibility_row.max_age,
        "sex_restriction": eligibility_row.sex_restriction,
        "included_conditions": eligibility_row.included_conditions or [],
        "excluded_conditions": eligibility_row.excluded_conditions or [],
        "excluded_medications": eligibility_row.excluded_medications or [],
        "excluded_allergies": eligibility_row.excluded_allergies or [],
        "other_notes": eligibility_row.other_notes,
    }
    match = match_patient_to_trial(patient, eligibility)
    match["nct_id"] = trial.nct_id
    match["title"] = trial.title
    match["condition"] = trial.condition
    results.append(match)

# Status distribution
status_counts = Counter(r["status"] for r in results)
print("Status distribution:")
for status, count in status_counts.most_common():
    pct = round(count / len(results) * 100, 1)
    print(f"  {status}: {count} ({pct}%)")
print()

# Show top 5 qualified/likely_qualified trials
qualifying = [r for r in results if r["status"] in ("qualified", "likely_qualified")]
qualifying.sort(key=lambda r: -r["score"])

print(f"Top 5 matches (out of {len(qualifying)} qualifying):\n")
for r in qualifying[:5]:
    print(f"  [{r['status']}] {r['nct_id']} — {r['title'][:70]}")
    print(f"    Score: {r['score']}  |  Matched: {r['matched_conditions']}")
    for reason in r["reasons"][:1]:
        print(f"    Reason: {reason[:150]}")
    print()

# Show 3 sample exclusions for diversity
excluded = [r for r in results if r["status"] == "excluded"]
print(f"Sample exclusions (out of {len(excluded)}):\n")
for r in excluded[:3]:
    print(f"  [{r['status']}] {r['nct_id']} — {r['title'][:70]}")
    print(f"    Reasons: {r['reasons'][:2]}")
    print()

db.close()