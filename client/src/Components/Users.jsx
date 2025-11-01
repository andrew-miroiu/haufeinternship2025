import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get the current session and access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Not authenticated. Please login again.')
      }

      const accessToken = session.access_token
      
      const response = await fetch('http://localhost:3001/api/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch users: ${response.statusText}`)
      }
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="users-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchUsers} className="btn-retry">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>All Users</h2>
        <button onClick={fetchUsers} className="btn-refresh">Refresh</button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <h3>{user.email || 'No email'}</h3>
                <p className="user-meta">
                  <span>ID: {user.id}</span>
                </p>
                {user.created_at && (
                  <p className="user-date">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Users

