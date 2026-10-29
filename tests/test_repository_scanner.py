from pathlib import Path

from analyzer.core.repository_scanner import (
    analyze_python_file,
    scan_repository,
)


def test_analyze_python_file_detects_code_structure(tmp_path):
    test_file = tmp_path / "example.py"

    test_file.write_text(
        """
import os
from pathlib import Path

class Example:
    pass

def hello():
    return "Hello"
""",
        encoding="utf-8",
    )

    result = analyze_python_file(test_file)

    assert result.language == "Python"
    assert result.lines == 9
    assert "Example" in result.classes
    assert "hello" in result.functions
    assert "os" in result.imports
    assert "pathlib" in result.imports


def test_scan_repository_finds_python_files(tmp_path):
    (tmp_path / "main.py").write_text(
        "def main():\n    pass\n",
        encoding="utf-8",
    )

    (tmp_path / "helper.py").write_text(
        "def helper():\n    pass\n",
        encoding="utf-8",
    )

    result = scan_repository(str(tmp_path))

    assert result.total_files == 2
    assert len(result.files) == 2


def test_scan_repository_ignores_excluded_directories(tmp_path):
    (tmp_path / "main.py").write_text(
        "def main():\n    pass\n",
        encoding="utf-8",
    )

    ignored_directory = tmp_path / ".venv"
    ignored_directory.mkdir()

    (ignored_directory / "ignored.py").write_text(
        "def ignored():\n    pass\n",
        encoding="utf-8",
    )

    result = scan_repository(str(tmp_path))

    assert result.total_files == 1
    assert all(
        ".venv" not in file.path
        for file in result.files
    )