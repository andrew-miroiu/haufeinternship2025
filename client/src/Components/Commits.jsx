import { useState, useEffect } from 'react'
import './Commits.css'

function Commits() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, approved, rejected, pending

  useEffect(() => {
    // TODO: Fetch commits from database
    // For now, display mock data
    fetchCommits()
  }, [filter])

  const fetchCommits = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://localhost:3001/api/commits?filter=${filter}`)
      // const data = await response.json()
      // setCommits(data.commits)

      // Mock data for display
      const mockCommits = [
        {
          id: '1',
          hash: 'a1b2c3d',
          message: 'feat: add user authentication system',
          author: 'john.doe@example.com',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          filesChanged: 5,
          insertions: 120,
          deletions: 45,
          reviewStatus: 'passed',
          aiFeedback: 'Code quality excellent. Good security practices implemented.'
        },
        {
          id: '2',
          hash: 'e4f5g6h',
          message: 'fix: resolve memory leak in data processing',
          author: 'jane.smith@example.com',
          date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          filesChanged: 3,
          insertions: 25,
          deletions: 18,
          reviewStatus: 'passed',
          aiFeedback: 'Memory leak fixed. Code follows best practices.'
        },
        {
          id: '3',
          hash: 'i7j8k9l',
          message: 'refactor: optimize database queries',
          author: 'bob.wilson@example.com',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'rejected',
          filesChanged: 8,
          insertions: 200,
          deletions: 150,
          reviewStatus: 'failed',
          aiFeedback: 'Security issue detected: SQL injection vulnerability in query builder.'
        },
        {
          id: '4',
          hash: 'm1n2o3p',
          message: 'docs: update API documentation',
          author: 'alice.brown@example.com',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'approved',
          filesChanged: 2,
          insertions: 50,
          deletions: 10,
          reviewStatus: 'passed',
          aiFeedback: 'Documentation improvements look good.'
        },
        {
          id: '5',
          hash: 'q4r5s6t',
          message: 'test: add unit tests for payment module',
          author: 'charlie.davis@example.com',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          filesChanged: 4,
          insertions: 180,
          deletions: 0,
          reviewStatus: 'pending',
          aiFeedback: null
        }
      ]

      // Simulate API delay
      setTimeout(() => {
        setCommits(mockCommits)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching commits:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4ade80'
      case 'rejected':
        return '#f87171'
      case 'pending':
        return '#fbbf24'
      default:
        return '#94a3b8'
    }
  }

  const filteredCommits = commits.filter(commit => {
    if (filter === 'all') return true
    return commit.status === filter
  })

  return (
    <div className="commits-container">
      <div className="commits-header">
        <h1>Commit History</h1>
        <p>Review and track all code commits with AI analysis</p>
      </div>

      <div className="commits-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Commits
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
      </div>

      {loading ? (
        <div className="commits-loading">
          <div className="spinner"></div>
          <p>Loading commits...</p>
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="commits-empty">
          <p>No commits found</p>
        </div>
      ) : (
        <div className="commits-list">
          {filteredCommits.map((commit) => (
            <div key={commit.id} className="commit-card">
              <div className="commit-header">
                <div className="commit-hash">
                  <code>{commit.hash}</code>
                </div>
                <div 
                  className="commit-status"
                  style={{ backgroundColor: getStatusColor(commit.status) }}
                >
                  {commit.status.charAt(0).toUpperCase() + commit.status.slice(1)}
                </div>
              </div>

              <div className="commit-message">
                <h3>{commit.message}</h3>
              </div>

              <div className="commit-meta">
                <div className="commit-author">
                  <span className="meta-label">Author:</span>
                  <span>{commit.author}</span>
                </div>
                <div className="commit-date">
                  <span className="meta-label">Date:</span>
                  <span>{formatDate(commit.date)}</span>
                </div>
              </div>

              <div className="commit-stats">
                <div className="stat-item">
                  <span className="stat-label">Files Changed:</span>
                  <span className="stat-value">{commit.filesChanged}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Insertions:</span>
                  <span className="stat-value insertions">+{commit.insertions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Deletions:</span>
                  <span className="stat-value deletions">-{commit.deletions}</span>
                </div>
              </div>

              {commit.reviewStatus && (
                <div className="commit-review">
                  <div className="review-status">
                    <span className="review-label">AI Review:</span>
                    <span className={`review-status-badge ${commit.reviewStatus}`}>
                      {commit.reviewStatus === 'passed' && '✓ Passed'}
                      {commit.reviewStatus === 'failed' && '✗ Failed'}
                      {commit.reviewStatus === 'pending' && '⏳ Pending'}
                    </span>
                  </div>
                  {commit.aiFeedback && (
                    <div className="review-feedback">
                      <p>{commit.aiFeedback}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="commit-actions">
                <button className="btn-view-details">
                  View Details
                </button>
                <button className="btn-view-diff">
                  View Diff
                </button>
                {commit.status === 'rejected' && (
                  <button className="btn-fix-issues">
                    Fix Issues
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="commits-footer">
        <p className="footer-note">
          💡 <strong>Note:</strong> This is a mock display. In production, commits will be fetched from your database.
          <br />
          Future implementation will include: database integration, real-time updates, pagination, and advanced filtering.
        </p>
      </div>
    </div>
  )
}

export default Commits

