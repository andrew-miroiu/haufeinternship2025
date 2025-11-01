import { useState } from 'react'
import CodeReview from './Components/CodeReview'
import Subscription from './Components/Subscription'
import Commits from './Components/Commits'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('review')

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Code Reviewer</h1>
        <nav className="app-nav">
          <button 
            className={`nav-button ${currentPage === 'review' ? 'active' : ''}`}
            onClick={() => setCurrentPage('review')}
          >
            Code Review
          </button>
          <button 
            className={`nav-button ${currentPage === 'commits' ? 'active' : ''}`}
            onClick={() => setCurrentPage('commits')}
          >
            Commits
          </button>
          <button 
            className={`nav-button ${currentPage === 'subscription' ? 'active' : ''}`}
            onClick={() => setCurrentPage('subscription')}
          >
            Subscription
          </button>
        </nav>
      </header>
      <main className="app-main">
        {currentPage === 'review' && <CodeReview />}
        {currentPage === 'commits' && <Commits />}
        {currentPage === 'subscription' && <Subscription />}
      </main>
    </div>
  )
}

export default App
