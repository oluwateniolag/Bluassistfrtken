import { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../pages/Settings.css';

const PLANS = [
  { id: 'free', name: 'Free', price: '0', period: '/ month', description: 'Get started with core features', features: ['1,000 conversations/month', '1 knowledge base', 'Web widget', 'Email support'], order: 0 },
  { id: 'basic', name: 'Basic', price: '29', period: '/ month', description: 'For small teams', features: ['5,000 conversations/month', '3 knowledge bases', 'Web + API', 'Email support'], order: 1 },
  { id: 'premium', name: 'Professional', price: '99', period: '/ month', description: 'For growing teams', features: ['10,000 conversations/month', '5 knowledge bases', 'Web + API', 'Priority support'], order: 2 },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', description: 'For large organizations', features: ['Unlimited conversations', 'Unlimited knowledge bases', 'SSO, SLA', 'Dedicated support'], order: 3 },
];

function Subscription({ tenant, onUpdate }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getSubscription();
      if (response.success && response.data) {
        setSubscription(response.data);
      } else {
        setError('Failed to load subscription');
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId, durationMonths = 1) => {
    if (subscription?.plan === planId) return;
    try {
      setUpdating(planId);
      setError('');
      setSuccess('');
      const response = await apiService.updateSubscription({
        plan: planId,
        durationMonths: planId === 'free' ? undefined : durationMonths,
      });
      if (response.success && response.data) {
        setSubscription(response.data);
        setSuccess(response.message || 'Subscription updated.');
        setTimeout(() => setSuccess(''), 5000);
        if (onUpdate) onUpdate();
      } else {
        setError(response.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Failed to update subscription:', err);
      setError(err.message || 'Failed to update subscription');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="settings-section-loading">
        <div className="spinner-large"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading subscription...</p>
      </div>
    );
  }

  const currentPlanId = subscription?.plan || 'free';
  const isActive = subscription?.subscriptionActive ?? true;

  return (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-header-content">
          <div className="section-icon-wrapper subscription-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h2 className="section-title">Subscription</h2>
            <p className="section-description">
              Manage your plan. Subscribe to a new plan or upgrade your current subscription.
            </p>
          </div>
        </div>
      </div>

      {/* Current plan status */}
      <div className="subscription-current-card">
        <div className="subscription-current-header">
          <span className="subscription-current-label">Current plan</span>
          <span className={`subscription-status-badge ${isActive ? 'active' : 'expired'}`}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        </div>
        <div className="subscription-current-plan">{PLANS.find(p => p.id === currentPlanId)?.name || currentPlanId}</div>
        {subscription?.subscriptionEndDate && (
          <div className="subscription-current-dates">
            {subscription.subscriptionStartDate && (
              <span>Started {new Date(subscription.subscriptionStartDate).toLocaleDateString('en-US')}</span>
            )}
            <span>Ends {new Date(subscription.subscriptionEndDate).toLocaleDateString('en-US')}</span>
          </div>
        )}
        {currentPlanId === 'free' && (
          <p className="subscription-current-note">Upgrade to access more conversations and knowledge bases.</p>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      <h3 className="subscription-plans-title">Available plans</h3>
      <div className="subscription-plans-grid">
        {PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const isEnterprise = plan.id === 'enterprise';
          return (
            <div
              key={plan.id}
              className={`subscription-plan-card ${isCurrent ? 'current' : ''} ${isEnterprise ? 'enterprise' : ''}`}
            >
              {isCurrent && <div className="subscription-plan-badge">Current</div>}
              <h4 className="subscription-plan-name">{plan.name}</h4>
              <div className="subscription-plan-price">
                <span className="subscription-plan-amount">{plan.price}</span>
                {plan.period && <span className="subscription-plan-period">{plan.period}</span>}
              </div>
              <p className="subscription-plan-desc">{plan.description}</p>
              <ul className="subscription-plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              {!isCurrent && (
                <button
                  type="button"
                  className={plan.order > PLANS.find(p => p.id === currentPlanId)?.order ? 'btn-primary subscription-plan-btn' : 'btn-outline subscription-plan-btn'}
                  onClick={() => handleSubscribe(plan.id, plan.id === 'enterprise' ? 12 : 1)}
                  disabled={!!updating}
                >
                  {updating === plan.id ? (
                    <>
                      <svg className="spinner-small" width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      Updating...
                    </>
                  ) : plan.order > PLANS.find(p => p.id === currentPlanId)?.order ? (
                    'Upgrade'
                  ) : plan.id === 'free' ? (
                    'Switch to Free'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Subscription;
