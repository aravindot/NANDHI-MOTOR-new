import React, { useState } from 'react';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Search,
  Trash2,
  User,
  Plus,
  Edit2,
  MessageCircle,
  Calendar,
  CheckCircle,
  FileText,
  Bike,
  CreditCard,
  Tag,
  ShieldCheck,
  X
} from 'lucide-react';

export default function CustomersPage({ customers = [], setCustomers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    address: '',
    source: 'Walk-In',
    vehicleModel: '',
    notes: ''
  });

  // Filtered customers
  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (c.name || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.vehicleModel && c.vehicleModel.toLowerCase().includes(q));

    const matchSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'Walk-In' && (c.source === 'Walk-In' || !c.source)) ||
      (sourceFilter === 'Digital' && c.source && c.source.toLowerCase().includes('digital')) ||
      (sourceFilter === 'Referral' && c.source && c.source.toLowerCase().includes('referral'));

    return matchSearch && matchSource;
  });

  // Active customer for preview
  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || (filtered.length > 0 ? filtered[0] : null);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      aadhar: '',
      address: '',
      source: 'Walk-In',
      vehicleModel: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      aadhar: customer.aadhar || '',
      address: customer.address || '',
      source: customer.source || 'Walk-In',
      vehicleModel: customer.vehicleModel || '',
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      alert('Please enter customer name and mobile number.');
      return;
    }

    if (editingCustomer) {
      const updatedList = customers.map(c =>
        c.id === editingCustomer.id
          ? {
              ...c,
              ...formData,
              id: c.id,
              registeredOn: c.registeredOn || new Date().toLocaleDateString('en-IN')
            }
          : c
      );
      setCustomers(updatedList);
    } else {
      const nextNum = customers.reduce((max, c) => {
        const n = parseInt((c.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0) + 1;
      const newId = `C-${String(nextNum).padStart(2, '0')}`;

      const newCustomer = {
        ...formData,
        id: newId,
        registeredOn: new Date().toLocaleDateString('en-IN')
      };
      setCustomers([newCustomer, ...customers]);
      setSelectedCustomerId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this customer record?')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      if (selectedCustomerId === id) {
        setSelectedCustomerId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handleSendWhatsApp = (cust) => {
    if (!cust || !cust.mobile) return;
    const cleanMobile = cust.mobile.replace(/\D/g, '');
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const msg = encodeURIComponent(`Hello ${cust.name}, greetings from Nandhi Motors! How can we assist with your two-wheeler needs today?`);
    window.open(`https://wa.me/${fullMobile}?text=${msg}`, '_blank');
  };

  const totalWalkIn = customers.filter(c => c.source === 'Walk-In' || !c.source).length;
  const totalDigital = customers.filter(c => c.source && c.source.toLowerCase().includes('digital')).length;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* 2-Column Master-Detail Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px'
      }}>
        
        {/* LEFT COLUMN: Customer Directory Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Users size={18} style={{ color: '#059669' }} /> Customer Directory
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search customer..."
                  style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAdd}
              >
                <Plus size={14} /> + Add Customer
              </button>
            </div>
          </div>

          <div className="card-body" style={{ maxHeight: '720px', overflowY: 'auto', padding: '12px' }}>
            {/* Top Metric Summary Strip matching Lead Management */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              backgroundColor: '#f9fafb',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Customers</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{customers.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🚶 Walk-In</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{totalWalkIn}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🌐 Digital / Web</span>
                <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>{totalDigital}</strong>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {[
                { key: 'ALL', label: 'All' },
                { key: 'Walk-In', label: '🚶 Walk-In' },
                { key: 'Digital', label: '🌐 Digital' },
                { key: 'Referral', label: '🤝 Referral' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: sourceFilter === f.key ? '#059669' : '#d1d5db',
                    backgroundColor: sourceFilter === f.key ? '#ecfdf5' : '#ffffff',
                    color: sourceFilter === f.key ? '#059669' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: sourceFilter === f.key ? 600 : 400
                  }}
                  onClick={() => setSourceFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Customer List Items */}
            {filtered && filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(cust => {
                  const isSelected = activeCustomer && activeCustomer.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
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
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            backgroundColor: isSelected ? '#a7f3d0' : '#e0e7ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.75rem', color: isSelected ? '#047857' : '#3730a3'
                          }}>
                            {(cust.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{cust.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>
                              #{cust.id}
                            </span>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: cust.source && cust.source.includes('Digital') ? '#eff6ff' : '#ecfdf5',
                          color: cust.source && cust.source.includes('Digital') ? '#2563eb' : '#059669',
                          border: '1px solid',
                          borderColor: cust.source && cust.source.includes('Digital') ? '#bfdbfe' : '#bbf7d0'
                        }}>
                          {cust.source || 'Walk-In'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#4b5563', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} color="#059669" /> {cust.mobile}
                        </span>
                        <span style={{ color: '#059669', fontWeight: 500 }}>
                          {cust.vehicleModel || 'Vehicle'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Users size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No customers match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Dossier & Profile Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <User size={18} style={{ color: '#059669' }} /> Customer Dossier
            </h3>
            {activeCustomer && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                Customer #{activeCustomer.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeCustomer ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Customer Relationship Dossier
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{
                      backgroundColor: '#059669',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      VERIFIED CUSTOMER
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                      Reg Date: <strong>{activeCustomer.registeredOn || 'Recent'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Customer Particulars</div>
                    <p><strong>Name:</strong> {activeCustomer.name}</p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      <a href={`tel:${activeCustomer.mobile}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                        {activeCustomer.mobile}
                      </a>
                    </p>
                    <p><strong>Email:</strong> {activeCustomer.email || '—'}</p>
                    <p><strong>Aadhaar / ID:</strong> {activeCustomer.aadhar || '—'}</p>
                    <p><strong>Address:</strong> {activeCustomer.address || '—'}</p>
                  </div>

                  <div>
                    <div className="section-title">Vehicle & Dealership Info</div>
                    <p><strong>Vehicle Model:</strong> {activeCustomer.vehicleModel || 'Vehicle'}</p>
                    <p><strong>Acquisition Source:</strong> {activeCustomer.source || 'Walk-In'}</p>
                    <p><strong>Account Status:</strong> <span style={{ color: '#059669', fontWeight: 600 }}>Active Customer</span></p>
                    <p><strong>Service Eligible:</strong> Free / Paid Service</p>
                  </div>
                </div>

                {/* Remarks Banner */}
                {activeCustomer.notes && (
                  <div style={{
                    margin: '16px 0',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    fontSize: '0.8rem',
                    color: '#374151'
                  }}>
                    <strong>Notes:</strong> {activeCustomer.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleSendWhatsApp(activeCustomer)}
                  >
                    <MessageCircle size={14} /> WhatsApp Chat
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleOpenEdit(activeCustomer)}
                  >
                    <Edit2 size={14} /> Edit Customer
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleDelete(activeCustomer.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Users size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select a customer from the directory on the left to preview.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#059669" />
                {editingCustomer ? `Edit Customer #${editingCustomer.id}` : 'Add New Customer'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Aadhaar / National ID</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    maxLength={12} pattern="[0-9]{12}" value={formData.aadhar}
                    onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lead / Customer Source</label>
                  <select
                    className="form-control"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="Walk-In">Walk-In Showroom</option>
                    <option value="Digital / Web">Digital / Web Enquiry</option>
                    <option value="Referral">Customer Referral</option>
                    <option value="Telephone">Telephone Enquiry</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Model</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Address</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle size={15} /> {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
