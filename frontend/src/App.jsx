import { useEffect, useState } from "react";
import "./App.css";
import logo from "./assets/evolution-logo-clean.png";

const icon = (children) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NAV_ICONS = {
  overview: icon(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.8" />
    </>
  ),
  repository: icon(
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  dependencies: icon(
    <>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="M8.2 11l7.6-4M8.2 13l7.6 4" />
    </>
  ),
  hotspots: icon(
    <path d="M12 3c.5 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 .8-3.3 2-4.4.1 1.8.9 2.7 2 3 .3-3-.5-5.3 1-8.6z" />
  ),
  impact: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  simulation: icon(
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
};

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
  { id: "overview", label: "Overview", icon: NAV_ICONS.overview },
  { id: "repository", label: "Repository", icon: NAV_ICONS.repository },
  { id: "dependencies", label: "Dependencies", icon: NAV_ICONS.dependencies },
  { id: "hotspots", label: "Hotspots", icon: NAV_ICONS.hotspots },
  { id: "impact", label: "Impact Analysis", icon: NAV_ICONS.impact },
  { id: "simulation", label: "Evolution Simulation", icon: NAV_ICONS.simulation },
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
              <strong
          className={`risk-level risk-${String(simulationResult.risk_level).toLowerCase()}`}
        >
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
  // Login / Register Screen
  // ================================
  const renderLogin = () => (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img
            src={logo}
            alt="Evolution Simulator"
            className="auth-logo"
          />

          <h1>
            {authMode === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h1>

          <p>
            {authMode === "login"
              ? "Sign in to access the Evolution Simulator"
              : "Join the Evolution Simulator"}
          </p>
        </div>

        {authMode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <p
                className={`auth-message ${
                  loginError.includes("successfully")
                    ? "success"
                    : "error"
                }`}
              >
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="auth-switch">
              New user?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setAuthMode("register");
                  setLoginError("");
                }}
              >
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="auth-field">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                value={registerUsername}
                onChange={(event) =>
                  setRegisterUsername(event.target.value)
                }
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={registerEmail}
                onChange={(event) =>
                  setRegisterEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={registerPassword}
                onChange={(event) =>
                  setRegisterPassword(event.target.value)
                }
                placeholder="Create a password"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirm">
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                value={registerConfirmPassword}
                onChange={(event) =>
                  setRegisterConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm your password"
                required
              />
            </div>

            {registerError && (
              <p className="auth-message error">
                {registerError}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={registerLoading}
            >
              {registerLoading
                ? "Creating account..."
                : "Create Account"}
            </button>

            <p className="auth-switch">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setAuthMode("login");
                  setRegisterError("");
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
      <div className="auth-loading">
        <span className="auth-spinner" />
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
    src={logo}
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
            className="logout-button"
            onClick={handleLogout}
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