import { useState } from "react";

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

  return (
    <div>
      <h1>AI Software Evolution Simulator</h1>

      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        style={{ width: "500px" }}
      />

      <button onClick={analyzeRepository}>
        {loading ? "Analyzing..." : "Analyze Repository"}
      </button>

      {error && <p>{error}</p>}

      {result && (
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;