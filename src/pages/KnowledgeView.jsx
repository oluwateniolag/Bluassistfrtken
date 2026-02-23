import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import '../components/Dashboard.css';
import './KnowledgeView.css';

const KnowledgeView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();

  const [tenant, setTenant] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('knowledge');
  const [expandedNav, setExpandedNav] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTenantData();
    loadPage();
  }, [id, user, navigate]);

  const fetchTenantData = async () => {
    try {
      const response = await apiService.getTenant();
      if (response.success && response.data?.tenant) {
        setTenant(response.data.tenant);
      }
    } catch (error) {
      console.error('Failed to fetch tenant data:', error);
    }
  };

  const toggleNav = (navItem) => {
    setExpandedNav(prev => ({
      ...prev,
      [navItem]: !prev[navItem]
    }));
  };

  const handleNavClick = (navItem) => {
    if (navItem === 'overview') {
      navigate('/dashboard');
    } else if (navItem === 'knowledge') {
      navigate('/knowledge');
    } else {
      setActiveNav(navItem);
    }
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);

      const pageRes = await api.getKnowledgePage(id);
      if (pageRes.success) {
        setPage(pageRes.data.page);
      } else {
        setError('Knowledge page not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load knowledge page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <div className="knowledge-view-container">
            <div className="knowledge-view-loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
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
          <div className="knowledge-view-container">
            <div className="knowledge-view-error">
              {error || 'Knowledge page not found'}
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/knowledge')}>
              Back to Knowledge Base
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = page.content || {};

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
        <div className="knowledge-view-container">
          <div className="knowledge-view-header">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/knowledge')}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/knowledge/edit/${page.id}`)}
            >
              Edit
            </button>
          </div>

          <div className="knowledge-view-content">
            {/* Header */}
            <div className="kb-header">
              <div className="kb-header-label">KNOWLEDGE BASE</div>
              <h1 className="kb-platform-name">{content.platformName || '[ Platform Name ]'}</h1>
              <div className="kb-header-divider"></div>
            </div>

            {/* 1. Platform Overview */}
            <section className="kb-section">
              <h2 className="kb-section-title">1. Platform Overview</h2>
              
              <h3 className="kb-subsection-title">1.1 Introduction</h3>
              
              {content.platformName && (
                <div className="kb-highlight-box">
                  <em>{content.platformName} — e.g., 'trustpro', 'paymentpro'</em>
                </div>
              )}

              <div className="kb-content">
                {content.introduction || (
                  <p className="kb-placeholder">[ Platform Name ] is a [ cloud-based / hybrid / on-premise ] platform designed to [ describe the core purpose and value proposition in 1–2 sentences ]. It serves [ describe primary user personas, e.g., enterprise teams, independent developers, small businesses ] by providing [ summarize the key capability or outcome ].</p>
                )}
              </div>
            </section>

            {/* 2. Core Functionality & System Capabilities */}
            <section className="kb-section">
              <h2 className="kb-section-title">2. Core Functionality & System Capabilities</h2>
              
              <h3 className="kb-subsection-title">2.1 Module Overview</h3>
              
              <div className="kb-content">
                {content.moduleOverview || (
                  <p className="kb-placeholder">[ Platform Name ] is organized into the following functional modules. Each module may be independently enabled or disabled depending on your subscription plan.</p>
                )}
              </div>

              {(content.modules && content.modules.length > 0) && (
                <div className="kb-modules">
                  {content.modules.map((module, idx) => (
                    <div key={idx} className="kb-module">
                      <h4 className="kb-module-title">2.1.{idx + 1}  {module.name || `[ Module Name — e.g., User & Account Management ]`}</h4>
                      {module.features && module.features.length > 0 && (
                        <ul className="kb-features-list">
                          {module.features.map((feature, fIdx) => (
                            <li key={fIdx}>{feature || '[ Feature or capability within this module ]'}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. API Documentation */}
            <section className="kb-section">
              <h2 className="kb-section-title">3. API Documentation</h2>
              
              <h3 className="kb-subsection-title">3.1 REQUEST And Responses</h3>
              
              <div className="kb-content">
                {content.apiRequestResponses || (
                  <p className="kb-placeholder">[ Document API request and response formats ]</p>
                )}
              </div>
            </section>

            {/* 4. Error Codes & Status Responses */}
            <section className="kb-section">
              <h2 className="kb-section-title">4. Error Codes & Status Responses</h2>
              
              <h3 className="kb-subsection-title">5.1 HTTP Status Code Reference</h3>
              
              {(content.httpStatusCodes && content.httpStatusCodes.length > 0) ? (
                <table className="kb-status-table">
                  <thead>
                    <tr>
                      <th>HTTP Status</th>
                      <th>Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.httpStatusCodes.map((code, idx) => (
                      <tr key={idx}>
                        <td><strong>{code.status || '[ Status Code ]'}</strong></td>
                        <td>{code.meaning || '[ Meaning ]'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="kb-content">
                  <p className="kb-placeholder">[ Add HTTP status codes and their meanings ]</p>
                </div>
              )}
            </section>

            {/* 5. Frequently Asked Questions */}
            <section className="kb-section">
              <h2 className="kb-section-title">5. Frequently Asked Questions (FAQ)</h2>
              
              {(content.faqCategories && content.faqCategories.length > 0) ? (
                <div className="kb-faq">
                  {content.faqCategories.map((category, catIdx) => (
                    <div key={catIdx} className="kb-faq-category">
                      <h3 className="kb-faq-category-title">{category.category || '[ Category Name ]'}</h3>
                      {category.questions && category.questions.length > 0 && (
                        <div className="kb-faq-questions">
                          {category.questions.map((faq, qIdx) => (
                            <div key={qIdx} className="kb-faq-item">
                              <div className="kb-faq-question">
                                <strong>Q: {faq.question || '[ Question ]'}</strong>
                              </div>
                              <div className="kb-faq-answer">
                                {faq.answer || '[ Answer ]'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="kb-content">
                  <p className="kb-placeholder">( Add new section and questions based on your platform )</p>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="kb-footer">
              <div className="kb-footer-platform">{content.platformName || '[ Platform Name ]'}</div>
              <div className="kb-footer-text">Platform Knowledge Base  |  Technical Documentation</div>
              <div className="kb-footer-copyright">© {new Date().getFullYear()} {tenant?.name || '[ Company Name ]'}. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeView;
