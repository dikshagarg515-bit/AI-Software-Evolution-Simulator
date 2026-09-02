import { useState } from "react";
import "./App.css";

function App() {
  const [path, setPath] = useState(
    "C:\\Users\\Diksha\\Documents\\AI-Software-Evolution-Simulator"
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepository = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalLines =
    result?.files?.reduce((sum, file) => sum + file.lines, 0) || 0;

  const totalFunctions =
    result?.files?.reduce(
      (sum, file) => sum + file.functions.length,
      0
    ) || 0;

  const totalClasses =
    result?.files?.reduce(
      (sum, file) => sum + file.classes.length,
      0
    ) || 0;

  const pythonFiles =
    result?.files?.filter((file) => file.language === "Python").length || 0;

  return (
    <div className="app">
      <header className="header">
        <h1>AI Software Evolution Simulator</h1>
        <p>
          Analyze a software repository and understand its structure.
        </p>
      </header>

      <section className="analyzer">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="Enter repository path"
        />

        <button onClick={analyzeRepository} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Repository"}
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <section className="stats">
            <div className="stat-card">
              <h3>Total Files</h3>
              <strong>{result.total_files}</strong>
            </div>

            <div className="stat-card">
              <h3>Python Files</h3>
              <strong>{pythonFiles}</strong>
            </div>

            <div className="stat-card">
              <h3>Total Lines</h3>
              <strong>{totalLines}</strong>
            </div>

            <div className="stat-card">
              <h3>Functions</h3>
              <strong>{totalFunctions}</strong>
            </div>

            <div className="stat-card">
              <h3>Classes</h3>
              <strong>{totalClasses}</strong>
            </div>
          </section>

          <section className="repository">
            <h2>Repository Structure</h2>
            <p className="repository-path">{result.path}</p>

            <div className="file-list">
              {result.files.map((file) => (
                <div className="file-card" key={file.path}>
                  <div>
                    <h3>{file.path}</h3>
                    <p>
                      {file.language} • {file.lines} lines
                    </p>
                  </div>

                  <div className="file-details">
                    <span>
                      Functions: {file.functions.length}
                    </span>

                    <span>
                      Classes: {file.classes.length}
                    </span>

                    <span>
                      Imports: {file.imports.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;