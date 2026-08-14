import React, { useState } from 'react';
import { Plus, Trash2, Clipboard, ShoppingCart, Layers, Printer } from 'lucide-react';
import PrintPreviewModal from '../PrintPreviewModal';

export default function PurchasePage({
  activeSubTab,
  purchaseInvoices = [],
  setPurchaseInvoices,
  spares = [],
  setSpares
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'purchase', data: null });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSpareModalOpen, setIsSpareModalOpen] = useState(false);

  // Form states for vehicle purchase
  const [vehFormData, setVehFormData] = useState({
    supplierName: '',
    supplierGst: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    model: '',
    color: 'Black',
    qty: 1,
    unitPrice: '',
    gstRate: 5
  });

  // Form states for spares purchase
  const [spareFormData, setSpareFormData] = useState({
    supplierName: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    spareId: '', // For existing spares
    newPartName: '', // For write-in if new
    qty: 1,
    unitPrice: '',
    gstRate: 18
  });

  // Calculations for Vehicle Purchase
  const getVehTotals = () => {
    const base = Number(vehFormData.unitPrice || 0) * Number(vehFormData.qty || 1);
    const gst = Math.round(base * (Number(vehFormData.gstRate) / 100));
    const grand = base + gst;
    return { base, gst, grand };
  };

  // Calculations for Spares Purchase
  const getSpareTotals = () => {
    const base = Number(spareFormData.unitPrice || 0) * Number(spareFormData.qty || 1);
    const gst = Math.round(base * (Number(spareFormData.gstRate) / 100));
    const grand = base + gst;
    return { base, gst, grand };
  };

  const handleVehiclePurchaseSubmit = (e) => {
    e.preventDefault();
    const totals = getVehTotals();
    const newInvoice = {
      id: `PUR-${String(purchaseInvoices.length + 1).padStart(2, '0')}`,
      purchaseType: 'Vehicle Purchases',
      supplierName: vehFormData.supplierName,
      supplierGst: vehFormData.supplierGst.toUpperCase(),
      invoiceNo: vehFormData.invoiceNo,
      date: vehFormData.date,
      itemDetails: `${vehFormData.qty}x ${vehFormData.model} (${vehFormData.color})`,
      qty: Number(vehFormData.qty),
      unitPrice: Number(vehFormData.unitPrice),
      gstRate: Number(vehFormData.gstRate),
      gstAmount: totals.gst,
      totalAmount: totals.grand
    };

    setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
    setVehFormData({
      supplierName: '',
      supplierGst: '',
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      model: '',
      color: 'Black',
      qty: 1,
      unitPrice: '',
      gstRate: 5
    });
    setIsVehicleModalOpen(false);
    alert('Vehicle Purchase Invoice recorded successfully!');
  };

  const handleSparePurchaseSubmit = (e) => {
    e.preventDefault();
    const totals = getSpareTotals();

    // Identify part details
    let partName = '';
    let targetSpareId = spareFormData.spareId;

    if (targetSpareId === 'NEW') {
      partName = spareFormData.newPartName;
    } else {
      const match = spares.find(s => s.id === targetSpareId);
      partName = match ? match.name : '';
    }

    const newInvoice = {
      id: `PUR-${String(purchaseInvoices.length + 1).padStart(2, '0')}`,
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

    setPurchaseInvoices([newInvoice, ...purchaseInvoices]);

    // INCREMENT INVENTORY QUANTITY OR ADD NEW ITEM
    if (targetSpareId === 'NEW') {
      const newSpareItem = {
        id: `SP-${String(spares.length + 1).padStart(2, '0')}`,
        name: partName,
        quantity: Number(spareFormData.qty),
        dealerPrice: Number(spareFormData.unitPrice),
        gstRate: String(spareFormData.gstRate),
        mrp: Math.round(Number(spareFormData.unitPrice) * 1.35) // Estimate 35% margin for MRP
      };
      setSpares([newSpareItem, ...spares]);
    } else {
      setSpares(spares.map(s => {
        if (s.id === targetSpareId) {
          return {
            ...s,
            quantity: Number(s.quantity || 0) + Number(spareFormData.qty),
            dealerPrice: Number(spareFormData.unitPrice) // Update with latest purchase cost
          };
        }
        return s;
      }));
    }

    // Reset State
    setSpareFormData({
      supplierName: '',
      invoiceNo: '',
      date: new Date().toISOString().split('T')[0],
      spareId: '',
      newPartName: '',
      qty: 1,
      unitPrice: '',
      gstRate: 18
    });
    setIsSpareModalOpen(false);
    alert('Spare Parts Purchase recorded and stock quantity auto-incremented!');
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to remove this purchase invoice?')) {
      setPurchaseInvoices(purchaseInvoices.filter(p => p.id !== id));
    }
  };

  const handlePrintPurchase = (item) => {
    setPrintModalConfig({ isOpen: true, type: 'purchase', data: item });
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      
      {/* SUBTAB 1: VEHICLE PURCHASE */}
      {activeSubTab === 'vehicle-purchase' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <ShoppingCart size={18} style={{ color: '#059669' }} /> Vehicle Purchase Invoices
            </h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsVehicleModalOpen(true)}
            >
              <Plus size={14} style={{ marginRight: '4px' }} /> Record Vehicle Purchase
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {purchaseInvoices.filter(p => p.purchaseType === 'Vehicle Purchases').length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Supplier Name</th>
                      <th>Supplier GSTIN</th>
                      <th>Supplier Inv No</th>
                      <th>Purchase Date</th>
                      <th>Vehicle Purchased</th>
                      <th style={{ textAlign: 'right' }}>Tax Cost (GST)</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseInvoices
                      .filter(p => p.purchaseType === 'Vehicle Purchases')
                      .map(p => (
                        <tr key={p.id}>
                          <td>
                            <span style={{ fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>{p.id}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.supplierName}</td>
                          <td style={{ fontFamily: 'monospace' }}>{p.supplierGst || '--'}</td>
                          <td style={{ fontWeight: 600 }}>{p.invoiceNo}</td>
                          <td>{p.date.split('-').reverse().join('/')}</td>
                          <td>{p.itemDetails}</td>
                          <td style={{ textAlign: 'right', color: '#6b7280' }}>₹{p.gstAmount.toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
                            ₹{p.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', minWidth: 'auto' }}
                                title="Print Purchase Voucher"
                                onClick={() => handlePrintPurchase(p)}
                              >
                                <Printer size={13} style={{ color: '#059669' }} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', minWidth: 'auto' }}
                                title="Delete Purchase Record"
                                onClick={() => handleDeleteInvoice(p.id)}
                              >
                                <Trash2 size={13} style={{ color: '#ef4444' }} />
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
                <p>No vehicle purchase invoices logged.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SPARE PARTS PURCHASE */}
      {activeSubTab === 'spare-purchase' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Layers size={18} style={{ color: '#0284c7' }} /> Spare Parts Purchase Invoices
            </h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsSpareModalOpen(true)}
            >
              <Plus size={14} style={{ marginRight: '4px' }} /> Record Spares Purchase
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {purchaseInvoices.filter(p => p.purchaseType === 'Spare Purchases').length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Supplier Name</th>
                      <th>Supplier Inv No</th>
                      <th>Purchase Date</th>
                      <th>Spares Issued</th>
                      <th style={{ textAlign: 'right' }}>Tax (GST)</th>
                      <th style={{ textAlign: 'right' }}>Total Amount</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseInvoices
                      .filter(p => p.purchaseType === 'Spare Purchases')
                      .map(p => (
                        <tr key={p.id}>
                          <td>
                            <span style={{ fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>{p.id}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.supplierName}</td>
                          <td style={{ fontWeight: 600 }}>{p.invoiceNo}</td>
                          <td>{p.date.split('-').reverse().join('/')}</td>
                          <td>{p.itemDetails}</td>
                          <td style={{ textAlign: 'right', color: '#6b7280' }}>₹{p.gstAmount.toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
                            ₹{p.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', minWidth: 'auto' }}
                                title="Print Spare Purchase Voucher"
                                onClick={() => handlePrintPurchase(p)}
                              >
                                <Printer size={13} style={{ color: '#059669' }} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', minWidth: 'auto' }}
                                title="Delete Record"
                                onClick={() => handleDeleteInvoice(p.id)}
                              >
                                <Trash2 size={13} style={{ color: '#ef4444' }} />
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
                <p>No spare parts purchase invoices logged.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD VEHICLE PURCHASE MODAL */}
      {isVehicleModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, backdropFilter: 'blur(3px)'
        }} onClick={() => setIsVehicleModalOpen(false)}>
          <div className="card" style={{
            width: '95%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <ShoppingCart size={18} style={{ color: '#059669' }} /> Record Vehicle Purchase Invoice
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsVehicleModalOpen(false)}>✕ Close</button>
            </div>
            
            <form className="card-body" onSubmit={handleVehiclePurchaseSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Honda India Pvt Ltd"
                    value={vehFormData.supplierName}
                    onChange={(e) => setVehFormData({ ...vehFormData, supplierName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier GSTIN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="15-digit GST"
                    maxLength="15"
                    value={vehFormData.supplierGst}
                    onChange={(e) => setVehFormData({ ...vehFormData, supplierGst: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Supplier Invoice No *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Supplier reference bill no"
                    value={vehFormData.invoiceNo}
                    onChange={(e) => setVehFormData({ ...vehFormData, invoiceNo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={vehFormData.date}
                    onChange={(e) => setVehFormData({ ...vehFormData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Model Choice *</label>
                  <select
                    className="form-control"
                    required
                    value={vehFormData.model}
                    onChange={(e) => setVehFormData({ ...vehFormData, model: e.target.value })}
                  >
                    <option value="">-- Choose Model --</option>
                    <option value="Honda Activa 6G">Honda Activa 6G</option>
                    <option value="Honda Shine 125">Honda Shine 125</option>
                    <option value="Honda SP 125">Honda SP 125</option>
                    <option value="Honda Unicorn">Honda Unicorn</option>
                    <option value="Ola S1 Pro (Electric)">Ola S1 Pro (Electric)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={vehFormData.color}
                    onChange={(e) => setVehFormData({ ...vehFormData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Unit Price Ex-GST (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    placeholder="Enter ex-tax cost"
                    value={vehFormData.unitPrice}
                    onChange={(e) => setVehFormData({ ...vehFormData, unitPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity Purchased *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    value={vehFormData.qty}
                    onChange={(e) => setVehFormData({ ...vehFormData, qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Rate (%) *</label>
                <select
                  className="form-control"
                  required
                  value={vehFormData.gstRate}
                  onChange={(e) => setVehFormData({ ...vehFormData, gstRate: Number(e.target.value) })}
                >
                  <option value="5">5% EV Standard Tax</option>
                  <option value="12">12% Parts Tax</option>
                  <option value="28">28% High Rate (ICE Vehicles)</option>
                  <option value="0">0% Exempted</option>
                </select>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.88rem' }}>Grand Total Cost (Tax Included):</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#b91c1c' }}>
                  ₹{getVehTotals().grand.toLocaleString('en-IN')}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', fontWeight: 600, marginTop: '16px' }}>
                Save Purchase Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECORD SPARES PURCHASE MODAL */}
      {isSpareModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, backdropFilter: 'blur(3px)'
        }} onClick={() => setIsSpareModalOpen(false)}>
          <div className="card" style={{
            width: '95%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <Layers size={18} style={{ color: '#0284c7' }} /> Record Spare Parts Purchase Invoice
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsSpareModalOpen(false)}>✕ Close</button>
            </div>
            
            <form className="card-body" onSubmit={handleSparePurchaseSubmit}>
              <div className="form-group">
                <label className="form-label">Supplier Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Anand Automotive Spares"
                  value={spareFormData.supplierName}
                  onChange={(e) => setSpareFormData({ ...spareFormData, supplierName: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Supplier Invoice No *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Bill number reference"
                    value={spareFormData.invoiceNo}
                    onChange={(e) => setSpareFormData({ ...spareFormData, invoiceNo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={spareFormData.date}
                    onChange={(e) => setSpareFormData({ ...spareFormData, date: e.target.value })}
                  />
                </div>
              </div>

              {/* Select or create Spare Part */}
              <div className="form-group">
                <label className="form-label">Spare Part Selection *</label>
                <select
                  className="form-control"
                  required
                  value={spareFormData.spareId}
                  onChange={(e) => setSpareFormData({ ...spareFormData, spareId: e.target.value })}
                >
                  <option value="">-- Choose Part --</option>
                  <option value="NEW">+ Register New Spare Item</option>
                  {spares.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - (Stock: {s.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional New Part Name field */}
              {spareFormData.spareId === 'NEW' && (
                <div className="form-group">
                  <label className="form-label">New Spare Part Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. Brake Shoe Set Activa 6G"
                    value={spareFormData.newPartName}
                    onChange={(e) => setSpareFormData({ ...spareFormData, newPartName: e.target.value })}
                  />
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Unit Price Ex-GST (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    placeholder="Supplier unit price cost"
                    value={spareFormData.unitPrice}
                    onChange={(e) => setSpareFormData({ ...spareFormData, unitPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity Purchased *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    value={spareFormData.qty}
                    onChange={(e) => setSpareFormData({ ...spareFormData, qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Rate (%) *</label>
                <select
                  className="form-control"
                  required
                  value={spareFormData.gstRate}
                  onChange={(e) => setSpareFormData({ ...spareFormData, gstRate: Number(e.target.value) })}
                >
                  <option value="18">18% Accessories / Spares Tax</option>
                  <option value="12">12% Parts Standard Tax</option>
                  <option value="0">0% Exempted</option>
                </select>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.88rem' }}>Grand Total Cost (Tax Included):</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#b91c1c' }}>
                  ₹{getSpareTotals().grand.toLocaleString('en-IN')}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', fontWeight: 600, marginTop: '16px' }}>
                Record Purchase & Update Stock
              </button>
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
