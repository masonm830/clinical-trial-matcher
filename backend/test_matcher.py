from matcher import match_patient_to_trial
import json

# Example patient from our parser tests
patient = {
    "age": 42,
    "sex": None,
    "conditions": ["stage 2 breast cancer"],
    "medications": ["tamoxifen"],
    "allergies": ["sulfa drugs"],
    "location": {"city": "Phoenix", "state": "Arizona", "country": None},
}

# Test case 1: qualified — patient fits cleanly
trial_qualified = {
    "min_age": 18,
    "max_age": None,
    "sex_restriction": "any",
    "included_conditions": ["breast cancer"],
    "excluded_conditions": ["pregnancy", "active hepatitis"],
    "excluded_medications": ["warfarin"],
    "excluded_allergies": ["penicillin"],
    "other_notes": None,
}

# Test case 2: excluded — age too young
trial_too_old = {
    "min_age": 65,
    "max_age": None,
    "sex_restriction": "any",
    "included_conditions": ["breast cancer"],
    "excluded_conditions": [],
    "excluded_medications": [],
    "excluded_allergies": [],
    "other_notes": None,
}

# Test case 3: excluded — excluded medication
trial_bad_med = {
    "min_age": 18,
    "max_age": None,
    "sex_restriction": "any",
    "included_conditions": ["breast cancer"],
    "excluded_conditions": [],
    "excluded_medications": ["tamoxifen"],
    "excluded_allergies": [],
    "other_notes": None,
}

# Test case 4: likely_qualified — has other_notes
trial_with_notes = {
    "min_age": 18,
    "max_age": None,
    "sex_restriction": "any",
    "included_conditions": ["breast cancer"],
    "excluded_conditions": [],
    "excluded_medications": [],
    "excluded_allergies": [],
    "other_notes": "Requires ECOG performance status 0-1 and adequate organ function.",
}

# Test case 5: excluded — wrong condition
trial_wrong_condition = {
    "min_age": 18,
    "max_age": None,
    "sex_restriction": "any",
    "included_conditions": ["diabetes"],
    "excluded_conditions": [],
    "excluded_medications": [],
    "excluded_allergies": [],
    "other_notes": None,
}

cases = [
    ("Qualified case", trial_qualified),
    ("Age too young (trial requires 65+)", trial_too_old),
    ("Excluded medication (tamoxifen)", trial_bad_med),
    ("Likely qualified (has other_notes)", trial_with_notes),
    ("Wrong condition (trial wants diabetes)", trial_wrong_condition),
]

for label, trial in cases:
    print("=" * 60)
    print(label)
    result = match_patient_to_trial(patient, trial)
    print(json.dumps(result, indent=2))
    print()