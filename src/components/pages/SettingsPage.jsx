import React, { useState, useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, Info, FileText, Save, Check, RefreshCw, ShieldAlert, Wrench, X } from 'lucide-react';

export const DEFAULT_QUOTATION_TERMS = `1. Prices quoted are valid for 7 days from the date of issuance and subject to manufacturer price revisions.
2. Final delivery is subject to availability of vehicle stock and color chosen at the time of final booking.
3. RTO registration, road tax, and insurance charges are subject to statutory revisions by Government authorities.
4. Full on-road payment is required prior to vehicle invoicing and registration dispatch.
5. Standard accessories and helmet are supplied according to dealership delivery policy.`;

export const DEFAULT_INVOICE_TERMS = `1. Goods once sold will not be taken back or exchanged.
2. Warranty is subject to manufacturer's policy and applies from the date of this invoice.
3. Dealership is not liable for indirect damages or delays beyond our control.
4. All disputes are subject to local city jurisdiction only.
5. E. & O.E. (Errors and Omissions Excepted)`;

export const DEFAULT_SERVICE_LABOR_TYPES = [
  { id: 't1', type: '1st Free Service', desc: '1st Free Service Periodic Checkup', amount: 0 },
  { id: 't2', type: '2nd Free Service', desc: '2nd Free Service Periodic Checkup', amount: 0 },
  { id: 't3', type: '3rd Free Service', desc: '3rd Free Service Periodic Checkup', amount: 0 },
  { id: 't4', type: 'General Service', desc: 'General Periodic Service & Washing', amount: 350 },
  { id: 't5', type: 'Paid Periodic Maintenance Service', desc: 'Paid Periodic Maintenance Service (PMS)', amount: 450 },
  { id: 't6', type: 'Major Overhaul / Engine Repair', desc: 'Major Engine / Motor Transmission Overhaul', amount: 1200 },
  { id: 't7', type: 'Electrical & Battery Diagnostics', desc: 'Electrical Wiring & Battery Health Check', amount: 250 },
  { id: 't8', type: 'Brake, Chain & Suspension Overhaul', desc: 'Brake Shoes, Chain Sprocket & Suspension Work', amount: 350 },
  { id: 't9', type: 'Accidental / Body Repair', desc: 'Accidental / Body Repair', amount: 500 },
  { id: 't10', type: 'Running Repair', desc: 'Running Repair & Adjustments', amount: 300 }
];

export default function SettingsPage({
  showPreviews,
  setShowPreviews,
  companyProfile,
  setCompanyProfile
}) {
  const [quotationTerms, setQuotationTerms] = useState(() => {
    return companyProfile?.quotationTerms || DEFAULT_QUOTATION_TERMS;
  });
  const [invoiceTerms, setInvoiceTerms] = useState(() => {
    return companyProfile?.invoiceTerms || DEFAULT_INVOICE_TERMS;
  });
  const [laborTypes, setLaborTypes] = useState(() => {
    return companyProfile?.serviceLaborTypes || DEFAULT_SERVICE_LABOR_TYPES;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (companyProfile?.quotationTerms) setQuotationTerms(companyProfile.quotationTerms);
    if (companyProfile?.invoiceTerms) setInvoiceTerms(companyProfile.invoiceTerms);
    if (companyProfile?.serviceLaborTypes) setLaborTypes(companyProfile.serviceLaborTypes);
  }, [companyProfile]);

  const handleSaveTerms = (e) => {
    e?.preventDefault();
    if (setCompanyProfile) {
      const updatedProfile = {
        ...(companyProfile || {}),
        quotationTerms: quotationTerms.trim(),
        invoiceTerms: invoiceTerms.trim(),
        serviceLaborTypes: laborTypes
      };
      setCompanyProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleResetTerms = () => {
    if (confirm('Reset quotation, invoice terms, and labor types back to the system default templates?')) {
      setQuotationTerms(DEFAULT_QUOTATION_TERMS);
      setInvoiceTerms(DEFAULT_INVOICE_TERMS);
      setLaborTypes(DEFAULT_SERVICE_LABOR_TYPES);
      if (setCompanyProfile) {
        setCompanyProfile({
          ...(companyProfile || {}),
          quotationTerms: DEFAULT_QUOTATION_TERMS,
          invoiceTerms: DEFAULT_INVOICE_TERMS,
          serviceLaborTypes: DEFAULT_SERVICE_LABOR_TYPES
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Bar */}
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', width: '100%' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#111827', margin: 0 }}>Application Settings</h2>
      </div>

      {saveSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '12px 18px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <Check size={18} /> Settings saved successfully!
        </div>
      )}

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }} 
          onClick={() => setActiveModal('terms')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card-body" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '12px', color: '#059669' }}>
              <FileText size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>Document Terms</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Edit quotation and tax invoice terms & conditions.</p>
            </div>
          </div>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }} 
          onClick={() => setActiveModal('layout')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card-body" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '12px', color: '#4b5563' }}>
              <Settings size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>Feature Preview</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Toggle side-by-side ledger print previews.</p>
            </div>
          </div>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }} 
          onClick={() => setActiveModal('labor')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card-body" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
              <Wrench size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>Service Labour Types</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Configure default service types and labour charges.</p>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: activeModal === 'labor' ? '900px' : '650px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #e5e7eb', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeModal === 'terms' && <><FileText size={20} color="#059669" /> Document Terms & Conditions</>}
                {activeModal === 'layout' && <><Settings size={20} color="#4b5563" /> Feature Preview & Layouts</>}
                {activeModal === 'labor' && <><Wrench size={20} color="#2563eb" /> Service Labour & Work Types</>}
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              
              {activeModal === 'terms' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                      Quotation Terms & Conditions:
                    </label>
                    <textarea
                      rows={7}
                      value={quotationTerms}
                      onChange={(e) => setQuotationTerms(e.target.value)}
                      
                      className="form-control"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                      Tax Invoice Terms & Conditions:
                    </label>
                    <textarea
                      rows={5}
                      value={invoiceTerms}
                      onChange={(e) => setInvoiceTerms(e.target.value)}
                      
                      className="form-control"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #d1d5db',
                        fontSize: '0.85rem',
                        lineHeight: 1.6,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'layout' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    border: '1.5px solid #059669',
                    borderColor: showPreviews ? '#059669' : '#e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: showPreviews ? '#fdfefd' : '#ffffff',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: showPreviews ? '0 2px 8px rgba(5,150,105,0.05)' : 'none'
                  }} onClick={() => setShowPreviews(!showPreviews)}>
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: '#1f2937', display: 'block', marginBottom: '4px' }}>
                        Enable Side-by-Side Print Previews & Ledgers
                      </strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                      {showPreviews ? (
                        <ToggleRight size={44} color="#059669" style={{ fill: '#d1fae5' }} />
                      ) : (
                        <ToggleLeft size={44} color="#9ca3af" />
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontWeight: 600, padding: '8px 16px' }}
                      onClick={() => setShowPreviews(true)}
                    >
                      Reset Layout Defaults
                    </button>
                  </div>
                </div>
              )}

              {activeModal === 'labor' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 12px' }}
                      onClick={() => {
                        setLaborTypes([
                          ...laborTypes,
                          { id: `t${Date.now()}`, type: 'New Service Type', desc: 'Service Description', amount: 0 }
                        ]);
                      }}
                    >
                      + Add Work Type
                    </button>
                  </div>
                  <table className="table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Service Type Name</th>
                        <th style={{ width: '40%' }}>Default Description on Invoice</th>
                        <th style={{ width: '20%' }}>Default Labor (₹)</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laborTypes.map((lt, idx) => (
                        <tr key={lt.id || idx}>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={lt.type}
                              onChange={(e) => {
                                const newArr = [...laborTypes];
                                newArr[idx].type = e.target.value;
                                setLaborTypes(newArr);
                              }}
                              style={{ fontSize: '0.85rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={lt.desc}
                              onChange={(e) => {
                                const newArr = [...laborTypes];
                                newArr[idx].desc = e.target.value;
                                setLaborTypes(newArr);
                              }}
                              style={{ fontSize: '0.85rem' }}
                            />
                          </td>
                          <td>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>₹</span>
                              <input
                                type="number"
                                className="form-control"
                                value={lt.amount}
                                onChange={(e) => {
                                  const newArr = [...laborTypes];
                                  newArr[idx].amount = Number(e.target.value) || 0;
                                  setLaborTypes(newArr);
                                }}
                                style={{ paddingLeft: '24px', fontSize: '0.85rem' }}
                                min="0"
                              />
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444', borderColor: '#fee2e2', backgroundColor: '#fef2f2', padding: '6px' }}
                              onClick={() => {
                                if (confirm('Remove this work type?')) {
                                  setLaborTypes(laborTypes.filter((_, i) => i !== idx));
                                }
                              }}
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {laborTypes.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                            No labor types configured. Add a work type to show in the service module.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #e5e7eb', 
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {activeModal === 'terms' ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', padding: '8px 14px' }}
                  onClick={handleResetTerms}
                >
                  <RefreshCw size={14} /> Reset to Default Terms
                </button>
              ) : (
                <div />
              )}
              
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#059669',
                  borderColor: '#047857',
                  padding: '9px 22px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(5,150,105,0.25)'
                }}
                onClick={(e) => {
                  handleSaveTerms(e);
                  setActiveModal(null);
                }}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
