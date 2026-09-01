from dataclasses import dataclass, field


@dataclass
class FileInfo:
    path: str
    language: str
    lines: int
    functions: list[str] = field(default_factory=list)
    classes: list[str] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)


@dataclass
class RepositoryInfo:
    path: str
    total_files: int
    files: list[FileInfo] = field(default_factory=list)

    def to_dict(self):
        return {
            "path": self.path,
            "total_files": self.total_files,
            "files": [
                {
                    "path": file.path,
                    "language": file.language,
                    "lines": file.lines,
                    "functions": file.functions,
                    "classes": file.classes,
                    "imports": file.imports,
                }
                for file in self.files
            ],
        }