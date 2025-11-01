import { useState, useEffect } from 'react'
import './CodeReview.css'

function CodeReview() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [model, setModel] = useState('llama3.1:latest')
  const [models, setModels] = useState([])
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [error, setError] = useState(null)
  
  // Chat state
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [chatMessages, setChatMessages] = useState({})
  const [showChat, setShowChat] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    // Fetch available models on mount
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/models')
        if (response.ok) {
          const data = await response.json()
          setModels(data.models || [])
          // Set default to first installed model, or first model if none installed
          const firstInstalled = data.models?.find(m => m.installed)
          if (firstInstalled) {
            setModel(firstInstalled.name)
          }
        }
      } catch (err) {
        console.error('Error fetching models:', err)
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
    
    // Initialize with mock chats
    const mockChats = [
      { id: 1, title: 'JavaScript function optimization', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 2, title: 'Python security review', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    ]
    setChats(mockChats)
    
    const mockMessages = {
      1: [
        { id: 1, type: 'user', content: 'Can you review this function?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: 2, type: 'ai', content: 'I\'d be happy to help review your function. Please share the code you\'d like me to review.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000) },
      ],
      2: [
        { id: 1, type: 'user', content: 'Is this secure?', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        { id: 2, type: 'ai', content: 'I notice a potential SQL injection vulnerability. Let me provide recommendations...', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 45000) },
      ],
    }
    setChatMessages(mockMessages)
  }, [])

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review')
      return
    }

    setLoading(true)
    setError(null)
    setReview(null)

    try {
      const response = await fetch('http://localhost:3001/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          model,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to review code: ${response.statusText}`)
      }

      const data = await response.json()
      setReview(data.review)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    // TODO: Implement chat creation
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      createdAt: new Date(),
    }
    setChats([newChat, ...chats])
    setActiveChatId(newChat.id)
    setChatMessages({
      ...chatMessages,
      [newChat.id]: [],
    })
    setShowChat(true)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChatId) return

    // TODO: Implement message sending
    const message = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
    }

    setChatMessages({
      ...chatMessages,
      [activeChatId]: [...(chatMessages[activeChatId] || []), message],
    })

    // Simulate AI response (not implemented)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'This is a mock response. Chat functionality is not yet implemented.',
        timestamp: new Date(),
      }
      setChatMessages({
        ...chatMessages,
        [activeChatId]: [...(chatMessages[activeChatId] || []), aiResponse],
      })
    }, 1000)

    setNewMessage('')
  }

  const formatChatTime = (date) => {
    const now = new Date()
    const diffMs = now - new Date(date)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return new Date(date).toLocaleDateString()
    }
  }

  return (
    <div className="code-review-container">
      <div className="code-review-header">
        <div className="header-top">
          <div>
            <h1>AI Code Reviewer</h1>
            <p>Analyze your code for potential issues, improvements, and best practices</p>
          </div>
          <button 
            className="btn-new-chat"
            onClick={handleNewChat}
            title="Create New Chat"
          >
            + New Chat
          </button>
        </div>
      </div>

      <div className="code-review-layout">
        <div className="code-review-content">
          <div className="code-input-section">
            <div className="code-input-header">
              <label htmlFor="language">Programming Language:</label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
              </select>
            </div>

            <div className="code-input-header">
              <label htmlFor="model">AI Model:</label>
              {loadingModels ? (
                <select disabled className="model-select">
                  <option>Loading models...</option>
                </select>
              ) : (
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="model-select"
                >
                  {models.map((m) => (
                    <option key={m.name} value={m.name} disabled={!m.installed}>
                      {m.display} {m.recommended && '⭐'} {!m.installed && '(Not installed)'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {models.length > 0 && (
              <div className="model-info">
                {models.find(m => m.name === model)?.installed ? (
                  <span className="model-status installed">✓ Model installed</span>
                ) : (
                  <span className="model-status not-installed">
                    ⚠ Model not installed. Install with: <code>ollama pull {model}</code>
                  </span>
                )}
              </div>
            )}

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="code-input"
              rows={20}
            />

            <button
              onClick={handleReview}
              disabled={loading || !code.trim() || !models.find(m => m.name === model)?.installed}
              className="btn-review"
            >
              {loading ? 'Analyzing...' : 'Review Code'}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="review-results-section">
            <h2>Review Results</h2>
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Analyzing your code...</p>
              </div>
            )}

            {!loading && !review && (
              <div className="empty-state">
                <p>Submit code above to see review results</p>
              </div>
            )}

            {review && (
              <div className="review-content">
               <pre className="review-text">
                <code className="language-javascript"> {review}</code>
              </pre>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <div className="chat-sidebar">
            <div className="chat-header">
              <h3>Chat History</h3>
              <button 
                className="btn-close-chat"
                onClick={() => setShowChat(false)}
                title="Close Chat"
              >
                ×
              </button>
            </div>

            <div className="chat-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChatId(chat.id)
                    if (!chatMessages[chat.id]) {
                      setChatMessages({ ...chatMessages, [chat.id]: [] })
                    }
                  }}
                >
                  <div className="chat-item-title">{chat.title}</div>
                  <div className="chat-item-time">{formatChatTime(chat.createdAt)}</div>
                </div>
              ))}
            </div>

            {activeChatId && (
              <div className="chat-messages">
                <div className="chat-messages-header">
                  <h4>{chats.find(c => c.id === activeChatId)?.title || 'Chat'}</h4>
                </div>
                <div className="messages-container">
                  {chatMessages[activeChatId]?.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  {chatMessages[activeChatId]?.length === 0 && (
                    <div className="empty-chat">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  )}
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message... (not functional)"
                    className="chat-input"
                    disabled
                  />
                  <button 
                    type="submit" 
                    className="btn-send"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </form>
                <div className="chat-notice">
                  💡 Chat functionality is not yet implemented
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeReview
