import React, { useState } from 'react';
import { Wrench, Plus, Search, Trash2, Printer, CheckCircle, Clock, FileText, Clipboard, DollarSign, Calendar, RefreshCw } from 'lucide-react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeJobSheetId, setActiveJobSheetId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
  const [laborItems, setLaborItems] = useState([{ desc: 'General Service Labor', amount: 350 }]);
  const [billingParts, setBillingParts] = useState([]);
  const [taxRate, setTaxRate] = useState(5); // 5% GST standard for EV services
  const [discount, setDiscount] = useState(0);

  // Helpers to fetch selected job sheet for preview
  const selectedJobSheet = jobSheets.find(js => js.id === activeJobSheetId) || jobSheets[0];

  // Filter job sheets by search query
  const filteredJobSheets = jobSheets.filter(js =>
    js.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    js.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metric summaries
  const totalSheets = jobSheets.length;
  const pendingCount = jobSheets.filter(js => js.status === 'Pending').length;
  const inProgressCount = jobSheets.filter(js => js.status === 'In Progress').length;
  const readyCount = jobSheets.filter(js => js.status === 'Ready' || js.status === 'Delivered').length;

  // Suggestions helper for Customer Name matching
  const customerSuggestions = React.useMemo(() => {
    if (!formData.customerName.trim()) return [];
    return customers.filter(c =>
      c.name.toLowerCase().includes(formData.customerName.toLowerCase())
    ).slice(0, 5);
  }, [customers, formData.customerName]);

  const handleSelectCustomer = (cust) => {
    // Attempt auto-matching vehicle reg no from existing job sheets
    const matchedJS = jobSheets.find(js =>
      js.customerName.toLowerCase() === cust.name.toLowerCase() ||
      (js.customerMobile && js.customerMobile === cust.mobile)
    );

    setFormData(prev => ({
      ...prev,
      customerName: cust.name,
      customerMobile: cust.mobile,
      vehicleNo: matchedJS ? matchedJS.vehicleNo : prev.vehicleNo
    }));
    setShowSuggestions(false);
  };

  const handleCreateJobSheet = (e) => {
    e.preventDefault();
    const newJobSheet = {
      id: `JS-${String(jobSheets.length + 1).padStart(2, '0')}`,
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      vehicleNo: formData.vehicleNo.toUpperCase(),
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
    if (window.confirm('Are you sure you want to delete this job sheet?')) {
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
    setBillingParts([...billingParts, { id: '', name: '', price: 0, qty: 1 }]);
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
    const newBill = {
      id: `SB-${String(serviceBills.length + 1).padStart(2, '0')}`,
      jobSheetId: js.id,
      customerName: js.customerName,
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

    alert(`Service Invoice ${newBill.id} generated successfully!`);
    setActiveSubTab('service-history');
  };

  const printBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Service Invoice - ${bill.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1f2937; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #059669; margin: 0; font-size: 24px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 14px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
            .table th, .table td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            .table th { background-color: #f9fafb; color: #374151; font-weight: bold; }
            .totals { text-align: right; margin-top: 15px; font-size: 14px; }
            .totals table { margin-left: auto; width: 300px; border-collapse: collapse; }
            .totals td { padding: 6px; }
            .totals .grand-row { font-size: 16px; font-weight: bold; color: #059669; border-top: 2px solid #059669; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NANDHI MOTORS</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Premium Two Wheeler Service & Spares Hub</p>
          </div>
          <div class="meta-grid">
            <div>
              <strong>Customer Details:</strong><br/>
              Name: ${bill.customerName}<br/>
              Vehicle Reg No: ${bill.vehicleNo}<br/>
              Service Type: ${bill.serviceType}
            </div>
            <div style="text-align: right;">
              <strong>Invoice Details:</strong><br/>
              Invoice No: ${bill.id}<br/>
              Job Sheet No: ${bill.jobSheetId}<br/>
              Date: ${bill.date}
            </div>
          </div>
          <h3>Labor & Service Charges</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right; width: 150px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bill.laborItems.map(item => `
                <tr>
                  <td>${item.desc || 'Labor Charge'}</td>
                  <td style="text-align: right;">₹${Number(item.amount).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${bill.parts.length > 0 ? `
            <h3>Spares Used</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th style="text-align: right; width: 100px;">Price</th>
                  <th style="text-align: center; width: 80px;">Qty</th>
                  <th style="text-align: right; width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${bill.parts.map(part => `
                  <tr>
                    <td>${part.name}</td>
                    <td style="text-align: right;">₹${Number(part.price).toLocaleString('en-IN')}</td>
                    <td style="text-align: center;">${part.qty}</td>
                    <td style="text-align: right;">₹${(Number(part.price) * Number(part.qty)).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="totals">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">₹${bill.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td>GST Tax:</td>
                <td style="text-align: right;">+ ₹${bill.gst.toLocaleString('en-IN')}</td>
              </tr>
              ${bill.discount > 0 ? `
                <tr>
                  <td style="color: #ef4444;">Discount:</td>
                  <td style="text-align: right; color: #ef4444;">- ₹${bill.discount.toLocaleString('en-IN')}</td>
                </tr>
              ` : ''}
              ${bill.roundOff !== 0 ? `
                <td>Round Off:</td>
                <td style="text-align: right;">${bill.roundOff > 0 ? '+' : ''} ₹${bill.roundOff}</td>
              ` : ''}
              <tr class="grand-row">
                <td>Grand Total:</td>
                <td style="text-align: right;">₹${bill.grandTotal.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for choosing Nandhi Motors! Ride safely.</p>
            <p>Authorized Mechanical Job Sheet & Billing Printout</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>

      {/* SUBTAB 1: ADD JOB SHEET */}
      {activeSubTab === 'add-jobsheet' && (
        <>
          {/* Summary metrics overview */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stats-card">
              <div className="stats-info">
                <span className="stats-label">Total Job Sheets</span>
                <span className="stats-value">{totalSheets}</span>
              </div>
              <div className="stats-icon" style={{ backgroundColor: '#e0f2fe' }}>
                <Clipboard size={22} color="#0284c7" />
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-info">
                <span className="stats-label">Pending Service</span>
                <span className="stats-value" style={{ color: '#ef4444' }}>{pendingCount}</span>
              </div>
              <div className="stats-icon" style={{ backgroundColor: '#fee2e2' }}>
                <Clock size={22} color="#dc2626" />
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-info">
                <span className="stats-label">In Progress</span>
                <span className="stats-value" style={{ color: '#f59e0b' }}>{inProgressCount}</span>
              </div>
              <div className="stats-icon" style={{ backgroundColor: '#fef3c7' }}>
                <RefreshCw size={22} color="#d97706" />
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-info">
                <span className="stats-label">Completed / Ready</span>
                <span className="stats-value" style={{ color: '#10b981' }}>{readyCount}</span>
              </div>
              <div className="stats-icon" style={{ backgroundColor: '#d1fae5' }}>
                <CheckCircle size={22} color="#059669" />
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
            gap: '24px'
          }}>
            {/* Left Column: Job Sheets Ledger */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">
                  <Wrench size={18} style={{ color: '#059669' }} /> Job Sheets Ledger
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="quick-search">
                    <Search size={14} className="quick-search-icon" />
                    <input
                      type="text"
                      placeholder="Search vehicle / customer..."
                      style={{ width: '180px', padding: '6px 10px 6px 30px', fontSize: '0.8rem' }}
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
                          <th>Status</th>
                          <th>Billing</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredJobSheets.map(js => (
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
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Created: {js.date}</div>
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
                            <td style={{ fontSize: '0.85rem' }}>{Number(js.vehicleKm).toLocaleString('en-IN')} km</td>
                            <td>
                              <span className={`badge ${js.serviceType === 'Free Service' ? 'badge-success' : 'badge-primary'}`} style={{
                                backgroundColor: js.serviceType === 'Free Service' ? '#ecfdf5' : '#eff6ff',
                                color: js.serviceType === 'Free Service' ? '#047857' : '#1d4ed8'
                              }}>
                                {js.serviceType}
                              </span>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                style={{
                                  padding: '2px 6px',
                                  height: 'auto',
                                  fontSize: '0.75rem',
                                  width: '110px',
                                  color: js.status === 'Pending' ? '#dc2626' : js.status === 'In Progress' ? '#d97706' : '#059669',
                                  backgroundColor: js.status === 'Pending' ? '#fee2e2' : js.status === 'In Progress' ? '#fef3c7' : '#ecfdf5',
                                  fontWeight: 600,
                                  border: 'none'
                                }}
                                value={js.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleStatusChange(js.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Ready">Ready</option>
                                <option value="Delivered">Delivered</option>
                              </select>
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
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {js.billingStatus !== 'Billed' && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{
                                      padding: '2px 8px',
                                      minWidth: 'auto',
                                      backgroundColor: '#059669',
                                      color: '#fff'
                                    }}
                                    onClick={() => {
                                      setBillingJobSheetId(js.id);
                                      setActiveSubTab('service-billing');
                                    }}
                                  >
                                    Bill
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '2px 4px', minWidth: 'auto' }}
                                  onClick={() => handleDeleteJobSheet(js.id)}
                                >
                                  <Trash2 size={12} style={{ color: '#ef4444' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '10px' }} />
                    <p>No job sheets found matching search query.</p>
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
                          <strong style={{ fontSize: '0.92rem' }}>{Number(selectedJobSheet.vehicleKm).toLocaleString('en-IN')} km</strong>
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
            {/* Select Job Sheet */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Select Active Job Sheet *</label>
              <select
                className="form-control"
                required
                value={billingJobSheetId}
                onChange={(e) => {
                  setBillingJobSheetId(e.target.value);
                  const matched = jobSheets.find(js => js.id === e.target.value);
                  if (matched) {
                    // Pre-fill fields based on service type
                    if (matched.serviceType === 'Free Service') {
                      setLaborItems([{ desc: 'Free Service Checkup', amount: 0 }]);
                    } else {
                      setLaborItems([{ desc: 'General Service Labor', amount: 350 }]);
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

            {/* LABOR ITEMS */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, margin: 0 }}>
                  1. Labor & Service Works
                </h4>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', minWidth: 'auto' }} onClick={addLaborRow}>
                  + Add Labor
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

            {/* PARTS / SPARES INTEGRATION */}
            <div style={{ marginBottom: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, margin: 0 }}>
                  2. Spares & Parts Issued
                </h4>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', minWidth: 'auto' }} onClick={addPartRow}>
                  + Add Spare Part
                </button>
              </div>

              {billingParts.map((item, idx) => (
                <div className="form-grid" key={idx} style={{ gridTemplateColumns: '1.2fr 130px 100px 40px', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select
                      className="form-control"
                      required
                      value={item.id}
                      onChange={(e) => {
                        const spare = spares.find(s => s.id === e.target.value);
                        if (spare) {
                          const updated = [...billingParts];
                          updated[idx] = {
                            id: spare.id,
                            name: spare.partName,
                            price: spare.sellingPrice || spare.price || 0,
                            qty: item.qty
                          };
                          setBillingParts(updated);
                        }
                      }}
                    >
                      <option value="">-- Choose Spare --</option>
                      {spares.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.partName} - (Stock: {s.stockQty || s.quantity || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Price (₹)"
                      required
                      disabled
                      value={item.price}
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
              ))}
              {billingParts.length === 0 && (
                <div style={{ padding: '10px', fontSize: '0.8rem', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '4px', textAlign: 'center' }}>
                  No spare parts added to this bill.
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
                    placeholder="Enter discount discount"
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
              Complete & Print Invoice
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 3: SERVICE HISTORY */}
      {activeSubTab === 'service-history' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Calendar size={18} style={{ color: '#059669' }} /> Completed Services History
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Total Bills Billed: <strong>{serviceBills.length}</strong>
            </span>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {serviceBills.length > 0 ? (
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
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBills.map(bill => (
                      <tr key={bill.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#059669' }}>{bill.id}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{bill.jobSheetId}</span>
                        </td>
                        <td>
                          <strong>{bill.customerName}</strong>
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
                          ₹{bill.grandTotal.toLocaleString('en-IN')}
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
                <p>No billing invoices generated yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL DIALOG FOR JOB SHEET CREATION */}
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
                  <label className="form-label">Customer Mobile *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="10-digit phone number"
                    required
                    pattern="[0-9]{10}"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  />
                </div>
              </div>

              {/* Vehicle Number & KM */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TN-37-BJ-5120"
                    required
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
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
