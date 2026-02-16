import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import './style.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

function App() {
  const [lectureData, setLectureData] = useState(null)
  const [activeTab, setActiveTab] = useState('notes')
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [panelWidth, setPanelWidth] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = () => setIsResizing(true)
  const stopResizing = () => setIsResizing(false)

  const resize = (e) => {
    if (isResizing) {
      const newWidth = (e.clientX / window.innerWidth) * 100
      if (newWidth > 20 && newWidth < 80) {
        setPanelWidth(newWidth)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setPdfUrl(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      if (data.lecture_id) {
        await fetchLectureData(data.lecture_id)
      } else {
        console.error("No lecture_id returned")
        setLoading(false)
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("Analysis failed. Please check the console for details.")
      setLoading(false)
    }
  }

  const fetchLectureData = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/lecture/${id}`)
      const data = await response.json()
      setLectureData(data)
    } catch (err) {
      console.error("Fetch failed", err)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    const notesContainer = document.querySelector('.notes-view')
    if (notesContainer) {
      notesContainer.scrollTop = 0
    }
  }, [lectureData, activeTab])

  return (
    <div className={`app-container ${isResizing ? 'is-resizing' : ''}`}>
      <div className="pdf-viewer" style={{ width: `${panelWidth}%`, flex: 'none' }}>
        {pdfUrl ? (
          <iframe src={pdfUrl} title="Lecture PDF" />
        ) : (
          <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
            <p>📁 Click to upload NST Lecture PDF</p>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              hidden
              onChange={handleFileUpload}
            />
          </div>
        )}

        {loading && (
          <div className="upload-overlay">
            <div className="loader">Analyzing Lecture Patterns...</div>
          </div>
        )}
      </div>

      <div className="resizer" onMouseDown={startResizing} />

      <div className="analysis-panel" style={{ width: `${100 - panelWidth}%`, flex: 'none' }}>
        <div className="panel-header">
          <h1>{lectureData ? lectureData.title : 'Lecture Intelligence'}</h1>
          {lectureData && <span className="badge">Analyzed</span>}
        </div>

        {lectureData ? (
          <>
            <div className="tabs">
              {['notes', 'summary'].map(tab => (
                <div
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </div>
              ))}
            </div>

            <div className="tab-content fade-in">
              {activeTab === 'summary' && (
                <div className="summary-view markdown-body">
                  <ReactMarkdown>{lectureData.summary}</ReactMarkdown>

                  <div className="keywords-box">
                    <h3>Focus Keywords</h3>
                    <div className="keyword-tags">
                      {lectureData.keywords.map(kw => <span key={kw} className="tag">{kw}</span>)}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="notes-view">
                  {lectureData.notes.map((n, i) => (
                    <div key={i} className="note-card">
                      <div className="note-card-header">
                        <span className="page-badge">Page {n.page}</span>
                      </div>
                      <div className="note-groups">
                        {Array.from(new Set(n.content.map(p => p.heading))).map(heading => (
                          <div key={heading} className="note-group">
                            <div className="section-divider">
                              <span className="section-label">SECTION</span>
                              <h4>{heading}</h4>
                            </div>
                            <ul>
                              {n.content.filter(p => p.heading === heading).map((p, j) => (
                                <li key={j}>{p.point}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Upload a lecture to start the transformation</p>
          </div>
        )}
      </div>
    </div>
  )
}
const root = createRoot(document.getElementById('app'))
root.render(<App />)
