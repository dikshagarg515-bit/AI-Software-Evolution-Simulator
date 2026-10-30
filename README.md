\# AI Software Evolution Simulator



An AI-powered software architecture analysis and evolution risk simulator that analyzes a Python repository, identifies dependencies and architectural hotspots, evaluates the impact of potential changes, and provides AI-assisted explanations of software evolution risks.



\## Features



\- Repository structure analysis

\- Python dependency graph generation

\- Dependency metrics and architectural hotspot detection

\- Impact analysis

\- Software evolution simulation

\- Deterministic risk scoring

\- AI-generated risk explanations

\- User registration and JWT authentication

\- Local AI reasoning using Ollama and Llama 3.2 3B



\## System Architecture



```text

Repository

&#x20;   ↓

Repository Analyzer

&#x20;   ↓

Dependency Graph

&#x20;   ↓

Dependency Metrics

&#x20;   ↓

Hotspot Detection

&#x20;   ↓

Impact Analysis

&#x20;   ↓

Evolution Engine

&#x20;   ↓

Risk Calculation

&#x20;   ↓

Local AI Reasoning

&#x20;   ↓

Simulation Results

```



\## Technology Stack



\### Frontend

\- React

\- Vite

\- JavaScript

\- CSS



\### Backend

\- Python

\- FastAPI

\- Uvicorn

\- SQLite

\- JWT Authentication



\### Analysis Engine

\- Python AST parsing

\- Dependency graph analysis

\- Static repository scanning

\- Deterministic risk calculation



\### AI

\- Ollama

\- Llama 3.2 3B



\## Project Structure



```text

AI-Software-Evolution-Simulator/

├── analyzer/

│   └── core/

├── backend/

│   ├── app/

│   └── tests/

├── frontend/

│   ├── src/

│   └── public/

├── tests/

├── docs/

├── .env.example

├── .gitignore

└── README.md

```



\## Getting Started



\### Prerequisites



\- Python 3.12+

\- Node.js

\- npm

\- Git

\- Ollama



\### Clone the repository



```bash

git clone https://github.com/dikshagarg515-bit/AI-Software-Evolution-Simulator.git

cd AI-Software-Evolution-Simulator

```



\### Backend setup



Create and activate a virtual environment:



```powershell

python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1

```



Install dependencies:



```powershell

pip install -r backend\\requirements.txt

```



Create a `.env` file using `.env.example` and provide a secure `SECRET\_KEY`.



\### AI setup



Install Ollama and download the local model:



```powershell

ollama pull llama3.2:3b

```



\### Start the backend



From the project root:



```powershell

python -m uvicorn backend.app.main:app

```



Backend:



```text

http://127.0.0.1:8000

```



\### Start the frontend



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Frontend:



```text

http://localhost:5173

```



\## Evolution Simulation



The simulator supports these change types:



\- `modify\_function`

\- `add\_function`

\- `remove\_function`

\- `change\_dependency`

\- `change\_api`



Risk is calculated deterministically using structural impact, hotspot score, and change type.



The local AI then explains the calculated result and provides practical recommendations.



\## Authentication



The application includes:



\- User registration

\- Password hashing

\- Login

\- JWT authentication

\- Protected analysis endpoints

\- Current-user session validation



\## Testing



Run the test suite from the project root:



```powershell

pytest

```



\## Production Build



To create the frontend production build:



```powershell

cd frontend

npm run build

```



\## Security



Sensitive configuration is stored through environment variables.



The following are excluded from Git:



\- `.env`

\- Virtual environments

\- `node\_modules`

\- SQLite user database

\- Generated build files



Never commit passwords, secrets, API keys, or `.env` files.



\## Project Objective



The objective of this project is to combine software architecture analysis with AI-assisted reasoning to help developers understand the potential consequences of software changes before they are introduced.



\## Author



\*\*Diksha Garg\*\*



BTech Final Year Project



\*\*AI Software Evolution Simulator\*\*

