import { useState } from 'react';
import Sidebar from './Sidebar';
import BotHeader from './BotHeader';
import OverviewMetrics from './OverviewMetrics';
import './Dashboard.css';

function Dashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const [expandedNav, setExpandedNav] = useState({});

  const toggleNav = (navItem) => {
    setExpandedNav(prev => ({
      ...prev,
      [navItem]: !prev[navItem]
    }));
  };

  return (
    <div className="dashboard">
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav}
        expandedNav={expandedNav}
        toggleNav={toggleNav}
      />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="separator">›</span>
            <span>Bluassist</span>
            <span className="separator">›</span>
            <span className="active">Overview</span>
          </div>

          <BotHeader />

          <div className="overview-section">
            <div className="section-header">
              <h2>Overview</h2>
              <div className="time-range-selector">
                <button className="time-btn">Last 24 hours</button>
                <button className="time-btn active">Last 7 days</button>
                <button className="time-btn">Last 30 days</button>
              </div>
            </div>

            <OverviewMetrics />

            <div className="additional-cards">
              <div className="info-card">
                <div className="card-header">
                  <h3>Human Handoff Queue</h3>
                  <span className="arrow">→</span>
                </div>
                <div className="card-content">
                  <div className="card-value">-</div>
                  <div className="card-subtitle">Conversations awaiting humans</div>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header">
                  <h3>Performance</h3>
                  <span className="arrow">→</span>
                </div>
                <div className="card-content">
                  <div className="card-value"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
