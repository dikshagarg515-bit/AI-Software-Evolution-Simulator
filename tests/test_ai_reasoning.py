from analyzer.core.ai_reasoning import (
    build_reasoning_prompt,
    generate_ai_reasoning,
)


def create_test_simulation():
    return {
        "target_file": "example.py",
        "change_type": "change_api",
        "change_description": (
            "An interface or API used by other components is changed."
        ),
        "impact_count": 3,
        "hotspot_score": 4,
        "change_weight": 3,
        "risk_score": 10,
        "risk_level": "High",
        "direct_dependents": [
            "service.py",
            "controller.py",
        ],
        "all_affected_files": [
            "service.py",
            "controller.py",
            "main.py",
        ],
    }


def test_reasoning_prompt_contains_deterministic_results():
    simulation = create_test_simulation()

    prompt = build_reasoning_prompt(simulation)

    assert "Risk level:" in prompt
    assert "High" in prompt
    assert "Risk score:" in prompt
    assert "10" in prompt
    assert "Impact count:" in prompt
    assert "3" in prompt
    assert "Hotspot score:" in prompt
    assert "4" in prompt


def test_reasoning_prompt_has_required_sections():
    simulation = create_test_simulation()

    prompt = build_reasoning_prompt(simulation)

    assert "1. Why this change has this level of risk" in prompt
    assert (
        "2. What could potentially break if the change is introduced"
        in prompt
    )
    assert (
        "3. What a developer should review before making the change"
        in prompt
    )
    assert (
        "4. Practical recommendations for reducing the risk"
        in prompt
    )


def test_ai_reasoning_returns_explanation():
    simulation = create_test_simulation()

    result = generate_ai_reasoning(simulation)

    assert isinstance(result, str)
    assert len(result.strip()) > 0


def test_ai_reasoning_contains_required_sections():
    simulation = create_test_simulation()

    result = generate_ai_reasoning(simulation)

    assert "1." in result
    assert "2." in result
    assert "3." in result
    assert "4." in result