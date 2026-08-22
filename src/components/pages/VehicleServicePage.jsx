import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Trash2,
  Printer,
  CheckCircle,
  Clock,
  FileText,
  Clipboard,
  DollarSign,
  Calendar,
  RefreshCw,
  Eye,
  User,
  Phone,
  MessageCircle,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import PrintPreviewModal from '../PrintPreviewModal';

export default function VehicleServicePage({
  activeSubTab,
  setActiveSubTab,
  jobSheets = [],
  setJobSheets,
  serviceBills = [],
  setServiceBills,
  spares = [],
  showPreviews = true,
  customers = []
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'jobsheet', data: null });

  // Job Sheets ledger states
  const [searchQuery, setSearchQuery] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('ALL');
  const [activeJobSheetId, setActiveJobSheetId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Customer History & Details modal state
  const [inspectedCustomer, setInspectedCustomer] = useState(null);

  // Service History filtering states
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyDateFilter, setHistoryDateFilter] = useState('ALL');

  // Job Sheet Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    vehicleNo: '',
    vehicleKm: '',
    complaints: '',
    serviceType: 'Paid Service',
    status: 'Pending'
  });

  // Billing Module States
  const [billingJobSheetId, setBillingJobSheetId] = useState('');
  const [selectedServiceWork, setSelectedServiceWork] = useState('General Service');
  const [laborItems, setLaborItems] = useState([{ desc: 'General Service Labor', amount: 350 }]);
  const [billingParts, setBillingParts] = useState([]);
  const [taxRate, setTaxRate] = useState(5); // 5% GST standard for EV services
  const [discount, setDiscount] = useState(0);

  // Status progression cycle
  const STATUS_FLOW = ['Pending', 'In Progress', 'Ready', 'Delivered'];

  // Metric summaries
  const totalSheets = jobSheets.length;
  const pendingCount = jobSheets.filter(js => js.status === 'Pending').length;
  const inProgressCount = jobSheets.filter(js => js.status === 'In Progress').length;
  const readyCount = jobSheets.filter(js => js.status === 'Ready').length;
  const deliveredCount = jobSheets.filter(js => js.status === 'Delivered').length;

  // Helpers to fetch selected job sheet for preview
  const selectedJobSheet = jobSheets.find(js => js.id === activeJobSheetId) || (jobSheets.length > 0 ? jobSheets[0] : null);

  // Filter job sheets by search query and status filter
  const filteredJobSheets = jobSheets.filter(js => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q ||
      (js.customerName || '').toLowerCase().includes(q) ||
      (js.vehicleNo || '').toLowerCase().includes(q) ||
      (js.customerMobile || '').includes(q) ||
      (js.id || '').toLowerCase().includes(q);
    const matchStatus = jobStatusFilter === 'ALL' || js.status === jobStatusFilter;
    return matchQuery && matchStatus;
  });

  // Filtered Service History Bills
  const filteredServiceBills = serviceBills.filter(bill => {
    const q = historySearchQuery.toLowerCase().trim();
    const matchQuery = !q ||
      (bill.customerName || '').toLowerCase().includes(q) ||
      (bill.vehicleNo || '').toLowerCase().includes(q) ||
      (bill.id || '').toLowerCase().includes(q) ||
      (bill.jobSheetId || '').toLowerCase().includes(q);

    const matchType = historyTypeFilter === 'ALL' || bill.serviceType === historyTypeFilter;

    let matchDate = true;
    if (historyDateFilter === 'TODAY') {
      const todayStr = new Date().toLocaleDateString('en-IN');
      matchDate = bill.date === todayStr;
    } else if (historyDateFilter === 'MONTH') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const parts = (bill.date || '').split('/');
      if (parts.length === 3) {
        matchDate = parseInt(parts[1], 10) === currentMonth + 1 && parseInt(parts[2], 10) === currentYear;
      }
    }

    return matchQuery && matchType && matchDate;
  });

  // Suggestions helper for Customer Name matching
  const customerSuggestions = React.useMemo(() => {
    if (!formData.customerName.trim()) return [];
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(formData.customerName.toLowerCase()) ||
      (c.mobile || '').includes(formData.customerName)
    ).slice(0, 5);
  }, [customers, formData.customerName]);

  const handleSelectCustomer = (cust) => {
    const matchedJS = jobSheets.find(js =>
      (js.customerName || '').toLowerCase() === (cust.name || '').toLowerCase() ||
      (js.customerMobile && js.customerMobile === cust.mobile)
    );

    setFormData(prev => ({
      ...prev,
      customerName: cust.name || '',
      customerMobile: (cust.mobile || '').replace(/\D/g, '').slice(0, 10),
      vehicleNo: matchedJS ? matchedJS.vehicleNo : prev.vehicleNo
    }));
    setShowSuggestions(false);
  };

  const handleCreateJobSheet = (e) => {
    e.preventDefault();
    const nextNum = jobSheets.reduce((max, js) => {
      const n = parseInt((js.id || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const id = `JS-${String(nextNum).padStart(2, '0')}`;

    const newJobSheet = {
      id,
      customerName: formData.customerName,
      customerMobile: (formData.customerMobile || '').replace(/\D/g, '').slice(0, 10),
      vehicleNo: (formData.vehicleNo || '').toUpperCase(),
      vehicleKm: formData.vehicleKm,
      complaints: formData.complaints,
      serviceType: formData.serviceType,
      status: 'Pending',
      billingStatus: 'Unbilled',
      date: new Date().toLocaleDateString('en-IN')
    };

    setJobSheets([newJobSheet, ...jobSheets]);
    setFormData({
      customerName: '',
      customerMobile: '',
      vehicleNo: '',
      vehicleKm: '',
      complaints: '',
      serviceType: 'Paid Service',
      status: 'Pending'
    });
    setIsFormOpen(false);
    setActiveJobSheetId(newJobSheet.id);
  };

  const handleDeleteJobSheet = (id) => {
    if (window.confirm(`Are you sure you want to delete Job Sheet ${id}?`)) {
      setJobSheets(jobSheets.filter(js => js.id !== id));
      if (activeJobSheetId === id) setActiveJobSheetId(null);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setJobSheets(jobSheets.map(js => {
      if (js.id === id) {
        return { ...js, status: newStatus };
      }
      return js;
    }));
  };

  const handleCycleStatus = (id, currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];
    handleStatusChange(id, nextStatus);
  };

  // Standard labor work presets (Item 10)
  const handleServiceWorkChange = (workType) => {
    setSelectedServiceWork(workType);
    let defaultDesc = workType;
    let defaultAmt = 350;

    switch (workType) {
      case '1st Free Service':
      case '2nd Free Service':
      case '3rd Free Service':
        defaultDesc = `${workType} Periodic Checkup`;
        defaultAmt = 0;
        break;
      case 'General Service':
        defaultDesc = 'General Periodic Service & Washing';
        defaultAmt = 350;
        break;
      case 'Paid Periodic Maintenance Service':
        defaultDesc = 'Paid Periodic Maintenance Service (PMS)';
        defaultAmt = 450;
        break;
      case 'Major Overhaul / Engine Repair':
        defaultDesc = 'Major Engine / Motor Transmission Overhaul';
        defaultAmt = 1200;
        break;
      case 'Electrical & Battery Diagnostics':
        defaultDesc = 'Electrical Wiring & Battery Health Check';
        defaultAmt = 250;
        break;
      case 'Brake, Chain & Suspension Overhaul':
        defaultDesc = 'Brake Shoes, Chain Sprocket & Suspension Work';
        defaultAmt = 350;
        break;
      default:
        defaultDesc = 'Service Work Labor';
        defaultAmt = 300;
        break;
    }

    setLaborItems(prev => {
      if (prev.length === 0) return [{ desc: defaultDesc, amount: defaultAmt }];
      const next = [...prev];
      next[0] = { desc: defaultDesc, amount: defaultAmt };
      return next;
    });
  };

  // Billing calculation details
  const getBillingTotals = () => {
    const laborTotal = laborItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const partsTotal = billingParts.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
    const subtotal = laborTotal + partsTotal;
    const gstAmount = Math.round(subtotal * (taxRate / 100));
    const rawTotal = subtotal + gstAmount - Number(discount || 0);
    const grandTotal = Math.max(0, Math.round(rawTotal));
    const roundOff = grandTotal - rawTotal;

    return { laborTotal, partsTotal, subtotal, gstAmount, roundOff, grandTotal };
  };

  const addLaborRow = () => {
    setLaborItems([...laborItems, { desc: '', amount: 0 }]);
  };

  const removeLaborRow = (idx) => {
    setLaborItems(laborItems.filter((_, i) => i !== idx));
  };

  const addPartRow = () => {
    setBillingParts([...billingParts, { id: '', name: '', partNo: '', price: 0, stock: 0, qty: 1 }]);
  };

  const removePartRow = (idx) => {
    setBillingParts(billingParts.filter((_, i) => i !== idx));
  };

  const handleBillSubmit = (e) => {
    e.preventDefault();
    if (!billingJobSheetId) {
      alert('Please select a Job Sheet to bill.');
      return;
    }

    const js = jobSheets.find(item => item.id === billingJobSheetId);
    if (!js) return;

    const totals = getBillingTotals();
    const nextBillNum = serviceBills.reduce((max, b) => {
      const n = parseInt((b.id || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const newBill = {
      id: `SB-${String(nextBillNum).padStart(2, '0')}`,
      jobSheetId: js.id,
      customerName: js.customerName,
      customerMobile: js.customerMobile || '',
      vehicleNo: js.vehicleNo,
      serviceType: js.serviceType,
      laborItems: [...laborItems],
      parts: [...billingParts],
      subtotal: totals.subtotal,
      gst: totals.gstAmount,
      discount: Number(discount),
      roundOff: Number(totals.roundOff.toFixed(2)),
      grandTotal: totals.grandTotal,
      date: new Date().toLocaleDateString('en-IN')
    };

    setServiceBills([newBill, ...serviceBills]);

    // Mark Job Sheet as Delivered and Billed
    setJobSheets(jobSheets.map(item => {
      if (item.id === js.id) {
        return { ...item, status: 'Delivered', billingStatus: 'Billed' };
      }
      return item;
    }));

    // Reset Billing States
    setBillingJobSheetId('');
    setLaborItems([{ desc: 'General Service Labor', amount: 350 }]);
    setBillingParts([]);
    setDiscount(0);

    setActiveSubTab('service-history');
  };

  // Inspect Customer Details modal (Item 12)
  const handleOpenCustomerDetails = (billOrJs) => {
    const custName = billOrJs.customerName;
    const custMobile = billOrJs.customerMobile;
    const vehicleNo = billOrJs.vehicleNo;

    const relatedBills = serviceBills.filter(b =>
      (b.customerName && b.customerName.toLowerCase() === (custName || '').toLowerCase()) ||
      (b.vehicleNo && b.vehicleNo.toLowerCase() === (vehicleNo || '').toLowerCase()) ||
      (custMobile && b.customerMobile && b.customerMobile === custMobile)
    );

    const relatedJobSheets = jobSheets.filter(js =>
      (js.customerName && js.customerName.toLowerCase() === (custName || '').toLowerCase()) ||
      (js.vehicleNo && js.vehicleNo.toLowerCase() === (vehicleNo || '').toLowerCase()) ||
      (custMobile && js.customerMobile && js.customerMobile === custMobile)
    );

    const totalSpent = relatedBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

    setInspectedCustomer({
      name: custName,
      mobile: custMobile,
      vehicleNo,
      bills: relatedBills,
      jobSheets: relatedJobSheets,
      totalSpent,
      visitsCount: Math.max(relatedBills.length, relatedJobSheets.length, 1)
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>

      {/* SUBTAB 1: JOB SHEETS */}
      {activeSubTab === 'add-jobsheet' && (
        <>
          {/* Status Pipeline with Notification Badges & Icons (Item 9) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* 1. All Jobs */}
            <div
              onClick={() => setJobStatusFilter('ALL')}
              style={{
                backgroundColor: jobStatusFilter === 'ALL' ? '#f0fdf4' : '#ffffff',
                border: '1.5px solid',
                borderColor: jobStatusFilter === 'ALL' ? '#059669' : '#e5e7eb',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: jobStatusFilter === 'ALL' ? '0 4px 6px -1px rgba(5, 150, 105, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Clipboard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>All Jobs</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>{totalSheets}</div>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#e5e7eb', color: '#374151', fontSize: '0.75rem', fontWeight: 700 }}>
                {totalSheets}
              </span>
            </div>

            {/* 2. Pending */}
            <div
              onClick={() => setJobStatusFilter('Pending')}
              style={{
                backgroundColor: jobStatusFilter === 'Pending' ? '#fffbeb' : '#ffffff',
                border: '1.5px solid',
                borderColor: jobStatusFilter === 'Pending' ? '#f59e0b' : '#e5e7eb',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: jobStatusFilter === 'Pending' ? '0 4px 6px -1px rgba(245, 158, 11, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#d97706' }}>{pendingCount}</div>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700 }}>
                {pendingCount}
              </span>
            </div>

            {/* 3. In Progress */}
            <div
              onClick={() => setJobStatusFilter('In Progress')}
              style={{
                backgroundColor: jobStatusFilter === 'In Progress' ? '#eff6ff' : '#ffffff',
                border: '1.5px solid',
                borderColor: jobStatusFilter === 'In Progress' ? '#3b82f6' : '#e5e7eb',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: jobStatusFilter === 'In Progress' ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  <Wrench size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2563eb' }}>{inProgressCount}</div>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700 }}>
                {inProgressCount}
              </span>
            </div>

            {/* 4. Ready */}
            <div
              onClick={() => setJobStatusFilter('Ready')}
              style={{
                backgroundColor: jobStatusFilter === 'Ready' ? '#f0fdf4' : '#ffffff',
                border: '1.5px solid',
                borderColor: jobStatusFilter === 'Ready' ? '#10b981' : '#e5e7eb',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: jobStatusFilter === 'Ready' ? '0 4px 6px -1px rgba(16, 185, 129, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#d1fae5', color: '#059669' }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Ready</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#059669' }}>{readyCount}</div>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#047857', fontSize: '0.75rem', fontWeight: 700 }}>
                {readyCount}
              </span>
            </div>

            {/* 5. Delivered */}
            <div
              onClick={() => setJobStatusFilter('Delivered')}
              style={{
                backgroundColor: jobStatusFilter === 'Delivered' ? '#f0fdf4' : '#ffffff',
                border: '1.5px solid',
                borderColor: jobStatusFilter === 'Delivered' ? '#047857' : '#e5e7eb',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  <CheckCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Delivered</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#15803d' }}>{deliveredCount}</div>
                </div>
              </div>
              <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
                {deliveredCount}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
            gap: '24px'
          }}>
            {/* Left Column: Job Sheets Ledger */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="card-title">
                  <Wrench size={18} style={{ color: '#059669' }} /> Job Sheets Ledger
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="quick-search">
                    <Search size={14} className="quick-search-icon" />
                    <input
                      type="text"
                      placeholder="Search job / customer / vehicle..."
                      style={{ width: '200px', padding: '6px 10px 6px 30px', fontSize: '0.8rem' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <Plus size={14} style={{ marginRight: '4px' }} /> Create Job Sheet
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ padding: 0 }}>
                {filteredJobSheets.length > 0 ? (
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Job ID</th>
                          <th>Customer Details</th>
                          <th>Vehicle Number</th>
                          <th>KM</th>
                          <th>Service Type</th>
                          <th>Status Pipeline</th>
                          <th>Billing</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobSheets.map(js => {
                          const isPending = js.status === 'Pending';
                          const isInProg = js.status === 'In Progress';
                          const isReady = js.status === 'Ready';
                          const isDelivered = js.status === 'Delivered';

                          return (
                            <tr
                              key={js.id}
                              style={{
                                cursor: 'pointer',
                                backgroundColor: activeJobSheetId === js.id ? '#f0fdf4' : 'transparent'
                              }}
                              onClick={() => setActiveJobSheetId(js.id)}
                            >
                              <td>
                                <span style={{ fontWeight: 700, color: '#374151' }}>{js.id}</span>
                              </td>
                              <td>
                                <div><strong>{js.customerName}</strong></div>
                                {js.customerMobile && (
                                  <div style={{ fontSize: '0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <span>📞</span> <span>{js.customerMobile}</span>
                                  </div>
                                )}
                                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Date: {js.date}</div>
                              </td>
                              <td>
                                <span style={{
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  letterSpacing: '0.5px',
                                  backgroundColor: '#f3f4f6',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.82rem'
                                }}>{js.vehicleNo}</span>
                              </td>
                              <td style={{ fontSize: '0.82rem' }}>{Number(js.vehicleKm || 0).toLocaleString('en-IN')} km</td>
                              <td>
                                <span className={`badge ${js.serviceType === 'Free Service' ? 'badge-success' : 'badge-primary'}`} style={{
                                  backgroundColor: js.serviceType === 'Free Service' ? '#ecfdf5' : '#eff6ff',
                                  color: js.serviceType === 'Free Service' ? '#047857' : '#1d4ed8',
                                  fontSize: '0.72rem'
                                }}>
                                  {js.serviceType}
                                </span>
                              </td>
                              {/* Modern Icon Status Pipeline Toggle (Item 9) */}
                              <td onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleCycleStatus(js.id, js.status)}
                                  title="Click to advance status"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '1px solid',
                                    cursor: 'pointer',
                                    backgroundColor: isPending ? '#fef2f2' : isInProg ? '#fef3c7' : isReady ? '#ecfdf5' : '#f0fdf4',
                                    borderColor: isPending ? '#fca5a5' : isInProg ? '#fcd34d' : isReady ? '#86efac' : '#bbf7d0',
                                    color: isPending ? '#dc2626' : isInProg ? '#d97706' : isReady ? '#059669' : '#15803d'
                                  }}
                                >
                                  {isPending && <Clock size={12} />}
                                  {isInProg && <Wrench size={12} />}
                                  {isReady && <CheckCircle size={12} />}
                                  {isDelivered && <CheckCheck size={12} />}
                                  <span>{js.status}</span>
                                  <ChevronRight size={10} style={{ opacity: 0.6 }} />
                                </button>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: js.billingStatus === 'Billed' ? '#059669' : '#6b7280'
                                }}>
                                  {js.billingStatus}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                  {/* View Customer Details Button (Item 12) */}
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '3px 6px', minWidth: 'auto', color: '#2563eb' }}
                                    onClick={() => handleOpenCustomerDetails(js)}
                                    title="View Customer Profile & History"
                                  >
                                    <User size={13} />
                                  </button>

                                  {/* Bill Action Button */}
                                  {js.billingStatus !== 'Billed' && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      style={{
                                        padding: '2px 8px',
                                        minWidth: 'auto',
                                        fontSize: '0.75rem'
                                      }}
                                      onClick={() => {
                                        setBillingJobSheetId(js.id);
                                        if (js.serviceType === 'Free Service') {
                                          handleServiceWorkChange('1st Free Service');
                                        } else {
                                          handleServiceWorkChange('General Service');
                                        }
                                        setActiveSubTab('service-billing');
                                      }}
                                    >
                                      Bill
                                    </button>
                                  )}

                                  {/* Delete Job Sheet */}
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '3px 6px', minWidth: 'auto' }}
                                    onClick={() => handleDeleteJobSheet(js.id)}
                                    title="Delete Job Sheet"
                                  >
                                    <Trash2 size={13} style={{ color: '#ef4444' }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '10px' }} />
                    <p>No job sheets found matching current filter.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Print Card Preview */}
            {showPreviews && (
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="card-title">
                    <Printer size={18} style={{ color: '#059669' }} /> Job Card Preview
                  </h3>
                  {selectedJobSheet && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPrintModalConfig({ isOpen: true, type: 'jobsheet', data: selectedJobSheet })}
                    >
                      <Printer size={13} style={{ marginRight: '4px' }} /> Print Card
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {selectedJobSheet ? (
                    <div style={{
                      backgroundColor: '#fafbfc',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      lineHeight: '1.6'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px dashed #d1d5db',
                        paddingBottom: '12px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>JOB SHEET ID</span>
                          <h4 style={{ margin: 0, color: '#059669', fontSize: '1.2rem', fontWeight: 700 }}>{selectedJobSheet.id}</h4>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af' }}>DATE CREATED</span>
                          <div style={{ fontWeight: 600 }}>{selectedJobSheet.date}</div>
                        </div>
                      </div>

                      <div className="form-grid" style={{ marginBottom: '16px', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Customer Name</label>
                          <strong style={{ fontSize: '0.92rem' }}>{selectedJobSheet.customerName}</strong>
                          {selectedJobSheet.customerMobile && (
                            <span style={{ fontSize: '0.78rem', color: '#4b5563', display: 'block', marginTop: '2px' }}>
                              📞 {selectedJobSheet.customerMobile}
                            </span>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Vehicle Reg No</label>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            backgroundColor: '#f3f4f6',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '0.84rem'
                          }}>{selectedJobSheet.vehicleNo}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>KM Reading</label>
                          <strong style={{ fontSize: '0.92rem' }}>{Number(selectedJobSheet.vehicleKm || 0).toLocaleString('en-IN')} km</strong>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Service Type</label>
                          <span className={`badge ${selectedJobSheet.serviceType === 'Free Service' ? 'badge-success' : 'badge-primary'}`} style={{
                            backgroundColor: selectedJobSheet.serviceType === 'Free Service' ? '#ecfdf5' : '#eff6ff',
                            color: selectedJobSheet.serviceType === 'Free Service' ? '#047857' : '#1d4ed8',
                            fontSize: '0.75rem'
                          }}>
                            {selectedJobSheet.serviceType}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Customer Complaints Box:
                        </span>
                        <p style={{
                          margin: '8px 0 0 0',
                          fontSize: '0.88rem',
                          color: '#374151',
                          whiteSpace: 'pre-wrap'
                        }}>{selectedJobSheet.complaints || 'No specific complaints recorded.'}</p>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '32px',
                        borderTop: '1px dashed #e5e7eb',
                        paddingTop: '14px',
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        <span>Mechanic Sign: ___________</span>
                        <span>Customer Sign: ___________</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#9ca3af', textAlign: 'center' }}>
                      <FileText size={48} strokeWidth={1} style={{ marginBottom: '14px' }} />
                      <p>Select a job sheet from the list to preview details.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUBTAB 2: SERVICE BILLING */}
      {activeSubTab === 'service-billing' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <DollarSign size={18} style={{ color: '#059669' }} /> Generate Service Billing Invoice
            </h3>
          </div>
          <form className="card-body" onSubmit={handleBillSubmit}>
            {/* Select Job Sheet & Work Preset (Item 10) */}
            <div className="form-grid" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Active Job Sheet *</label>
                <select
                  className="form-control"
                  required
                  value={billingJobSheetId}
                  onChange={(e) => {
                    setBillingJobSheetId(e.target.value);
                    const matched = jobSheets.find(js => js.id === e.target.value);
                    if (matched) {
                      if (matched.serviceType === 'Free Service') {
                        handleServiceWorkChange('1st Free Service');
                      } else {
                        handleServiceWorkChange('General Service');
                      }
                    }
                  }}
                >
                  <option value="">-- Choose Job Sheet --</option>
                  {jobSheets
                    .filter(js => js.billingStatus === 'Unbilled')
                    .map(js => (
                      <option key={js.id} value={js.id}>
                        {js.id} - {js.customerName} ({js.vehicleNo})
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Service Work Preset Selector (Item 10) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Labor & Service Work Type Preset *</label>
                <select
                  className="form-control"
                  value={selectedServiceWork}
                  onChange={(e) => handleServiceWorkChange(e.target.value)}
                >
                  <option value="General Service">General Service (Base ₹350)</option>
                  <option value="1st Free Service">1st Free Service (Labor ₹0)</option>
                  <option value="2nd Free Service">2nd Free Service (Labor ₹0)</option>
                  <option value="3rd Free Service">3rd Free Service (Labor ₹0)</option>
                  <option value="Paid Periodic Maintenance Service">Paid Periodic Service (Base ₹450)</option>
                  <option value="Major Overhaul / Engine Repair">Major Overhaul / Engine Repair (Base ₹1,200)</option>
                  <option value="Electrical & Battery Diagnostics">Electrical & Battery Diagnostics (Base ₹250)</option>
                  <option value="Brake, Chain & Suspension Overhaul">Brake & Suspension Overhaul (Base ₹350)</option>
                  <option value="Custom Labor">Custom Labor Work</option>
                </select>
              </div>
            </div>

            {/* LABOR ITEMS */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, margin: 0 }}>
                  1. Labor & Service Works
                </h4>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', minWidth: 'auto' }} onClick={addLaborRow}>
                  + Add Custom Labor
                </button>
              </div>

              {laborItems.map((item, idx) => (
                <div className="form-grid" key={idx} style={{ gridTemplateColumns: '1fr 180px 40px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engine Oil Service, Brake Pad Labor"
                      required
                      value={item.desc}
                      onChange={(e) => {
                        const updated = [...laborItems];
                        updated[idx].desc = e.target.value;
                        setLaborItems(updated);
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount (₹)"
                      required
                      min="0"
                      value={item.amount}
                      onChange={(e) => {
                        const updated = [...laborItems];
                        updated[idx].amount = Number(e.target.value);
                        setLaborItems(updated);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '8px', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}
                    onClick={() => removeLaborRow(idx)}
                    disabled={laborItems.length === 1}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>

            {/* PARTS / SPARES INTEGRATION FROM LIVE INVENTORY (Item 11) */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, margin: 0 }}>
                  2. Spares & Parts Issued (from Spare Inventory)
                </h4>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', minWidth: 'auto' }} onClick={addPartRow}>
                  + Add Spare Part
                </button>
              </div>

              {billingParts.map((item, idx) => {
                const isOverStock = item.stock > 0 && item.qty > item.stock;
                return (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div className="form-grid" style={{ gridTemplateColumns: '1.4fr 120px 90px 40px', gap: '10px', alignItems: 'center' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <select
                          className="form-control"
                          required
                          value={item.id}
                          onChange={(e) => {
                            const spare = spares.find(s => s.id === e.target.value);
                            if (spare) {
                              const updated = [...billingParts];
                              const partPrice = spare.unitPrice || spare.priceWithGst || spare.mrp || spare.sellingPrice || spare.price || 0;
                              const partStock = spare.stock ?? spare.quantity ?? 0;
                              updated[idx] = {
                                id: spare.id,
                                name: spare.name || spare.partName,
                                partNo: spare.partNo || '',
                                price: partPrice,
                                stock: partStock,
                                qty: item.qty || 1
                              };
                              setBillingParts(updated);
                            }
                          }}
                        >
                          <option value="">-- Choose Spare from Catalog --</option>
                          {spares.map(s => {
                            const pName = s.name || s.partName;
                            const pPrice = s.unitPrice || s.priceWithGst || s.mrp || s.sellingPrice || s.price || 0;
                            const pStock = s.stock ?? s.quantity ?? 0;
                            return (
                              <option key={s.id} value={s.id}>
                                {pName} {s.partNo ? `[${s.partNo}]` : ''} - ₹{pPrice} (In Stock: {pStock})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Price (₹)"
                          required
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...billingParts];
                            updated[idx].price = Number(e.target.value);
                            setBillingParts(updated);
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Qty"
                          required
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const updated = [...billingParts];
                            updated[idx].qty = Number(e.target.value);
                            setBillingParts(updated);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '8px', minWidth: 'auto', display: 'flex', justifyContent: 'center' }}
                        onClick={() => removePartRow(idx)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>

                    {/* Stock Alert Banner */}
                    {item.id && (
                      <div style={{ fontSize: '0.72rem', marginTop: '3px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: item.stock > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                          📦 Available Stock: {item.stock} units
                        </span>
                        {isOverStock && (
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>
                            ⚠️ Warning: Quantity ({item.qty}) exceeds available stock ({item.stock})!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {billingParts.length === 0 && (
                <div style={{ padding: '10px', fontSize: '0.8rem', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '4px', textAlign: 'center' }}>
                  No spare parts added to this bill. Click "+ Add Spare Part" to issue parts from inventory.
                </div>
              )}
            </div>

            {/* BILL SUMMARY & DISCOUNTS */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: '12px' }}>
                3. Tax, Discounts & Round Off
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">GST Tax rate (%)</label>
                  <select
                    className="form-control"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  >
                    <option value="5">5% EV Service Tax</option>
                    <option value="12">12% Parts Standard Tax</option>
                    <option value="18">18% Accessories / Labor Tax</option>
                    <option value="0">0% Exempted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter discount"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Total Billing Table */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              maxWidth: '380px',
              marginLeft: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#6b7280' }}>Labor Charges:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>₹{getBillingTotals().laborTotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#6b7280' }}>Spares Total:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>₹{getBillingTotals().partsTotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#6b7280' }}>Subtotal:</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>₹{getBillingTotals().subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 0', color: '#6b7280' }}>GST ({taxRate}%):</td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>+ ₹{getBillingTotals().gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  {discount > 0 && (
                    <tr>
                      <td style={{ padding: '5px 0', color: '#ef4444' }}>Discount:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>- ₹{Number(discount).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {getBillingTotals().roundOff !== 0 && (
                    <tr>
                      <td style={{ padding: '5px 0', color: '#6b7280' }}>Round Off:</td>
                      <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 600 }}>
                        {getBillingTotals().roundOff > 0 ? '+' : ''}₹{getBillingTotals().roundOff.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '2px solid #059669', fontSize: '1.15rem' }}>
                    <td style={{ padding: '10px 0 0 0', fontWeight: 700, color: '#059669' }}>Grand Total:</td>
                    <td style={{ padding: '10px 0 0 0', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                      ₹{getBillingTotals().grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px', fontWeight: 700 }}>
              Complete & Generate Service Invoice
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: SERVICE HISTORY WITH FILTER OPTIONS (Item 12) */}
      {activeSubTab === 'service-history' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: '#059669' }} /> Completed Services History
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Total Bills: <strong>{serviceBills.length}</strong>
            </span>
          </div>

          {/* Filter Toolbar (Item 12) */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#fafbfc',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {/* Search Input */}
            <div className="quick-search" style={{ flex: '1 1 200px' }}>
              <Search size={14} className="quick-search-icon" />
              <input
                type="text"
                placeholder="Search Customer, Mobile, Vehicle No, Invoice ID..."
                style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '0.82rem' }}
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
              />
            </div>

            {/* Service Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Service Type:</span>
              <select
                className="form-control"
                style={{ width: '140px', padding: '4px 8px', fontSize: '0.78rem' }}
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="General Service">General Service</option>
                <option value="Free Service">Free Service</option>
                <option value="Paid Service">Paid Service</option>
              </select>
            </div>

            {/* Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Date Range:</span>
              <select
                className="form-control"
                style={{ width: '120px', padding: '4px 8px', fontSize: '0.78rem' }}
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value)}
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Today</option>
                <option value="MONTH">This Month</option>
              </select>
            </div>

            {(historySearchQuery || historyTypeFilter !== 'ALL' || historyDateFilter !== 'ALL') && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => {
                  setHistorySearchQuery('');
                  setHistoryTypeFilter('ALL');
                  setHistoryDateFilter('ALL');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {filteredServiceBills.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Job Sheet</th>
                      <th>Customer Details</th>
                      <th>Vehicle Reg No</th>
                      <th>Service Type</th>
                      <th>Billed Date</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                      <th style={{ textAlign: 'center' }}>Customer Details</th>
                      <th style={{ textAlign: 'center' }}>Print Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServiceBills.map(bill => (
                      <tr key={bill.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#059669' }}>{bill.id}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{bill.jobSheetId}</span>
                        </td>
                        <td>
                          <div><strong>{bill.customerName}</strong></div>
                          {bill.customerMobile && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>📞 {bill.customerMobile}</div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            backgroundColor: '#f3f4f6',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.82rem'
                          }}>{bill.vehicleNo}</span>
                        </td>
                        <td>
                          <span className={`badge ${bill.serviceType === 'Free Service' ? 'badge-success' : 'badge-primary'}`} style={{
                            backgroundColor: bill.serviceType === 'Free Service' ? '#ecfdf5' : '#eff6ff',
                            color: bill.serviceType === 'Free Service' ? '#047857' : '#1d4ed8'
                          }}>
                            {bill.serviceType}
                          </span>
                        </td>
                        <td>{bill.date}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          ₹{Number(bill.grandTotal || 0).toLocaleString('en-IN')}
                        </td>
                        {/* View Customer Details Button (Item 12) */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenCustomerDetails(bill)}
                            title="View Customer Profile & Full Service History"
                          >
                            <Eye size={13} /> View Profile
                          </button>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', minWidth: 'auto' }}
                            onClick={() => setPrintModalConfig({ isOpen: true, type: 'servicebill', data: bill })}
                          >
                            <Printer size={12} style={{ marginRight: '4px' }} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '10px' }} />
                <p>No billing invoices match the search / filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR CUSTOMER SERVICE HISTORY & PROFILE (Item 12) */}
      {inspectedCustomer && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setInspectedCustomer(null)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <User size={18} style={{ color: '#059669' }} /> Customer Service Profile & History
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInspectedCustomer(null)}
                style={{ padding: '4px 10px', minWidth: 'auto' }}
              >
                ✕ Close
              </button>
            </div>

            <div className="card-body">
              {/* Customer Summary Header */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Customer Name</span>
                  <strong style={{ fontSize: '1rem', color: '#111827' }}>{inspectedCustomer.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Mobile Number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{inspectedCustomer.mobile || 'N/A'}</span>
                    {inspectedCustomer.mobile && (
                      <a
                        href={`https://wa.me/91${inspectedCustomer.mobile.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#16a34a', textDecoration: 'none' }}
                        title="WhatsApp Customer"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Vehicle Reg No</span>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    backgroundColor: '#e5e7eb',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.84rem'
                  }}>{inspectedCustomer.vehicleNo || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Total Spend (Lifetime)</span>
                  <strong style={{ fontSize: '1rem', color: '#059669' }}>₹{inspectedCustomer.totalSpent.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Service Records List */}
              <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 700 }}>
                Past Service Invoices ({inspectedCustomer.bills.length})
              </h4>
              {inspectedCustomer.bills.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {inspectedCustomer.bills.map((b, idx) => (
                    <div key={idx} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <strong style={{ color: '#059669' }}>{b.id}</strong> (Job Sheet: {b.jobSheetId})
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '8px' }}>Date: {b.date}</span>
                        </div>
                        <strong style={{ color: '#111827', fontSize: '0.95rem' }}>₹{Number(b.grandTotal || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
                        <div><strong>Labor:</strong> {b.laborItems.map(l => `${l.desc} (₹${l.amount})`).join(', ')}</div>
                        {b.parts && b.parts.length > 0 && (
                          <div style={{ marginTop: '3px' }}>
                            <strong>Spares:</strong> {b.parts.map(p => `${p.name} x${p.qty} (₹${p.price * p.qty})`).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '16px' }}>No billed invoices on record yet.</p>
              )}

              {/* Job Sheets History */}
              <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', fontWeight: 700 }}>
                Job Sheets Records ({inspectedCustomer.jobSheets.length})
              </h4>
              {inspectedCustomer.jobSheets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectedCustomer.jobSheets.map((js, idx) => (
                    <div key={idx} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      backgroundColor: '#fafbfc',
                      fontSize: '0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{js.id}</strong> | {js.serviceType} | {js.vehicleKm} KM<br />
                        <span style={{ color: '#6b7280' }}>Complaints: {js.complaints || 'None'}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge" style={{
                          backgroundColor: js.status === 'Delivered' ? '#dcfce7' : '#fef3c7',
                          color: js.status === 'Delivered' ? '#166534' : '#b45309',
                          fontSize: '0.72rem'
                        }}>
                          {js.status}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>{js.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic' }}>No job sheets recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL DIALOG FOR JOB SHEET CREATION (Items 4, 8) */}
      {isFormOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setIsFormOpen(false)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <Wrench size={18} style={{ color: '#059669' }} /> Create Vehicle Job Sheet
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsFormOpen(false)}
                style={{ padding: '4px 10px', minWidth: 'auto' }}
              >
                ✕ Close
              </button>
            </div>

            <form className="card-body" onSubmit={handleCreateJobSheet}>
              {/* Customer Details Grid */}
              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ position: 'relative', margin: 0 }}>
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type name to search / suggest..."
                    required
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                  />
                  {/* Suggestion Dropdown */}
                  {showSuggestions && customerSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {customerSuggestions.map(cust => (
                        <div
                          key={cust.id}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseDown={() => handleSelectCustomer(cust)}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <strong style={{ fontSize: '0.85rem', color: '#111827', textAlign: 'left' }}>{cust.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280', textAlign: 'left' }}>📞 {cust.mobile} {cust.address ? `| 📍 ${cust.address}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Customer Mobile * (10 Digits)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="form-control"
                    placeholder="10-digit mobile number"
                    required
                    pattern="[0-9]{10}"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
              </div>

              {/* Vehicle Number & KM */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number * (Uppercase)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TN-37-BJ-5120"
                    style={{ textTransform: 'uppercase' }}
                    required
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Odometer Reading (KM) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 15400"
                    required
                    min="0"
                    value={formData.vehicleKm}
                    onChange={(e) => setFormData({ ...formData, vehicleKm: e.target.value })}
                  />
                </div>
              </div>

              {/* Service Type Selection */}
              <div className="form-group">
                <label className="form-label">Choose Service Type *</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="Free Service"
                      checked={formData.serviceType === 'Free Service'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    />
                    Free Service Coupon
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="Paid Service"
                      checked={formData.serviceType === 'Paid Service'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    />
                    Paid Service
                  </label>
                </div>
              </div>

              {/* Complaint Text Box */}
              <div className="form-group">
                <label className="form-label">Customer Complaints / Action Items *</label>
                <textarea
                  className="form-control"
                  placeholder="Describe specific complaints (e.g. 1. Engine noise; 2. Rear break check; 3. General wash)"
                  required
                  rows="4"
                  style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px' }}
                  value={formData.complaints}
                  onChange={(e) => setFormData({ ...formData, complaints: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '11px', fontWeight: 600 }}>
                  Submit Job Sheet
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '11px 16px' }} onClick={() => setIsFormOpen(false)}>
                  Cancel
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
