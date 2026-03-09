import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Sidebar from '../components/Sidebar';
import BotHeader from '../components/BotHeader';
import OverviewMetrics from '../components/OverviewMetrics';
import '../components/Dashboard.css';
import '../components/Sidebar.css';
import '../components/BotHeader.css';
import '../components/OverviewMetrics.css';

// Remove old dashboard styles - using new component-based styles

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchTenantData();
  }, [user, navigate]);

  useEffect(() => {
    if (tenant && !tenant.onboardingCompleted && tenant.onboardingCompleted !== undefined) {
      navigate('/onboarding');
    }
  }, [tenant, navigate]);

  // Set light theme for dashboard
  useEffect(() => {
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
      <div className="dashboard-loading" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        color: '#1a1a1a'
      }}>
        <div className="spinner-large"></div>
        <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading dashboard...</p>
      </div>
    );
  }

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
            <span className="active">Overview</span>
          </div>

          <BotHeader tenant={tenant} />

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
};

export default Dashboard;
