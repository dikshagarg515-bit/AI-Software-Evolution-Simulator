import { useState } from "react";
import "./App.css";

function renderAIReasoning(text) {
  if (!text) {
    return null;
  }

  return text.split("\n").map((line, index) => {
    const trimmedLine = line.trim();
    const cleanLine = trimmedLine
      .replace(/^:\s*/, "")
      .replace(/`/g, "");

    if (!cleanLine) {
      return <div key={index} className="ai-spacer" />;
    }

    /*
     * Format:
     * **1. Heading**Explanation
     */
    const boldNumberedMatch = cleanLine.match(
      /^\*\*(\d+)\.\s+(.*?)\*\*(.*)$/
    );

    if (boldNumberedMatch) {
      return (
        <div key={index} className="ai-numbered-item">
          <strong>
            {boldNumberedMatch[1]}. {boldNumberedMatch[2]}
          </strong>

          {boldNumberedMatch[3].trim() && (
            <span>
              {boldNumberedMatch[3]
                .replace(/^:\s*/, "")
                .trim()}
            </span>
          )}
        </div>
      );
    }

    /*
     * Format:
     * 1. **Heading**Explanation
     */
    const numberedMatch = cleanLine.match(
      /^(\d+)\.\s+\*\*(.*?)\*\*(.*)$/
    );

    if (numberedMatch) {
      return (
        <div key={index} className="ai-numbered-item">
          <strong>
            {numberedMatch[1]}. {numberedMatch[2]}
          </strong>

          {numberedMatch[3].trim() && (
            <span>
              {numberedMatch[3]
                .replace(/^:\s*/, "")
                .trim()}
            </span>
          )}
        </div>
      );
    }

    /*
     * Normal numbered heading
     */
    const plainNumberedMatch = cleanLine.match(
      /^(\d+)\.\s+(.*)$/
    );

    if (plainNumberedMatch) {
      return (
        <div key={index} className="ai-numbered-item">
          <strong>
            {plainNumberedMatch[1]}.{" "}
            {plainNumberedMatch[2].replace(/\*\*/g, "")}
          </strong>
        </div>
      );
    }

    /*
     * Bullet points
     */
    if (
      cleanLine.startsWith("* ") ||
      cleanLine.startsWith("- ") ||
      cleanLine.startsWith("• ")
    ) {
      return (
        <div key={index} className="ai-bullet">
          <span>•</span>

          <span>
            {cleanLine
              .substring(2)
              .replace(/\*\*/g, "")
              .replace(/^:\s*/, "")
              .trim()}
          </span>
        </div>
      );
    }

    /*
     * Regular paragraph
     */
    return (
      <p key={index}>
        {cleanLine.replace(/\*\*/g, "").trim()}
      </p>
    );
  });
}

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

  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
const [changeType, setChangeType] = useState("modify_function");

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
  const simulateEvolution = async () => {
  if (!selectedFile) {
    return;
  }

  setSimulationLoading(true);
  setError("");
  setSimulationResult(null);

  try {
    const response = await fetch(
  `http://127.0.0.1:8000/simulate?path=${encodeURIComponent(
    path
  )}&file=${encodeURIComponent(selectedFile)}&change_type=${encodeURIComponent(
    changeType
  )}`
);

    if (!response.ok) {
      throw new Error("Failed to simulate change");
    }

    const data = await response.json();
    setSimulationResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setSimulationLoading(false);
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

    const connectedComponents =
  result?.dependency_metrics
    ? Object.values(result.dependency_metrics).filter(
        (metrics) => metrics.total_connections > 0
      ).length
    : 0;

const highHotspots =
  result?.hotspot_ranking
    ? result.hotspot_ranking.filter(
        (item) => item.hotspot_level === "High"
      ).length
    : 0;

const mediumHotspots =
  result?.hotspot_ranking
    ? result.hotspot_ranking.filter(
        (item) => item.hotspot_level === "Medium"
      ).length
    : 0;

const totalDependencies =
  result?.dependency_metrics
    ? Object.values(result.dependency_metrics).reduce(
        (sum, metrics) => sum + metrics.dependencies,
        0
      )
    : 0;

    

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

<section className="overview-grid">
  <div className="overview-card repository-overview">
    <div className="overview-icon">📁</div>

    <div>
      <h2>Repository Overview</h2>
      <p>
        A quick summary of the analyzed software repository.
      </p>
    </div>

    <div className="overview-stats">
      <div>
        <strong>{result.total_files}</strong>
        <span>Total Files</span>
      </div>

      <div>
        <strong>{pythonFiles}</strong>
        <span>Python Files</span>
      </div>

      <div>
        <strong>{totalLines}</strong>
        <span>Lines of Code</span>
      </div>
    </div>
  </div>

  <div className="overview-card architecture-overview">
    <div className="overview-icon">🕸️</div>

    <div>
      <h2>Architecture Overview</h2>
      <p>
        A quick view of the repository's dependency structure.
      </p>
    </div>

    <div className="architecture-stats">
      <div>
        <strong>{connectedComponents}</strong>
        <span>Connected Components</span>
      </div>

      <div>
        <strong>{totalDependencies}</strong>
        <span>Dependencies</span>
      </div>

      <div>
        <strong>{highHotspots}</strong>
        <span>High Hotspots</span>
      </div>

      <div>
        <strong>{mediumHotspots}</strong>
        <span>Medium Hotspots</span>
      </div>
    </div>
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
            <div className="dependency-legend">
  <div className="legend-item">
    <span className="legend-box source-legend"></span>
    <span>Source component</span>
  </div>

  <div className="legend-arrow">→</div>

  <div className="legend-item">
    <span className="legend-box target-legend"></span>
    <span>Dependency</span>
  </div>
</div>

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

  <div className="hotspot-list">
    {result.hotspot_ranking.map((item, index) => (
  <div
    key={item.file}
    className={`hotspot-card hotspot-${item.hotspot_level.toLowerCase()}`}
  >
    <div className="hotspot-rank">
      #{index + 1}
    </div>

    <div className="hotspot-main">
      <div className="hotspot-header">
        <h3>{getShortPath(item.file)}</h3>

        <span className="hotspot-badge">
          {item.hotspot_level}
        </span>
      </div>

      <div className="hotspot-details">
        <span>
          {item.dependencies} dependencies
        </span>

        <span>
          {item.dependents} dependents
        </span>

        <span>
          {item.total_connections} connections
        </span>
      </div>

      <div className="hotspot-bar">
        <div
          className="hotspot-bar-fill"
          style={{
            width: `${Math.min(
              item.hotspot_score * 20,
              100
            )}%`,
          }}
        ></div>
      </div>
    </div>

    <div className="hotspot-score">
      <strong>{item.hotspot_score}</strong>
      <span>Score</span>
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
          <section className="simulation-section">
  <h2>Evolution Simulation</h2>

  <p className="section-description">
    Simulate a change to a component and estimate its structural impact.
  </p>

  <div className="simulation-controls">
  <select
  value={changeType}
  onChange={(e) => {
    setChangeType(e.target.value);
    setSimulationResult(null);
  }}
>
  <option value="modify_function">
    Modify Function
  </option>

  <option value="add_function">
    Add Function
  </option>

  <option value="remove_function">
    Remove Function
  </option>

  <option value="change_dependency">
    Change Dependency
  </option>

  <option value="change_api">
    Change API
  </option>
</select>
    <select
      value={selectedFile}
      onChange={(e) => {
        setSelectedFile(e.target.value);
        setImpactResult(null);
        setSimulationResult(null);
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
      onClick={simulateEvolution}
      disabled={simulationLoading || !selectedFile}
    >
      {simulationLoading
        ? "Simulating..."
        : "Simulate Change"}
    </button>
  </div>

  {simulationResult && (
    <div className="simulation-results">
      <div className="simulation-summary">
        <div>
          <span>Risk Level</span>
          <strong>{simulationResult.risk_level}</strong>
        </div>

        <div>
          <span>Risk Score</span>
          <strong>{simulationResult.risk_score}</strong>
        </div>

        <div>
          <span>Impact Count</span>
          <strong>{simulationResult.impact_count}</strong>
        </div>

        <div>
          <span>Hotspot Score</span>
          <strong>{simulationResult.hotspot_score}</strong>
        </div>
      </div>
      

      <div className="risk-explanation">
  <h3>Why is this change risky?</h3>

  <p>{simulationResult.risk_explanation}</p>
</div>
<div className="ai-reasoning">
  <div className="ai-reasoning-header">
    <span className="ai-icon">🤖</span>
    <div>
      <h3>AI Architectural Analysis</h3>
      <p>Generated by the local AI reasoning engine</p>
    </div>
  </div>

  <div className="ai-reasoning-content">
  {renderAIReasoning(simulationResult.ai_reasoning)}
</div>
</div>

<div className="architecture-evidence">
  <div className="architecture-evidence-header">
    <div>
      <h3>Confirmed Architecture Evidence</h3>
      <p>
        Dependency relationships identified by the deterministic analysis engine.
      </p>
    </div>

    <span className="evidence-badge">Deterministic</span>
  </div>

  <div className="evidence-grid">
    <div className="evidence-card">
      <h4>Confirmed Direct Dependents</h4>

      <p className="evidence-description">
        These components directly depend on the selected target file.
      </p>

      {simulationResult.direct_dependents.length > 0 ? (
        <div className="dependency-evidence-list">
          {simulationResult.direct_dependents.map((file) => (
            <div
              key={file}
              className="dependency-evidence-row"
            >
              <span className="evidence-file">
                {getShortPath(file)}
              </span>

              <span className="evidence-arrow">
                →
              </span>

              <span className="evidence-target">
                {getShortPath(simulationResult.target_file)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-evidence">
          No confirmed direct dependents found.
        </p>
      )}
    </div>

    <div className="evidence-card">
      <h4>Potentially Affected Files</h4>

      <p className="evidence-description">
        Files that may be affected through the dependency chain.
      </p>

      {simulationResult.all_affected_files.length > 0 ? (
        <div className="affected-files-list">
          {simulationResult.all_affected_files.map((file) => (
            <div
              key={file}
              className="affected-file"
            >
              {getShortPath(file)}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-evidence">
          No potentially affected files found.
        </p>
      )}
    </div>
  </div>
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