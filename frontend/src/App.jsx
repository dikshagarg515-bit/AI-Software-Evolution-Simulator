import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [path, setPath] = useState(
    "C:\\Users\\Diksha\\Documents\\AI-Software-Evolution-Simulator"
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState("");
  const [impactResult, setImpactResult] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

  const [changeType, setChangeType] = useState("modify_function");
    // ================================
  // Authentication
  // ================================

  const [token, setToken] = useState(
    () => localStorage.getItem("access_token")
  );

  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [authMode, setAuthMode] = useState("login");

const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

const [registerUsername, setRegisterUsername] = useState("");
const [registerEmail, setRegisterEmail] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [registerConfirmPassword, setRegisterConfirmPassword] =
  useState("");

const [loginLoading, setLoginLoading] = useState(false);
const [registerLoading, setRegisterLoading] = useState(false);

const [loginError, setLoginError] = useState("");
const [registerError, setRegisterError] = useState("");

  const navigation = [
  { id: "overview", label: "Overview" },
  { id: "repository", label: "Repository" },
  { id: "dependencies", label: "Dependencies" },
  { id: "hotspots", label: "Hotspots" },
  { id: "impact", label: "Impact Analysis" },
  { id: "simulation", label: "Evolution Simulation" },
];

  // ================================
  // Check existing login session
  // ================================

  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");

    if (!savedToken) {
      setAuthChecking(false);
      return;
    }

    fetch("http://127.0.0.1:8000/auth/me", {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Session expired");
        }

        return response.json();
      })
      .then((data) => {
        setToken(savedToken);
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  // ================================
  // Login
  // ================================

  const handleLogin = async (event) => {
  event.preventDefault();
  setLoginLoading(true);
  setLoginError("");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Invalid email or password."
      );
    }

    const accessToken =
      data.access_token || data.token;

    if (!accessToken) {
      throw new Error(
        "Login succeeded but no access token was returned."
      );
    }

    localStorage.setItem(
      "access_token",
      accessToken
    );

    setToken(accessToken);

    const meResponse = await fetch(
      "http://127.0.0.1:8000/auth/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (meResponse.ok) {
      const meData = await meResponse.json();
      setUser(meData);
    } else {
      setUser(data.user);
    }

    setLoginPassword("");
  } catch (err) {
    setLoginError(
      err.message || "Login failed."
    );
  } finally {
    setLoginLoading(false);
  }
};

const handleRegister = async (event) => {
  event.preventDefault();
  setRegisterLoading(true);
  setRegisterError("");

  if (
    registerPassword !==
    registerConfirmPassword
  ) {
    setRegisterError(
      "Passwords do not match."
    );
    setRegisterLoading(false);
    return;
  }

  if (registerPassword.length < 6) {
    setRegisterError(
      "Password must contain at least 6 characters."
    );
    setRegisterLoading(false);
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Registration failed."
      );
    }

    setLoginEmail(registerEmail.trim());

    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");

    setAuthMode("login");

    setLoginError(
      "Account created successfully. Please sign in."
    );
  } catch (err) {
    setRegisterError(
      err.message || "Registration failed."
    );
  } finally {
    setRegisterLoading(false);
  }
};
  // ================================
  // Logout
  // ================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    setToken(null);
    setUser(null);

    setResult(null);
    setImpactResult(null);
    setSimulationResult(null);
    setSelectedFile("");
    setActivePage("overview");
  };

  const analyzeRepository = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setImpactResult(null);
    setSimulationResult(null);
    setSelectedFile("");

    try {
      const response = await fetch(
  `http://127.0.0.1:8000/analyze?path=${encodeURIComponent(path)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
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
    if (!selectedFile) return;

    setImpactLoading(true);
    setError("");
    setImpactResult(null);

    try {
      const response = await fetch(
  `http://127.0.0.1:8000/impact?path=${encodeURIComponent(
    path
  )}&file=${encodeURIComponent(selectedFile)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
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
    if (!selectedFile) return;

    setSimulationLoading(true);
    setError("");
    setSimulationResult(null);

    try {
      const response = await fetch(
  `http://127.0.0.1:8000/simulate?path=${encodeURIComponent(
    path
  )}&file=${encodeURIComponent(
    selectedFile
  )}&change_type=${encodeURIComponent(changeType)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
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

  const openPage = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

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
    result?.files?.filter(
      (file) => file.language === "Python"
    ).length || 0;

  const renderAIReasoning = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return <div key={index} className="ai-spacer" />;
      }

      const heading = trimmed.match(
        /^\*\*(\d+)\.\s+(.*?)\*\*(.*)$/
      );

      if (heading) {
        return (
          <div key={index} className="ai-numbered-item">
            <strong>
              {heading[1]}. {heading[2]}
            </strong>

            {heading[3].trim() && (
              <span>
                {heading[3].replace(/^:\s*/, "").trim()}
              </span>
            )}
          </div>
        );
      }

      const plainHeading = trimmed.match(
        /^(\d+)\.\s+(.*)$/
      );

      if (plainHeading) {
        return (
          <div key={index} className="ai-numbered-item">
            <strong>
              {plainHeading[1]}.{" "}
              {plainHeading[2].replace(/\*\*/g, "")}
            </strong>
          </div>
        );
      }

      if (
        trimmed.startsWith("* ") ||
        trimmed.startsWith("- ")
      ) {
        return (
          <div key={index} className="ai-bullet">
            <span>•</span>
            <span>
              {trimmed
                .substring(2)
                .replace(/\*\*/g, "")
                .trim()}
            </span>
          </div>
        );
      }

      return (
        <p key={index}>
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    });
  };

  const renderOverview = () => (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">Dashboard</span>
          <h1>Repository Overview</h1>
          <p>
            A high-level view of the analyzed software repository.
          </p>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <span>Total Files</span>
          <strong>{result.total_files}</strong>
        </div>

        <div className="stat-card">
          <span>Python Files</span>
          <strong>{pythonFiles}</strong>
        </div>

        <div className="stat-card">
          <span>Total Lines</span>
          <strong>{totalLines}</strong>
        </div>

        <div className="stat-card">
          <span>Functions</span>
          <strong>{totalFunctions}</strong>
        </div>

        <div className="stat-card">
          <span>Classes</span>
          <strong>{totalClasses}</strong>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card repository-overview-card">
          
          <div>
            <h2>Repository</h2>
            <p>
              The repository contains the source files
              discovered by the analyzer.
            </p>
          </div>

          <div className="overview-stats">
            <div>
              <strong>{result.total_files}</strong>
              <span>Files</span>
            </div>

            <div>
              <strong>{totalLines}</strong>
              <span>Lines</span>
            </div>

            <div>
              <strong>{pythonFiles}</strong>
              <span>Python</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          
          <div>
            <h2>Architecture</h2>
            <p>
              Dependency information generated from the
              repository structure.
            </p>
          </div>

          <div className="overview-stats purple-stats">
            <div>
              <strong>
                {Object.keys(result.dependency_graph).length}
              </strong>
              <span>Nodes</span>
            </div>

            <div>
              <strong>
                {
                  Object.values(result.dependency_graph).flat()
                    .length
                }
              </strong>
              <span>Connections</span>
            </div>

            <div>
              <strong>
                {result.hotspot_ranking?.length || 0}
              </strong>
              <span>Components</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderRepository = () => (
    <section className="dashboard-section">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">Repository</span>
          <h1>Repository Structure</h1>
          <p>
            Files, functions, classes and imports discovered
            during analysis.
          </p>
        </div>
      </div>

      <div className="repository-path">
        {result.path}
      </div>

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
  );

  const renderDependencies = () => (
    <>
      <section className="dashboard-section">
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">Architecture</span>
            <h1>Dependency Graph</h1>
            <p>
              How files in the repository depend on one another.
            </p>
          </div>
        </div>

        <div className="dependency-legend">
          <span>
            <i className="source-legend"></i>
            Source
          </span>

          <span>
            <i className="target-legend"></i>
            Dependency
          </span>
        </div>

        <div className="dependency-list">
          {Object.entries(result.dependency_graph).map(
            ([source, dependencies]) => (
              <div
                className="dependency-row"
                key={source}
              >
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

      <section className="dashboard-section">
        <div className="page-heading compact">
          <div>
            <h2>Dependency Metrics</h2>
            <p>
              Connectivity measurements for repository files.
            </p>
          </div>
        </div>

        <div className="metrics-list">
          {Object.entries(result.dependency_metrics)
            .sort(
              ([, a], [, b]) =>
                b.total_connections -
                a.total_connections
            )
            .map(([file, metrics]) => (
              <div className="metric-row purple-metric-row" key={file}>
                <div className="metric-file">
                  {getShortPath(file)}
                </div>

                <div className="metric-value">
                  <span>Dependencies</span>
                  <strong>
                    {metrics.dependencies}
                  </strong>
                </div>

                <div className="metric-value">
                  <span>Dependents</span>
                  <strong>
                    {metrics.dependents}
                  </strong>
                </div>

                <div className="metric-value">
                  <span>Connections</span>
                  <strong>
                    {metrics.total_connections}
                  </strong>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );

  const renderHotspots = () => (
    <>
      <section className="dashboard-section">
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">Architecture</span>
            <h1>Architectural Hotspots</h1>
            <p>
              Components with the highest connectivity.
            </p>
          </div>
        </div>

        <div className="hotspot-list">
          {result.hotspot_ranking
            .filter((item) => item.hotspot_score > 0)
            .slice(0, 10)
            .map((item, index) => (
              <div
                className="hotspot-card"
                key={item.file}
              >
                <div className="hotspot-rank">
                  #{index + 1}
                </div>

                <div className="hotspot-main">
                  <div className="hotspot-header">
                    <h3>
                      {getShortPath(item.file)}
                    </h3>

                    <span
  className={`hotspot-badge hotspot-${item.hotspot_level.toLowerCase()}`}
>
  {item.hotspot_level}
</span>
                  </div>

                  <div className="hotspot-details">
                    <span>
                      Dependencies:{" "}
                      {item.dependencies}
                    </span>

                    <span>
                      Dependents:{" "}
                      {item.dependents}
                    </span>

                    <span>
                      Connections:{" "}
                      {item.total_connections}
                    </span>
                  </div>

                  <div className="hotspot-bar">
                    <div
                      className="hotspot-bar-fill"
                      style={{
                        width: `${Math.min(
                          item.hotspot_score * 10,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <strong className="hotspot-score">
                  {item.hotspot_score}
                </strong>
              </div>
            ))}
        </div>
      </section>
    </>
  );

  const renderImpact = () => (
    <section className="dashboard-section">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            Change Analysis
          </span>
          <h1>Impact Analysis</h1>
          <p>
            Discover which components could be affected
            when a file changes.
          </p>
        </div>
      </div>

      <div className="analysis-controls">
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
  className="analyze-impact-button"
  onClick={analyzeImpact}
  disabled={impactLoading || !selectedFile}
>
  {impactLoading
    ? "Analyzing..."
    : "Analyze Impact"}
</button>
      </div>

      {impactResult && (
        <div className="impact-results">
          <div className="impact-count">
            <span>Impact Count</span>
            <strong>
              {impactResult.impact_count}
            </strong>
          </div>

          <div className="impact-group">
            <h3>Direct Dependents</h3>

            {impactResult.direct_dependents
              .length > 0 ? (
              <ul>
                {impactResult.direct_dependents.map(
                  (file) => (
                    <li key={file}>
                      {getShortPath(file)}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No files directly depend on this
                file.
              </p>
            )}
          </div>

          <div className="impact-group">
            <h3>
              All Potentially Affected Files
            </h3>

            {impactResult.all_affected_files
              .length > 0 ? (
              <ul>
                {impactResult.all_affected_files.map(
                  (file) => (
                    <li key={file}>
                      {getShortPath(file)}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p>
                No affected files found.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );

  const renderSimulation = () => (
    <section className="dashboard-section">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            Software Evolution
          </span>

          <h1>Evolution Simulation</h1>

          <p>
            Simulate a software change and estimate
            its structural risk.
          </p>
        </div>
      </div>

      <div className="simulation-controls">
        <select
          value={selectedFile}
          onChange={(e) => {
            setSelectedFile(e.target.value);
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

        <button
          onClick={simulateEvolution}
          disabled={
            simulationLoading || !selectedFile
          }
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
              <strong>
                {simulationResult.risk_level}
              </strong>
            </div>

            <div>
              <span>Risk Score</span>
              <strong>
                {simulationResult.risk_score}
              </strong>
            </div>

            <div>
              <span>Impact Count</span>
              <strong>
                {simulationResult.impact_count}
              </strong>
            </div>

            <div>
              <span>Hotspot Score</span>
              <strong>
                {simulationResult.hotspot_score}
              </strong>
            </div>
          </div>

          <div className="risk-explanation">
            <h3>
              Why is this change risky?
            </h3>

            <p>
              {simulationResult.risk_explanation}
            </p>
          </div>

          <div className="architecture-evidence">
            <div className="architecture-evidence-header">
              <div>
                <h3>
                  Confirmed Architecture Evidence
                </h3>

                <p>
                  Dependency relationships identified
                  by the deterministic analysis engine.
                </p>
              </div>

              <span className="evidence-badge">
                Deterministic
              </span>
            </div>

            <div className="evidence-grid">
              <div className="evidence-card">
                <h4>
                  Confirmed Direct Dependents
                </h4>

                <p className="evidence-description">
                  Components that directly depend on
                  the selected target.
                </p>

                {simulationResult.direct_dependents
                  .length > 0 ? (
                  <div className="dependency-evidence-list">
                    {simulationResult.direct_dependents.map(
                      (file) => (
                        <div
                          className="dependency-evidence-row"
                          key={file}
                        >
                          <span className="evidence-file">
                            {getShortPath(file)}
                          </span>

                          <span className="evidence-arrow">
                            →
                          </span>

                          <span className="evidence-target">
                            {getShortPath(
                              simulationResult.target_file
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="empty-evidence">
                    No confirmed direct dependents
                    found.
                  </p>
                )}
              </div>

              <div className="evidence-card">
                <h4>
                  Potentially Affected Files
                </h4>

                <p className="evidence-description">
                  Files that may be affected through
                  the dependency chain.
                </p>

                {simulationResult.all_affected_files
                  .length > 0 ? (
                  <div className="affected-files-list">
                    {simulationResult.all_affected_files.map(
                      (file) => (
                        <div
                          className="affected-file"
                          key={file}
                        >
                          {getShortPath(file)}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="empty-evidence">
                    No potentially affected files
                    found.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="ai-reasoning">
            <div className="ai-reasoning-header">
              <span className="ai-icon">
                🤖
              </span>

              <div>
                <h3>
                  AI Architectural Analysis
                </h3>

                <p>
                  Generated by the local AI reasoning
                  engine
                </p>
              </div>
            </div>

            <div className="ai-reasoning-content">
              {renderAIReasoning(
                simulationResult.ai_reasoning
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );

    // ================================
  // Login Screen
  // ================================
const renderLogin = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "#07070d",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "540px",
        padding: "46px",
        borderRadius: "24px",
        background: "#11101a",
        border: "1px solid rgba(255,255,255,0.12)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        <img
          src="/src/assets/evolution-logo.png"
          alt="Evolution Simulator"
          style={{
            width: "250px",
            maxWidth: "80%",
            marginBottom: "24px",
          }}
        />

        <h1
          style={{
            margin: "0 0 10px",
            color: "#ffffff",
            fontSize: "36px",
          }}
        >
          {authMode === "login"
            ? "Welcome Back"
            : "Create Account"}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#9b98ad",
            fontSize: "17px",
          }}
        >
          {authMode === "login"
            ? "Sign in to access the Evolution Simulator"
            : "Join the Evolution Simulator"}
        </p>
      </div>

      {authMode === "login" ? (
        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={loginEmail}
            onChange={(event) =>
              setLoginEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "24px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={loginPassword}
            onChange={(event) =>
              setLoginPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "18px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          {loginError && (
            <p
              style={{
                color: loginError.includes("successfully")
                  ? "#43d17a"
                  : "#ff6b6b",
                marginBottom: "16px",
              }}
            >
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: "100%",
              padding: "18px",
              border: "none",
              borderRadius: "12px",
              background: "#20c5dc",
              color: "#050509",
              fontSize: "18px",
              fontWeight: 700,
              cursor: loginLoading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loginLoading
              ? "Signing in..."
              : "Sign In"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              color: "#9b98ad",
            }}
          >
            New user?{" "}
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setLoginError("");
              }}
              style={{
                border: "none",
                background: "none",
                color: "#20c5dc",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "inherit",
              }}
            >
              Create an account
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Username
          </label>

          <input
            type="text"
            value={registerUsername}
            onChange={(event) =>
              setRegisterUsername(event.target.value)
            }
            placeholder="Choose a username"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={registerEmail}
            onChange={(event) =>
              setRegisterEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={registerPassword}
            onChange={(event) =>
              setRegisterPassword(event.target.value)
            }
            placeholder="Create a password"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            value={registerConfirmPassword}
            onChange={(event) =>
              setRegisterConfirmPassword(
                event.target.value
              )
            }
            placeholder="Confirm your password"
            required
            style={{
              width: "100%",
              padding: "18px",
              marginBottom: "18px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#08080d",
              color: "#ffffff",
              fontSize: "18px",
              boxSizing: "border-box",
            }}
          />

          {registerError && (
            <p
              style={{
                color: "#ff6b6b",
                marginBottom: "16px",
              }}
            >
              {registerError}
            </p>
          )}

          <button
            type="submit"
            disabled={registerLoading}
            style={{
              width: "100%",
              padding: "18px",
              border: "none",
              borderRadius: "12px",
              background: "#20c5dc",
              color: "#050509",
              fontSize: "18px",
              fontWeight: 700,
              cursor: registerLoading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {registerLoading
              ? "Creating account..."
              : "Create Account"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              color: "#9b98ad",
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setRegisterError("");
              }}
              style={{
                border: "none",
                background: "none",
                color: "#20c5dc",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "inherit",
              }}
            >
              Sign In
            </button>
          </p>
        </form>
      )}
    </div>
  </div>
);

  const renderCurrentPage = () => {
    if (!result) {
      return (
        <div className="empty-dashboard">
          <div className="empty-icon">⌘</div>

          <h1>Analyze a repository to begin</h1>

          <p>
            Enter a repository path above and run the
            analyzer to explore the software architecture.
          </p>
        </div>
      );
    }

    switch (activePage) {
      case "repository":
        return renderRepository();

      case "dependencies":
        return renderDependencies();

      case "hotspots":
        return renderHotspots();

      case "impact":
        return renderImpact();

      case "simulation":
        return renderSimulation();

      default:
        return renderOverview();
    }
  };

    if (authChecking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08070f",
          color: "#ffffff",
          fontSize: "18px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (!token || !user) {
    return renderLogin();
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
  <img
    src="/src/assets/evolution-logo.png"
    alt="Evolution Simulator"
    className="sidebar-logo"
  />
</div>

        <nav className="sidebar-nav">
          <p className="nav-label">
            ANALYSIS
          </p>

          {navigation.map((item) => (
            <button
              key={item.id}
              className={
                activePage === item.id
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                openPage(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

                <div className="sidebar-footer">
          <span>
            {user?.username || "User"}
          </span>

          <strong>Ollama</strong>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginTop: "14px",
              width: "100%",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >
            ☰
          </button>

          <div className="topbar-title">
            <strong>
              AI Software Evolution Simulator
            </strong>

            <span>
              Software architecture analysis platform
            </span>
          </div>
        </header>

        <section className="analyzer-bar">
          <div className="path-wrapper">
            <span>Repository</span>

            <input
              value={path}
              onChange={(e) =>
                setPath(e.target.value)
              }
              placeholder="Enter repository path"
            />
          </div>

          <button
            onClick={analyzeRepository}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Repository"}
          </button>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="content-area">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
}

export default App;