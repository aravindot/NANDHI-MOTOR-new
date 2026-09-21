import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Tag,
  Layers,
  Clipboard,
  AlertTriangle,
  Search,
  CheckCircle,
  Edit2,
  Wrench,
  DollarSign,
  Package,
  TrendingUp,
  Percent,
  X
} from 'lucide-react';

export default function SpareInventoryPage({
  spares = [],
  setSpares,
  showPreviews = true
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [selectedSpareId, setSelectedSpareId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpare, setEditingSpare] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    dealerPrice: '',
    gstRate: '18',
    mrp: '',
    location: ''
  });

  const [priceWithGst, setPriceWithGst] = useState(0);

  // Auto-calculate Price with GST
  useEffect(() => {
    const dealer = parseFloat(formData.dealerPrice || 0);
    const gst = parseFloat(formData.gstRate || 0);
    if (!isNaN(dealer) && !isNaN(gst)) {
      const computed = dealer * (1 + gst / 100);
      setPriceWithGst(Math.round(computed * 100) / 100);
    } else {
      setPriceWithGst(0);
    }
  }, [formData.dealerPrice, formData.gstRate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSpares = spares.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const qty = Number(item.quantity ?? item.stock ?? 0);
    const matchSearch =
      !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.id || '').toLowerCase().includes(q) ||
      (item.partNo || '').toLowerCase().includes(q);

    const matchStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'IN_STOCK' && qty >= 5) ||
      (stockFilter === 'LOW_STOCK' && qty > 0 && qty < 5) ||
      (stockFilter === 'OUT_OF_STOCK' && qty === 0);

    return matchSearch && matchStock;
  });

  const activeSpare = spares.find((s) => s.id === selectedSpareId) || (filteredSpares.length > 0 ? filteredSpares[0] : null);

  const handleOpenAdd = () => {
    setEditingSpare(null);
    setFormData({
      name: '',
      quantity: '',
      dealerPrice: '',
      gstRate: '18',
      mrp: '',
      location: 'Rack A-1'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spare) => {
    setEditingSpare(spare);
    setFormData({
      name: spare.name || '',
      quantity: spare.quantity ?? spare.stock ?? 0,
      dealerPrice: spare.dealerPrice ?? spare.unitPrice ?? 0,
      gstRate: String(spare.gstRate || '18'),
      mrp: spare.mrp || Math.round((spare.dealerPrice || 100) * 1.35),
      location: spare.location || 'Rack A-1'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.quantity === '' || formData.dealerPrice === '') {
      alert('Please fill out all required fields.');
      return;
    }

    const qty = parseInt(formData.quantity);
    const dealerPriceVal = parseFloat(formData.dealerPrice);
    const mrpVal = parseFloat(formData.mrp || dealerPriceVal * 1.35);

    if (editingSpare) {
      const updatedList = spares.map((s) =>
        s.id === editingSpare.id
          ? {
              ...s,
              name: formData.name.trim(),
              quantity: qty,
              stock: qty,
              dealerPrice: dealerPriceVal,
              unitPrice: dealerPriceVal,
              gstRate: parseInt(formData.gstRate),
              priceWithGst: priceWithGst,
              mrp: mrpVal,
              location: formData.location
            }
          : s
      );
      setSpares(updatedList);
    } else {
      const nextNum = spares.reduce((max, s) => {
        const n = parseInt((s.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0) + 1;
      const newId = `SP-${String(nextNum).padStart(2, '0')}`;

      const newSpare = {
        id: newId,
        name: formData.name.trim(),
        quantity: qty,
        stock: qty,
        dealerPrice: dealerPriceVal,
        unitPrice: dealerPriceVal,
        gstRate: parseInt(formData.gstRate),
        priceWithGst: priceWithGst,
        mrp: mrpVal,
        location: formData.location,
        createdOn: new Date().toLocaleDateString('en-IN')
      };
      setSpares([newSpare, ...spares]);
      setSelectedSpareId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this spare part from inventory?')) {
      const updated = spares.filter((item) => item.id !== id);
      setSpares(updated);
      if (selectedSpareId === id) {
        setSelectedSpareId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Metric summaries
  const lowStockCount = spares.filter((s) => {
    const q = Number(s.quantity ?? s.stock ?? 0);
    return q < 5;
  }).length;

  const totalInventoryVal = spares.reduce((sum, s) => {
    const q = Number(s.quantity ?? s.stock ?? 0);
    const price = Number(s.dealerPrice ?? s.unitPrice ?? 0);
    return sum + q * price;
  }, 0);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* 2-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px'
        }}
      >
        {/* LEFT COLUMN: Spare Parts Inventory Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Package size={18} style={{ color: '#059669' }} /> Spare Parts Inventory
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search spare name/ID..."
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
                <Plus size={14} /> + Add Spare
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Items</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{spares.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>⚠️ Low Stock</span>
                <strong style={{ fontSize: '0.9rem', color: lowStockCount > 0 ? '#ef4444' : '#059669' }}>{lowStockCount}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>📦 Stock Value</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>₹{totalInventoryVal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              {[
                { key: 'ALL', label: 'All' },
                { key: 'IN_STOCK', label: '✅ In Stock' },
                { key: 'LOW_STOCK', label: '⚠️ Low Stock (<5)' },
                { key: 'OUT_OF_STOCK', label: '❌ Out of Stock' }
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: stockFilter === f.key ? '#059669' : '#d1d5db',
                    backgroundColor: stockFilter === f.key ? '#ecfdf5' : '#ffffff',
                    color: stockFilter === f.key ? '#059669' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: stockFilter === f.key ? 600 : 400
                  }}
                  onClick={() => setStockFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Spare Parts List */}
            {filteredSpares && filteredSpares.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredSpares.map((spare) => {
                  const isSelected = activeSpare && activeSpare.id === spare.id;
                  const qty = Number(spare.quantity ?? spare.stock ?? 0);
                  const isLow = qty > 0 && qty < 5;
                  const isOut = qty === 0;

                  return (
                    <div
                      key={spare.id}
                      onClick={() => setSelectedSpareId(spare.id)}
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
                          <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{spare.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>#{spare.id}</span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isOut ? '#fef2f2' : isLow ? '#fffbeb' : '#ecfdf5',
                            color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669',
                            border: '1px solid',
                            borderColor: isOut ? '#fecaca' : isLow ? '#fde68a' : '#bbf7d0'
                          }}
                        >
                          {isOut ? 'Out of Stock' : `${qty} in Stock`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280', marginTop: '4px' }}>
                        <span>Cost: ₹{Number(spare.dealerPrice ?? spare.unitPrice ?? 0).toLocaleString('en-IN')} (+{spare.gstRate || 18}% GST)</span>
                        <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.82rem' }}>
                          MRP: ₹{Number(spare.mrp || Math.round((spare.dealerPrice || 100) * 1.35)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Package size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No spare parts match your filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Spare Part Dossier & Calculation Sheet */}
        {showPreviews && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <Clipboard size={18} style={{ color: '#059669' }} /> Spare Part Specification Sheet
              </h3>
              {activeSpare && (
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Part #{activeSpare.id}
                </span>
              )}
            </div>

            <div className="card-body">
              {activeSpare ? (
                <div className="invoice-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                    <div>
                      <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                      <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                        Genuine Spare Parts & Inventory Dossier
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
                        GENUINE OEM SPARE
                      </span>
                      <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                        Location: <strong>{activeSpare.location || 'Rack A-1'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Info Grid */}
                  <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                    <div>
                      <div className="section-title">Component Particulars</div>
                      <p><strong>Part Name:</strong> {activeSpare.name}</p>
                      <p><strong>Part Number / ID:</strong> {activeSpare.partNo || activeSpare.id}</p>
                      <p><strong>Current Stock:</strong> {Number(activeSpare.quantity ?? activeSpare.stock ?? 0)} Units</p>
                      <p><strong>Reorder Threshold:</strong> 5 Units</p>
                    </div>

                    <div>
                      <div className="section-title">Pricing & Margins</div>
                      <p><strong>Dealer Base Cost:</strong> ₹{Number(activeSpare.dealerPrice ?? activeSpare.unitPrice ?? 0).toLocaleString('en-IN')}</p>
                      <p><strong>GST Applicable:</strong> {activeSpare.gstRate || 18}%</p>
                      <p><strong>Cost with GST:</strong> ₹{Math.round(Number(activeSpare.dealerPrice ?? activeSpare.unitPrice ?? 0) * (1 + (Number(activeSpare.gstRate) || 18) / 100)).toLocaleString('en-IN')}</p>
                      <p><strong>Showroom MRP:</strong> ₹{Number(activeSpare.mrp || Math.round((activeSpare.dealerPrice || 100) * 1.35)).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Profit Margin Highlight Banner */}
                  {(() => {
                    const cost = Math.round(Number(activeSpare.dealerPrice ?? activeSpare.unitPrice ?? 0) * (1 + (Number(activeSpare.gstRate) || 18) / 100));
                    const mrp = Number(activeSpare.mrp || Math.round((activeSpare.dealerPrice || 100) * 1.35));
                    const margin = mrp - cost;
                    const marginPct = cost > 0 ? Math.round((margin / cost) * 100) : 0;

                    return (
                      <div
                        style={{
                          margin: '16px 0',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div>
                          <span style={{ color: '#047857', fontWeight: 600 }}>Estimated Dealer Margin per Unit:</span>
                          <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>Based on Showroom Retail MRP</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '1rem', color: '#059669' }}>+₹{margin > 0 ? margin.toLocaleString('en-IN') : 0}</strong>
                          <span style={{ fontSize: '0.74rem', color: '#047857', marginLeft: '6px' }}>({marginPct}%)</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                      onClick={() => handleOpenEdit(activeSpare)}
                    >
                      <Edit2 size={14} /> Edit Spare Part
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                      onClick={() => handleDelete(activeSpare.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                  <Package size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                  <p>Select a spare part from the inventory on the left to preview.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Spare Modal */}
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
                <Package size={18} color="#059669" />
                {editingSpare ? `Edit Spare Part #${editingSpare.id}` : 'Add New Spare Part'}
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
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Spare Part Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Stock Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    required
                    min="0"
                    
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Rack / Bin Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dealer Cost (Ex-Tax) *</label>
                  <input
                    type="number"
                    name="dealerPrice"
                    className="form-control"
                    required
                    
                    value={formData.dealerPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>GST Rate (%)</label>
                  <select
                    name="gstRate"
                    className="form-control"
                    maxLength={15} value={formData.gstRate}
                    onChange={handleInputChange}
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Showroom Retail MRP (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    className="form-control"
                    required
                    
                    value={formData.mrp}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {priceWithGst > 0 && (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginTop: '12px',
                    fontSize: '0.78rem'
                  }}
                >
                  💡 <strong>Calculated Purchase Cost with GST:</strong> ₹{priceWithGst.toLocaleString('en-IN')}
                </div>
              )}

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
                  <CheckCircle size={15} /> {editingSpare ? 'Update Spare Part' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
