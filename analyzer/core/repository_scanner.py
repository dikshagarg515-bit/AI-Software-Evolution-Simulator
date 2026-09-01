from pathlib import Path
import ast

from .models import FileInfo, RepositoryInfo


IGNORED_DIRECTORIES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
}


def count_lines(file_path: Path) -> int:
    try:
        return len(file_path.read_text(encoding="utf-8").splitlines())
    except (UnicodeDecodeError, OSError):
        return 0


def analyze_python_file(file_path: Path) -> FileInfo:
    source = file_path.read_text(encoding="utf-8")
    tree = ast.parse(source)

    functions = []
    classes = []
    imports = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node.name)

        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)

        elif isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)

        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    return FileInfo(
        path=str(file_path),
        language="Python",
        lines=count_lines(file_path),
        functions=functions,
        classes=classes,
        imports=imports,
    )


def scan_repository(repository_path: str) -> RepositoryInfo:
    root = Path(repository_path).resolve()
    files = []

    for file_path in root.rglob("*.py"):
        if any(part in IGNORED_DIRECTORIES for part in file_path.parts):
            continue

        try:
            file_info = analyze_python_file(file_path)
            files.append(file_info)
        except (SyntaxError, UnicodeDecodeError, OSError):
            continue

    return RepositoryInfo(
        path=str(root),
        total_files=len(files),
        files=files,
    )