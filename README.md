<p align="center">
  <h1 align="center">📚 Naa-Ai</h1>
  <p align="center">
    <strong>Intelligent Lecture Assistant — Turn PDFs into Study Superpowers</strong>
  </p>
  <p align="center">
    <a href="#-getting-started">Quick Start</a> •
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api-reference">API</a> •
    <a href="#-deployment">Deploy</a>
  </p>
</p>

---

> Upload a lecture PDF, and Naa-Ai instantly generates structured notes, AI-powered summaries, focus keywords, and helpful links — all inside a beautiful split-screen dashboard.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Smart PDF Ingestion** | Extracts text with `pdfplumber`, auto-detects headings, strips headers/footers, and cleans noise |
| 🧠 **AI Summarization** | Graph-based extractive summaries via `PyTextRank`, with auto-detected helpful links |
| 🔑 **TF-IDF Keyword Extraction** | Identifies the top focus keywords using `scikit-learn` unigram/bigram analysis |
| 📝 **Exam-Ready Notes** | Auto-generates per-page revision notes — detects bullets, definitions, and key sentences |
| 🔀 **Resizable Split-Screen UI** | Drag-to-resize PDF viewer + analysis panel for side-by-side studying |
| 🎨 **Dark Mode Dashboard** | GitHub-inspired dark theme with glassmorphism, smooth animations, and custom scrollbars |

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for instant HMR dev server
- **React Markdown** for rendering rich summaries
- **Vanilla CSS** — custom design system using CSS variables, `Inter` + `Outfit` fonts

### Backend — Python (Primary)
- **FastAPI** — high-performance async API with automatic OpenAPI docs
- **spaCy** (`en_core_web_sm`) — NLP pipeline for sentence segmentation and entity recognition
- **PyTextRank** — graph-based extractive summarization
- **scikit-learn** — TF-IDF vectorization for keyword extraction
- **pdfplumber** — robust PDF text extraction

### Backend — Node.js (Legacy)
- **Express 5** — REST API server
- **Google Generative AI SDK** — Gemini 2.5 Flash integration for generative Q&A

### Infrastructure
| Layer | Tool |
|-------|------|
| Frontend Hosting | [Vercel](https://vercel.com) |
| Backend Hosting | [Render](https://render.com) |
| Build Script | `build.sh` (spaCy model download + Gunicorn) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                    │
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │  PDF Viewer       │  │  Analysis Panel                     │ │
│  │  (iframe)         │  │  ┌──────────┐ ┌──────────────────┐  │ │
│  │                   │◄─┤  │  Notes    │ │  Summary +       │  │ │
│  │                   │  │  │  Tab      │ │  Keywords Tab    │  │ │
│  └──────────────────┘  └──┴──────────┴─┴──────────────────┘──┘ │
│         ▲ Resizable Divider                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (Python)                     │
│                                                                 │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Ingestion   │  │ NLP Pipeline  │  │ Storage Layer           │ │
│  │ /api/ingest │─▶│ extract →     │─▶│ MD5-hashed JSON cache   │ │
│  │             │  │ summarize →   │  │ data/<hash>.json        │ │
│  │             │  │ keywords →    │  │                         │ │
│  │             │  │ notes         │  │                         │ │
│  └────────────┘  └──────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Processing Pipeline

1. **Ingestion** — PDF uploaded → text extracted page-by-page via `pdfplumber`
2. **Cleaning** — Headers, footers, and noise patterns stripped with regex
3. **Structure Detection** — Headings identified by casing, title-case, and colon patterns
4. **Summarization** — TextRank graph algorithm selects top-6 representative sentences
5. **Keyword Extraction** — TF-IDF scores rank unigrams and bigrams by relevance
6. **Notes Generation** — Bullets, definitions, and key sentences extracted per page
7. **Caching** — Results stored as JSON keyed by MD5 hash of content

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/ingest` | Upload a PDF — returns `lecture_id` and `title` |
| `GET` | `/api/lecture/:id` | Retrieve processed lecture data (summary, keywords, notes) |
| `GET` | `/api/lectures` | List all processed lectures |

## ⚡ Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+

### 1. Clone the Repository

```bash
git clone https://github.com/NssGourav/Naa-Ai.git
cd Naa-Ai
```

### 2. Backend Setup (Python)

```bash
cd backend_py
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn main:app --reload
```

The API will be live at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive Swagger docs.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_BASE_URL (defaults to http://localhost:8000/api)
npm run dev
```

The app will be live at `http://localhost:5173`.

## 🧪 Testing

Run the NLP pipeline validation suite:

```bash
python backend_py/verify_nlp.py
```

## 🚀 Deployment

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | Auto-deploys on push — set `VITE_API_BASE_URL` in environment |
| Backend | [Render](https://render.com) | Uses `build.sh` for setup — runs with Gunicorn in production |

## � Project Structure

```
Naa-Ai/
├── frontend/
│   ├── index.html          # Entry point
│   ├── main.jsx            # React app — upload, tabs, split-screen
│   ├── style.css           # Full design system (dark theme, animations)
│   ├── vite.config.js      # Vite configuration
│   └── .env.example        # Environment template
├── backend_py/
│   ├── main.py             # FastAPI server + routes
│   ├── nlp_pipeline.py     # NLP engine (extract, summarize, keywords, notes)
│   ├── storage.py          # JSON-based lecture cache with MD5 hashing
│   ├── verify_nlp.py       # Pipeline validation script
│   ├── build.sh            # Render deploy script
│   ├── requirements.txt    # Python dependencies
│   └── data/               # Cached lecture JSON files
├── backend/                # Legacy Node.js backend (Gemini AI)
│   └── main.js             # Express + Google Generative AI
├── LICENSE                 # MIT License
└── README.md
```

## 👨‍💻 Author

**Gourav N S S**
- GitHub: [@NssGourav](https://github.com/NssGourav)

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built for the Newton School of Technology </sub>
</p>
