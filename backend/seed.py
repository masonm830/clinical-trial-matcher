from dotenv import load_dotenv
import os
import requests
from datetime import datetime
from database import SessionLocal, ClinicalTrial, init_db

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

API_URL = os.getenv("CLINICALTRIALS_API_URL", "https://clinicaltrials.gov/api/v2/studies")

CONDITIONS = ["cancer", "diabetes", "heart disease", "depression", "alzheimer's"]
PAGE_SIZE = 100


def parse_date(date_str):
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%B %d, %Y", "%Y-%m"):
        try:
            return datetime.strptime(date_str[:len(fmt.replace("%Y", "0000").replace("%m", "00").replace("%d", "00").replace("%B", "September"))], fmt).date()
        except ValueError:
            continue
    # Fallback: try first 10 chars as YYYY-MM-DD
    try:
        return datetime.strptime(date_str[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def fetch_trials(condition, max_results=200):
    trials = []
    next_token = None
    fetched = 0

    while fetched < max_results:
        params = {
            "query.cond": condition,
            "filter.overallStatus": "RECRUITING",
            "pageSize": PAGE_SIZE,
            "format": "json",
            "fields": (
                "NCTId,BriefTitle,OverallStatus,Condition,BriefSummary,"
                "EligibilityCriteria,MinimumAge,MaximumAge,"
                "LocationCity,LocationState,LocationCountry,"
                "Phase,LeadSponsorName,LastUpdatePostDate"
            ),
        }
        if next_token:
            params["pageToken"] = next_token

        try:
            response = requests.get(API_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"  [ERROR] Request failed for '{condition}': {e}")
            break

        studies = data.get("studies", [])
        if not studies:
            break

        for study in studies:
            proto = study.get("protocolSection", {})
            id_mod = proto.get("identificationModule", {})
            status_mod = proto.get("statusModule", {})
            desc_mod = proto.get("descriptionModule", {})
            eligibility_mod = proto.get("eligibilityModule", {})
            contacts_mod = proto.get("contactsLocationsModule", {})
            design_mod = proto.get("designModule", {})
            sponsor_mod = proto.get("sponsorCollaboratorsModule", {})

            # Location: pick first available location
            locations = contacts_mod.get("locations", [])
            loc = locations[0] if locations else {}

            # Phase: list -> join
            phases = design_mod.get("phases", [])
            phase_str = ", ".join(phases) if phases else None

            trials.append({
                "nct_id": id_mod.get("nctId"),
                "title": id_mod.get("briefTitle"),
                "status": status_mod.get("overallStatus"),
                "condition": condition,
                "description": desc_mod.get("briefSummary"),
                "eligibility_criteria": eligibility_mod.get("eligibilityCriteria"),
                "min_age": eligibility_mod.get("minimumAge"),
                "max_age": eligibility_mod.get("maximumAge"),
                "location_city": loc.get("city"),
                "location_state": loc.get("state"),
                "location_country": loc.get("country"),
                "phase": phase_str,
                "sponsor": sponsor_mod.get("leadSponsor", {}).get("name"),
                "last_updated": parse_date(status_mod.get("lastUpdatePostDateStruct", {}).get("date")),
            })

        fetched += len(studies)
        next_token = data.get("nextPageToken")
        if not next_token:
            break

    return trials


def seed():
    print("Initializing database...")
    init_db()

    db = SessionLocal()
    total_saved = 0
    total_skipped = 0

    try:
        for condition in CONDITIONS:
            print(f"\nFetching trials for: {condition}")
            trials = fetch_trials(condition, max_results=200)
            print(f"  Fetched {len(trials)} trials, saving to database...")

            saved = 0
            skipped = 0
            for t in trials:
                if not t["nct_id"]:
                    skipped += 1
                    continue
                exists = db.query(ClinicalTrial).filter_by(nct_id=t["nct_id"]).first()
                if exists:
                    skipped += 1
                    continue
                db.add(ClinicalTrial(**t))
                saved += 1

            db.commit()
            print(f"  Saved: {saved} | Skipped (duplicates): {skipped}")
            total_saved += saved
            total_skipped += skipped

    finally:
        db.close()

    print(f"\nDone. Total saved: {total_saved} | Total skipped: {total_skipped}")


if __name__ == "__main__":
    seed()
