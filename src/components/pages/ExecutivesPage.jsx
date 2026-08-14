import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Mail, Phone, Award, Target, CheckCircle2, TrendingUp, Edit2, Trash2 } from 'lucide-react';

export default function ExecutivesPage() {
  const [executives, setExecutives] = useState(() => {
    const saved = localStorage.getItem('nandhi_executives');
    return saved ? JSON.parse(saved) : [
      {
        id: 'EMP-01',
        name: 'K. Balaji',
        role: 'Senior Sales Executive',
        department: 'Sales',
        phone: '9842109876',
        email: 'balaji.sales@nandhimotors.com',
        joinDate: '2023-04-10',
        monthlySalesTarget: 12,
        salesAchieved: 10,
        servicesTarget: 0,
        servicesAchieved: 0,
        incentiveEarned: 15000,
        status: 'Active'
      },
      {
        id: 'EMP-02',
        name: 'S. Karthik',
        role: 'Sales Executive',
        department: 'Sales',
        phone: '9843211223',
        email: 'karthik.s@nandhimotors.com',
        joinDate: '2024-01-15',
        monthlySalesTarget: 10,
        salesAchieved: 8,
        servicesTarget: 0,
        servicesAchieved: 0,
        incentiveEarned: 9500,
        status: 'Active'
      },
      {
        id: 'EMP-03',
        name: 'M. Anand',
        role: 'Senior Service Advisor',
        department: 'Service',
        phone: '9789123456',
        email: 'anand.service@nandhimotors.com',
        joinDate: '2022-08-01',
        monthlySalesTarget: 0,
        salesAchieved: 0,
        servicesTarget: 120,
        servicesAchieved: 114,
        incentiveEarned: 12400,
        status: 'Active'
      },
      {
        id: 'EMP-04',
        name: 'R. Vignesh',
        role: 'Lead Technician & Mechanic',
        department: 'Service',
        phone: '9655443322',
        email: 'vignesh.tech@nandhimotors.com',
        joinDate: '2021-11-12',
        monthlySalesTarget: 0,
        salesAchieved: 0,
        servicesTarget: 100,
        servicesAchieved: 92,
        incentiveEarned: 11000,
        status: 'Active'
      },
      {
        id: 'EMP-105',
        name: 'P. Revathi',
        role: 'Accounts & Billing Officer',
        department: 'Accounts',
        phone: '9894001122',
        email: 'accounts@nandhimotors.com',
        joinDate: '2023-02-01',
        monthlySalesTarget: 0,
        salesAchieved: 0,
        servicesTarget: 0,
        servicesAchieved: 0,
        incentiveEarned: 5000,
        status: 'Active'
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  React.useEffect(() => {
    localStorage.setItem('nandhi_executives', JSON.stringify(executives));
  }, [executives]);

  const filteredExecutives = useMemo(() => {
    return executives.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDept = deptFilter === 'All' || emp.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [executives, searchQuery, deptFilter]);

  const handleAddExecutive = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill employee name and phone number');
      return;
    }

    const newEmp = {
      id: `EMP-${String(executives.length + 1).padStart(2, '0')}`,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      salesAchieved: 0,
      servicesAchieved: 0,
      incentiveEarned: 0
    };

    setExecutives([newEmp, ...executives]);
    setIsModalOpen(false);
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
  };

  const handleDeleteExecutive = (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      setExecutives(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ color: '#059669' }} /> Executives & Staff Directory
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Manage showroom sales executives, service advisors, technicians, sales targets and incentives.
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
          <Plus size={18} /> Add New Executive
        </button>
      </div>

      {/* Target Progress Quick Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Active Staff</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{executives.filter(e => e.status === 'Active').length}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Full-time dealership team</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Vehicles Sold (MTD)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>
            {executives.reduce((sum, e) => sum + (e.salesAchieved || 0), 0)} Units
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>Target: {executives.reduce((sum, e) => sum + (e.monthlySalesTarget || 0), 0)} Units</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Job Sheets Closed (MTD)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
            {executives.reduce((sum, e) => sum + (e.servicesAchieved || 0), 0)} Services
          </div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 500 }}>94% on-time turnaround</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Incentives Pool (MTD)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857', marginTop: '6px' }}>
            ₹{executives.reduce((sum, e) => sum + (e.incentiveEarned || 0), 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Performance bonus pool</div>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Search and Filters */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '450px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by executive name, ID, phone, role..."
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
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Department:</span>
            {['All', 'Sales', 'Service', 'Accounts'].map(d => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: deptFilter === d ? 600 : 500,
                  backgroundColor: deptFilter === d ? '#ecfdf5' : '#f9fafb',
                  color: deptFilter === d ? '#059669' : '#4b5563',
                  border: deptFilter === d ? '1px solid #a7f3d0' : '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', padding: '20px' }}>
          {filteredExecutives.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              No staff members found matching criteria.
            </div>
          ) : (
            filteredExecutives.map(emp => {
              const salesPct = emp.monthlySalesTarget > 0 ? Math.min(100, Math.round((emp.salesAchieved / emp.monthlySalesTarget) * 100)) : 0;
              const servicePct = emp.servicesTarget > 0 ? Math.min(100, Math.round((emp.servicesAchieved / emp.servicesTarget) * 100)) : 0;

              return (
                <div
                  key={emp.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: emp.department === 'Sales' ? '#ecfdf5' : emp.department === 'Service' ? '#eff6ff' : '#fef3c7',
                          color: emp.department === 'Sales' ? '#059669' : emp.department === 'Service' ? '#2563eb' : '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{emp.role}</div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        {emp.id}
                      </span>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#4b5563' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} style={{ color: '#9ca3af' }} />
                        <span>{emp.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} style={{ color: '#9ca3af' }} />
                        <span style={{ fontSize: '0.8rem' }}>{emp.email}</span>
                      </div>
                    </div>

                    {/* Performance Target Bar */}
                    {emp.department === 'Sales' && (
                      <div style={{ marginTop: '16px', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                          <span>Sales Target</span>
                          <span>{emp.salesAchieved} / {emp.monthlySalesTarget} Units ({salesPct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${salesPct}%`, height: '100%', backgroundColor: '#059669', borderRadius: '3px' }} />
                        </div>
                      </div>
                    )}

                    {emp.department === 'Service' && (
                      <div style={{ marginTop: '16px', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                          <span>Service Target</span>
                          <span>{emp.servicesAchieved} / {emp.servicesTarget} Jobs ({servicePct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${servicePct}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '3px' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Incentive Earned</div>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>₹{emp.incentiveEarned.toLocaleString('en-IN')}</div>
                    </div>

                    <button
                      onClick={() => handleDeleteExecutive(emp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove Staff"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Executive Modal */}
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
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Add New Staff / Executive</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAddExecutive} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Vignesh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  >
                    <option value="Sales">Sales</option>
                    <option value="Service">Service</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Designation / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales Executive"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9842100000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@nandhimotors.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Monthly Sales Target</label>
                  <input
                    type="number"
                    value={formData.monthlySalesTarget}
                    onChange={(e) => setFormData({ ...formData, monthlySalesTarget: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Monthly Service Target</label>
                  <input
                    type="number"
                    value={formData.servicesTarget}
                    onChange={(e) => setFormData({ ...formData, servicesTarget: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

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
                  Save Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
