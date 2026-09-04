import { useState } from "react";
import "./App.css";

function App() {
  const [path, setPath] = useState(
    "C:\\Users\\Diksha\\Documents\\AI-Software-Evolution-Simulator"
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState("");
  const [impactResult, setImpactResult] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const analyzeRepository = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setImpactResult(null);
    setSelectedFile("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/analyze?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }

      const data = await response.json();
      setResult(data);

      if (data.files.length > 0) {
        setSelectedFile(
          data.files[0].path
            .replaceAll("\\", "/")
            .replace(`${data.path.replaceAll("\\", "/")}/`, "")
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImpact = async () => {
    if (!selectedFile) {
      return;
    }

    setImpactLoading(true);
    setError("");
    setImpactResult(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/impact?path=${encodeURIComponent(
          path
        )}&file=${encodeURIComponent(selectedFile)}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze impact");
      }

      const data = await response.json();
      setImpactResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setImpactLoading(false);
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

  const getShortPath = (filePath) => {
    if (!result?.path) {
      return filePath;
    }

    const normalizedRoot = result.path.replaceAll("\\", "/");
    const normalizedFile = filePath.replaceAll("\\", "/");

    if (normalizedFile.startsWith(normalizedRoot)) {
      return normalizedFile
        .replace(normalizedRoot, "")
        .replace(/^\/+/, "");
    }

    return filePath;
  };

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
                    <h3>{getShortPath(file.path)}</h3>

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

          <section className="dependency-section">
            <h2>Dependency Graph</h2>

            <p className="section-description">
              This shows how files in the repository depend on one another.
            </p>

            <div className="dependency-list">
              {Object.entries(result.dependency_graph).map(
                ([source, dependencies]) => (
                  <div className="dependency-row" key={source}>
                    <div className="dependency-node source-node">
                      {getShortPath(source)}
                    </div>

                    <div className="dependency-arrow">
                      →
                    </div>

                    <div className="dependency-targets">
                      {dependencies.length > 0 ? (
                        dependencies.map((dependency) => (
                          <div
                            className="dependency-node target-node"
                            key={dependency}
                          >
                            {getShortPath(dependency)}
                          </div>
                        ))
                      ) : (
                        <span className="no-dependency">
                          No internal dependencies
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="metrics-section">
  <h2>Dependency Metrics</h2>

  <p className="section-description">
    These metrics show how connected each file is within the repository.
  </p>

  <div className="metrics-list">
    {Object.entries(result.dependency_metrics)
      .sort(
        ([, a], [, b]) =>
          b.total_connections - a.total_connections
      )
      .map(([file, metrics]) => (
        <div className="metric-row" key={file}>
          <div className="metric-file">
            {getShortPath(file)}
          </div>

          <div className="metric-value">
            <span>Dependencies</span>
            <strong>{metrics.dependencies}</strong>
          </div>

          <div className="metric-value">
            <span>Dependents</span>
            <strong>{metrics.dependents}</strong>
          </div>

          <div className="metric-value">
            <span>Connections</span>
            <strong>{metrics.total_connections}</strong>
          </div>
          <div className="metric-value">
  <span>Hotspot</span>
  <strong>{metrics.hotspot_level}</strong>
</div>
        </div>
      ))}
  </div>
</section>
<section className="ranking-section">
  <h2>Top Architectural Components</h2>

  <p className="section-description">
    These components have the highest connectivity within the repository.
  </p>

  <div className="ranking-list">
    {result.hotspot_ranking
      .filter((item) => item.hotspot_score > 0)
      .slice(0, 5)
      .map((item, index) => (
        <div className="ranking-row" key={item.file}>
          <div className="ranking-position">
            #{index + 1}
          </div>

          <div className="ranking-file">
            <strong>{getShortPath(item.file)}</strong>

            <span>
              {item.dependencies} dependencies •{" "}
              {item.dependents} dependents
            </span>
          </div>

          <div className="ranking-score">
            <span>{item.hotspot_level}</span>
            <strong>{item.hotspot_score}</strong>
          </div>
        </div>
      ))}
  </div>
</section>

          <section className="impact-section">
            <h2>Impact Analysis</h2>

            <p className="section-description">
              Select a file to discover which other files could be affected
              if it changes.
            </p>

            <div className="impact-controls">
              <select
                value={selectedFile}
                onChange={(e) => {
                  setSelectedFile(e.target.value);
                  setImpactResult(null);
                }}
              >
                {result.files.map((file) => (
                  <option
                    key={file.path}
                    value={getShortPath(file.path)}
                  >
                    {getShortPath(file.path)}
                  </option>
                ))}
              </select>

              <button
                onClick={analyzeImpact}
                disabled={impactLoading || !selectedFile}
              >
                {impactLoading
                  ? "Analyzing Impact..."
                  : "Analyze Impact"}
              </button>
            </div>

            {impactResult && (
              <div className="impact-results">
                <div className="impact-count">
                  <span>Impact Count</span>
                  <strong>{impactResult.impact_count}</strong>
                </div>

                <div className="impact-group">
                  <h3>Direct Dependents</h3>

                  {impactResult.direct_dependents.length > 0 ? (
                    <ul>
                      {impactResult.direct_dependents.map((file) => (
                        <li key={file}>
                          {getShortPath(file)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No files directly depend on this file.</p>
                  )}
                </div>

                <div className="impact-group">
                  <h3>All Potentially Affected Files</h3>

                  {impactResult.all_affected_files.length > 0 ? (
                    <ul>
                      {impactResult.all_affected_files.map((file) => (
                        <li key={file}>
                          {getShortPath(file)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No affected files found.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default App;