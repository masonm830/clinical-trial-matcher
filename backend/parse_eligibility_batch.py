import argparse
import time

from database import SessionLocal, ClinicalTrial, ParsedEligibility
from parsers import parse_trial_eligibility


def parse_structured_age(age_str: str) -> int | None:
    if not age_str:
        return None
    parts = age_str.lower().split()
    if parts and parts[0].isdigit():
        return int(parts[0])
    return None


def run_batch(limit: int | None = None):
    db = SessionLocal()
    try:
        already_parsed = db.query(ParsedEligibility.trial_id)

        query = (
            db.query(ClinicalTrial)
            .filter(
                ClinicalTrial.eligibility_criteria.isnot(None),
                ClinicalTrial.eligibility_criteria != "",
                ClinicalTrial.id.notin_(already_parsed),
            )
        )

        if limit is not None:
            query = query.limit(limit)

        trials = query.all()
        total = len(trials)
        print(f"Parsing {total} trials...")

        parsed_count = 0
        error_count = 0
        start = time.time()

        for i, trial in enumerate(trials, start=1):
            try:
                result = parse_trial_eligibility(trial.eligibility_criteria)

                min_age = result["min_age"]
                if min_age is None:
                    min_age = parse_structured_age(trial.min_age)

                max_age = result["max_age"]
                if max_age is None:
                    max_age = parse_structured_age(trial.max_age)

                row = ParsedEligibility(
                    trial_id=trial.id,
                    min_age=min_age,
                    max_age=max_age,
                    sex_restriction=result.get("sex_restriction"),
                    included_conditions=result.get("included_conditions") or [],
                    excluded_conditions=result.get("excluded_conditions") or [],
                    excluded_medications=result.get("excluded_medications") or [],
                    excluded_allergies=result.get("excluded_allergies") or [],
                    other_notes=result.get("other_notes"),
                )
                db.add(row)
                parsed_count += 1

            except Exception as e:
                print(f"  [ERROR] {trial.nct_id}: {e}")
                error_count += 1

            if i % 10 == 0:
                db.commit()
                pct = round(i / total * 100)
                print(f"  Parsed {i}/{total} ({pct}%)")

        db.commit()
        elapsed = round(time.time() - start)
        print(f"Done. Parsed: {parsed_count} | Errors: {error_count} | Time: {elapsed}s")

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Batch-parse trial eligibility criteria into structured rows.")
    parser.add_argument("--limit", type=int, default=None, help="Max number of trials to parse")
    args = parser.parse_args()
    run_batch(limit=args.limit)
