import './OverviewMetrics.css';

function OverviewMetrics() {
  const metrics = [
    {
      label: 'Messages',
      value: '18',
      change: '+6%',
      changeType: 'positive',
      period: 'from last 7 days'
    },
    {
      label: 'Users',
      value: '5',
      change: '+67%',
      changeType: 'positive',
      period: 'from last 7 days'
    },
    {
      label: 'Active Conversations',
      value: '12',
      change: '+20%',
      changeType: 'positive',
      period: 'from last 7 days'
    }
  ];

  return (
    <div className="metrics-grid">
      {metrics.map(metric => (
        <div key={metric.label} className="metric-card">
          <div className="metric-header">
            <h3 className="metric-label">{metric.label}</h3>
          </div>
          <div className="metric-content">
            <div className="metric-value">{metric.value}</div>
            <div className="metric-change">
              <span className={`change-value ${metric.changeType}`}>
                {metric.change}
              </span>
              <span className="change-period">{metric.period}</span>
            </div>
          </div>
          <div className="metric-chart">
            <svg width="100%" height="40" viewBox="0 0 200 40">
              <polyline
                points="0,30 20,25 40,28 60,20 80,22 100,18 120,15 140,12 160,10 180,8 200,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="chart-line"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OverviewMetrics;
