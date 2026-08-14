import React, { useState, useRef } from 'react';
import { Plus, Trash2, Tag, Layers, Palette, FileCode, Upload, Image as ImageIcon } from 'lucide-react';

export default function VehicleListPage({ vehicles = [], setVehicles }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    color: '',
    hsnCode: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand.trim() || !formData.model.trim() || !formData.color.trim() || !formData.hsnCode.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const newVehicle = {
      ...formData,
      id: `VEH-${String(vehicles.length + 1).padStart(2, '0')}`,
      createdOn: new Date().toLocaleDateString('en-IN')
    };

    setVehicles([newVehicle, ...vehicles]);

    // Reset Form
    setFormData({
      brand: '',
      model: '',
      color: '',
      hsnCode: '',
      image: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this vehicle from the directory?')) {
      setVehicles(vehicles.filter((v) => v.id !== id));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Vehicle Registry</h2>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Manage spare inventory and showroom vehicle models</p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
          📦 Total Models: {vehicles.length}
        </span>
      </div>

      {/* Main Layout Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Form Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus size={18} style={{ color: '#059669' }} /> Add New Vehicle
            </h3>
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label className="form-label">Vehicle Brand *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <Tag size={15} />
                </span>
                <input
                  type="text"
                  name="brand"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder=""
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Model *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <Layers size={15} />
                </span>
                <input
                  type="text"
                  name="model"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder=""
                  required
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                  <Palette size={15} />
                </span>
                <select
                  name="color"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  required
                  value={formData.color}
                  onChange={handleInputChange}
                >
                  <option value="">Choose Option</option>
                  <option value="Blue">Blue</option>
                  <option value="Black">Black</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Green">Green</option>
                  <option value="Red">Red</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">HSN Code *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <FileCode size={15} />
                </span>
                <input
                  type="text"
                  name="hsnCode"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder=""
                  required
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Beautiful Image Upload Box */}
            <div className="form-group">
              <label className="form-label">Vehicle Image</label>
              
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />

              {formData.image ? (
                <div style={{
                  position: 'relative',
                  border: '1.5px solid #d1fae5',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  height: '140px',
                  backgroundColor: '#fafdfb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    title="Remove Image"
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
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f9fbf9',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ecfdf5';
                    e.currentTarget.style.borderColor = '#047857';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fbf9';
                    e.currentTarget.style.borderColor = '#059669';
                  }}
                >
                  <Upload size={20} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
                    Click to upload photo
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    PNG, JPG or WEBP
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <Plus size={16} /> Add Vehicle to List
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ImageIcon size={18} style={{ color: '#059669' }} /> Showroom Vehicle List
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {vehicles.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Color</th>
                      <th>HSN Code</th>
                      <th>ID</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div style={{
                            width: '54px',
                            height: '40px',
                            borderRadius: '6px',
                            border: '1px solid #f3f4f6',
                            overflow: 'hidden',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {v.image ? (
                              <img src={v.image} alt={v.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ color: '#cbd5e1' }} title="No photo">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{v.brand}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#4b5563', fontWeight: 500 }}>{v.model}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            color: '#374151'
                          }}>{v.color}</span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.8rem', color: '#047857', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                            {v.hsnCode}
                          </code>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600 }}>{v.id}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', color: '#ef4444', borderColor: 'transparent' }}
                            onClick={() => handleDelete(v.id)}
                            title="Remove Vehicle"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '60px 40px', textAlign: 'center', color: '#9ca3af' }}>
                <ImageIcon size={52} strokeWidth={1} style={{ marginBottom: '12px', color: '#d1d5db' }} />
                <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>
                  No vehicles in register
                </h5>
                <p style={{ fontSize: '0.82rem', maxWidth: '300px', margin: '0 auto' }}>
                  Use the registration form on the left to add your brand models and color options.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
