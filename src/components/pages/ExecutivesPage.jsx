import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Award,
  Target,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  User,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  Percent,
  X
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_executives');
    return saved
      ? JSON.parse(saved)
      : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Sales Executive',
    department: 'Sales',
    phone: '',
    email: '',
    monthlySalesTarget: 10,
    servicesTarget: 0,
    status: 'Active'
  });

  // Initial fetch from backend
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/executives`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setExecutives(data);
        }
      } catch (err) {
        console.warn('Fallback to local storage for executives.');
      }
    };
    fetchExecutives();
  }, []);

  useEffect(() => {
    localStorage.setItem('nandhi_executives', JSON.stringify(executives));
  }, [executives]);

  const filteredExecutives = useMemo(() => {
    return executives.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = deptFilter === 'All' || emp.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [executives, searchQuery, deptFilter]);

  const activeExecutive =
    executives.find((e) => e.id === selectedExecutiveId) || (filteredExecutives.length > 0 ? filteredExecutives[0] : null);

  const handleOpenAdd = () => {
    setEditingExecutive(null);
    setFormData({
      name: '',
      role: 'Sales Executive',
      department: 'Sales',
      phone: '',
      email: '',
      monthlySalesTarget: 10,
      servicesTarget: 0,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingExecutive(emp);
    setFormData({
      name: emp.name || '',
      role: emp.role || 'Sales Executive',
      department: emp.department || 'Sales',
      phone: emp.phone || '',
      email: emp.email || '',
      monthlySalesTarget: emp.monthlySalesTarget || 0,
      servicesTarget: emp.servicesTarget || 0,
      status: emp.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill employee name and phone number');
      return;
    }

    if (editingExecutive) {
      const updatedList = executives.map((e) =>
        e.id === editingExecutive.id
          ? {
              ...e,
              ...formData,
              monthlySalesTarget: Number(formData.monthlySalesTarget || 0),
              servicesTarget: Number(formData.servicesTarget || 0)
            }
          : e
      );
      setExecutives(updatedList);
    } else {
      const nextNum = executives.reduce((max, emp) => {
        const n = parseInt((emp.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0) + 1;
      const newId = `EMP-${String(nextNum).padStart(2, '0')}`;

      const newEmp = {
        id: newId,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        salesAchieved: 0,
        servicesAchieved: 0,
        incentiveEarned: 0,
        monthlySalesTarget: Number(formData.monthlySalesTarget || 0),
        servicesTarget: Number(formData.servicesTarget || 0)
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/executives`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmp)
        });
        if (res.ok) {
          const saved = await res.json();
          setExecutives([saved, ...executives]);
        } else {
          setExecutives([newEmp, ...executives]);
        }
      } catch (err) {
        setExecutives([newEmp, ...executives]);
      }
      setSelectedExecutiveId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDeleteExecutive = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee record?')) {
      try {
        await fetch(`${API_BASE_URL}/api/executives/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete executive:', err);
      }
      const updated = executives.filter((e) => e.id !== id);
      setExecutives(updated);
      if (selectedExecutiveId === id) {
        setSelectedExecutiveId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Metrics
  const totalIncentives = executives.reduce((sum, e) => sum + (Number(e.incentiveEarned) || 0), 0);
  const totalSalesTarget = executives.reduce((sum, e) => sum + (Number(e.monthlySalesTarget) || 0), 0);

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
        {/* LEFT COLUMN: Staff Directory Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Users size={18} style={{ color: '#059669' }} /> Executives & Staff Directory
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search staff / role..."
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
                <Plus size={14} /> + Add Staff
              </button>
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Staff</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{executives.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🎯 Monthly Target</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{totalSalesTarget} Units</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>💰 Incentives</span>
                <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>₹{totalIncentives.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {['All', 'Sales', 'Service', 'Accounts'].map((d) => (
                <button
                  key={d}
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: deptFilter === d ? '#059669' : '#d1d5db',
                    backgroundColor: deptFilter === d ? '#ecfdf5' : '#ffffff',
                    color: deptFilter === d ? '#059669' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: deptFilter === d ? 600 : 400
                  }}
                  onClick={() => setDeptFilter(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Staff List */}
            {filteredExecutives && filteredExecutives.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredExecutives.map((emp) => {
                  const isSelected = activeExecutive && activeExecutive.id === emp.id;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedExecutiveId(emp.id)}
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
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#a7f3d0' : '#e0e7ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: isSelected ? '#047857' : '#3730a3'
                            }}
                          >
                            {(emp.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{emp.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>#{emp.id}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              emp.department === 'Sales' ? '#ecfdf5' : emp.department === 'Service' ? '#eff6ff' : '#fef3c7',
                            color:
                              emp.department === 'Sales' ? '#059669' : emp.department === 'Service' ? '#2563eb' : '#b45309',
                            border: '1px solid',
                            borderColor:
                              emp.department === 'Sales' ? '#bbf7d0' : emp.department === 'Service' ? '#bfdbfe' : '#fde68a'
                          }}
                        >
                          {emp.department}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} color="#059669" /> {emp.phone}
                        </span>
                        <span style={{ color: '#4b5563', fontWeight: 500 }}>{emp.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Users size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No staff members found.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Executive Dossier & Performance Sheet */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <User size={18} style={{ color: '#059669' }} /> Employee Dossier & Targets
            </h3>
            {activeExecutive && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                Staff #{activeExecutive.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeExecutive ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Staff Dossier & Monthly Performance Sheet
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#059669',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {activeExecutive.status || 'ACTIVE EMPLOYEE'}
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                      Joined: <strong>{activeExecutive.joinDate || '2023-01-01'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Employee Particulars</div>
                    <p><strong>Name:</strong> {activeExecutive.name}</p>
                    <p><strong>Designation:</strong> {activeExecutive.role}</p>
                    <p><strong>Department:</strong> {activeExecutive.department}</p>
                    <p>
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${activeExecutive.phone}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                        {activeExecutive.phone}
                      </a>
                    </p>
                    <p><strong>Email:</strong> {activeExecutive.email || '—'}</p>
                  </div>

                  <div>
                    <div className="section-title">KPI & Target Status</div>
                    {activeExecutive.department === 'Sales' ? (
                      <>
                        <p><strong>Sales Target:</strong> {activeExecutive.monthlySalesTarget || 10} Vehicles</p>
                        <p><strong>Sales Achieved:</strong> {activeExecutive.salesAchieved || 0} Vehicles</p>
                        <p><strong>Target Achievement:</strong> {Math.round(((activeExecutive.salesAchieved || 0) / (activeExecutive.monthlySalesTarget || 10)) * 100)}%</p>
                        <p><strong>Incentive Earned:</strong> ₹{Number(activeExecutive.incentiveEarned || 0).toLocaleString('en-IN')}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Service Target:</strong> {activeExecutive.servicesTarget || 100} Vehicles</p>
                        <p><strong>Services Completed:</strong> {activeExecutive.servicesAchieved || 0} Vehicles</p>
                        <p><strong>Incentive Earned:</strong> ₹{Number(activeExecutive.incentiveEarned || 0).toLocaleString('en-IN')}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar banner */}
                <div
                  style={{
                    margin: '16px 0',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    <span>Monthly Target Completion</span>
                    <span style={{ color: '#059669' }}>
                      {activeExecutive.department === 'Sales'
                        ? `${activeExecutive.salesAchieved || 0} / ${activeExecutive.monthlySalesTarget || 10} Sales`
                        : `${activeExecutive.servicesAchieved || 0} / ${activeExecutive.servicesTarget || 100} Jobs`}
                    </span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: '#059669',
                        width: `${Math.min(
                          100,
                          activeExecutive.department === 'Sales'
                            ? Math.round(((activeExecutive.salesAchieved || 0) / (activeExecutive.monthlySalesTarget || 10)) * 100)
                            : Math.round(((activeExecutive.servicesAchieved || 0) / (activeExecutive.servicesTarget || 100)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleOpenEdit(activeExecutive)}
                  >
                    <Edit2 size={14} /> Edit Staff Info
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleDeleteExecutive(activeExecutive.id)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Users size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select an employee from the directory on the left to preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div
          style={{
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
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#059669" />
                {editingExecutive ? `Edit Employee #${editingExecutive.id}` : 'Add New Staff Member'}
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
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Employee Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Department *</label>
                  <select
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Service">Service & Workshop</option>
                    <option value="Accounts">Accounts & Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Designation / Role</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Monthly Sales Target</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.monthlySalesTarget}
                    onChange={(e) => setFormData({ ...formData, monthlySalesTarget: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Service Target</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.servicesTarget}
                    onChange={(e) => setFormData({ ...formData, servicesTarget: e.target.value })}
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
                  <CheckCircle size={15} /> {editingExecutive ? 'Update Staff Info' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
