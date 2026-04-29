from llm import extract_structured

_SYSTEM_PROMPT = """You are a medical data extraction assistant. Your task is to extract structured information from a patient's free-text description.

STRICT RULES:
- Extract ONLY information the patient explicitly states in their own words.
- Do NOT infer, assume, guess, or add plausible-but-unstated details, even if the inference seems obvious.
- If the patient does not explicitly state a field, return null (for scalars) or an empty array (for lists) — never fill in reasonable guesses.

EXAMPLES OF WHAT NOT TO INFER:
- Do NOT infer sex from medications, conditions, or pronouns. Only extract sex if the patient explicitly states it (e.g., "I am a woman", "I'm male").
- Do NOT infer country from city or state unless the patient explicitly names the country.
- Do NOT infer diagnosis specifics (e.g., "type 2 diabetes" when the patient only said "diabetes").
- Do NOT expand abbreviations or add details the patient did not provide.

FORMATTING:
- Preserve the patient's exact terminology for conditions (e.g., use "stage 2 breast cancer", not "breast cancer").
- For location, extract city, state, and country as separate fields only if each is explicitly mentioned."""

_SCHEMA = {
    "type": "object",
    "properties": {
        "age": {
            "type": ["integer", "null"],
            "description": "Patient's age in years, or null if not mentioned",
        },
        "sex": {
            "type": ["string", "null"],
            "enum": ["male", "female", "other", None],
            "description": "Patient's biological sex, or null if not mentioned",
        },
        "conditions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Medical conditions or diagnoses mentioned, using the patient's exact wording",
        },
        "medications": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Current medications mentioned by the patient",
        },
        "allergies": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Allergies mentioned by the patient",
        },
        "location": {
            "type": "object",
            "properties": {
                "city": {"type": ["string", "null"]},
                "state": {"type": ["string", "null"]},
                "country": {"type": ["string", "null"]},
            },
            "required": ["city", "state", "country"],
            "description": "Patient's location broken into city, state, and country",
        },
    },
    "required": ["age", "sex", "conditions", "medications", "allergies", "location"],
}


_TRIAL_SYSTEM_PROMPT = """You are a clinical trial eligibility extraction assistant. Your task is to extract structured eligibility criteria from a clinical trial's eligibility text.

The text will contain inclusion criteria (conditions patients MUST meet) and exclusion criteria (conditions that DISQUALIFY patients).

EXTRACTION RULES:
- min_age / max_age: extract the integer number of years (e.g., "18 Years" → 18). Return null if a side is unrestricted.
- sex_restriction: use "any" if the trial accepts all sexes or does not specify; use "male" or "female" only if explicitly restricted to one sex.
- included_conditions: list specific diagnoses or conditions patients must have to qualify. Omit vague general statements like "adults with a medical condition".
- excluded_conditions: list specific conditions that disqualify a patient (e.g., "pregnancy", "active hepatitis B infection").
- excluded_medications: list specific drugs or drug classes that disqualify (e.g., "warfarin", "anticoagulants").
- excluded_allergies: list specific allergies or hypersensitivities that disqualify.
- other_notes: concisely summarize remaining important criteria in 1–3 sentences (e.g., lab value thresholds, ECOG performance scores, prior treatment windows). Do not repeat information already captured in the fields above.

STRICT RULES:
- Do not hallucinate or infer criteria that are not present in the text.
- If the input is empty or meaningless, return null for scalars and empty arrays for lists."""

_TRIAL_SCHEMA = {
    "type": "object",
    "properties": {
        "min_age": {
            "type": ["integer", "null"],
            "description": "Minimum age in years to qualify, or null if unrestricted",
        },
        "max_age": {
            "type": ["integer", "null"],
            "description": "Maximum age in years to qualify, or null if unrestricted",
        },
        "sex_restriction": {
            "type": ["string", "null"],
            "enum": ["male", "female", "any", None],
            "description": "Sex restriction: 'male', 'female', 'any' if unrestricted/unspecified, or null",
        },
        "included_conditions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Specific diagnoses or conditions patients must have to qualify",
        },
        "excluded_conditions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Specific conditions that disqualify a patient",
        },
        "excluded_medications": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Specific drugs or drug classes that disqualify a patient",
        },
        "excluded_allergies": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Specific allergies or hypersensitivities that disqualify a patient",
        },
        "other_notes": {
            "type": ["string", "null"],
            "description": "Brief summary of other important criteria not captured above (1–3 sentences)",
        },
    },
    "required": [
        "min_age",
        "max_age",
        "sex_restriction",
        "included_conditions",
        "excluded_conditions",
        "excluded_medications",
        "excluded_allergies",
        "other_notes",
    ],
}


def parse_patient_profile(free_text: str) -> dict:
    return extract_structured(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=free_text,
        tool_name="extract_patient_profile",
        tool_description="Extract structured patient medical profile from free-text patient description",
        schema=_SCHEMA,
    )


def parse_trial_eligibility(eligibility_text: str) -> dict:
    return extract_structured(
        system_prompt=_TRIAL_SYSTEM_PROMPT,
        user_prompt=eligibility_text,
        tool_name="extract_trial_eligibility",
        tool_description="Extract structured eligibility criteria from a clinical trial's eligibility text",
        schema=_TRIAL_SCHEMA,
    )
