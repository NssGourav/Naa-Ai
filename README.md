# Naa AI - Prompt Responder

An AI powered chat application that uses Google's Gemini AI to respond to user prompts. The application features a modern React frontend and an Express.js backend.

## 🚀 Features

- Interactive chat interface with markdown support
- Powered by Google Gemini 2.5 Flash model
- Real time AI responses
- Modern and responsive UI
- Deployed on Vercel (frontend) and Render (backend)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Markdown** - Markdown rendering for AI responses

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Google Generative AI** - AI model integration
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
API_KEY=your_google_gemini_api_key_here
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🌐 API Endpoints

### GET `/`
Health check endpoint
- **Response**: `{ "message": "Server is running" }`

### POST `/api/content`
Generate AI response for a prompt
- **Request Body**:
  ```json
  {
    "question": "Your question here"
  }
  ```
- **Response**:
  ```json
  {
    "result": "AI generated response"
  }
  ```
- **Error Response**:
  ```json
  {
    "error": "Internal server error"
  }
  ```

## 🚢 Deployment

### Backend (Render)
- Backend is deployed at: `https://naa-ai-backend.onrender.com`
- Set environment variables in Render dashboard:
  - `API_KEY`: Your Google Gemini API key

### Frontend (Vercel)
- Frontend is configured to connect to the production backend
- The API URL defaults to: `https://naa-ai-backend.onrender.com/api/content`
- You can override it using the `VITE_API_URL` environment variable in Vercel

## 📁 Project Structure

```
Naa-Ai/
├── backend/
│   ├── main.js          # Express server and API routes
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables (not in git)
├── frontend/
│   ├── index.html       # HTML entry point
│   ├── main.jsx         # React application
│   ├── style.css        # Styles
│   ├── vite.config.js   # Vite configuration
│   └── package.json     # Frontend dependencies
└── README.md            
```

## 🔐 Environment Variables

### Backend
- `API_KEY` - Google Gemini API key (required)

### Frontend
- `VITE_API_URL` - API endpoint URL (optional, defaults to production backend)

## 📝 Usage

1. Start both backend and frontend servers
2. Open the frontend application in your browser
3. Type your question in the input field
4. Press Enter or click Send to get AI-generated responses
5. Responses are rendered with markdown support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Backend API**: https://naa-ai-backend.onrender.com
- **Frontend**: https://naa-ai.vercel.app/

---

Built with ❤️ using React and Google Gemini AI.
