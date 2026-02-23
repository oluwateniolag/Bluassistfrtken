import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import ApiKeyManagement from '../components/ApiKeyManagement';
import Subscription from '../components/Subscription';
import '../components/Sidebar.css';
import '../components/Dashboard.css';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [activeNav, setActiveNav] = useState('settings');
  const [expandedNav, setExpandedNav] = useState({ settings: true });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTenantData();
    
    // Set expanded state based on current route
    if (location.pathname.startsWith('/settings')) {
      setExpandedNav({ settings: true });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    // Set light theme for settings page
    document.body.style.backgroundColor = '#f5f7fa';
    document.body.style.color = '#1a1a1a';
    
    return () => {
      // Reset on unmount if needed
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  const fetchTenantData = async () => {
    try {
      const response = await apiService.getTenant();
      if (response.success && response.data?.tenant) {
        setTenant(response.data.tenant);
        return response.data.tenant;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch tenant data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleNav = (navItem) => {
    setExpandedNav(prev => ({
      ...prev,
      [navItem]: !prev[navItem]
    }));
  };

  const handleNavClick = (navItem) => {
    if (navItem === 'knowledge') {
      navigate('/knowledge');
    } else {
      setActiveNav(navItem);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner-large"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={handleNavClick}
        expandedNav={expandedNav}
        toggleNav={toggleNav}
        tenant={tenant}
      />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="separator">›</span>
            <span>{tenant?.name || 'Bluassist'}</span>
            <span className="separator">›</span>
            <span className="active">Settings</span>
          </div>

          <Routes>
            <Route index element={<Navigate to="api-keys" replace />} />
            <Route path="api-keys" element={<ApiKeyManagement tenant={tenant} onUpdate={fetchTenantData} />} />
            <Route path="subscription" element={<Subscription tenant={tenant} onUpdate={fetchTenantData} />} />
            <Route path="tenant" element={<TenantSettings tenant={tenant} onUpdate={fetchTenantData} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Tenant Settings Component
const TenantSettings = ({ tenant, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(tenant?.onboardingStep || 1);

  const [companyData, setCompanyData] = useState({
    companyName: tenant?.companyName || '',
    website: tenant?.website || '',
    phone: tenant?.phone || '',
  });

  const [chatbotData, setChatbotData] = useState({
    chatbotName: tenant?.chatbotConfig?.name || 'BluAssist',
    welcomeMessage: tenant?.chatbotConfig?.welcomeMessage || 'Hello! How can I help you today?',
    primaryColor: tenant?.chatbotConfig?.theme?.primaryColor || 'rgba(80,159,239,1)',
    secondaryColor: tenant?.chatbotConfig?.theme?.secondaryColor || '#0059b3',
  });

  useEffect(() => {
    if (tenant) {
      // Always sync currentStep from database
      setCurrentStep(tenant.onboardingStep || 1);
      setCompanyData({
        companyName: tenant.companyName || '',
        website: tenant.website || '',
        phone: tenant.phone || '',
      });
      setChatbotData({
        chatbotName: tenant.chatbotConfig?.name || 'BluAssist',
        welcomeMessage: tenant.chatbotConfig?.welcomeMessage || 'Hello! How can I help you today?',
        primaryColor: tenant.chatbotConfig?.theme?.primaryColor || 'rgba(80,159,239,1)',
        secondaryColor: tenant.chatbotConfig?.theme?.secondaryColor || '#0059b3',
      });
    }
  }, [tenant]);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateCompanyDetails(companyData);
      if (response.success) {
        setSuccess('Company details saved successfully!');
        
        // Update local state with response data
        if (response.data?.tenant) {
          const updatedTenant = response.data.tenant;
          setCurrentStep(Math.max(currentStep, updatedTenant.onboardingStep || 2));
          
          // Update company data from response
          setCompanyData({
            companyName: updatedTenant.companyName || companyData.companyName,
            website: updatedTenant.website || companyData.website,
            phone: updatedTenant.phone || companyData.phone,
          });
        } else {
          setCurrentStep(Math.max(currentStep, 2));
        }
        
        // Refresh tenant data from backend
        if (onUpdate) {
          await onUpdate();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to save company details');
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      setError(error.message || 'An error occurred while saving. Please try again.');
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
        
        // Update local state with response data
        if (response.data?.tenant?.chatbotConfig) {
          const updatedConfig = response.data.tenant.chatbotConfig;
          setCurrentStep(Math.max(currentStep, response.data.tenant.onboardingStep || 3));
          
          // Update chatbot data from response
          setChatbotData({
            chatbotName: updatedConfig.name || chatbotData.chatbotName,
            welcomeMessage: updatedConfig.welcomeMessage || chatbotData.welcomeMessage,
            primaryColor: updatedConfig.theme?.primaryColor || chatbotData.primaryColor,
            secondaryColor: updatedConfig.theme?.secondaryColor || chatbotData.secondaryColor,
          });
        } else if (response.data?.chatbotConfig) {
          // Handle alternative response format
          const updatedConfig = response.data.chatbotConfig;
          setChatbotData({
            chatbotName: updatedConfig.name || chatbotData.chatbotName,
            welcomeMessage: updatedConfig.welcomeMessage || chatbotData.welcomeMessage,
            primaryColor: updatedConfig.theme?.primaryColor || chatbotData.primaryColor,
            secondaryColor: updatedConfig.theme?.secondaryColor || chatbotData.secondaryColor,
          });
          setCurrentStep(Math.max(currentStep, 3));
        } else {
          setCurrentStep(Math.max(currentStep, 3));
        }
        
        // Refresh tenant data from backend
        if (onUpdate) {
          await onUpdate();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to configure chatbot');
      }
    } catch (error) {
      console.error('Error saving chatbot configuration:', error);
      setError(error.message || 'An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!window.confirm('Are you sure you want to complete onboarding? This will activate your chatbot.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.completeOnboarding();
      if (response.success) {
        setSuccess('Onboarding completed successfully!');
        if (onUpdate) onUpdate();
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
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

  // Calculate progress from database state
  const isCompleted = tenant?.onboardingCompleted || false;
  
  const steps = [
    { number: 1, title: 'Complete', completed: isCompleted },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = isCompleted ? 100 : Math.round((completedCount / 1) * 100);
  const currentActiveStep = isCompleted ? 1 : 1;

  return (
    <div className="settings-section">
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

      {/* Single Professional Progress Tracker */}
      <div className="tenant-progress-tracker">
        <div className="progress-tracker-header">
          <div className="progress-tracker-title-group">
            <h3 className="progress-tracker-title">Setup Progress</h3>
            <p className="progress-tracker-subtitle">Track your onboarding completion status</p>
          </div>
          <div className="progress-tracker-badge">
            {isCompleted ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                <span>Complete</span>
              </>
            ) : (
              <span>{progressPercent}%</span>
            )}
          </div>
        </div>
        
        <div className="progress-tracker-bar-container">
          <div className="progress-tracker-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`Setup progress: ${progressPercent}%`}>
            <div className="progress-tracker-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-tracker-stats">
            <span className="progress-tracker-stat">{completedCount} of 1 steps completed</span>
            {!isCompleted && (
              <span className="progress-tracker-stat">Current step: {currentActiveStep}</span>
            )}
          </div>
        </div>

        <div className="progress-tracker-steps">
          {steps.map((step, index) => {
            const isActive = !step.completed && (index === 0 || steps[index - 1]?.completed);
            return (
              <div key={step.number} className={`progress-tracker-step ${step.completed ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                <div className="progress-tracker-step-indicator">
                  {step.completed ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  ) : (
                    <span className="progress-tracker-step-number">{step.number}</span>
                  )}
                </div>
                <div className="progress-tracker-step-content">
                  <span className="progress-tracker-step-title">{step.title}</span>
                  <span className={`progress-tracker-step-status ${step.completed ? 'status-completed' : isActive ? 'status-active' : 'status-pending'}`}>
                    {step.completed ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`progress-tracker-step-connector ${step.completed ? 'completed' : ''}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Details Card */}
      <div className="tenant-form-card tenant-form-card-company">
        <div className="tenant-form-card-header">
          <div className="tenant-form-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21"></path>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"></path>
            </svg>
          </div>
          <div>
            <h3 className="tenant-form-card-title">Company Details</h3>
            <p className="tenant-form-card-description">Organization information (optional)</p>
          </div>
        </div>
        <form onSubmit={handleCompanySubmit} className="tenant-form">
          <div className="tenant-form-fields">
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
          </div>
          <div className="tenant-form-footer">
            <button type="submit" className="btn-tenant-save" disabled={saving}>
              {saving ? (
                <>
                  <svg className="spinner-small" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Save Company Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Chatbot Configuration Card */}
      <div className="tenant-form-card tenant-form-card-chatbot">
        <div className="tenant-form-card-header">
          <div className="tenant-form-card-icon tenant-form-card-icon-chatbot">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 className="tenant-form-card-title">Chatbot Configuration</h3>
            <p className="tenant-form-card-description">Name, welcome message, and theme colors</p>
          </div>
        </div>
        <form onSubmit={handleChatbotSubmit} className="tenant-form">
          <div className="tenant-form-fields">
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
            <div className="form-row tenant-form-row-colors">
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
          </div>
          <div className="tenant-form-footer">
            <button type="submit" className="btn-tenant-save" disabled={saving}>
              {saving ? (
                <>
                  <svg className="spinner-small" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Save Chatbot Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Complete Onboarding CTA */}
      {!tenant?.onboardingCompleted && (
        <div className="tenant-complete-card">
          <div className="tenant-complete-content">
            <div className="tenant-complete-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="tenant-complete-text">
              <h3 className="tenant-complete-title">Ready to go live?</h3>
              <p className="tenant-complete-description">
                Complete onboarding to activate your chatbot. You can still update company details and chatbot settings anytime from this page.
              </p>
            </div>
          </div>
          <button
            className="btn-tenant-complete"
            onClick={handleCompleteOnboarding}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner-small" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>Completing...</span>
              </>
            ) : (
              <>
                <span>Complete Onboarding</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tenant metadata */}
      {tenant && (
        <div className="api-keys-metadata tenant-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Workspace</span>
            <span className="metadata-value">{tenant.name || 'N/A'}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Type</span>
            <span className="metadata-value capitalize">{tenant.type || 'N/A'}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Status</span>
            <span className={`metadata-value ${tenant.onboardingCompleted ? 'metadata-status-active' : ''}`}>
              {tenant.onboardingCompleted ? (
                <>
                  <span className="status-dot"></span>
                  Active
                </>
              ) : (
                'Pending setup'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
