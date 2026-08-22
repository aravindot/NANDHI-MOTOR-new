import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Filter, Printer, CheckCircle, Clock, XCircle, AlertTriangle, FileText, Check, ChevronDown } from 'lucide-react';
import PrintPreviewModal from '../PrintPreviewModal';
import { API_BASE_URL } from '../../config/api';

export default function WarrantyClaimPage({
  customers = [],
  vehicles = [],
  spares = []
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'warranty', data: null });

  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('nandhi_warranty_claims');
    return saved ? JSON.parse(saved) : [
      {
        id: 'WC-01',
        customerName: 'Rajesh Kumar',
        customerMobile: '9842155670',
        vehicleModel: 'Honda Activa 6G',
        vehicleRegNo: 'TN-37-BJ-5120',
        chassisNo: 'ME4JF911NK001892',
        engineNo: 'JF91E910245',
        dateOfSale: '2025-06-15',
        odometerKm: '12400',
        defectivePart: 'Starter Motor Assembly',
        partCode: 'SP-05',
        defectCategory: 'Electrical',
        issueDescription: 'Starter motor intermittently fails to crank even with full battery charge.',
        claimAmount: 2450,
        oemRefNo: 'HMSI-CLM-8841',
        status: 'Approved',
        submissionDate: '2026-08-10',
        settlementDate: '2026-08-13',
        notes: 'OEM approved 100% replacement warranty credit.'
      },
      {
        id: 'WC-02',
        customerName: 'Deepak Sharma',
        customerMobile: '9443219800',
        vehicleModel: 'Honda Shine 125',
        vehicleRegNo: 'TN-45-AS-9821',
        chassisNo: 'ME4JC822MK009812',
        engineNo: 'JC82E881239',
        dateOfSale: '2025-11-20',
        odometerKm: '8200',
        defectivePart: 'Rear Shock Absorber RH',
        partCode: 'SP-08',
        defectCategory: 'Suspension',
        issueDescription: 'Oil leakage observed from damper seal.',
        claimAmount: 1850,
        oemRefNo: 'HMSI-CLM-9012',
        status: 'Under OEM Review',
        submissionDate: '2026-08-12',
        settlementDate: '',
        notes: 'Photos and part return dispatched to regional warranty coordinator.'
      },
      {
        id: 'WC-03',
        customerName: 'Sanjay Kumar',
        customerMobile: '9843322110',
        vehicleModel: 'Honda SP 125',
        vehicleRegNo: 'TN-38-K-4421',
        chassisNo: 'ME4JC911PL004312',
        engineNo: 'JC91E672301',
        dateOfSale: '2026-01-10',
        odometerKm: '4100',
        defectivePart: 'Fuel Pump Module',
        partCode: 'SP-12',
        defectCategory: 'Engine',
        issueDescription: 'Pressure drop under acceleration causing engine hesitation.',
        claimAmount: 4200,
        oemRefNo: '',
        status: 'Submitted',
        submissionDate: '2026-08-14',
        settlementDate: '',
        notes: 'Inspection diagnostic report attached.'
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaimForPrint, setSelectedClaimForPrint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    vehicleModel: 'Honda Activa 6G',
    vehicleRegNo: '',
    chassisNo: '',
    engineNo: '',
    dateOfSale: new Date().toISOString().split('T')[0],
    odometerKm: '',
    defectivePart: '',
    partCode: '',
    defectCategory: 'Electrical',
    issueDescription: '',
    claimAmount: '',
    oemRefNo: '',
    notes: ''
  });

  // Autocomplete for customer
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const handleCustomerSearch = (val) => {
    setFormData(prev => ({ ...prev, customerName: val }));
    if (val.trim().length > 0 && customers.length > 0) {
      const filtered = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(val.toLowerCase())) ||
        (c.mobile && c.mobile.includes(val))
      );
      setCustomerSuggestions(filtered);
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const selectCustomer = (c) => {
    setFormData(prev => ({
      ...prev,
      customerName: c.name || '',
      customerMobile: c.mobile || '',
      vehicleRegNo: c.vehicleRegNo || prev.vehicleRegNo,
      vehicleModel: c.vehicleModel || prev.vehicleModel
    }));
    setShowCustomerDropdown(false);
  };

  // Initial fetch from backend
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/warranties`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setClaims(data);
        }
      } catch (err) {
        console.warn('Fallback to local storage for warranty claims.');
      }
    };
    fetchClaims();
  }, []);

  // Sync to localstorage
  React.useEffect(() => {
    localStorage.setItem('nandhi_warranty_claims', JSON.stringify(claims));
  }, [claims]);

  // Statistics
  const stats = useMemo(() => {
    const total = claims.length;
    const submitted = claims.filter(c => c.status === 'Submitted').length;
    const underReview = claims.filter(c => c.status === 'Under OEM Review').length;
    const approved = claims.filter(c => c.status === 'Approved' || c.status === 'Settled').length;
    const totalReimbursed = claims
      .filter(c => c.status === 'Approved' || c.status === 'Settled')
      .reduce((sum, c) => sum + Number(c.claimAmount || 0), 0);

    return { total, submitted, underReview, approved, totalReimbursed };
  }, [claims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = 
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerMobile.includes(searchQuery) ||
        claim.vehicleRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.defectivePart.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.oemRefNo && claim.oemRefNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.vehicleRegNo || !formData.defectivePart) {
      alert('Please fill in Customer Name, Vehicle Reg No, and Defective Part.');
      return;
    }

    const newClaim = {
      id: `WC-${String(claims.length + 1).padStart(2, '0')}`,
      ...formData,
      claimAmount: Number(formData.claimAmount || 0),
      status: 'Submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      settlementDate: ''
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/warranties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClaim)
      });
      if (res.ok) {
        const saved = await res.json();
        setClaims([saved, ...claims]);
      } else {
        setClaims([newClaim, ...claims]);
      }
    } catch (err) {
      console.error('Failed to sync claim with MongoDB:', err);
      setClaims([newClaim, ...claims]);
    }

    setIsModalOpen(false);
    setFormData({
      customerName: '',
      customerMobile: '',
      vehicleModel: 'Honda Activa 6G',
      vehicleRegNo: '',
      chassisNo: '',
      engineNo: '',
      dateOfSale: new Date().toISOString().split('T')[0],
      odometerKm: '',
      defectivePart: '',
      partCode: '',
      defectCategory: 'Electrical',
      issueDescription: '',
      claimAmount: '',
      oemRefNo: '',
      notes: ''
    });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    let updatedClaim = null;
    const nextClaims = claims.map(c => {
      if (c.id === id) {
        updatedClaim = {
          ...c,
          status: newStatus,
          settlementDate: (newStatus === 'Approved' || newStatus === 'Settled') ? new Date().toISOString().split('T')[0] : c.settlementDate
        };
        return updatedClaim;
      }
      return c;
    });

    setClaims(nextClaims);

    if (updatedClaim) {
      try {
        await fetch(`${API_BASE_URL}/api/warranties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedClaim)
        });
      } catch (err) {
        console.error('Failed to sync claim update with MongoDB:', err);
      }
    }
  };

  const printClaim = (claim) => {
    setPrintModalConfig({ isOpen: true, type: 'warranty', data: claim });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Settled':
        return (
          <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={13} /> {status}
          </span>
        );
      case 'Under OEM Review':
        return (
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> Under Review
          </span>
        );
      case 'Submitted':
        return (
          <span style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={13} /> Submitted
          </span>
        );
      case 'Rejected':
        return (
          <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={13} /> Rejected
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ color: '#059669' }} /> Warranty Claims Hub
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Track manufacturer OEM parts replacement warranty claims, inspect defect categories, and manage reimbursement status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
          }}
        >
          <Plus size={18} /> File Warranty Claim
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Claims Filed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>All registered cases</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Under OEM Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>{stats.underReview + stats.submitted}</div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 500 }}>Awaiting manufacturer credit</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Approved / Settled</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>{stats.approved}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>{(stats.total > 0 ? (stats.approved / stats.total * 100).toFixed(0) : 0)}% acceptance rate</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Reimbursed Value</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857', marginTop: '6px' }}>₹{stats.totalReimbursed.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>Parts credit received</div>
        </div>
      </div>

      {/* Main Claims Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '450px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by Claim ID, Customer, Vehicle Reg, or Part..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Status:</span>
            {['All', 'Submitted', 'Under OEM Review', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: statusFilter === st ? 600 : 500,
                  backgroundColor: statusFilter === st ? '#ecfdf5' : '#f9fafb',
                  color: statusFilter === st ? '#059669' : '#4b5563',
                  border: statusFilter === st ? '1px solid #a7f3d0' : '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 18px' }}>Claim ID & Date</th>
                <th style={{ padding: '12px 18px' }}>Customer & Vehicle</th>
                <th style={{ padding: '12px 18px' }}>Defective Component</th>
                <th style={{ padding: '12px 18px' }}>Category & KM</th>
                <th style={{ padding: '12px 18px' }}>Claim Value</th>
                <th style={{ padding: '12px 18px' }}>OEM Ref / Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                    No warranty claims found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Submitted: {claim.submissionDate}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 500 }}>{claim.vehicleRegNo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{claim.vehicleModel}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{claim.defectivePart}</div>
                      {claim.partCode && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Code: {claim.partCode}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>
                        {claim.defectCategory}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{claim.odometerKm} KM</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>₹{claim.claimAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ marginBottom: '4px' }}>{getStatusBadge(claim.status)}</div>
                      {claim.oemRefNo ? (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>OEM: {claim.oemRefNo}</div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Pending OEM Ack</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={claim.status}
                          onChange={(e) => handleUpdateStatus(claim.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under OEM Review">Under OEM Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => printClaim(claim)}
                          title="Print Warranty Claim Sheet"
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            color: '#4b5563',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Warranty Claim Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck style={{ color: '#059669' }} size={22} /> File Manufacturer Warranty Claim
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateClaim} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer Name Autocomplete */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type to search customer or enter new name"
                  value={formData.customerName}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {customerSuggestions.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => selectCustomer(c)}
                        style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        <div style={{ fontWeight: 600, color: '#111827' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.mobile}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile & Vehicle Reg No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    pattern="[0-9]{10}"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Vehicle Reg Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="TN-37-AB-1234"
                    value={formData.vehicleRegNo}
                    onChange={(e) => setFormData({ ...formData, vehicleRegNo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Vehicle Model & Chassis No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Vehicle Model
                  </label>
                  <select
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  >
                    <option value="Honda Activa 6G">Honda Activa 6G</option>
                    <option value="Honda Shine 125">Honda Shine 125</option>
                    <option value="Honda SP 125">Honda SP 125</option>
                    <option value="Honda Dio 125">Honda Dio 125</option>
                    <option value="Honda Unicorn">Honda Unicorn</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Chassis / VIN Number
                  </label>
                  <input
                    type="text"
                    placeholder="ME4JF911NK..."
                    value={formData.chassisNo}
                    onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Defective Part & Defect Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Defective Part Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starter Motor, Fuel Pump, Shock Absorber"
                    value={formData.defectivePart}
                    onChange={(e) => setFormData({ ...formData, defectivePart: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Defect Category
                  </label>
                  <select
                    value={formData.defectCategory}
                    onChange={(e) => setFormData({ ...formData, defectCategory: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Engine">Engine</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Braking">Braking</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Paint / Body">Paint / Body</option>
                  </select>
                </div>
              </div>

              {/* Odometer KM & Claim Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Odometer Reading (KM)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10500"
                    value={formData.odometerKm}
                    onChange={(e) => setFormData({ ...formData, odometerKm: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Claim Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Issue Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Technical Defect Description & Symptoms
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe failure conditions, diagnostic error codes, or physical damages..."
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Warranty Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={printModalConfig.isOpen}
        onClose={() => setPrintModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={printModalConfig.type}
        data={printModalConfig.data}
      />
    </div>
  );
}
