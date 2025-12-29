import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import './style.css'

const API_URL = 'http://localhost:3000/api/content'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const question = input.trim()
    if (!question || loading) return

    setMessages(prev => [...prev, { text: question, isUser: true }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()
      
      if (data.result) {
        setMessages(prev => [...prev, { text: data.result, isUser: false }])
      } else if (data.error) {
        setMessages(prev => [...prev, { text: `Error: ${data.error}`, isUser: false }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Error: Could not connect to server. Make sure backend is running on port 3000.', 
        isUser: false 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="container">
      <h1>Naa AI - Prompt Responder</h1>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
              {msg.isUser ? (
                msg.text
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          ))}
          {loading && (
            <div className="message ai loading">Thinking...</div>
          )}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)

