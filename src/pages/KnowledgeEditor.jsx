import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/Sidebar.css';
import '../components/Dashboard.css';
import './KnowledgeEditor.css';

const KnowledgeEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: [],
    content: {
      platformName: '',
      introduction: '',
      moduleOverview: '',
      modules: [],
      apiRequestResponses: '',
      httpStatusCodes: [],
      faqCategories: []
    },
    status: 'draft',
    metaDescription: '',
    metaKeywords: []
  });
  const [tagInput, setTagInput] = useState('');
  const [activeNav, setActiveNav] = useState('knowledge');
  const [expandedNav, setExpandedNav] = useState({});

  const isEditMode = !!id;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchTenantData();
    loadData();
  }, [id, templateId, user, navigate]);

  const fetchTenantData = async () => {
    try {
      const response = await apiService.getTenant();
      if (response.success && response.data?.tenant) {
        const t = response.data.tenant;
        setTenant(t);

        // In CREATE mode, auto-populate form fields from Bot Identity data
        if (!id) {
          setFormData(prev => ({
            ...prev,
            title: prev.title || t.platformName || '',
            content: {
              ...prev.content,
              platformName: prev.content.platformName || t.platformName || '',
              introduction: prev.content.introduction || t.platformDescription || ''
            }
          }));
        }
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If creating, check if page already exists
      if (!id) {
        const pagesRes = await api.getKnowledgePages();
        if (pagesRes.success && pagesRes.data?.exists && pagesRes.data?.page) {
          // Page already exists, redirect to edit
          navigate(`/knowledge/edit/${pagesRes.data.page.id}`);
          return;
        }
      }

      // Load template if provided
      if (templateId) {
        const templateRes = await api.getKnowledgeTemplate(templateId);
        if (templateRes.success) {
          setTemplate(templateRes.data.template);
          // Initialize form with template default content
          setFormData(prev => ({
            ...prev,
            content: { ...templateRes.data.template.defaultContent }
          }));
        }
      }

      // Load existing page if editing
      if (id) {
        const pageRes = await api.getKnowledgePage(id);
        if (pageRes.success) {
          const page = pageRes.data.page;
          setFormData({
            title: page.title || '',
            category: page.category || '',
            tags: page.tags || [],
            content: page.content || {
              platformName: '',
              introduction: '',
              moduleOverview: '',
              modules: [],
              apiRequestResponses: '',
              httpStatusCodes: [],
              faqCategories: []
            },
            status: page.status || 'draft',
            metaDescription: page.metaDescription || '',
            metaKeywords: page.metaKeywords || []
          });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Module management
  const handleAddModule = () => {
    const modules = [...(formData.content.modules || [])];
    modules.push({ name: '', features: [] });
    handleContentChange('modules', modules);
  };

  const handleUpdateModule = (index, field, value) => {
    const modules = [...(formData.content.modules || [])];
    modules[index][field] = value;
    handleContentChange('modules', modules);
  };

  const handleRemoveModule = (index) => {
    const modules = [...(formData.content.modules || [])];
    modules.splice(index, 1);
    handleContentChange('modules', modules);
  };

  const handleAddModuleFeature = (moduleIndex) => {
    const modules = [...(formData.content.modules || [])];
    if (!modules[moduleIndex].features) {
      modules[moduleIndex].features = [];
    }
    modules[moduleIndex].features.push('');
    handleContentChange('modules', modules);
  };

  const handleUpdateModuleFeature = (moduleIndex, featureIndex, value) => {
    const modules = [...(formData.content.modules || [])];
    modules[moduleIndex].features[featureIndex] = value;
    handleContentChange('modules', modules);
  };

  const handleRemoveModuleFeature = (moduleIndex, featureIndex) => {
    const modules = [...(formData.content.modules || [])];
    modules[moduleIndex].features.splice(featureIndex, 1);
    handleContentChange('modules', modules);
  };

  // HTTP Status Codes management
  const handleAddStatusCode = () => {
    const codes = [...(formData.content.httpStatusCodes || [])];
    codes.push({ status: '', meaning: '' });
    handleContentChange('httpStatusCodes', codes);
  };

  const handleUpdateStatusCode = (index, field, value) => {
    const codes = [...(formData.content.httpStatusCodes || [])];
    codes[index][field] = value;
    handleContentChange('httpStatusCodes', codes);
  };

  const handleRemoveStatusCode = (index) => {
    const codes = [...(formData.content.httpStatusCodes || [])];
    codes.splice(index, 1);
    handleContentChange('httpStatusCodes', codes);
  };

  // FAQ Categories management
  const handleAddFAQCategory = () => {
    const categories = [...(formData.content.faqCategories || [])];
    categories.push({ category: '', questions: [] });
    handleContentChange('faqCategories', categories);
  };

  const handleUpdateFAQCategory = (index, field, value) => {
    const categories = [...(formData.content.faqCategories || [])];
    categories[index][field] = value;
    handleContentChange('faqCategories', categories);
  };

  const handleRemoveFAQCategory = (index) => {
    const categories = [...(formData.content.faqCategories || [])];
    categories.splice(index, 1);
    handleContentChange('faqCategories', categories);
  };

  const handleAddFAQQuestion = (categoryIndex) => {
    const categories = [...(formData.content.faqCategories || [])];
    if (!categories[categoryIndex].questions) {
      categories[categoryIndex].questions = [];
    }
    categories[categoryIndex].questions.push({ question: '', answer: '' });
    handleContentChange('faqCategories', categories);
  };

  const handleUpdateFAQQuestion = (categoryIndex, questionIndex, field, value) => {
    const categories = [...(formData.content.faqCategories || [])];
    categories[categoryIndex].questions[questionIndex][field] = value;
    handleContentChange('faqCategories', categories);
  };

  const handleRemoveFAQQuestion = (categoryIndex, questionIndex) => {
    const categories = [...(formData.content.faqCategories || [])];
    categories[categoryIndex].questions.splice(questionIndex, 1);
    handleContentChange('faqCategories', categories);
  };

  const handleSave = async (status) => {
    try {
      setSaving(true);
      setError(null);

      const dataToSave = {
        ...formData,
        status: status || formData.status
      };

      let response;
      if (isEditMode) {
        response = await api.updateKnowledgePage(id, dataToSave);
      } else {
        response = await api.createKnowledgePage({
          ...dataToSave,
          templateId: templateId || undefined
        });
      }

      if (response.success) {
        navigate('/knowledge');
      } else {
        // If creating and getting error about existing page, navigate to edit
        if (!isEditMode && response.data?.existingPageId) {
          navigate(`/knowledge/edit/${response.data.existingPageId}`);
        } else {
          setError(response.message || 'Failed to save knowledge page');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save knowledge page');
    } finally {
      setSaving(false);
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
          <div className="knowledge-editor-container">
            <div className="knowledge-editor-loading">Loading...</div>
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
        <div className="knowledge-editor-container">
          <div className="knowledge-editor-header">
            <h1>{isEditMode ? 'Edit Knowledge Page' : 'Create Knowledge Page'}</h1>
            <div className="knowledge-editor-actions">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/knowledge')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSave('published')}
                disabled={saving}
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          {error && (
            <div className="knowledge-editor-error">
              {error}
            </div>
          )}

          <div className="knowledge-editor-form">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter page title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" className="btn btn-sm" onClick={handleAddTag}>
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 1. Platform Overview */}
            <div className="form-section">
              <h2>1. Platform Overview</h2>
              
              <div className="form-group">
                <label>Platform Name *</label>
                <input
                  type="text"
                  value={formData.content.platformName || ''}
                  onChange={(e) => handleContentChange('platformName', e.target.value)}
                  placeholder="e.g., trustpro, paymentpro"
                  required
                />
              </div>

              <div className="form-group">
                <label>Introduction *</label>
                <textarea
                  value={formData.content.introduction || ''}
                  onChange={(e) => handleContentChange('introduction', e.target.value)}
                  placeholder="Describe the core purpose and value proposition in 1–2 sentences. It serves [user personas] by providing [key capability]."
                  rows={4}
                  required
                />
                <small className="form-hint">
                  Example: [Platform Name] is a [cloud-based/hybrid/on-premise] platform designed to [purpose]. It serves [user personas] by providing [capability].
                </small>
              </div>
            </div>

            {/* 2. Core Functionality & System Capabilities */}
            <div className="form-section">
              <h2>2. Core Functionality & System Capabilities</h2>
              
              <div className="form-group">
                <label>Module Overview</label>
                <textarea
                  value={formData.content.moduleOverview || ''}
                  onChange={(e) => handleContentChange('moduleOverview', e.target.value)}
                  placeholder="Describe how the platform is organized into functional modules..."
                  rows={3}
                />
                <small className="form-hint">
                  Example: [Platform Name] is organized into the following functional modules. Each module may be independently enabled or disabled depending on your subscription plan.
                </small>
              </div>

              <div className="form-group">
                <label>Modules</label>
                {(formData.content.modules || []).map((module, moduleIdx) => (
                  <div key={moduleIdx} className="module-item">
                    <div className="module-header">
                      <input
                        type="text"
                        value={module.name || ''}
                        onChange={(e) => handleUpdateModule(moduleIdx, 'name', e.target.value)}
                        placeholder={`Module ${moduleIdx + 1} Name (e.g., User & Account Management)`}
                        className="module-name-input"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveModule(moduleIdx)}
                      >
                        Remove Module
                      </button>
                    </div>
                    <div className="module-features">
                      <label className="module-features-label">Features:</label>
                      {(module.features || []).map((feature, featureIdx) => (
                        <div key={featureIdx} className="feature-item">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleUpdateModuleFeature(moduleIdx, featureIdx, e.target.value)}
                            placeholder={`Feature ${featureIdx + 1}`}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveModuleFeature(moduleIdx, featureIdx)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAddModuleFeature(moduleIdx)}
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleAddModule}
                >
                  Add Module
                </button>
              </div>
            </div>

            {/* 3. API Documentation */}
            <div className="form-section">
              <h2>3. API Documentation</h2>
              
              <div className="form-group">
                <label>Request and Responses</label>
                <textarea
                  value={formData.content.apiRequestResponses || ''}
                  onChange={(e) => handleContentChange('apiRequestResponses', e.target.value)}
                  placeholder="Document API request and response formats..."
                  rows={6}
                />
              </div>
            </div>

            {/* 4. Error Codes & Status Responses */}
            <div className="form-section">
              <h2>4. Error Codes & Status Responses</h2>
              
              <div className="form-group">
                <label>HTTP Status Code Reference</label>
                {(formData.content.httpStatusCodes || []).map((code, idx) => (
                  <div key={idx} className="status-code-item">
                    <input
                      type="text"
                      value={code.status || ''}
                      onChange={(e) => handleUpdateStatusCode(idx, 'status', e.target.value)}
                      placeholder="HTTP Status (e.g., 200 OK)"
                    />
                    <input
                      type="text"
                      value={code.meaning || ''}
                      onChange={(e) => handleUpdateStatusCode(idx, 'meaning', e.target.value)}
                      placeholder="Meaning (e.g., Request succeeded. Response body contains the result.)"
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveStatusCode(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleAddStatusCode}
                >
                  Add Status Code
                </button>
              </div>
            </div>

            {/* 5. Frequently Asked Questions */}
            <div className="form-section">
              <h2>5. Frequently Asked Questions (FAQ)</h2>
              
              {(formData.content.faqCategories || []).map((category, catIdx) => (
                <div key={catIdx} className="faq-category-item">
                  <div className="faq-category-header">
                    <input
                      type="text"
                      value={category.category || ''}
                      onChange={(e) => handleUpdateFAQCategory(catIdx, 'category', e.target.value)}
                      placeholder={`Category ${catIdx + 1} (e.g., General Questions, Technical Questions)`}
                      className="faq-category-name-input"
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveFAQCategory(catIdx)}
                    >
                      Remove Category
                    </button>
                  </div>
                  <div className="faq-questions">
                    {(category.questions || []).map((faq, qIdx) => (
                      <div key={qIdx} className="faq-item">
                        <input
                          type="text"
                          value={faq.question || ''}
                          onChange={(e) => handleUpdateFAQQuestion(catIdx, qIdx, 'question', e.target.value)}
                          placeholder="Question"
                        />
                        <textarea
                          value={faq.answer || ''}
                          onChange={(e) => handleUpdateFAQQuestion(catIdx, qIdx, 'answer', e.target.value)}
                          placeholder="Answer"
                          rows={3}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveFAQQuestion(catIdx, qIdx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleAddFAQQuestion(catIdx)}
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleAddFAQCategory}
              >
                Add FAQ Category
              </button>
            </div>

            {/* SEO Metadata */}
            <div className="form-section">
              <h2>SEO Metadata</h2>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  value={formData.metaKeywords.join(', ')}
                  onChange={(e) => handleInputChange('metaKeywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  placeholder="Comma-separated keywords"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeEditor;
