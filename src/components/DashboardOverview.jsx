import React, { useState } from 'react';
import {
  Users,
  Clipboard,
  Plus,
  Phone,
  ArrowUpRight,
  TrendingUp,
  CheckCircle,
  Bell,
  BellOff,
  Search,
  Bike,
  Sparkles,
  Calculator,
  FileText
} from 'lucide-react';

export default function DashboardOverview({ leads = [], onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const hotLeadsCount = leads.filter((l) => l.leadType === 'Hot' || l.leadType === 'Warm').length;
  const convertedCount = leads.filter((l) => l.status === 'Convert' || l.status === 'Converted' || l.status === 'Won').length;
  const pendingFollowups = leads.filter(
    (l) => (l.status === 'Follow-up' || l.status === 'Follow-Up' || l.status === 'Pending' || l.followupDate) && l.reminder !== 'OFF'
  ).length;

  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (l.name || '').toLowerCase().includes(q) ||
      (l.mobile || '').includes(q) ||
      (l.id || '').toLowerCase().includes(q) ||
      (l.vehicle || '').toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'HOT' && (l.leadType === 'Hot' || l.leadType === 'Warm')) ||
      (statusFilter === 'PENDING' && (l.status === 'Follow-up' || l.status === 'Pending')) ||
      (statusFilter === 'WON' && (l.status === 'Convert' || l.status === 'Converted' || l.status === 'Won'));

    return matchSearch && matchStatus;
  });

  return (
    <div className="dashboard-overview" style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Quick Operational Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Total Active Leads</div>
            <div className="metric-card-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="metric-card-value">{leads.length}</div>
          <div className="metric-card-subtitle" style={{ color: '#059669' }}>Customer pipeline active</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Hot Prospects</div>
            <div className="metric-card-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div className="metric-card-value">{hotLeadsCount}</div>
          <div className="metric-card-subtitle" style={{ color: '#ef4444' }}>High conversion priority</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Follow-ups Scheduled</div>
            <div className="metric-card-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <Phone size={20} />
            </div>
          </div>
          <div className="metric-card-value">{pendingFollowups}</div>
          <div className="metric-card-subtitle" style={{ color: '#d97706' }}>Callbacks active</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-card-title">Deals Won (MTD)</div>
            <div className="metric-card-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-card-value">{convertedCount}</div>
          <div className="metric-card-subtitle" style={{ color: '#3b82f6' }}>Converted into vehicle sales</div>
        </div>
      </div>

      {/* Quick Launchpad Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          backgroundColor: '#ffffff',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('leads', 'sale-lead')}
          className="btn btn-primary btn-sm"
          style={{ padding: '8px 12px' }}
        >
          <Plus size={14} /> + New Sale Lead
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('leads', 'quotation')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px' }}
        >
          <Calculator size={14} /> New Quotation
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('leads', 'invoice')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px' }}
        >
          <FileText size={14} /> Create Invoice
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('customers')}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 12px' }}
        >
          <Users size={14} /> Customer Directory
        </button>
      </div>

      {/* Leads Status Tracker List */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="card-title" style={{ gap: '6px' }}>
            <Users size={18} style={{ color: '#059669' }} /> Active Leads & Follow-up Tracker
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="quick-search">
              <Search size={14} className="quick-search-icon" />
              <input
                type="text"
                placeholder="Search leads..."
                style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate && onNavigate('leads', 'sale-lead')}>
              + New Lead
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#fafafa' }}>
          {[
            { key: 'ALL', label: 'All Leads' },
            { key: 'HOT', label: '🔥 Hot & Warm' },
            { key: 'PENDING', label: '⏳ Pending Follow-up' },
            { key: 'WON', label: '🏆 Deals Won' }
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              style={{
                padding: '2px 8px',
                fontSize: '0.72rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: statusFilter === f.key ? '#059669' : '#d1d5db',
                backgroundColor: statusFilter === f.key ? '#ecfdf5' : '#ffffff',
                color: statusFilter === f.key ? '#059669' : '#4b5563',
                cursor: 'pointer',
                fontWeight: statusFilter === f.key ? 600 : 400
              }}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {filteredLeads.length > 0 ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Entry Date</th>
                    <th>Customer Name</th>
                    <th>Mobile No</th>
                    <th>Vehicle Model</th>
                    <th>Lead Temp</th>
                    <th>Assigned Executive</th>
                    <th>Follow-up & Reminder</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong style={{ color: '#059669' }}>{lead.id}</strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#4b5563', whiteSpace: 'nowrap' }}>
                        {lead.entryDate ? (lead.entryDate.includes('-') ? lead.entryDate.split('-').reverse().join('/') : lead.entryDate) : lead.createdOn || '—'}
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.88rem' }}>{lead.name}</strong>
                      </td>
                      <td>
                        <a href={`tel:${lead.mobile}`} style={{ color: '#059669', fontWeight: 500, textDecoration: 'none' }}>
                          {lead.mobile}
                        </a>
                      </td>
                      <td>{lead.vehicle || 'Honda Model'}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: lead.leadType === 'Hot' ? '#fef2f2' : '#eff6ff',
                            color: lead.leadType === 'Hot' ? '#ef4444' : '#3b82f6',
                            border: '1px solid',
                            borderColor: lead.leadType === 'Hot' ? '#fecaca' : '#bfdbfe'
                          }}
                        >
                          {lead.leadType === 'Hot' ? '🔥 Hot' : lead.leadType || 'Warm'}
                        </span>
                      </td>
                      <td>{lead.executive || 'Unassigned'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                          <span style={{ fontSize: '0.8rem', color: '#374151' }}>{lead.followupDate || 'TBD'}</span>
                          {lead.reminder === 'OFF' ? (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <BellOff size={10} /> OFF
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              <Bell size={10} /> ON
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              lead.status === 'Convert' || lead.status === 'Converted' || lead.status === 'Won'
                                ? '#ecfdf5'
                                : lead.status === 'Follow-up'
                                ? '#fffbeb'
                                : '#f3f4f6',
                            color:
                              lead.status === 'Convert' || lead.status === 'Converted' || lead.status === 'Won'
                                ? '#047857'
                                : lead.status === 'Follow-up'
                                ? '#b45309'
                                : '#4b5563'
                          }}
                        >
                          {lead.status || 'Entered'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: '#9ca3af' }}>
              <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
              <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>No leads match your search</h5>
              <p style={{ fontSize: '0.85rem' }}>Create a new sale lead inside the Leads Management section to track status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
