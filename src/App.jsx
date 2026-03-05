import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Knowledge from './pages/Knowledge';
import KnowledgeEditor from './pages/KnowledgeEditor';
import KnowledgeView from './pages/KnowledgeView';
import Settings from './pages/Settings';
import ApiDocs from './pages/ApiDocs';
import BotIdentity from './pages/BotIdentity';
import './App.css';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleLoginSuccess = (loginData) => {
    handleCloseModals();
    const onboardingCompleted = loginData?.user?.tenant?.onboardingCompleted;
    if (onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  const handleRegisterSuccess = () => {
    handleCloseModals();
    setTimeout(() => {
      navigate('/onboarding');
    }, 100);
  };

  // Only redirect on initial login/register, not when manually navigating
  // Users can access homepage even when authenticated

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-secondary)'
      }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        <Route path="/onboarding" element={
          isAuthenticated ? <Onboarding /> : <Navigate to="/" replace />
        } />
        <Route path="/knowledge" element={
          isAuthenticated ? <Knowledge /> : <Navigate to="/" replace />
        } />
        <Route path="/knowledge/create" element={
          isAuthenticated ? <KnowledgeEditor /> : <Navigate to="/" replace />
        } />
        <Route path="/knowledge/edit/:id" element={
          isAuthenticated ? <KnowledgeEditor /> : <Navigate to="/" replace />
        } />
        <Route path="/knowledge/view/:id" element={
          isAuthenticated ? <KnowledgeView /> : <Navigate to="/" replace />
        } />
        <Route path="/settings/*" element={
          isAuthenticated ? <Settings /> : <Navigate to="/" replace />
        } />
        <Route path="/api-docs" element={
          isAuthenticated ? <ApiDocs /> : <Navigate to="/" replace />
        } />
        <Route path="/webchat/bot-identity" element={
          isAuthenticated ? <BotIdentity /> : <Navigate to="/" replace />
        } />
        <Route path="/" element={<LandingPage 
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
          isAuthenticated={isAuthenticated}
          user={user}
          logout={logout}
        />} />
      </Routes>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseModals}
          onSwitchToRegister={handleRegisterClick}
          onSuccess={handleLoginSuccess}
        />
      )}
      {showRegisterModal && (
        <RegisterModal
          onClose={handleCloseModals}
          onSwitchToLogin={handleLoginClick}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
}

function LandingPage({ onLoginClick, onRegisterClick, isAuthenticated, user, logout }) {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <a href="/" className="logo-link">
              <img src="/blusalt-icon.svg" alt="Bluassist" className="logo-img" />
              <span className="logo-text">Bluassist</span>
            </a>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <a href="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  Dashboard
                </a>
                <span className="user-info">
                  {user?.firstName} {user?.lastName}
                </span>
                <button className="btn-secondary" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={onLoginClick}>Log in</button>
                <button className="btn-primary" onClick={onRegisterClick}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>AI-powered customer service</span>
            </div>
            <h1 className="hero-title">
              Intelligent chatbots powered by your{' '}
              <span className="gradient-text">business knowledge</span>
            </h1>
            <p className="hero-description">
              Transform customer support with AI chatbots that understand your business. 
              Built on your knowledge base, delivering accurate answers 24/7.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <button className="btn-primary btn-large" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="btn-primary btn-large" onClick={onRegisterClick}>Start Free Trial</button>
                  <button className="btn-outline btn-large" onClick={onLoginClick}>Request Demo</button>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">Enterprise</div>
                <div className="stat-label">Grade Security</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chatbot-preview">
              <div className="chat-window">
                <div className="chat-header">
                  <div className="chat-header-info">
                    <img src="/blusalt-icon.svg" alt="Bluassist" className="chat-logo" />
                    <span className="chat-title">Bluassist Chat</span>
                  </div>
                  <div className="chat-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div className="chat-messages">
                  <div className="message bot-message">
                    <div className="message-content">
                      Hello! How can I help you today?
                    </div>
                  </div>
                  <div className="message user-message">
                    <div className="message-content">
                      What are your business hours?
                    </div>
                  </div>
                  <div className="message bot-message">
                    <div className="message-content">
                      We're open Monday-Friday, 9 AM - 6 PM EST. Is there anything specific you'd like to know?
                    </div>
                  </div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="Type your message..." />
                  <button className="send-btn">→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Built for modern businesses
            </h2>
            <p className="section-description">
              Everything you need to deliver exceptional customer experiences
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Knowledge Base Integration</h3>
              <p className="feature-description">
                Connect your existing documentation, FAQs, and business knowledge. 
                Your chatbot learns from your content instantly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Multi-Channel Support</h3>
              <p className="feature-description">
                Deploy across websites, mobile apps, messaging platforms, and more. 
                Consistent experience everywhere your customers are.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="feature-title">Enterprise Trust</h3>
              <p className="feature-description">
                Built with security and compliance in mind. Full visibility, 
                oversight, and control over your AI operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions / Why Bluassist */}
      <section id="solutions" className="trust" aria-labelledby="why-bluassist-heading">
        <div className="container">
          <div className="trust-section-header">
            <h2 id="why-bluassist-heading" className="trust-section-title">Why Bluassist</h2>
            <p className="trust-section-subtitle">Built for scale, security, and speed</p>
          </div>
          <div className="trust-grid">
            <article className="trust-card">
              <div className="trust-icon-wrap">
                <svg className="trust-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="trust-title">Fast Implementation</h3>
              <p className="trust-description">
                Get up and running in minutes, not weeks. Simple integration with your existing tools and workflows.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-icon-wrap">
                <svg className="trust-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 className="trust-title">Real-Time Analytics</h3>
              <p className="trust-description">
                Track performance, understand customer needs, and continuously improve with comprehensive insights.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-icon-wrap">
                <svg className="trust-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="trust-title">Secure & Compliant</h3>
              <p className="trust-description">
                Enterprise-grade security with SOC 2, GDPR, and HIPAA compliance. Your data stays protected.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-icon-wrap">
                <svg className="trust-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="trust-title">High Performance</h3>
              <p className="trust-description">
                99.9% uptime SLA with global infrastructure. Handle millions of conversations without breaking a sweat.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-description">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-name">Starter</h3>
              <div className="pricing-price">
                <span className="pricing-amount">Free</span>
                <span className="pricing-period">/ month</span>
              </div>
              <p className="pricing-desc">Perfect for trying out Bluassist</p>
              <ul className="pricing-features">
                <li>Up to 1,000 conversations/month</li>
                <li>1 knowledge base</li>
                <li>Web widget</li>
                <li>Email support</li>
              </ul>
              <button type="button" className="btn-outline" onClick={onRegisterClick}>Get started</button>
            </div>
            <div className="pricing-card pricing-card-featured">
              <div className="pricing-badge">Popular</div>
              <h3 className="pricing-name">Professional</h3>
              <div className="pricing-price">
                <span className="pricing-amount">$99</span>
                <span className="pricing-period">/ month</span>
              </div>
              <p className="pricing-desc">For growing teams</p>
              <ul className="pricing-features">
                <li>10,000 conversations/month</li>
                <li>5 knowledge bases</li>
                <li>Web + API</li>
                <li>Priority support</li>
              </ul>
              <button type="button" className="btn-primary" onClick={onRegisterClick}>Start free trial</button>
            </div>
            <div className="pricing-card">
              <h3 className="pricing-name">Enterprise</h3>
              <div className="pricing-price">
                <span className="pricing-amount">Custom</span>
              </div>
              <p className="pricing-desc">For large organizations</p>
              <ul className="pricing-features">
                <li>Unlimited conversations</li>
                <li>Unlimited knowledge bases</li>
                <li>SSO, SLA, dedicated support</li>
                <li>Custom integrations</li>
              </ul>
              <button type="button" className="btn-outline" onClick={onLoginClick}>Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to transform your customer service?</h2>
            <p className="cta-description">
              Join thousands of businesses using Bluassist to deliver exceptional customer experiences.
            </p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <button className="btn-primary btn-large" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="btn-primary btn-large" onClick={onRegisterClick}>Start Free Trial</button>
                  <button className="btn-outline btn-large" onClick={onLoginClick}>Schedule Demo</button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Resources */}
      <footer id="resources" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <img src="/blusalt-icon.svg" alt="Bluassist" className="footer-logo-img" />
                <span>Bluassist</span>
              </div>
              <p className="footer-description">
                AI-powered chatbots for modern businesses
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#api">API</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-links">
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#support">Support</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Bluassist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
