from ollama import chat


OLLAMA_MODEL = "llama3.2:3b"


def build_reasoning_prompt(simulation_result: dict) -> str:
    """
    Build the evidence-based prompt that will be sent
    to the local AI model.
    """

    target_file = simulation_result.get(
        "target_file",
        "Unknown file",
    )

    change_type = simulation_result.get(
        "change_type",
        "Unknown change",
    )

    change_description = simulation_result.get(
        "change_description",
        "No description available.",
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

    affected_files = simulation_result.get(
        "all_affected_files",
        [],
    )
    direct_dependents = simulation_result.get(
    "direct_dependents",
    [],
)
    confirmed_relationships = [
    f"{dependent} -> {target_file}"
    for dependent in direct_dependents
]

    prompt = f"""
You are an AI software architecture assistant.

Analyze the following software evolution scenario.

Target file:
{target_file}

Change type:
{change_type}

Change description:
{change_description}

Impact count:
{impact_count}

Hotspot score:
{hotspot_score}

Risk score:
{risk_score}

Risk level:
{risk_level}

Confirmed dependency relationships:

{confirmed_relationships}

The arrow "A -> B" means:
A depends on B.

Therefore:
- The files on the LEFT side are the dependents.
- The target file on the RIGHT side is the dependency.
- These relationships are confirmed by the dependency analysis.
- Never reverse these relationships.

All potentially affected files:
{affected_files}
Explain:

1. Why this change has this level of risk.
2. Which architectural relationships contribute to the risk.
3. What could potentially break if the change is introduced.
4. What a developer should review before making the change.
5. Give practical recommendations for reducing the risk.

Important rules:

- Use only the dependency and impact evidence provided above.
- Do not invent or assume dependency relationships.
- Treat the confirmed dependency relationships as factual.
- Interpret every arrow exactly as defined: A -> B means A depends on B.
- Never reverse an arrow.
- Never state that the target file depends on a file appearing on the left side of an arrow.
- The target file is the dependency when it appears on the right side of an arrow.
- Direct dependents are confirmed relationships.
- All other breakage or consequences must be described as potential consequences.
- Do not change or recalculate the risk score.
- The risk score and risk level are produced by the deterministic analysis engine.

Recommendations must be specific to the software architecture evidence.
Prefer recommendations such as:
- reviewing the direct dependents of the changed component
- checking API or interface compatibility
- reviewing affected functions or classes
- adding or updating tests for affected components
- validating the dependency graph after the change
- checking indirectly affected components

Avoid generic business advice, deployment advice, or unrelated recommendations unless the evidence specifically supports them.

Keep the explanation concise, technically accurate, and practical.
"""

    return prompt.strip()


def generate_ai_reasoning(simulation_result: dict) -> str:
    """
    Send the simulation evidence to the local Ollama model
    and return the generated architectural explanation.
    """

    prompt = build_reasoning_prompt(simulation_result)

    response = chat(
        model=OLLAMA_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response["message"]["content"]


def prepare_reasoning_input(simulation_result: dict) -> dict:
    """
    Convert simulation results into structured input
    for the AI reasoning system.
    """

    return {
        "target_file": simulation_result.get("target_file"),
        "change_type": simulation_result.get("change_type"),
        "change_description": simulation_result.get(
            "change_description"
        ),
        "impact_count": simulation_result.get("impact_count"),
        "hotspot_score": simulation_result.get("hotspot_score"),
        "risk_score": simulation_result.get("risk_score"),
        "risk_level": simulation_result.get("risk_level"),
        "affected_files": simulation_result.get(
            "all_affected_files",
            [],
        ),
    }