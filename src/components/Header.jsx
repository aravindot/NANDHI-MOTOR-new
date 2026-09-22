import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, User, Menu } from 'lucide-react';

export default function Header({ activeTab, activeSubTab, onSearchChange, notificationCount = 3, onAlertClick, onToggleSidebar, onLogout }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatBreadcrumb = () => {
    const formatName = (str) => {
      if (!str) return '';
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const mainText = formatName(activeTab);
    const subText = formatName(activeSubTab);

    return (
      <div className="header-title-area">
        <h2>{subText ? subText : mainText}</h2>
        <p className="breadcrumb-subtext">
          Nandhi Motors &gt; {mainText} {subText ? `> ${subText}` : ''}
        </p>
      </div>
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        {formatBreadcrumb()}
      </div>

      <div className="header-right">
        {/* Global Search Bar */}
        <div className="quick-search">
          <Search size={16} className="quick-search-icon" />
          <input
            type="text"
            placeholder="Search leads, jobs, spares..."
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Live Clock */}
        <div className="header-clock" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: '#059669' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111827' }}>{formatDate(time)}</span>
            <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>{formatTime(time)}</span>
          </div>
        </div>

        {/* Notification Alert Trigger */}
        <button className="header-action-btn" onClick={onAlertClick} title="View System Alerts">
          <Bell size={20} />
          {notificationCount > 0 && <span className="badge-dot" />}
        </button>

        {/* User Card */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">Nandhi Admin</span>
            <span className="user-role">Dealership Owner</span>
          </div>
        </div>

        {onLogout && (
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
