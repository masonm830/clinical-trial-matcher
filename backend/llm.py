from dotenv import load_dotenv
import os
import anthropic

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

_api_key = os.environ.get("ANTHROPIC_API_KEY")
if not _api_key:
    raise EnvironmentError(
        "ANTHROPIC_API_KEY is not set. Add it to your .env file or environment."
    )

client = anthropic.Anthropic(api_key=_api_key)


def call_claude(
    system_prompt: str,
    user_prompt: str,
    model: str = "claude-haiku-4-5",
) -> str:
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text


def extract_structured(
    system_prompt: str,
    user_prompt: str,
    tool_name: str,
    tool_description: str,
    schema: dict,
    model: str = "claude-haiku-4-5",
) -> dict:
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        temperature=0,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
        tools=[{"name": tool_name, "description": tool_description, "input_schema": schema}],
        tool_choice={"type": "tool", "name": tool_name},
    )
    for block in response.content:
        if block.type == "tool_use":
            return block.input
    raise RuntimeError(
        f"No tool_use block found in response for tool '{tool_name}'. "
        f"Response content types: {[b.type for b in response.content]}"
    )
