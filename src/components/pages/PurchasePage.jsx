import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Clipboard,
  ShoppingCart,
  Layers,
  Printer,
  Search,
  CheckCircle,
  FileText,
  IndianRupee,
  Package,
  Bike,
  Building,
  Calendar,
  X
} from 'lucide-react';
import PrintPreviewModal from '../PrintPreviewModal';

export default function PurchasePage({
  activeSubTab = 'vehicle-purchase',
  setActiveSubTab,
  purchaseInvoices = [],
  setPurchaseInvoices,
  spares = [],
  setSpares,
  vehicles = [],
  showPreviews = true,
  companyProfile
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'purchase', data: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSpareModalOpen, setIsSpareModalOpen] = useState(false);

  // Form states for vehicle purchase
  const [vehFormData, setVehFormData] = useState({
    supplierName: '',
    supplierGst: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    model: '',
    color: '',
    qty: '',
    unitPrice: '',
    gstRate: 5
  });

  // Form states for spares purchase
  const [spareFormData, setSpareFormData] = useState({
    supplierName: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    spareId: '',
    newPartName: '',
    qty: 10,
    unitPrice: 220,
    gstRate: 18
  });

  // Calculations
  

  const handleEditInvoice = (inv) => {
    setEditingPurchaseId(inv.id);
    if (inv.purchaseType === 'Vehicle Purchases') {
      setVehFormData({
        supplierName: inv.supplierName || '',
        supplierGst: inv.supplierGst || '',
        invoiceNo: inv.invoiceNo || '',
        date: inv.date || new Date().toISOString().split('T')[0],
        model: inv.itemDetails?.replace(/\dx /, '').split(' (')[0] || 'Activa 6G',
        color: inv.itemDetails?.includes('(') ? inv.itemDetails.split('(')[1].replace(')', '') : 'Matte Blue',
        qty: inv.qty || 1,
        unitPrice: inv.unitPrice || 0,
        gstRate: inv.gstRate || 5
      });
      setIsVehicleModalOpen(true);
    } else {
      setSpareFormData({
        supplierName: inv.supplierName || '',
        invoiceNo: inv.invoiceNo || '',
        date: inv.date || new Date().toISOString().split('T')[0],
        spareId: inv.partCode || 'NEW',
        newPartName: inv.itemDetails || '',
        qty: inv.qty || 1,
        unitPrice: inv.unitPrice || 0,
        gstRate: inv.gstRate || 18
      });
      setIsSpareModalOpen(true);
    }
  };

  const getVehTotals = () => {
    const base = Number(vehFormData.unitPrice || 0) * Number(vehFormData.qty || 1);
    const gst = Math.round(base * (Number(vehFormData.gstRate) / 100));
    const grand = base + gst;
    return { base, gst, grand };
  };

  const getSpareTotals = () => {
    const base = Number(spareFormData.unitPrice || 0) * Number(spareFormData.qty || 1);
    const gst = Math.round(base * (Number(spareFormData.gstRate) / 100));
    const grand = base + gst;
    return { base, gst, grand };
  };

  const handleVehiclePurchaseSubmit = (e) => {
    e.preventDefault();
    const totals = getVehTotals();
    const nextNum = purchaseInvoices.reduce((max, p) => {
      const n = parseInt((p.id || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const newId = `PUR-${String(nextNum).padStart(2, '0')}`;

    
    
    const newInvoice = {
      id: editingPurchaseId || newId,
      purchaseType: 'Spare Purchases',
      supplierName: spareFormData.supplierName,
      supplierGst: '',
      invoiceNo: spareFormData.invoiceNo,
      date: spareFormData.date,
      itemDetails: partName,
      partCode: targetSpareId,
      qty: Number(spareFormData.qty),
      unitPrice: Number(spareFormData.unitPrice),
      gstRate: Number(spareFormData.gstRate),
      gstAmount: totals.gst,
      totalAmount: totals.grand
    };

    if (editingPurchaseId) {
      setPurchaseInvoices(prev => prev.map(inv => inv.id === editingPurchaseId ? newInvoice : inv));
      setEditingPurchaseId(null);
    } else {
      setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
      setSelectedInvoiceId(newId);
    }

    setVehFormData({
      supplierName: '',
      supplierGst: '',
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      model: 'Activa 6G',
      color: 'Matte Blue',
      qty: 1,
      unitPrice: 75000,
      gstRate: 5
    });
    setIsVehicleModalOpen(false); setEditingPurchaseId(null);
  };

  const handleSparePurchaseSubmit = (e) => {
    e.preventDefault();
    const totals = getSpareTotals();

    let partName = '';
    let targetSpareId = spareFormData.spareId;

    if (targetSpareId === 'NEW' || !targetSpareId) {
      partName = spareFormData.newPartName || 'Custom Spare Part';
    } else {
      const match = spares.find((s) => s.id === targetSpareId);
      partName = match ? match.name : spareFormData.newPartName;
    }

    const nextNum = purchaseInvoices.reduce((max, p) => {
      const n = parseInt((p.id || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const newId = `PUR-${String(nextNum).padStart(2, '0')}`;

    const newInvoice = {
      id: newId,
      purchaseType: 'Spare Purchases',
      supplierName: spareFormData.supplierName,
      supplierGst: '',
      invoiceNo: spareFormData.invoiceNo,
      date: spareFormData.date,
      itemDetails: `${spareFormData.qty}x ${partName}`,
      qty: Number(spareFormData.qty),
      unitPrice: Number(spareFormData.unitPrice),
      gstRate: Number(spareFormData.gstRate),
      gstAmount: totals.gst,
      totalAmount: totals.grand
    };

    if (editingPurchaseId) {
      setPurchaseInvoices(prev => prev.map(inv => inv.id === editingPurchaseId ? newInvoice : inv));
      setEditingPurchaseId(null);
    } else {
      setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
      setSelectedInvoiceId(newId);
    }

    // Auto update spares stock
    if (targetSpareId === 'NEW' || !targetSpareId) {
      const newSpareItem = {
        id: `SP-${String(spares.length + 1).padStart(2, '0')}`,
        name: partName,
        quantity: Number(spareFormData.qty),
        stock: Number(spareFormData.qty),
        dealerPrice: Number(spareFormData.unitPrice),
        unitPrice: Number(spareFormData.unitPrice),
        gstRate: Number(spareFormData.gstRate),
        mrp: Math.round(Number(spareFormData.unitPrice) * 1.35)
      };
      setSpares([newSpareItem, ...spares]);
    } else {
      setSpares(
        spares.map((s) => {
          if (s.id === targetSpareId) {
            const currentQty = Number(s.quantity ?? s.stock ?? 0);
            return {
              ...s,
              quantity: currentQty + Number(spareFormData.qty),
              stock: currentQty + Number(spareFormData.qty),
              dealerPrice: Number(spareFormData.unitPrice)
            };
          }
          return s;
        })
      );
    }

    setSpareFormData({
      supplierName: '',
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      spareId: '',
      newPartName: '',
      qty: 10,
      unitPrice: 220,
      gstRate: 18
    });
    setIsSpareModalOpen(false); setEditingPurchaseId(null);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to remove this purchase invoice?')) {
      const updated = purchaseInvoices.filter((p) => p.id !== id);
      setPurchaseInvoices(updated);
      if (selectedInvoiceId === id) {
        setSelectedInvoiceId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const handlePrintPurchase = (item) => {
    setPrintModalConfig({ isOpen: true, type: 'purchase', data: item });
  };

  const currentType = activeSubTab === 'spare-purchase' ? 'Spare Purchases' : 'Vehicle Purchases';
  const filteredList = purchaseInvoices.filter((p) => {
    const isCorrectType = p.purchaseType === currentType;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      (p.supplierName || '').toLowerCase().includes(q) ||
      (p.invoiceNo || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.itemDetails || '').toLowerCase().includes(q);

    return isCorrectType && matchQuery;
  });

  const activeInvoice =
    purchaseInvoices.find((p) => p.id === selectedInvoiceId && p.purchaseType === currentType) ||
    (filteredList.length > 0 ? filteredList[0] : null);

  const totalSpent = filteredList.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const totalGst = filteredList.reduce((sum, p) => sum + (Number(p.gstAmount) || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Sub Tabs */}
      <div className="sub-tabs-container">
        <span
          className={`sub-tab ${activeSubTab === 'vehicle-purchase' ? 'active' : ''}`}
          onClick={() => setActiveSubTab && setActiveSubTab('vehicle-purchase')}
        >
          <Bike size={14} style={{ marginRight: '6px' }} /> Vehicle Purchases
        </span>
        <span
          className={`sub-tab ${activeSubTab === 'spare-purchase' ? 'active' : ''}`}
          onClick={() => setActiveSubTab && setActiveSubTab('spare-purchase')}
        >
          <Package size={14} style={{ marginRight: '6px' }} /> Spare Parts Purchases
        </span>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.4fr 1fr' : '1fr',
          gap: '20px',
          marginTop: '16px'
        }}
      >
        {/* LEFT COLUMN: Purchase Invoices Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <ShoppingCart size={18} style={{ color: '#059669' }} />{' '}
              {activeSubTab === 'spare-purchase' ? 'Spare Purchases Ledger' : 'Vehicle Purchases Ledger'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search supplier / inv..."
                  style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => (activeSubTab === 'spare-purchase' ? setIsSpareModalOpen(true) : setIsVehicleModalOpen(true))}
              >
                <Plus size={14} /> + Record Purchase
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoices</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{filteredList.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🏛️ Input GST</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>₹{totalGst.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>💳 Total Invoiced</span>
                <strong style={{ fontSize: '0.9rem', color: '#b91c1c' }}>₹{totalSpent.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* List of Invoices */}
            {filteredList && filteredList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredList.map((inv) => {
                  const isSelected = activeInvoice && activeInvoice.id === inv.id;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
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
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{inv.supplierName}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>#{inv.id}</span>
                        </div>

                        <span style={{ fontSize: '0.74rem', color: '#6b7280', fontWeight: 500 }}>
                          Inv: <strong>{inv.invoiceNo}</strong>
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#4b5563', marginBottom: '4px' }}>
                        {inv.itemDetails}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280' }}>
                        <span>Date: {inv.date ? inv.date.split('-').reverse().join('/') : 'Recent'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleEditInvoice(inv); }}
                            style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Edit Invoice"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(inv.id); }}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Invoice"
                          >
                            <Trash2 size={14} />
                          </button>
                          <strong style={{ fontSize: '0.88rem', color: '#b91c1c' }}>
                            ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <ShoppingCart size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No purchase invoices recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Purchase Voucher & Document Preview */}
        {showPreviews && (
          <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Clipboard size={18} style={{ color: '#059669' }} /> Inbound Purchase Voucher
            </h3>
            {activeInvoice && (
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Voucher #{activeInvoice.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleEditInvoice(activeInvoice)}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '2px' }}
                  title="Edit Invoice"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteInvoice(activeInvoice.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  title="Delete Invoice"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            )}
          </div>

          <div className="card-body">
            {activeInvoice ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>{companyProfile?.name || 'NANDHI MOTORS'}</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Inbound Goods Receipt & Purchase Voucher
                    </p>
                    {companyProfile?.address && (
                      <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '2px 0 0' }}>
                        {companyProfile.address}
                      </p>
                    )}
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
                      TAX INVOICE RECORDED
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                      Date: <strong>{activeInvoice.date ? activeInvoice.date.split('-').reverse().join('/') : 'Recent'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Supplier Particulars</div>
                    <p><strong>Supplier Name:</strong> {activeInvoice.supplierName}</p>
                    <p><strong>Supplier GSTIN:</strong> {activeInvoice.supplierGst || 'N/A'}</p>
                    <p><strong>Supplier Invoice Ref:</strong> {activeInvoice.invoiceNo}</p>
                    <p><strong>Category:</strong> {activeInvoice.purchaseType}</p>
                  </div>

                  <div>
                    <div className="section-title">Invoiced Item & Valuation</div>
                    <p><strong>Item Acquired:</strong> {activeInvoice.itemDetails}</p>
                    <p><strong>Quantity:</strong> {activeInvoice.qty || 1} Units</p>
                    <p><strong>Unit Base Rate:</strong> ₹{Number(activeInvoice.unitPrice || 0).toLocaleString('en-IN')}</p>
                    <p><strong>GST ({activeInvoice.gstRate || 5}%):</strong> ₹{Number(activeInvoice.gstAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Grand Total Box */}
                <div
                  style={{
                    margin: '16px 0',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#991b1b' }}>Total Invoice Expenditure:</span>
                  <strong style={{ fontSize: '1.25rem', color: '#b91c1c' }}>
                    ₹{Number(activeInvoice.totalAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handlePrintPurchase(activeInvoice)}
                  >
                    <Printer size={14} /> Print Voucher
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleDeleteInvoice(activeInvoice.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <ShoppingCart size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select a purchase invoice from the ledger on the left to preview.</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Vehicle Purchase Modal */}
      {isVehicleModalOpen && (
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
              maxWidth: '540px',
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
                <Bike size={18} color="#059669" /> Record Vehicle Purchase Invoice
              </h4>
              <button
                type="button"
                onClick={() => { setIsVehicleModalOpen(false); setEditingPurchaseId(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVehiclePurchaseSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Supplier / Manufacturer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={vehFormData.supplierName}
                    onChange={(e) => setVehFormData({ ...vehFormData, supplierName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Supplier GSTIN</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    maxLength={15} value={vehFormData.supplierGst}
                    onChange={(e) => setVehFormData({ ...vehFormData, supplierGst: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Supplier Invoice No *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={vehFormData.invoiceNo}
                    onChange={(e) => setVehFormData({ ...vehFormData, invoiceNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purchase Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={vehFormData.date}
                    onChange={(e) => setVehFormData({ ...vehFormData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Model</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={vehFormData.model}
                    onChange={(e) => setVehFormData({ ...vehFormData, model: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    required
                    value={vehFormData.qty}
                    onChange={(e) => setVehFormData({ ...vehFormData, qty: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Unit Dealer Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={vehFormData.unitPrice}
                    onChange={(e) => setVehFormData({ ...vehFormData, unitPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#065f46' }}>
                  Base: ₹{getVehTotals().base.toLocaleString('en-IN')} + 5% GST (₹{getVehTotals().gst.toLocaleString('en-IN')})
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>
                  Total: ₹{getVehTotals().grand.toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsVehicleModalOpen(false); setEditingPurchaseId(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle size={15} /> Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spare Purchase Modal */}
      {isSpareModalOpen && (
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
              maxWidth: '540px',
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
                <Package size={18} color="#059669" /> Record Spare Parts Purchase Invoice
              </h4>
              <button
                type="button"
                onClick={() => { setIsSpareModalOpen(false); setEditingPurchaseId(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSparePurchaseSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Supplier Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={spareFormData.supplierName}
                    onChange={(e) => setSpareFormData({ ...spareFormData, supplierName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Supplier Invoice No *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    
                    value={spareFormData.invoiceNo}
                    onChange={(e) => setSpareFormData({ ...spareFormData, invoiceNo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purchase Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={spareFormData.date}
                    onChange={(e) => setSpareFormData({ ...spareFormData, date: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Existing Spare or Add New</label>
                  <select
                    className="form-control"
                    value={spareFormData.spareId}
                    onChange={(e) => setSpareFormData({ ...spareFormData, spareId: e.target.value })}
                  >
                    <option value="NEW">+ Write-In New Spare Part</option>
                    {spares.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Current Stock: {s.quantity ?? s.stock ?? 0})
                      </option>
                    ))}
                  </select>
                </div>

                {(spareFormData.spareId === 'NEW' || !spareFormData.spareId) && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Spare Part Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      value={spareFormData.newPartName}
                      onChange={(e) => setSpareFormData({ ...spareFormData, newPartName: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quantity Purchased *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    required
                    value={spareFormData.qty}
                    onChange={(e) => setSpareFormData({ ...spareFormData, qty: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Unit Dealer Cost (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    value={spareFormData.unitPrice}
                    onChange={(e) => setSpareFormData({ ...spareFormData, unitPrice: e.target.value })}
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#065f46' }}>
                  Base: ₹{getSpareTotals().base.toLocaleString('en-IN')} + 18% GST (₹{getSpareTotals().gst.toLocaleString('en-IN')})
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#047857' }}>
                  Total: ₹{getSpareTotals().grand.toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsSpareModalOpen(false); setEditingPurchaseId(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <CheckCircle size={15} /> Record & Auto-Increment Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printModalConfig.isOpen && (
        <PrintPreviewModal
          isOpen={printModalConfig.isOpen}
          onClose={() => setPrintModalConfig({ isOpen: false, type: 'purchase', data: null })}
          type={printModalConfig.type}
          data={printModalConfig.data}
          companyProfile={{ ...companyProfile, printSettings: companyProfile?.printSettings || readPrintSettingsFromStorage() }}
        />
      )}
    </div>
  );
}
