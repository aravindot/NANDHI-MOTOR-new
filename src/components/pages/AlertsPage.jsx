import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Package,
  Wrench,
  Users,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  Plus,
  Search,
  Trash2,
  Send,
  Eye
} from 'lucide-react';

export default function AlertsPage({
  spares = [],
  jobSheets = [],
  serviceBills = [],
  customers = [],
  leads = [],
  updateLead,
  setLeads,
  onNavigate
}) {
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem('nandhi_dismissed_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleDismiss = (id) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    localStorage.setItem('nandhi_dismissed_alerts', JSON.stringify(next));
    if (selectedAlertId === id) {
      setSelectedAlertId(null);
    }
  };

  const handleClearAll = () => {
    const allIds = generatedAlerts.map((a) => a.id);
    setDismissedIds(allIds);
    localStorage.setItem('nandhi_dismissed_alerts', JSON.stringify(allIds));
    setSelectedAlertId(null);
  };

  // Compile Dynamic Alerts
  const generatedAlerts = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Spares Low Stock
    spares.forEach((s) => {
      const qty = Number(s.quantity ?? s.stock ?? 0);
      if (qty < 5) {
        list.push({
          id: `ALT-SP-${s.id}`,
          type: 'Low Stock',
          title: `Low Stock: ${s.name}`,
          desc: `Only ${qty} units left in stock. Reorder recommended immediately.`,
          severity: qty === 0 ? 'CRITICAL' : 'WARNING',
          date: todayStr,
          data: s
        });
      }
    });

    // 2. Lead Follow-Up Reminders
    leads.forEach((l) => {
      if (l.followupDate && l.reminder !== 'OFF') {
        const isOverdue = l.followupDate < todayStr;
        const isToday = l.followupDate === todayStr;
        if (isOverdue || isToday) {
          list.push({
            id: `ALT-LD-${l.id}`,
            type: 'Lead Follow-Up',
            title: isOverdue ? `Overdue Follow-up: ${l.name}` : `Follow-up Due Today: ${l.name}`,
            desc: `Vehicle: ${l.vehicle || 'Vehicle'}. Phone: ${l.mobile}. Executive: ${l.executive || 'Unassigned'}.`,
            severity: isOverdue ? 'CRITICAL' : 'URGENT',
            date: l.followupDate,
            data: l
          });
        }
      }
    });

    // 3. Service Periodic Due
    serviceBills.forEach((sb) => {
      list.push({
        id: `ALT-SRV-${sb.id}`,
        type: 'Service Due',
        title: `Periodic Service Due: ${sb.customerName}`,
        desc: `Vehicle ${sb.vehicleNo || 'Vehicle'} is due for scheduled 90-day maintenance checkup.`,
        severity: 'INFO',
        date: sb.date || todayStr,
        data: sb
      });
    });

    return list.filter((a) => !dismissedIds.includes(a.id));
  }, [spares, leads, serviceBills, dismissedIds]);

  const filteredAlerts = useMemo(() => {
    return generatedAlerts.filter((a) => {
      const matchType = filterType === 'All' || a.type === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [generatedAlerts, filterType, searchQuery]);

  const activeAlert =
    generatedAlerts.find((a) => a.id === selectedAlertId) || (filteredAlerts.length > 0 ? filteredAlerts[0] : null);

  const handleAlertWhatsApp = (alert) => {
    if (!alert || !alert.data) return;
    const phone = alert.data.mobile || alert.data.customerMobile || alert.data.phone || '9842155670';
    const cleanMobile = phone.replace(/\D/g, '');
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(`Greetings from Nandhi Motors! Reminder regarding ${alert.title}. Please let us know how we can assist you.`);
    window.open(`https://wa.me/${fullMobile}?text=${msg}`, '_blank');
  };

  const lowStockCount = generatedAlerts.filter((a) => a.type === 'Low Stock').length;
  const followupCount = generatedAlerts.filter((a) => a.type === 'Lead Follow-Up').length;
  const serviceCount = generatedAlerts.filter((a) => a.type === 'Service Due').length;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* 2-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px'
        }}
      >
        {/* LEFT COLUMN: Alerts Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Bell size={18} style={{ color: '#059669' }} /> System Alerts & Reminders
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  style={{ width: '150px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {generatedAlerts.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="card-body" style={{ maxHeight: '720px', overflowY: 'auto', padding: '12px' }}>
            {/* Top Metric Summary Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '10px',
                textAlign: 'center'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Active Alerts</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{generatedAlerts.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🔔 Lead Follow-ups</span>
                <strong style={{ fontSize: '0.9rem', color: '#ef4444' }}>{followupCount}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>📦 Low Spares</span>
                <strong style={{ fontSize: '0.9rem', color: '#f59e0b' }}>{lowStockCount}</strong>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {['All', 'Lead Follow-Up', 'Low Stock', 'Service Due'].map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: filterType === t ? '#059669' : '#d1d5db',
                    backgroundColor: filterType === t ? '#ecfdf5' : '#ffffff',
                    color: filterType === t ? '#059669' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: filterType === t ? 600 : 400
                  }}
                  onClick={() => setFilterType(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* List of Alerts */}
            {filteredAlerts && filteredAlerts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredAlerts.map((alert) => {
                  const isSelected = activeAlert && activeAlert.id === alert.id;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlertId(alert.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #059669' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(5, 150, 105, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {alert.type === 'Low Stock' ? '📦' : alert.type === 'Lead Follow-Up' ? '🔔' : '🛠️'}
                          </span>
                          <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{alert.title}</strong>
                        </div>

                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              alert.severity === 'CRITICAL' ? '#fef2f2' : alert.severity === 'URGENT' ? '#fffbeb' : '#eff6ff',
                            color:
                              alert.severity === 'CRITICAL' ? '#dc2626' : alert.severity === 'URGENT' ? '#d97706' : '#2563eb',
                            border: '1px solid',
                            borderColor:
                              alert.severity === 'CRITICAL' ? '#fecaca' : alert.severity === 'URGENT' ? '#fde68a' : '#bfdbfe'
                          }}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <p style={{ margin: '2px 0 6px', fontSize: '0.76rem', color: '#4b5563' }}>{alert.desc}</p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#6b7280' }}>
                        <span>Due: {alert.date}</span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>Click to Inspect →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <CheckCircle size={36} strokeWidth={1} style={{ marginBottom: '8px', color: '#059669' }} />
                <h5 style={{ fontSize: '0.95rem', color: '#1f2937', marginBottom: '4px' }}>All Caught Up!</h5>
                <p style={{ fontSize: '0.82rem' }}>No pending alerts or notifications.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Alert Action Dossier */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <AlertCircle size={18} style={{ color: '#059669' }} /> Alert Action Dossier
            </h3>
            {activeAlert && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                {activeAlert.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeAlert ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Automated Operational Alert & Follow-Up Sheet
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      ACTION REQUIRED
                    </span>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Alert Classification</div>
                    <p><strong>Alert Category:</strong> {activeAlert.type}</p>
                    <p><strong>Subject / Headline:</strong> {activeAlert.title}</p>
                    <p><strong>Trigger Date:</strong> {activeAlert.date}</p>
                    <p><strong>Status:</strong> Active & Pending Action</p>
                  </div>

                  <div>
                    <div className="section-title">Record Context</div>
                    {activeAlert.data && (
                      <>
                        <p><strong>Entity Ref:</strong> {activeAlert.data.id || activeAlert.data.name || 'System'}</p>
                        {activeAlert.data.mobile && <p><strong>Phone:</strong> {activeAlert.data.mobile}</p>}
                        {activeAlert.data.vehicle && <p><strong>Vehicle:</strong> {activeAlert.data.vehicle}</p>}
                        {activeAlert.data.quantity !== undefined && <p><strong>Stock Level:</strong> {activeAlert.data.quantity} units</p>}
                      </>
                    )}
                  </div>
                </div>

                {/* Alert Details Box */}
                <div
                  style={{
                    margin: '16px 0',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '0.82rem',
                    color: '#92400e'
                  }}
                >
                  <strong>Description:</strong> {activeAlert.desc}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  {activeAlert.data?.mobile && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                      onClick={() => handleAlertWhatsApp(activeAlert)}
                    >
                      <MessageCircle size={14} /> WhatsApp Contact
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleDismiss(activeAlert.id)}
                  >
                    <Check size={14} /> Dismiss Alert
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Bell size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select an alert from the ledger on the left to review details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
