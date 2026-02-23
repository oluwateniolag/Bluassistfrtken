import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    website: '',
    phone: '',
  });

  const [chatbotData, setChatbotData] = useState({
    chatbotName: 'BluAssist',
    welcomeMessage: 'Hello! How can I help you today?',
    primaryColor: 'rgba(80,159,239,1)',
    secondaryColor: '#0059b3',
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await apiService.getOnboardingStatus();
      if (response.success && response.data) {
        setOnboardingStatus(response.data);
        if (response.data.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          const step = response.data.onboardingStep || 1;
          setCurrentStep(step);
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateCompanyDetails(companyData);
      if (response.success) {
        setSuccess('Company details saved successfully!');
        setTimeout(() => {
          setCurrentStep(3);
          setSuccess('');
        }, 1000);
      } else {
        setError(response.message || 'Failed to save company details');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChatbotSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateChatbotConfig(chatbotData);
      if (response.success) {
        setSuccess('Chatbot configured successfully!');
        setTimeout(() => {
          setCurrentStep(4);
          setSuccess('');
        }, 1000);
      } else {
        setError(response.message || 'Failed to configure chatbot');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.completeOnboarding();
      if (response.success) {
        // Small delay for better UX
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        setError(response.message || 'Failed to complete onboarding');
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('An error occurred while completing onboarding. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Registration', description: 'Account created', completed: currentStep > 1 },
    { number: 2, title: 'Company', description: 'Business details', completed: currentStep > 2 },
    { number: 3, title: 'Chatbot', description: 'Configure AI', completed: currentStep > 3 },
    { number: 4, title: 'Complete', description: 'Ready to go', completed: currentStep > 4 },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="onboarding-card">
            <div className="card-header-section">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="card-title">Company Details</h2>
              <p className="card-description">
                Tell us more about your business (all fields are optional)
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 9.99999C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 9.99999C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.66666V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleCompanySubmit} className="onboarding-form">
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  placeholder="Acme Corporation"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  placeholder="https://www.example.com"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  disabled={saving}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setCurrentStep(3)} disabled={saving}>
                  Skip for now
                </button>
                <button type="submit" className="btn-primary btn-large" disabled={saving}>
                  {saving ? (
                    <>
                      <svg className="spinner-small" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-card">
            <div className="card-header-section">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="card-title">Chatbot Configuration</h2>
              <p className="card-description">
                Customize your chatbot's appearance and welcome message
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 9.99999C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 9.99999C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.66666V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleChatbotSubmit} className="onboarding-form">
              <div className="form-group">
                <label htmlFor="chatbotName">Chatbot Name</label>
                <input
                  id="chatbotName"
                  type="text"
                  value={chatbotData.chatbotName}
                  onChange={(e) => setChatbotData({ ...chatbotData, chatbotName: e.target.value })}
                  placeholder="BluAssist"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="welcomeMessage">Welcome Message</label>
                <textarea
                  id="welcomeMessage"
                  value={chatbotData.welcomeMessage}
                  onChange={(e) => setChatbotData({ ...chatbotData, welcomeMessage: e.target.value })}
                  placeholder="Hello! How can I help you today?"
                  rows="3"
                  disabled={saving}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="primaryColor">Primary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      id="primaryColor"
                      type="color"
                      value={chatbotData.primaryColor}
                      onChange={(e) => setChatbotData({ ...chatbotData, primaryColor: e.target.value })}
                      disabled={saving}
                    />
                    <input
                      type="text"
                      value={chatbotData.primaryColor}
                      onChange={(e) => setChatbotData({ ...chatbotData, primaryColor: e.target.value })}
                      placeholder="rgba(80,159,239,1)"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="secondaryColor">Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={chatbotData.secondaryColor}
                      onChange={(e) => setChatbotData({ ...chatbotData, secondaryColor: e.target.value })}
                      disabled={saving}
                    />
                    <input
                      type="text"
                      value={chatbotData.secondaryColor}
                      onChange={(e) => setChatbotData({ ...chatbotData, secondaryColor: e.target.value })}
                      placeholder="#0059b3"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setCurrentStep(2)} disabled={saving}>
                  Back
                </button>
                <button type="button" className="btn-secondary" onClick={() => setCurrentStep(4)} disabled={saving}>
                  Skip for now
                </button>
                <button type="submit" className="btn-primary btn-large" disabled={saving}>
                  {saving ? (
                    <>
                      <svg className="spinner-small" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-card completion-card">
            <div className="completion-animation">
              <div className="checkmark-circle">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#22c55e" opacity="0.1"/>
                  <path d="M20 32L28 40L44 24" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className="card-header-section">
              <h2 className="card-title">You're All Set!</h2>
              <p className="card-description">
                Your chatbot is configured and ready to use. Start engaging with your customers right away.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 9.99999C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 9.99999C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.66666V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="completion-features">
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div>
                  <h4>Chatbot Enabled</h4>
                  <p>Your AI assistant is ready to help customers</p>
                </div>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <h4>API Access</h4>
                  <p>Integrate with your existing systems</p>
                </div>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <h4>Free Plan Active</h4>
                  <p>Start with our free tier, upgrade anytime</p>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-primary btn-large btn-complete" onClick={handleComplete} disabled={loading}>
                {loading ? (
                  <>
                    <svg className="spinner-small" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <span>Go to Dashboard</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="onboarding-card">
            <div className="card-header-section">
              <div className="card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h2 className="card-title">Registration Complete!</h2>
              <p className="card-description">
                Your account has been created successfully. Let's continue with the setup.
              </p>
            </div>
            <div className="card-actions">
              <button className="btn-secondary btn-large" onClick={handleComplete} disabled={loading}>
                {loading ? (
                  <>
                    <svg className="spinner-small" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <span>Skip Setup</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
              <button className="btn-primary btn-large" onClick={() => setCurrentStep(2)} disabled={loading}>
                Get Started
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Welcome to BluAssist</h1>
          <p className="onboarding-subtitle">
            {currentStep === 4 
              ? 'Almost there! Complete your setup to get started.'
              : 'Let\'s get your chatbot set up in just a few steps'}
          </p>
        </div>

        <div className="onboarding-progress">
          {steps.map((step, index) => (
            <div key={step.number} className="progress-step">
              <div className={`step-indicator ${step.completed ? 'completed' : currentStep === step.number ? 'active' : ''}`}>
                {step.completed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className="step-info">
                <span className="step-label">{step.title}</span>
                <span className="step-description">{step.description}</span>
              </div>
              {index < steps.length - 1 && <div className={`step-connector ${step.completed ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="onboarding-content">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
