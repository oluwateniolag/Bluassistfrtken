import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import '../components/Dashboard.css';
import './ApiDocs.css';

const ApiDocs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchTenantData();
  }, [user, navigate]);

  const fetchTenantData = async () => {
    try {
      const response = await apiService.getTenant();
      if (response.success && response.data?.tenant) {
        setTenant(response.data.tenant);
      } else {
        console.warn('Tenant data not available');
        setTenant(null);
      }
    } catch (error) {
      console.error('Failed to fetch tenant data:', error);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar
          tenant={tenant}
        />
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="api-docs-loading">Loading API documentation...</div>
          </div>
        </div>
      </div>
    );
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="dashboard">
      <Sidebar
        tenant={tenant}
      />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="separator">›</span>
            <span>{tenant?.name || 'Bluassist'}</span>
            <span className="separator">›</span>
            <span className="active">API Documentation</span>
          </div>

          <div className="api-docs-container">
            <div className="api-docs-header">
              <h1>API Documentation</h1>
              <p className="api-docs-subtitle">
                Complete reference for integrating with the BluAssist API
              </p>
            </div>

            <div className="api-docs-content">
              <section className="api-section">
                <h2>Base URL</h2>
                <div className="api-endpoint">
                  <code>{apiBaseUrl}/api</code>
                </div>
              </section>

              <section className="api-section">
                <h2>Authentication</h2>
                <p>All protected endpoints require a Bearer token in the Authorization header:</p>
                <div className="api-code-block">
                  <pre><code>{`Authorization: Bearer <accessToken>`}</code></pre>
                </div>
                <p className="api-note">
                  Get your API key from <a href="/settings/api-keys">Settings → API Key Management</a>
                </p>
              </section>

              <section className="api-section">
                <h2>API Key Management</h2>
                
                <div className="api-endpoint-item">
                  <div className="api-method get">GET</div>
                  <div className="api-endpoint-path">/api/tenants/api-keys</div>
                </div>
                <p className="api-description">Retrieve your API key and secret.</p>
                <div className="api-code-block">
                  <pre><code>{`{
  "success": true,
  "data": {
    "apiKey": "550e8400-e29b-41d4-a716-446655440000",
    "apiSecret": "660e8400-e29b-41d4-a716-446655440001",
    "createdAt": "2026-02-20T10:00:00.000Z"
  }
}`}</code></pre>
                </div>

                <div className="api-endpoint-item">
                  <div className="api-method post">POST</div>
                  <div className="api-endpoint-path">/api/tenants/api-keys/regenerate-key</div>
                </div>
                <p className="api-description">Regenerate your API key.</p>

                <div className="api-endpoint-item">
                  <div className="api-method post">POST</div>
                  <div className="api-endpoint-path">/api/tenants/api-keys/regenerate-secret</div>
                </div>
                <p className="api-description">Regenerate your API secret.</p>

                <div className="api-endpoint-item">
                  <div className="api-method post">POST</div>
                  <div className="api-endpoint-path">/api/tenants/api-keys/regenerate-both</div>
                </div>
                <p className="api-description">Regenerate both API key and secret.</p>
              </section>

              <section className="api-section">
                <h2>Chatbot Configuration</h2>
                
                <div className="api-endpoint-item">
                  <div className="api-method get">GET</div>
                  <div className="api-endpoint-path">/api/chatbot/config</div>
                </div>
                <p className="api-description">Get your chatbot configuration.</p>

                <div className="api-endpoint-item">
                  <div className="api-method put">PUT</div>
                  <div className="api-endpoint-path">/api/chatbot/config</div>
                </div>
                <p className="api-description">Update chatbot configuration.</p>
                <div className="api-code-block">
                  <pre><code>{`{
  "name": "My Custom Chatbot",
  "welcomeMessage": "Welcome! How can I assist you?",
  "primaryColor": "rgba(80,159,239,1)",
  "secondaryColor": "#333333",
  "enabled": true
}`}</code></pre>
                </div>

                <div className="api-endpoint-item">
                  <div className="api-method put">PUT</div>
                  <div className="api-endpoint-path">/api/chatbot/toggle</div>
                </div>
                <p className="api-description">Toggle chatbot on/off.</p>

                <div className="api-endpoint-item">
                  <div className="api-method post">POST</div>
                  <div className="api-endpoint-path">/api/chatbot/reset</div>
                </div>
                <p className="api-description">Reset chatbot configuration to defaults.</p>
              </section>

              <section className="api-section">
                <h2>Knowledge Base</h2>
                
                <div className="api-endpoint-item">
                  <div className="api-method get">GET</div>
                  <div className="api-endpoint-path">/api/knowledge</div>
                </div>
                <p className="api-description">Get all knowledge base pages.</p>

                <div className="api-endpoint-item">
                  <div className="api-method get">GET</div>
                  <div className="api-endpoint-path">/api/knowledge/:id</div>
                </div>
                <p className="api-description">Get a specific knowledge base page.</p>

                <div className="api-endpoint-item">
                  <div className="api-method post">POST</div>
                  <div className="api-endpoint-path">/api/knowledge</div>
                </div>
                <p className="api-description">Create a new knowledge base page.</p>

                <div className="api-endpoint-item">
                  <div className="api-method put">PUT</div>
                  <div className="api-endpoint-path">/api/knowledge/:id</div>
                </div>
                <p className="api-description">Update a knowledge base page.</p>

                <div className="api-endpoint-item">
                  <div className="api-method delete">DELETE</div>
                  <div className="api-endpoint-path">/api/knowledge/:id</div>
                </div>
                <p className="api-description">Delete a knowledge base page.</p>
              </section>

              <section className="api-section">
                <h2>Error Responses</h2>
                <p>All endpoints return consistent error responses:</p>
                <div className="api-code-block">
                  <pre><code>{`{
  "success": false,
  "message": "Error message",
  "errors": [] // For validation errors
}`}</code></pre>
                </div>
              </section>

              <section className="api-section">
                <h2>Rate Limits</h2>
                <p>API requests are rate-limited to ensure fair usage. Rate limit headers are included in all responses:</p>
                <ul>
                  <li><code>X-RateLimit-Limit</code> - Maximum number of requests allowed</li>
                  <li><code>X-RateLimit-Remaining</code> - Number of requests remaining</li>
                  <li><code>X-RateLimit-Reset</code> - Time when the rate limit resets</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
