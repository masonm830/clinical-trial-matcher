
def _symmetric_substring_match(term: str, other: str) -> bool:
    t = term.lower().strip()
    o = other.lower().strip()
    if not t or not o:
        return False
    return t in o or o in t


def _matches_any(term: str, candidates: list) -> bool:
    for c in candidates or []:
        if c and _symmetric_substring_match(term, c):
            return True
    return False


def match_patient_to_trial(patient: dict, eligibility: dict) -> dict:
    patient = patient or {}
    eligibility = eligibility or {}

    age = patient.get("age")
    sex = patient.get("sex")
    patient_conditions = patient.get("conditions") or []
    patient_medications = patient.get("medications") or []
    patient_allergies = patient.get("allergies") or []

    min_age = eligibility.get("min_age")
    max_age = eligibility.get("max_age")
    sex_restriction = eligibility.get("sex_restriction")
    included_conditions = eligibility.get("included_conditions") or []
    excluded_conditions = eligibility.get("excluded_conditions") or []
    excluded_medications = eligibility.get("excluded_medications") or []
    excluded_allergies = eligibility.get("excluded_allergies") or []
    other_notes = eligibility.get("other_notes")

    exclusion_reasons: list = []
    uncertainty_reasons: list = []
    positive_reasons: list = []
    matched_conditions: list = []

    # 1. Age check
    if age is not None and min_age is not None and age < min_age:
        exclusion_reasons.append(
            f"Patient is {age} years old; trial requires {min_age}+"
        )
    if age is not None and max_age is not None and age > max_age:
        exclusion_reasons.append(
            f"Patient is {age} years old; trial maximum age is {max_age}"
        )
    if age is None and (min_age is not None or max_age is not None):
        uncertainty_reasons.append(
            "Trial has age restriction but patient age unknown"
        )

    # 2. Sex check
    if sex_restriction in ("male", "female"):
        patient_sex_lower = sex.lower() if isinstance(sex, str) else None
        if patient_sex_lower != sex_restriction:
            if patient_sex_lower is None:
                uncertainty_reasons.append(
                    f"Trial restricted to {sex_restriction}; patient sex unknown"
                )
            else:
                exclusion_reasons.append(
                    f"Trial is {sex_restriction}-only; patient is {sex}"
                )

    # 3. Excluded conditions
    for excluded in excluded_conditions:
        if excluded and _matches_any(excluded, patient_conditions):
            exclusion_reasons.append(f"Excluded condition detected: {excluded}")

    # 4. Excluded medications
    for med in excluded_medications:
        if med and _matches_any(med, patient_medications):
            exclusion_reasons.append(f"Excluded medication detected: {med}")

    # 5. Excluded allergies
    for allergy in excluded_allergies:
        if allergy and _matches_any(allergy, patient_allergies):
            exclusion_reasons.append(f"Excluded allergy detected: {allergy}")

    # 6. Included conditions
    if included_conditions:
        for inc in included_conditions:
            if inc and _matches_any(inc, patient_conditions):
                matched_conditions.append(inc)

        if not matched_conditions:
            if patient_conditions:
                exclusion_reasons.append(
                    f"Patient does not have any of the required conditions: {included_conditions}"
                )
            else:
                uncertainty_reasons.append(
                    "Trial requires specific conditions but none provided by patient"
                )
    else:
        if other_notes:
            uncertainty_reasons.append(
                "Trial has no structured inclusion criteria; eligibility requires manual review"
            )

    # Status determination
    if exclusion_reasons:
        status = "excluded"
        score = 0
        reasons = exclusion_reasons
    elif uncertainty_reasons:
        status = "unknown"
        score = 40
        reasons = uncertainty_reasons
    elif other_notes:
        status = "likely_qualified"
        score = 75
        reasons = positive_reasons + [
            f"Trial has additional criteria requiring manual review: {other_notes}"
        ]
    else:
        status = "qualified"
        score = 100
        reasons = ["Patient meets all specified eligibility criteria"]

    return {
        "status": status,
        "score": score,
        "reasons": reasons,
        "matched_conditions": matched_conditions,
    }
