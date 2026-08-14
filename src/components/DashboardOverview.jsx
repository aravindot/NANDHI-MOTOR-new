import React from 'react';
import { Users, Clipboard, Plus, Phone, ArrowUpRight, TrendingUp, CheckCircle } from 'lucide-react';

export default function DashboardOverview({ leads = [], onNavigate }) {
  const hotLeadsCount = leads.filter(l => l.leadType === 'Hot' || l.leadType === 'Warm').length;
  const convertedCount = leads.filter(l => l.status === 'Convert' || l.status === 'Converted' || l.status === 'Won').length;
  const pendingFollowups = leads.filter(l => l.status === 'Follow-up' || l.status === 'Follow-Up' || l.status === 'Pending').length;

  return (
    <div className="dashboard-overview" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Quick Operational Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Active Leads</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{leads.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Customer inquiries in pipeline</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Hot & Warm Prospects</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>{hotLeadsCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>High conversion priority</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Pending Follow-Ups</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>{pendingFollowups}</div>
          <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px', fontWeight: 500 }}>Callbacks scheduled</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Deals Closed (MTD)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>{convertedCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Converted into vehicle sales</div>
        </div>
      </div>

      {/* Leads Status Tracker List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ gap: '6px' }}>
            <Users size={18} style={{ color: '#059669' }} /> Active Leads & Follow-up Tracker
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('leads', 'sale-lead')}>
            + New Lead
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {leads.length > 0 ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Customer Name</th>
                    <th>Mobile No</th>
                    <th>Vehicle Model</th>
                    <th>Lead Temp</th>
                    <th>Assigned Executive</th>
                    <th>Follow-up Date</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td><strong>{lead.id}</strong></td>
                      <td>{lead.name}</td>
                      <td>{lead.mobile}</td>
                      <td>{lead.vehicle || 'N/A'}</td>
                      <td>
                        <span className={`badge ${lead.leadType === 'Hot' ? 'badge-danger' : 'badge-info'}`}>
                          {lead.leadType}
                        </span>
                      </td>
                      <td>{lead.executive}</td>
                      <td>{lead.followupDate || 'TBD'}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: lead.status === 'Convert' ? '#ecfdf5' : lead.status === 'Follow-up' ? '#fffbeb' : '#f3f4f6',
                          color: lead.status === 'Convert' ? '#047857' : lead.status === 'Follow-up' ? '#b45309' : '#4b5563'
                        }}>
                          {lead.status}
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
              <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>No active leads found</h5>
              <p style={{ fontSize: '0.85rem' }}>
                Create a new sale lead inside the Leads Management section to track status.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
