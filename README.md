# ⚡ ResumeAI — AI-Powered Resume Builder

> A full-stack web application that helps users build professional, ATS-optimized resumes with the help of Google Gemini AI.

![Tech Stack](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=flat-square&logo=google)
![Tech Stack](https://img.shields.io/badge/PDF-ReportLab-red?style=flat-square)

---

## 🚀 Features

- **AI-Powered Enhancement** — Uses Google Gemini to enhance summaries, experience descriptions, and project write-ups
- **Live Preview** — See exactly how your resume looks before downloading
- **PDF Export** — Download a clean, professional ATS-friendly PDF
- **Multi-Section Support** — Personal info, summary, experience, education, skills, and projects
- **Smart Checklist** — Tracks completion of each resume section
- **Target Role Optimization** — AI tailors content based on your job target

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS-in-JS |
| Backend | Python, FastAPI |
| AI | Google Gemini 1.5 Flash API |
| PDF Generation | ReportLab |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## 📁 Project Structure

```
ai-resume-builder/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx        # Main React application
│   │   └── index.js       # Entry point
│   └── package.json
├── backend/
│   ├── main.py            # FastAPI server + all endpoints
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Python 3.9+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY in .env
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enhance` | AI-enhance any text section |
| POST | `/api/generate-summary` | Auto-generate professional summary |
| POST | `/api/export-pdf` | Generate and download PDF resume |

---

## 🚀 Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Deploy build/ folder to Vercel
```

**Backend → Render**
- Connect GitHub repo to Render
- Set `GEMINI_API_KEY` as environment variable
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## 📸 Screenshots

> Live preview with dark UI editor on the left, clean white resume preview on the right.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use and modify.

---

**Built with ❤️ by [Dannyy69](https://github.com/Dannyy69)**
