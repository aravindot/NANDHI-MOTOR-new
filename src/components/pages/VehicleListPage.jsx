import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Tag,
  Layers,
  Palette,
  FileCode,
  Upload,
  Image as ImageIcon,
  Search,
  CheckCircle,
  Edit2,
  Bike,
  Sparkles,
  Calculator,
  IndianRupee,
  X
} from 'lucide-react';

export default function VehicleListPage({ vehicles = [], setVehicles, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: '',
    hsnCode: '',
    price: '',
    image: ''
  });

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.brand || '').toLowerCase().includes(q) ||
      (v.id || '').toLowerCase().includes(q) ||
      (v.hsnCode || '').toLowerCase().includes(q) ||
      (v.color || '').toLowerCase().includes(q);

    const matchColor = colorFilter === 'ALL' || (v.color && v.color.toLowerCase().includes(colorFilter.toLowerCase()));
    return matchSearch && matchColor;
  });

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || (filteredVehicles.length > 0 ? filteredVehicles[0] : null);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      color: '',
      hsnCode: '',
      price: '',
      image: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (veh) => {
    setEditingVehicle(veh);
    setFormData({
      brand: veh.brand || '',
      model: veh.model || '',
      color: veh.color || '',
      hsnCode: veh.hsnCode || '',
      price: veh.price || '',
      image: veh.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingVehicle) {
      const updatedList = vehicles.map((v) =>
        v.id === editingVehicle.id
          ? {
              ...v,
              ...formData,
              id: v.id,
              price: Number(formData.price || 0)
            }
          : v
      );
      setVehicles(updatedList);
    } else {
      const nextNum = vehicles.reduce((max, v) => {
        const n = parseInt((v.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0) + 1;
      const newId = `VEH-${String(nextNum).padStart(2, '0')}`;

      const newVehicle = {
        ...formData,
        id: newId,
        price: Number(formData.price || 0),
        createdOn: new Date().toLocaleDateString('en-IN')
      };
      setVehicles([newVehicle, ...vehicles]);
      setSelectedVehicleId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this vehicle from the showroom catalog?')) {
      const updated = vehicles.filter((v) => v.id !== id);
      setVehicles(updated);
      if (selectedVehicleId === id) {
        setSelectedVehicleId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  const allColors = Array.from(new Set(vehicles.map((v) => v.color).filter(Boolean)));

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
        {/* LEFT COLUMN: Vehicle Registry Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Bike size={18} style={{ color: '#059669' }} /> Showroom Vehicle Registry
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search model / HSN..."
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
                <Plus size={14} /> + Add Vehicle
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Models</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{vehicles.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🎨 Color Variants</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{allColors.length || 5}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🏷️ Avg Price</span>
                <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>
                  ₹
                  {vehicles.length > 0
                    ? Math.round(vehicles.reduce((acc, v) => acc + (Number(v.price) || 82000), 0) / vehicles.length).toLocaleString('en-IN')
                    : '85,000'}
                </strong>
              </div>
            </div>

            {/* Filter Chips Bar */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              <button
                type="button"
                style={{
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: colorFilter === 'ALL' ? '#059669' : '#d1d5db',
                  backgroundColor: colorFilter === 'ALL' ? '#ecfdf5' : '#ffffff',
                  color: colorFilter === 'ALL' ? '#059669' : '#4b5563',
                  cursor: 'pointer',
                  fontWeight: colorFilter === 'ALL' ? 600 : 400
                }}
                onClick={() => setColorFilter('ALL')}
              >
                All Colors
              </button>
              {allColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: colorFilter === c ? '#059669' : '#d1d5db',
                    backgroundColor: colorFilter === c ? '#ecfdf5' : '#ffffff',
                    color: colorFilter === c ? '#059669' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: colorFilter === c ? 600 : 400
                  }}
                  onClick={() => setColorFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Vehicle List Items */}
            {filteredVehicles && filteredVehicles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredVehicles.map((veh) => {
                  const isSelected = activeVehicle && activeVehicle.id === veh.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => setSelectedVehicleId(veh.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #059669' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(5, 150, 105, 0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      {/* Vehicle Thumbnail */}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '8px',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb',
                          flexShrink: 0
                        }}
                      >
                        {veh.image ? (
                          <img src={veh.image} alt={veh.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Bike size={24} color="#059669" />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                            {veh.brand} {veh.model}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>#{veh.id}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor:
                                  veh.color?.toLowerCase().includes('red') ? '#ef4444' :
                                  veh.color?.toLowerCase().includes('blue') ? '#3b82f6' :
                                  veh.color?.toLowerCase().includes('yellow') ? '#eab308' :
                                  veh.color?.toLowerCase().includes('black') ? '#1f2937' : '#059669'
                              }}
                            />
                            {veh.color || 'Standard'}
                          </span>

                          <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.84rem' }}>
                            ₹{Number(veh.price || 82000).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Bike size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No vehicle models match your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Vehicle Specification Sheet Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: '#059669' }} /> Vehicle Showcase Sheet
            </h3>
            {activeVehicle && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                Model #{activeVehicle.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeVehicle ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Showroom Vehicle Portfolio & Technical Sheet
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
                      IN SHOWROOM DISPLAY
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                      HSN: <strong>{activeVehicle.hsnCode || '87112029'}</strong>
                    </div>
                  </div>
                </div>

                {/* Big Image Preview Showcase */}
                <div
                  style={{
                    margin: '16px 0',
                    height: '180px',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeVehicle.image ? (
                    <img src={activeVehicle.image} alt={activeVehicle.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                      <Bike size={54} strokeWidth={1} style={{ marginBottom: '6px', color: '#059669' }} />
                      <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {activeVehicle.brand} {activeVehicle.model} — {activeVehicle.color}
                      </p>
                    </div>
                  )}
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2">
                  <div>
                    <div className="section-title">Technical Particulars</div>
                    <p><strong>Brand / Make:</strong> {activeVehicle.brand}</p>
                    <p><strong>Model Name:</strong> {activeVehicle.model}</p>
                    <p><strong>Color Finish:</strong> {activeVehicle.color || 'Standard'}</p>
                    <p><strong>HSN Classification:</strong> {activeVehicle.hsnCode || '87112029'}</p>
                  </div>

                  <div>
                    <div className="section-title">Pricing & Financials</div>
                    <p><strong>Ex-Showroom Price:</strong> ₹{Number(activeVehicle.price || 82000).toLocaleString('en-IN')}</p>
                    <p><strong>Applicable GST Rate:</strong> 5% (Standard EV / Two-Wheeler)</p>
                    <p><strong>Estimated GST Amount:</strong> ₹{Math.round(Number(activeVehicle.price || 82000) * 0.05).toLocaleString('en-IN')}</p>
                    <p><strong>Estimated On-Road:</strong> ₹{Math.round(Number(activeVehicle.price || 82000) * 1.18).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleOpenEdit(activeVehicle)}
                  >
                    <Edit2 size={14} /> Edit Model
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleDelete(activeVehicle.id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Bike size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select a vehicle model from the registry on the left to preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
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
                <Bike size={18} color="#059669" />
                {editingVehicle ? `Edit Vehicle #${editingVehicle.id}` : 'Add New Vehicle Model'}
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
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Brand / Make *</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-control"
                    required
                    
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Model Name *</label>
                  <input
                    type="text"
                    name="model"
                    className="form-control"
                    required
                    
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Color *</label>
                  <input
                    type="text"
                    name="color"
                    className="form-control"
                    required
                    
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>HSN Code *</label>
                  <input
                    type="text"
                    name="hsnCode"
                    className="form-control"
                    required
                    
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Ex-Showroom Base Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    required
                    
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Upload Image */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  {formData.image ? (
                    <div
                      style={{
                        position: 'relative',
                        border: '1.5px solid #d1fae5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '110px',
                        backgroundColor: '#fafdfb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={triggerFileInput}
                      style={{
                        border: '2px dashed #059669',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f9fbf9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={18} color="#059669" />
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>Click to upload vehicle photo</span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>PNG, JPG or WEBP</span>
                    </div>
                  )}
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
                  <CheckCircle size={15} /> {editingVehicle ? 'Update Vehicle' : 'Save to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
