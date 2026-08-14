import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Layers, Clipboard, AlertTriangle } from 'lucide-react';

export default function SpareInventoryPage({ spares = [], setSpares }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    dealerPrice: '',
    gstRate: '18', // Default 18% GST
    mrp: ''
  });

  const [priceWithGst, setPriceWithGst] = useState(0);

  // Auto-calculate Price with GST whenever dealerPrice or gstRate changes
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quantity || !formData.dealerPrice || !formData.mrp) {
      alert('Please fill out all required fields.');
      return;
    }

    const qty = parseInt(formData.quantity);
    const dealerPriceVal = parseFloat(formData.dealerPrice);
    const mrpVal = parseFloat(formData.mrp);

    if (qty < 0 || dealerPriceVal < 0 || mrpVal < 0) {
      alert('Values cannot be negative.');
      return;
    }

    const newSpare = {
      name: formData.name.trim(),
      quantity: qty,
      dealerPrice: dealerPriceVal,
      gstRate: parseInt(formData.gstRate),
      priceWithGst: priceWithGst,
      mrp: mrpVal,
      id: `SP-${String(spares.length + 1).padStart(2, '0')}`,
      createdOn: new Date().toLocaleDateString('en-IN')
    };

    setSpares([newSpare, ...spares]);

    // Reset Form
    setFormData({
      name: '',
      quantity: '',
      dealerPrice: '',
      gstRate: '18',
      mrp: ''
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this spare part from the inventory?')) {
      setSpares(spares.filter((item) => item.id !== id));
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Spare Parts Inventory</h2>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Manage spare stocks, dealer prices, GST rates, and showroom MRP listings</p>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
          ⚙️ Total Spares: {spares.length}
        </span>
      </div>

      {/* Main Layout Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Form Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus size={18} style={{ color: '#059669' }} /> Add Spare Part
            </h3>
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label className="form-label">Spare Name *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <Tag size={15} />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder=""
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Spare Quantity *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                  <Layers size={15} />
                </span>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder=""
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Dealer Price (Before GST) *</label>
                <input
                  type="number"
                  name="dealerPrice"
                  className="form-control"
                  placeholder=""
                  required
                  min="0"
                  step="0.01"
                  value={formData.dealerPrice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GST Rate (%)</label>
                <select
                  name="gstRate"
                  className="form-control"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                >
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" style={{ color: '#059669', fontWeight: 600 }}>Price with GST (Auto)</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ backgroundColor: '#f9fafb', fontWeight: 600, color: '#047857' }}
                  readOnly
                  value={`₹ ${priceWithGst}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Spare MRP (₹) *</label>
                <input
                  type="number"
                  name="mrp"
                  className="form-control"
                  placeholder=""
                  required
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', fontWeight: 600, marginTop: '8px' }}>
              Add to Spare Inventory
            </button>
          </form>
        </div>

        {/* Table List Column */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clipboard size={18} style={{ color: '#059669' }} /> Spares Catalog Directory
            </h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {spares.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Spare ID</th>
                      <th>Spare Name</th>
                      <th>Stock Quantity</th>
                      <th>Dealer Price</th>
                      <th>Price with GST</th>
                      <th>MRP</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spares.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.id}</strong></td>
                        <td>{item.name}</td>
                        <td>
                          {item.quantity < 10 ? (
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Low Stock Warning!">
                              <AlertTriangle size={11} /> {item.quantity} units
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              {item.quantity} units
                            </span>
                          )}
                        </td>
                        <td>₹ {item.dealerPrice.toFixed(2)}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#047857' }}>₹ {item.priceWithGst.toFixed(2)}</span>
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '4px' }}>({item.gstRate}%)</span>
                        </td>
                        <td><strong>₹ {item.mrp.toFixed(2)}</strong></td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', color: '#ef4444', borderColor: 'transparent' }}
                            onClick={() => handleDelete(item.id)}
                            title="Remove Spare Part"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '80px 40px', textAlign: 'center', color: '#9ca3af' }}>
                <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                <h5 style={{ fontSize: '1rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>No spares registered</h5>
                <p style={{ fontSize: '0.85rem' }}>
                  Use the left form panel to register spare parts into the showroom inventory catalog database.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
