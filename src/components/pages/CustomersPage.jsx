import React, { useState } from 'react';
import { Users, Phone, Mail, MapPin, Search, Trash2, User } from 'lucide-react';

export default function CustomersPage({ customers = [], setCustomers }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={18} style={{ color: '#059669' }} /> Customer Directory
          </h3>
          <div className="quick-search">
            <Search size={14} className="quick-search-icon" />
            <input
              type="text"
              placeholder="Search name / mobile / email..."
              style={{ width: '220px', padding: '6px 10px 6px 30px', fontSize: '0.8rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Summary bar */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #d1fae5',
          fontSize: '0.82rem',
          color: '#065f46',
          display: 'flex',
          gap: '24px'
        }}>
          <span>📋 Total Customers: <strong>{customers.length}</strong></span>
          <span>🔍 Showing: <strong>{filtered.length}</strong></span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {filtered.length > 0 ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer ID</th>
                    <th>Full Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Aadhar No</th>
                    <th>Address</th>
                    <th>Lead Source</th>
                    <th>Registered On</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr key={c.id}>
                      <td style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{idx + 1}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>{c.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            backgroundColor: '#d1fae5', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <User size={14} color="#059669" />
                          </div>
                          <strong style={{ fontSize: '0.88rem' }}>{c.name}</strong>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem' }}>
                          <Phone size={12} color="#6b7280" /> {c.mobile}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                        {c.email ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="#6b7280" /> {c.email}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: '#374151' }}>{c.aadhar || '—'}</td>
                      <td style={{ fontSize: '0.84rem', color: '#6b7280', maxWidth: '160px' }}>
                        {c.address ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="#6b7280" style={{ flexShrink: 0 }} /> {c.address}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{c.source}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{c.registeredOn}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', color: '#ef4444', borderColor: 'transparent' }}
                          onClick={() => handleDelete(c.id)}
                          title="Remove Customer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center', color: '#9ca3af' }}>
              <Users size={52} strokeWidth={1} style={{ marginBottom: '12px' }} />
              <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>
                No customers found
              </h5>
              <p style={{ fontSize: '0.85rem' }}>
                Customers are automatically added here when you submit a <strong>Sale Lead</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
