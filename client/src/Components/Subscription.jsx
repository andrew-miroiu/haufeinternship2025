import { useState, useEffect } from 'react'
import './Subscription.css'

function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch current subscription status
    fetchCurrentSubscription()
  }, [])

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data.subscription)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '10 code reviews per month',
        'Basic code analysis',
        'Security vulnerability detection',
        'Standard AI models',
        'Community support'
      ],
      limitations: [
        'Limited to 10 reviews/month',
        'Basic analysis only'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$29',
      period: 'per month',
      description: 'For professional developers',
      features: [
        'Unlimited code reviews',
        'Advanced code analysis',
        'Security vulnerability detection',
        'Architecture recommendations',
        'Testing & CI/CD analysis',
        'Priority AI models',
        'Custom coding standards',
        'Documentation recommendations',
        'Priority support',
        'API access'
      ],
      limitations: [],
      popular: true
    }
  ]

  const handleSubscribe = async (planId) => {
    setLoading(true)
    setSelectedPlan(planId)

    try {
      // TODO: Implement subscription logic
      const response = await fetch('http://localhost:3001/api/subscription/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Subscription to ${planId} plan initiated! (Implementation pending)`)
        fetchCurrentSubscription()
      } else {
        alert('Failed to subscribe. Please try again.')
      }
    } catch (err) {
      console.error('Error subscribing:', err)
      alert('Error subscribing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    setLoading(true)

    try {
      // TODO: Implement cancellation logic
      const response = await fetch('http://localhost:3001/api/subscription/cancel', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Subscription cancelled successfully! (Implementation pending)')
        fetchCurrentSubscription()
      } else {
        alert('Failed to cancel subscription. Please try again.')
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      alert('Error cancelling subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your code review needs</p>
      </div>

      {currentSubscription && (
        <div className="current-subscription-banner">
          <div className="subscription-info">
            <span className="subscription-badge">{currentSubscription.plan}</span>
            <span className="subscription-status">
              {currentSubscription.status === 'active' 
                ? 'Active' 
                : currentSubscription.status === 'cancelled'
                ? 'Cancelled (ends ' + new Date(currentSubscription.endsAt).toLocaleDateString() + ')'
                : 'Expired'}
            </span>
          </div>
          {currentSubscription.status === 'active' && (
            <button 
              className="btn-cancel-subscription"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              Cancel Subscription
            </button>
          )}
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">Most Popular</div>
            )}
            
            <div className="plan-header">
              <h2>{plan.name}</h2>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-features">
              <h3>Features:</h3>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {plan.limitations.length > 0 && (
              <div className="plan-limitations">
                <h3>Limitations:</h3>
                <ul>
                  {plan.limitations.map((limitation, index) => (
                    <li key={index}>
                      <span className="limit-icon">⚠</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className={`btn-subscribe ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || (currentSubscription?.plan === plan.id && currentSubscription?.status === 'active')}
            >
              {currentSubscription?.plan === plan.id && currentSubscription?.status === 'active'
                ? 'Current Plan'
                : plan.id === 'free'
                ? 'Get Started'
                : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="subscription-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I change plans later?</h3>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards and PayPal. (Payment processing not yet implemented)</p>
          </div>
          <div className="faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>The Free Plan is always free. The Pro Plan includes a 14-day free trial. (Trial not yet implemented)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscription

