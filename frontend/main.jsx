import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import './style.css'

const API_BASE = 'http://localhost:8000/api'

function App() {
  const [lectureData, setLectureData] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

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
      const data = await response.json()
      if (data.lecture_id) {
        fetchLectureData(data.lecture_id)
      }
    } catch (err) {
      console.error("Upload failed", err)
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
    <div className="app-container">
      <div className="pdf-viewer">
        {pdfUrl ? (
          <iframe src={pdfUrl} title="Lecture PDF" />
        ) : (
          <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
            <p>📁 Click to upload NS  T Lecture PDF</p>
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


      <div className="analysis-panel">
        <div className="panel-header">
          <h1>{lectureData ? lectureData.title : 'Lecture Intelligence'}</h1>
          {lectureData && <span className="badge">Analyzed</span>}
        </div>

        {lectureData ? (
          <>
            <div className="tabs">
              {['summary', 'notes'].map(tab => (
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
                <div className="summary-view">
                  {lectureData.summary.map((s, i) => (
                    <div key={i} className="summary-item">{s}</div>
                  ))}
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
                      <h3>Page {n.page}</h3>
                      <div className="note-groups">
                        {Array.from(new Set(n.content.map(p => p.heading))).map(heading => (
                          <div key={heading} className="note-group">
                            <h4>{heading}</h4>
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
