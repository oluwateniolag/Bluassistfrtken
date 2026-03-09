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

  const handleDownloadDoc = () => {
    const platformName = content.platformName || 'Knowledge Base';
    const companyName = tenant?.name || '';
    const year = new Date().getFullYear();

    // Build modules HTML
    const modulesHtml = (content.modules && content.modules.length > 0)
      ? content.modules.map((mod, idx) => `
          <h4 style="font-size:13pt;color:#071B2B;margin:12pt 0 6pt;">2.1.${idx + 1}  ${mod.name || '[ Module Name ]'}</h4>
          ${mod.features && mod.features.length > 0
            ? `<ul>${mod.features.map(f => `<li style="margin-bottom:4pt;">${f}</li>`).join('')}</ul>`
            : ''}
        `).join('')
      : '<p style="color:#888;">[ No modules added ]</p>';

    // Build API calls HTML
    const apiCallsHtml = (content.apiCalls && content.apiCalls.length > 0)
      ? content.apiCalls.map((call, idx) => `
          <h3 style="font-size:12pt;color:#071B2B;margin:14pt 0 6pt;">3.${idx + 1} ${call.name || `API Call ${idx + 1}`}</h3>
          ${call.request ? `<p style="font-size:9pt;font-weight:bold;color:#509FEF;margin:6pt 0 2pt;">Example Request</p>
          <pre style="background:#f3f4f6;padding:10pt;border-radius:4pt;font-family:Courier New,monospace;font-size:9pt;white-space:pre-wrap;word-break:break-all;">${call.request.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>` : ''}
          ${call.response ? `<p style="font-size:9pt;font-weight:bold;color:#509FEF;margin:6pt 0 2pt;">Example Response</p>
          <pre style="background:#f3f4f6;padding:10pt;border-radius:4pt;font-family:Courier New,monospace;font-size:9pt;white-space:pre-wrap;word-break:break-all;">${call.response.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>` : ''}
        `).join('')
      : content.apiRequestResponses
        ? `<p>${content.apiRequestResponses.replace(/\n/g, '<br/>')}</p>`
        : '<p style="color:#888;">[ No API documentation added ]</p>';

    // Build status codes HTML
    const statusCodesHtml = (content.httpStatusCodes && content.httpStatusCodes.length > 0)
      ? `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt;">
          <thead><tr style="background:#509FEF;color:white;">
            <th style="padding:8pt;text-align:left;">HTTP Status</th>
            <th style="padding:8pt;text-align:left;">Meaning</th>
          </tr></thead>
          <tbody>
            ${content.httpStatusCodes.map(c => `<tr><td style="padding:6pt;"><b>${c.status || ''}</b></td><td style="padding:6pt;">${c.meaning || ''}</td></tr>`).join('')}
          </tbody>
        </table>`
      : '<p style="color:#888;">[ No status codes added ]</p>';

    // Build page locations HTML
    const pageLocationsHtml = (content.pageLocations && content.pageLocations.length > 0)
      ? `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt;">
          <thead><tr style="background:#509FEF;color:white;">
            <th style="padding:8pt;text-align:left;">Page Name</th>
            <th style="padding:8pt;text-align:left;">Link / URL</th>
          </tr></thead>
          <tbody>
            ${content.pageLocations.map(p => `<tr><td style="padding:6pt;"><b>${p.name || ''}</b></td><td style="padding:6pt;">${p.link || ''}</td></tr>`).join('')}
          </tbody>
        </table>`
      : '<p style="color:#888;">[ No page locations added ]</p>';

    // Build FAQ HTML
    const faqHtml = (content.faqCategories && content.faqCategories.length > 0)
      ? content.faqCategories.map(cat => `
          <h3 style="font-size:12pt;color:#071B2B;margin:14pt 0 6pt;">${cat.category || ''}</h3>
          ${(cat.questions || []).map(q => `
            <p style="margin:8pt 0 2pt;"><b>Q: ${q.question || ''}</b></p>
            <p style="margin:2pt 0 8pt;color:#444;">${q.answer || ''}</p>
          `).join('')}
        `).join('')
      : '<p style="color:#888;">[ No FAQ entries added ]</p>';

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${platformName} Knowledge Base</title>
        <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #222; margin: 72pt; }
          h1 { font-size: 22pt; color: #071B2B; margin-bottom: 4pt; }
          h2 { font-size: 15pt; color: #509FEF; border-bottom: 2pt solid #509FEF; padding-bottom: 4pt; margin-top: 24pt; }
          h3 { font-size: 12pt; color: #071B2B; margin-top: 14pt; }
          p { line-height: 1.6; margin: 6pt 0; }
          ul { margin: 6pt 0 6pt 20pt; }
          li { margin-bottom: 3pt; }
          .label { font-size: 9pt; color: #509FEF; letter-spacing: 1pt; text-transform: uppercase; margin-bottom: 4pt; }
          .divider { border: none; border-top: 2pt solid #509FEF; margin: 12pt 0 24pt; }
          .footer { margin-top: 40pt; text-align: center; color: #888; font-size: 9pt; border-top: 1pt solid #ddd; padding-top: 8pt; }
        </style>
      </head>
      <body>
        <p class="label">KNOWLEDGE BASE</p>
        <h1>${platformName}</h1>
        <hr class="divider" />

        <h2>1. Platform Overview</h2>
        <h3>1.1 Introduction</h3>
        <p>${content.introduction || '[ No introduction added ]'}</p>

        <h2>2. Core Functionality &amp; System Capabilities</h2>
        <h3>2.1 Module Overview</h3>
        <p>${content.moduleOverview || '[ No module overview added ]'}</p>
        ${modulesHtml}

        <h2>3. API Documentation</h2>
        ${apiCallsHtml}

        <h2>4. Error Codes &amp; Status Responses</h2>
        <h3>4.1 HTTP Status Code Reference</h3>
        ${statusCodesHtml}

        <h2>5. Page Locations</h2>
        ${pageLocationsHtml}

        <h2>6. Frequently Asked Questions (FAQ)</h2>
        ${faqHtml}

        <div class="footer">
          <p>${platformName} Platform Knowledge Base &nbsp;|&nbsp; Technical Documentation</p>
          <p>&copy; ${year} ${companyName}. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platformName.replace(/\s+/g, '_')}_Knowledge_Base.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <Sidebar
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={handleDownloadDoc}
              >
                ↓ Download Doc
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/knowledge/edit/${page.id}`)}
              >
                Edit
              </button>
            </div>
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

              {(content.apiCalls && content.apiCalls.length > 0) ? (
                <div className="kb-api-calls">
                  {content.apiCalls.map((call, idx) => (
                    <div key={idx} className="kb-api-call">
                      <h3 className="kb-subsection-title">3.{idx + 1} {call.name || `[ API Call ${idx + 1} ]`}</h3>
                      {call.request && (
                        <div className="kb-api-block">
                          <div className="kb-api-block-label">Example Request</div>
                          <pre className="kb-code-block">{call.request}</pre>
                        </div>
                      )}
                      {call.response && (
                        <div className="kb-api-block">
                          <div className="kb-api-block-label">Example Response</div>
                          <pre className="kb-code-block">{call.response}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : content.apiRequestResponses ? (
                <div className="kb-content">{content.apiRequestResponses}</div>
              ) : (
                <div className="kb-content">
                  <p className="kb-placeholder">[ No API calls documented ]</p>
                </div>
              )}
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

            {/* 5. Page Locations */}
            <section className="kb-section">
              <h2 className="kb-section-title">5. Page Locations</h2>

              {(content.pageLocations && content.pageLocations.length > 0) ? (
                <table className="kb-status-table">
                  <thead>
                    <tr>
                      <th>Page Name</th>
                      <th>Link / URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.pageLocations.map((loc, idx) => (
                      <tr key={idx}>
                        <td><strong>{loc.name || '[ Page Name ]'}</strong></td>
                        <td>{loc.link || '[ URL ]'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="kb-content">
                  <p className="kb-placeholder">[ Add page names and their links ]</p>
                </div>
              )}
            </section>

            {/* 6. Frequently Asked Questions */}
            <section className="kb-section">
              <h2 className="kb-section-title">6. Frequently Asked Questions (FAQ)</h2>
              
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
