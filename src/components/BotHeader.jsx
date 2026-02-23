import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BotHeader.css';

// Channel Icons
const SlackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const TeamsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 4.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2.5 5.5c0-.8-.7-1.5-1.5-1.5h-8c-.8 0-1.5.7-1.5 1.5v8c0 .8.7 1.5 1.5 1.5h8c.8 0 1.5-.7 1.5-1.5v-8zm-10 0c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5v8c0 .8.7 1.5 1.5 1.5h3c.8 0 1.5-.7 1.5-1.5v-8z"/>
  </svg>
);

const WebchatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

function BotHeader({ tenant }) {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(tenant?.status === 'active');
  const [alwaysAlive, setAlwaysAlive] = useState(tenant?.chatbotConfig?.enabled || false);
  const [lastDeployed] = useState('1 day ago');

  const channels = [
    { name: 'Slack', icon: <SlackIcon />, active: true },
    { name: 'Microsoft Teams', icon: <TeamsIcon />, active: true },
    { name: 'Webchat', icon: <WebchatIcon />, active: true },
    { name: 'WhatsApp', icon: <WhatsAppIcon />, active: true }
  ];

  return (
    <div className="bot-header-section">
      <div className="bot-status-card">
        <button type="button" className="edit-studio-btn" onClick={() => navigate('/knowledge')}>
          <span className="edit-icon"><EditIcon /></span> Edit in studio
        </button>

        <div className="status-info">
          <div className="deployed-info">Last Deployed: {lastDeployed}</div>

          <div className="status-controls">
            <div className="status-options">
              <label className={`status-option ${isOnline ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  checked={isOnline}
                  onChange={() => setIsOnline(true)}
                />
                <span className="status-dot online"></span>
                Online
              </label>
              <label className={`status-option ${!isOnline ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  checked={!isOnline}
                  onChange={() => setIsOnline(false)}
                />
                <span className="status-dot disabled"></span>
                Disabled
              </label>
            </div>

            <div className="always-alive-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={alwaysAlive}
                  onChange={(e) => setAlwaysAlive(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Always Alive</span>
            </div>
          </div>

          <div className="deployed-channels">
            <div className="channels-label">Deployed Channels:</div>
            <div className="channels-list">
              {channels.map(channel => (
                <div key={channel.name} className={`channel-badge ${channel.active ? 'active' : ''}`}>
                  <span className="channel-icon">{channel.icon}</span>
                  <span className="channel-name">{channel.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!alwaysAlive && (
        <div className="warning-banner">
          <div className="warning-content">
            <span className="warning-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </span>
            <span className="warning-text">
              Your agent may sleep when inactive, adding a few seconds to its first reply. 
              Enable Always Alive for instant responses every time.
            </span>
          </div>
          <button className="enable-alive-btn" onClick={() => setAlwaysAlive(true)}>
            Enable Always Alive
          </button>
        </div>
      )}
    </div>
  );
}

export default BotHeader;
