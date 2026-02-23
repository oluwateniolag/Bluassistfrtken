import { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../pages/Settings.css';

const ApiKeyManagement = ({ tenant, onUpdate }) => {
  const [apiKeys, setApiKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApiKeys();
      if (response.success && response.data) {
        setApiKeys(response.data);
      } else {
        setError('Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value, type) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRegenerate = async (type) => {
    const typeLabel = type === 'key' ? 'API Key' : type === 'secret' ? 'API Secret' : 'API Credentials';
    const message = `Are you sure you want to regenerate your ${typeLabel}?\n\nThis action cannot be undone. Any applications using the current credentials will need to be updated immediately.`;
    
    if (!window.confirm(message)) {
      return;
    }

    try {
      setRegenerating(type);
      setError('');
      setSuccess('');

      let response;
      if (type === 'key') {
        response = await apiService.regenerateApiKey();
      } else if (type === 'secret') {
        response = await apiService.regenerateApiSecret();
      } else {
        response = await apiService.regenerateBoth();
      }

      if (response.success && response.data) {
        setApiKeys(response.data);
        setShowSecret(false); // Hide secret after regeneration
        setSuccess(`${typeLabel} regenerated successfully. Please update your applications with the new credentials.`);
        setTimeout(() => setSuccess(''), 5000);
        if (onUpdate) onUpdate();
      } else {
        setError(response.message || 'Failed to regenerate API credentials');
      }
    } catch (error) {
      console.error('Failed to regenerate:', error);
      setError('Failed to regenerate API credentials. Please try again.');
    } finally {
      setRegenerating(null);
    }
  };

  const maskSecret = (secret) => {
    if (!secret) return 'N/A';
    if (showSecret) return secret;
    return '•'.repeat(Math.min(secret.length, 40)) + (secret.length > 40 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="settings-section-loading">
        <div className="spinner-large"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading API credentials...</p>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-header-content">
          <div className="section-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div>
            <h2 className="section-title">API Key Management</h2>
            <p className="section-description">
              Manage your API credentials securely. Use these credentials to authenticate requests to the BluAssist API.
            </p>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="api-security-warning">
        <div className="security-warning-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 8v4M12 16h.01"></path>
          </svg>
        </div>
        <div className="security-warning-content">
          <h4 className="security-warning-title">Security Best Practices</h4>
          <ul className="security-warning-list">
            <li>Never share your API credentials publicly or commit them to version control</li>
            <li>Regenerate credentials immediately if they are exposed or compromised</li>
            <li>Use environment variables or secure secret management tools to store credentials</li>
            <li>Rotate credentials regularly for enhanced security</li>
          </ul>
        </div>
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

      <div className="api-keys-grid">
        {/* API Key Card */}
        <div className="api-key-card api-key-card-primary">
          <div className="api-key-card-header">
            <div className="api-key-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className="api-key-header-content">
              <h3 className="api-key-title">API Key</h3>
              <p className="api-key-description">Public identifier for API authentication</p>
            </div>
          </div>
          
          <div className="api-key-value-container">
            <div className="api-key-value-wrapper">
              <code className="api-key-value">{apiKeys?.apiKey || 'N/A'}</code>
              <div className="api-key-actions-group">
                <button
                  className={`api-key-action-btn ${copied === 'key' ? 'copied' : ''}`}
                  onClick={() => handleCopy(apiKeys?.apiKey, 'key')}
                  title="Copy to clipboard"
                >
                  {copied === 'key' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="api-key-card-footer">
            <button
              className="btn-regenerate"
              onClick={() => handleRegenerate('key')}
              disabled={regenerating === 'key' || regenerating === 'both'}
            >
              {regenerating === 'key' ? (
                <>
                  <svg className="spinner-small" width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Regenerate Key</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Secret Card */}
        <div className="api-key-card api-key-card-secret">
          <div className="api-key-card-header">
            <div className="api-key-icon api-key-icon-secret">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                <circle cx="12" cy="16" r="1"></circle>
              </svg>
            </div>
            <div className="api-key-header-content">
              <h3 className="api-key-title">API Secret</h3>
              <p className="api-key-description">Private secret key (keep secure)</p>
            </div>
          </div>
          
          <div className="api-key-value-container">
            <div className="api-key-value-wrapper">
              <code className="api-key-value">{maskSecret(apiKeys?.apiSecret)}</code>
              <div className="api-key-actions-group">
                <button
                  className="api-key-action-btn api-key-toggle-btn"
                  onClick={() => setShowSecret(!showSecret)}
                  title={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>Show</span>
                    </>
                  )}
                </button>
                <button
                  className={`api-key-action-btn ${copied === 'secret' ? 'copied' : ''}`}
                  onClick={() => handleCopy(apiKeys?.apiSecret, 'secret')}
                  title="Copy to clipboard"
                  disabled={!showSecret}
                >
                  {copied === 'secret' ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="api-key-card-footer">
            <button
              className="btn-regenerate"
              onClick={() => handleRegenerate('secret')}
              disabled={regenerating === 'secret' || regenerating === 'both'}
            >
              {regenerating === 'secret' ? (
                <>
                  <svg className="spinner-small" width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Regenerate Secret</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Knowledge Base ID - shown when tenant has active subscription and a knowledge base */}
        {apiKeys?.knowledgeBaseId && (
          <div className="api-key-card api-key-card-kb">
            <div className="api-key-card-header">
              <div className="api-key-icon api-key-icon-kb">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <path d="M8 7h8M8 11h8"></path>
                </svg>
              </div>
              <div className="api-key-header-content">
                <h3 className="api-key-title">Knowledge Base ID</h3>
                <p className="api-key-description">Use this ID when calling the API with your knowledge base</p>
              </div>
            </div>
            <div className="api-key-value-container">
              <div className="api-key-value-wrapper">
                <code className="api-key-value">{apiKeys.knowledgeBaseId}</code>
                <div className="api-key-actions-group">
                  <button
                    className={`api-key-action-btn ${copied === 'knowledgeBaseId' ? 'copied' : ''}`}
                    onClick={() => handleCopy(apiKeys.knowledgeBaseId, 'knowledgeBaseId')}
                    title="Copy to clipboard"
                  >
                    {copied === 'knowledgeBaseId' ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regenerate Both Action */}
      <div className="api-keys-bulk-action">
        <div className="bulk-action-content">
          <div className="bulk-action-info">
            <h4 className="bulk-action-title">Regenerate Both Credentials</h4>
            <p className="bulk-action-description">
              Regenerate both API Key and Secret simultaneously. This will invalidate your current credentials.
            </p>
          </div>
          <button
            className="btn-regenerate-both"
            onClick={() => handleRegenerate('both')}
            disabled={regenerating === 'both' || regenerating === 'key' || regenerating === 'secret'}
          >
            {regenerating === 'both' ? (
              <>
                <svg className="spinner-small" width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span>Regenerate Both</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      {apiKeys?.createdAt && (
        <div className="api-keys-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Created</span>
            <span className="metadata-value">{new Date(apiKeys.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Status</span>
            <span className="metadata-value metadata-status-active">
              <span className="status-dot"></span>
              Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagement;
