# 🧬 AI Software Evolution Simulator

<p align="center">
  <strong>AI-powered software architecture analysis and evolution risk simulation</strong>
</p>

<p align="center">
  Analyze code • Explore dependencies • Predict impact • Simulate evolution • Understand risk
</p>

---

## 📌 About the Project

**AI Software Evolution Simulator** is an interactive software architecture analysis system designed to help developers understand how changes in one part of a software repository may affect the rest of the system.

The application analyzes a Python repository, builds its dependency structure, identifies architectural hotspots, evaluates change impact, and simulates different types of software evolution.

A local AI model then provides a human-readable explanation of the deterministic risk analysis.

> **Key idea:** understand the possible consequences of a software change before introducing it.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Repository Analysis | Scans Python repositories and extracts code structure |
| 🕸️ Dependency Graph | Identifies relationships between internal components |
| 📊 Dependency Metrics | Calculates dependency and connection metrics |
| 🔥 Hotspot Detection | Identifies components with higher structural importance |
| 🎯 Impact Analysis | Finds components potentially affected by a change |
| 🧪 Evolution Simulation | Simulates different software change types |
| ⚠️ Risk Scoring | Calculates deterministic change-risk scores |
| 🤖 AI Reasoning | Explains risk results using a local AI model |
| 🔐 Authentication | Provides registration, login, and JWT-protected APIs |
| 💻 Interactive Dashboard | Visualizes analysis and simulation results |

---

## 🏗️ System Architecture

```text
Repository
    ↓
Repository Analyzer
    ↓
Dependency Graph
    ↓
Dependency Metrics
    ↓
Hotspot Detection
    ↓
Impact Analysis
    ↓
Evolution Engine
    ↓
Risk Calculation
    ↓
Local AI Reasoning
    ↓
Simulation Results
```

---

## 🧠 How It Works

The simulator follows a structured analysis pipeline:

**1. Scan the repository**  
The system analyzes supported Python files and extracts functions, classes, imports, and file-level information.

**2. Build the dependency graph**  
Internal relationships between Python modules are identified.

**3. Calculate structural metrics**  
The system calculates dependency counts, dependents, connections, and hotspot scores.

**4. Analyze impact**  
For a selected component, the system identifies direct and transitive affected components.

**5. Simulate evolution**  
A developer can select a potential change and evaluate its structural risk.

**6. Explain the result with AI**  
A local Llama model explains the deterministic result in practical developer-oriented language.

---

## 🧪 Supported Change Types

The evolution simulator supports:

- `modify_function`
- `add_function`
- `remove_function`
- `change_dependency`
- `change_api`

The deterministic engine combines structural impact, hotspot information, and the selected change type to calculate the risk.

The AI **explains** the calculated result. It does not replace or recalculate the deterministic risk engine.

---

## 🤖 Local AI

The project uses:

- **Ollama**
- **Llama 3.2 3B**

The model runs locally, so the application does not require a paid AI API.

The AI explanation covers:

1. Why the change has its risk level
2. What could potentially break
3. What a developer should review
4. Practical recommendations for reducing risk

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Python
- FastAPI
- Uvicorn
- SQLite
- JWT Authentication

### Analysis Engine
- Python AST parsing
- Static repository scanning
- Dependency graph analysis
- Deterministic risk calculation

### AI
- Ollama
- Llama 3.2 3B

### Tools
- Git
- GitHub
- VS Code
- Docker

---

## 📂 Project Structure

```text
AI-Software-Evolution-Simulator/
│
├── analyzer/
│   └── core/
│       ├── ai_reasoning.py
│       ├── dependency_graph.py
│       ├── dependency_metrics.py
│       ├── evolution_engine.py
│       ├── impact_analysis.py
│       ├── models.py
│       └── repository_scanner.py
│
├── backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── tests/
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js
- npm
- Git
- Ollama

### 1. Clone the repository

```bash
git clone https://github.com/dikshagarg515-bit/AI-Software-Evolution-Simulator.git
cd AI-Software-Evolution-Simulator
```

### 2. Create a Python virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```powershell
pip install -r backend\requirements.txt
```

### 4. Configure environment variables

Create a `.env` file based on `.env.example` and set a secure `SECRET_KEY`.

**Do not commit your real `.env` file to GitHub.**

### 5. Prepare the local AI model

```powershell
ollama pull llama3.2:3b
```

---

## ▶️ Running the Application

### Start the Backend

**Terminal 1, project root:**

```powershell
python -m uvicorn backend.app.main:app
```

Backend:

```text
http://127.0.0.1:8000
```

### Start the Frontend

**Terminal 2:**

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔐 Authentication

The application includes:

- User registration
- Password hashing
- Login
- JWT access tokens
- Protected analysis endpoints
- Current-user session validation

The main workflow is:

```text
Register
   ↓
Login
   ↓
JWT Token
   ↓
Protected API Requests
   ↓
Repository Analysis
```

---

## 🔬 API Endpoints

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Authenticate a user |
| `POST` | `/auth/token` | OAuth2-compatible authentication |
| `GET` | `/auth/me` | Get the current user |

### Analysis

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/analyze` | Analyze repository structure |
| `GET` | `/impact` | Analyze change impact |
| `GET` | `/simulate` | Simulate an evolution change |

Analysis endpoints require authentication.

---

## 🧪 Testing

Run the automated test suite from the project root:

```powershell
pytest
```

The project includes tests covering core analysis functionality and API validation.

---

## 📦 Production Build

Build the frontend for production:

```powershell
cd frontend
npm run build
```

The production files are generated in:

```text
frontend/dist/
```

---

## 🔒 Security

The project follows basic security practices including:

- Password hashing
- JWT authentication
- Protected API endpoints
- Environment-based secret configuration
- `.env` excluded from Git
- SQLite user database excluded from Git
- Generated frontend build files excluded from Git

Never commit passwords, API keys, tokens, or real environment secrets.

---

## 🎯 Project Objective

The objective of this project is to combine **software architecture analysis** and **AI-assisted reasoning** to help developers understand the potential consequences of software evolution.

Rather than treating a code change as an isolated modification, the simulator examines the structural characteristics of the repository and provides a risk-oriented interpretation of the proposed change.

---

## 🔮 Future Scope

Potential future improvements include:

- Support for additional programming languages
- Git history and commit analysis
- Remote repository analysis
- Repository upload functionality
- Advanced dependency visualization
- Historical evolution tracking
- Machine-learning-based risk prediction
- Cloud deployment

---

## 👩‍💻 Author

**Diksha Garg**

BTech Final Year Project

### AI Software Evolution Simulator

---

<p align="center">
  Built as a final-year software engineering project.
</p>
