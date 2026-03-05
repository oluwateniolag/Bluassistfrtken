import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const SIDEBAR_COLLAPSED_KEY = 'bluassist-sidebar-collapsed';

// SVG Icon Components
const OverviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);


const KnowledgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);


const WebchatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);


const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364-4.243-4.243m-4.242 0L5.636 17.364m12.728 0-4.243-4.243m-4.242 0L5.636 6.636"></path>
  </svg>
);

const ApiDocsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

function Sidebar({ activeNav, setActiveNav, expandedNav, toggleNav, tenant }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(collapsed));
    } catch (e) {}
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setCollapsed(prev => !prev);
  };

  const handleSubItemClick = (subItem) => {
    if (subItem === 'Knowledge Bases') {
      if (typeof setActiveNav === 'function') {
        // If setActiveNav is a navigation handler (from Dashboard/Knowledge pages)
        setActiveNav('knowledge');
      } else {
        // Fallback: navigate directly if needed
        navigate('/knowledge');
      }
    } else if (subItem === 'Bot Identity') {
      navigate('/webchat/bot-identity');
    } else if (subItem === 'API Key Management') {
      navigate('/settings/api-keys');
    } else if (subItem === 'Subscription') {
      navigate('/settings/subscription');
    } else if (subItem === 'Tenant Settings') {
      navigate('/settings/tenant');
    }
  };

  const handleNavClick = (itemId) => {
    if (itemId === 'settings') {
      // Don't navigate, just expand/collapse
      if (toggleNav) {
        toggleNav(itemId);
      }
    } else if (itemId === 'knowledge') {
      navigate('/knowledge');
    } else if (itemId === 'api-docs') {
      navigate('/api-docs');
    } else if (setActiveNav) {
      setActiveNav(itemId);
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <OverviewIcon />
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      icon: <KnowledgeIcon />,
      subItems: ['Tables', 'Knowledge Bases']
    },
    {
      id: 'webchat',
      label: 'Webchat',
      icon: <WebchatIcon />,
      subItems: ['Bot Identity', 'Bot Appearance', 'Deploy Settings', 'Features']
    },
    {
      id: 'api-docs',
      label: 'API Docs',
      icon: <ApiDocsIcon />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      subItems: ['API Key Management', 'Subscription', 'Tenant Settings']
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} title={collapsed ? 'Expand sidebar' : undefined}>
      <div className="sidebar-header">
        <div className="workspace-info">
          <a href="/dashboard" className="sidebar-logo-link">
            <img src="/blusalt-icon.svg" alt="Bluassist" className="sidebar-logo-img" />
          </a>
          {!collapsed && (
            <>
              <div className="workspace-name">{tenant?.name || 'Bluassist'} Workspace</div>
              <div className="workspace-plan">{tenant?.plan || 'Pay-as-you-go'}</div>
            </>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div key={item.id} className="nav-item-wrapper">
            <div
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.subItems && !collapsed) {
                  toggleNav(item.id);
                } else if (!item.subItems) {
                  handleNavClick(item.id);
                } else if (collapsed) {
                  if (item.id === 'overview') navigate('/dashboard');
                  else if (item.id === 'knowledge') navigate('/knowledge');
                  else if (item.id === 'webchat') navigate('/dashboard');
                  else if (item.id === 'api-docs') navigate('/api-docs');
                  else if (item.id === 'settings') navigate('/settings');
                } else if (!item.subItems) {
                  handleNavClick(item.id);
                }
              }}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.subItems && (
                    <span className={`nav-arrow ${expandedNav[item.id] ? 'expanded' : ''}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  )}
                </>
              )}
            </div>
            {!collapsed && item.subItems && expandedNav[item.id] && (
              <div className="nav-subitems">
                {item.subItems.map(subItem => (
                  <div 
                    key={subItem} 
                    className="nav-subitem"
                    onClick={() => handleSubItemClick(subItem)}
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer-actions">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
        >
          <span className="nav-icon"><LogoutIcon /></span>
          {!collapsed && <span className="nav-label">Log out</span>}
        </button>
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>
    </div>
  );
}

export default Sidebar;
