from ollama import chat


OLLAMA_MODEL = "llama3.2:3b"


def build_reasoning_prompt(simulation_result: dict) -> str:
    """
    Build a simple prompt for the local AI model.

    The deterministic engine is responsible for:
    - risk score
    - risk level
    - impact count
    - hotspot score
    - dependency relationships

    The AI is responsible only for explaining the risk
    and giving practical recommendations.
    """

    change_type = simulation_result.get(
        "change_type",
        "unknown change",
    )

    change_description = simulation_result.get(
        "change_description",
        "No change description available.",
    )

    impact_count = simulation_result.get(
        "impact_count",
        0,
    )

    hotspot_score = simulation_result.get(
        "hotspot_score",
        0,
    )

    risk_score = simulation_result.get(
        "risk_score",
        0,
    )

    risk_level = simulation_result.get(
        "risk_level",
        "Unknown",
    )

    prompt = f"""
You are an AI software architecture assistant.

Explain the results of a deterministic software evolution analysis.

The deterministic analysis engine has already calculated the
risk information. Do not recalculate it.

DETERMINISTIC RESULTS

Change type:
{change_type}

Change description:
{change_description}

Risk level:
{risk_level}

Risk score:
{risk_score}

Impact count:
{impact_count}

Hotspot score:
{hotspot_score}


YOUR TASK

Explain what these results mean for a developer.

Return exactly these four sections:

1. Why this change has this level of risk

Explain the provided risk level using the risk score,
impact count, hotspot score, and change type.

2. What could potentially break if the change is introduced

Explain possible consequences of introducing the change.
Use words such as "could", "may", or "might".
Do not claim that something will definitely break.

3. What a developer should review before making the change

Give practical things the developer should check before
implementing the change.

4. Practical recommendations for reducing the risk

Give practical recommendations such as testing,
validation, compatibility checks, and reviewing the
changed component.

STRICT RULES

- Do not discuss dependency relationships.
- Do not discuss direct dependents.
- Do not list files.
- Do not invent architecture information.
- Do not invent components.
- Do not create an architectural relationship.
- Do not reverse dependency relationships.
- Do not recalculate the risk score.
- Do not change the risk level.
- Do not create additional sections.
- Do not create a section called "Potentially Affected Components".
- Do not create a section called "Architectural Relationships".
- Keep the answer concise.
- Use simple Markdown.
"""

    return prompt.strip()


def generate_ai_reasoning(simulation_result: dict) -> str:
    """
    Generate AI explanation from deterministic simulation results.

    Dependency relationships are intentionally excluded from the
    AI response. They are displayed separately by the frontend.
    """

    prompt = build_reasoning_prompt(
        simulation_result
    )

    try:
        response = chat(
            model=OLLAMA_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            options={
                "temperature": 0.2,
            },
        )

        ai_reasoning = response[
            "message"
        ][
            "content"
        ].strip()

        if not ai_reasoning:
            return (
                "The local AI model did not return an explanation."
            )

        return ai_reasoning

    except Exception as error:
        return (
            "The local AI reasoning engine could not generate "
            "an explanation at this time."
        )