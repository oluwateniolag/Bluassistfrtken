import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import '../components/Dashboard.css';
import './Knowledge.css';

const Knowledge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [page, setPage] = useState(null);
  const [pageExists, setPageExists] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeNav, setActiveNav] = useState('knowledge');
  const [expandedNav, setExpandedNav] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTenantData();
    loadData();
  }, [user, navigate]);

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
    } else {
      setActiveNav(navItem);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pagesRes, templatesRes] = await Promise.all([
        api.getKnowledgePages(),
        api.getKnowledgeTemplates()
      ]);

      if (pagesRes.success) {
        setPage(pagesRes.data.page);
        setPageExists(pagesRes.data.exists);
      }
      if (templatesRes.success) {
        setTemplates(templatesRes.data.templates);
      }
    } catch (err) {
      setError(err.message || 'Failed to load knowledge page');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = (templateId) => {
    if (pageExists && page) {
      // If page exists, navigate to edit
      navigate(`/knowledge/edit/${page.id}`);
    } else {
      // Create new page
      if (templateId) {
        navigate(`/knowledge/create?template=${templateId}`);
      } else {
        navigate('/knowledge/create');
      }
    }
  };

  const handleEditPage = () => {
    if (page) {
      navigate(`/knowledge/edit/${page.id}`);
    }
  };

  const handleViewPage = () => {
    if (page) {
      navigate(`/knowledge/view/${page.id}`);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badges = {
      draft: { label: 'Draft', className: 'status-draft' },
      published: { label: 'Published', className: 'status-published' },
      archived: { label: 'Archived', className: 'status-archived' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
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
          <div className="knowledge-container">
            <div className="knowledge-loading">Loading knowledge pages...</div>
          </div>
        </div>
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
            <span className="active">Knowledge</span>
          </div>

        <div className="knowledge-container">
      <div className="knowledge-header">
        <div className="knowledge-header-actions">
          {pageExists ? (
            <>
              <button
                className="knowledge-btn knowledge-btn-secondary"
                onClick={handleViewPage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View Page
              </button>
              <button
                className="knowledge-btn knowledge-btn-primary"
                onClick={handleEditPage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Page
              </button>
            </>
          ) : (
            <>
              <button
                className="knowledge-btn knowledge-btn-secondary"
                onClick={() => setShowCreateModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M12 18v-6"></path>
                  <path d="M9 15h6"></path>
                </svg>
                Create from Template
              </button>
              <button
                className="knowledge-btn knowledge-btn-primary"
                onClick={() => handleCreatePage()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Page
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="knowledge-alert knowledge-alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="knowledge-list">
        {!pageExists ? (
          <div className="knowledge-empty-state">
            <div className="knowledge-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <h3 className="knowledge-empty-title">No pages yet</h3>
            <p className="knowledge-empty-description">Create a page to document your platform and power your chatbot.</p>
            <div className="knowledge-empty-actions">
              <button className="knowledge-btn knowledge-btn-primary" onClick={() => handleCreatePage()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Page
              </button>
              <button className="knowledge-btn knowledge-btn-secondary" onClick={() => setShowCreateModal(true)}>
                Use Template
              </button>
            </div>
          </div>
        ) : (
          <div className="knowledge-single-card">
            <div className="knowledge-card">
              <div className="knowledge-card-header">
                <h3 className="knowledge-card-title">{page.title}</h3>
                {getStatusBadge(page.status)}
              </div>
              {page.category && (
                <span className="knowledge-card-category">{page.category}</span>
              )}
              {page.metaDescription && (
                <p className="knowledge-card-description">{page.metaDescription}</p>
              )}
              {page.tags && page.tags.length > 0 && (
                <div className="knowledge-card-tags">
                  {page.tags.map((tag, idx) => (
                    <span key={idx} className="knowledge-tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="knowledge-card-footer">
                <div className="knowledge-card-meta">
                  <span>Version {page.version}</span>
                  {page.viewCount > 0 && (
                    <span>{page.viewCount} views</span>
                  )}
                  {page.updatedAt && (
                    <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="knowledge-card-actions">
                  <button className="knowledge-btn knowledge-btn-sm knowledge-btn-secondary" onClick={handleViewPage}>
                    View
                  </button>
                  <button className="knowledge-btn knowledge-btn-sm knowledge-btn-primary" onClick={handleEditPage}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="knowledge-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="knowledge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="knowledge-modal-header">
              <h2 className="knowledge-modal-title">Choose a template</h2>
              <button type="button" className="knowledge-modal-close" onClick={() => setShowCreateModal(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="knowledge-modal-body">
              {templates.length === 0 ? (
                <p className="knowledge-modal-empty">No templates available. You can create a blank page.</p>
              ) : (
                <div className="knowledge-template-grid">
                  <button
                    type="button"
                    className="knowledge-template-card"
                    onClick={() => {
                      handleCreatePage();
                      setShowCreateModal(false);
                    }}
                  >
                    <div className="knowledge-template-card-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <h3 className="knowledge-template-card-title">Blank Page</h3>
                    <p className="knowledge-template-card-desc">Start with an empty page</p>
                  </button>
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      className="knowledge-template-card"
                      onClick={() => {
                        handleCreatePage(template.id);
                        setShowCreateModal(false);
                      }}
                    >
                      <div className="knowledge-template-card-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <path d="M12 18v-6"></path>
                          <path d="M9 15h6"></path>
                        </svg>
                      </div>
                      <h3 className="knowledge-template-card-title">{template.name}</h3>
                      {template.description && (
                        <p className="knowledge-template-card-desc">{template.description}</p>
                      )}
                      {template.isSystem && (
                        <span className="knowledge-template-badge">System</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
