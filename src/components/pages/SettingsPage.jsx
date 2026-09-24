import React, { useState, useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, Info, FileText, Save, Check, RefreshCw, ShieldAlert, Wrench, X, Palette, Printer, Sparkles, Award, CheckCircle2, Layers, Layout } from 'lucide-react';
import { DEFAULT_PRINT_SETTINGS, PRINT_STYLE_OPTIONS, PRINT_COLOR_OPTIONS, PRINT_DOCUMENT_TYPES, openThemePrintWindow, getPrintTheme, normalizePrintSettings, buildPrintThemeCss } from '../../utils/printSettings';

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
  setCompanyProfile,
  printSettings,
  setPrintSettings
}) {
  const defaultGstSettings = {
    laborGstEnabled: true,
    sparesGstEnabled: true,
    laborRate: 18,
    sparesRate: 18
  };

  const [quotationTerms, setQuotationTerms] = useState(() => {
    return companyProfile?.quotationTerms || DEFAULT_QUOTATION_TERMS;
  });
  const [invoiceTerms, setInvoiceTerms] = useState(() => {
    return companyProfile?.invoiceTerms || DEFAULT_INVOICE_TERMS;
  });
  const [laborTypes, setLaborTypes] = useState(() => {
    return companyProfile?.serviceLaborTypes || DEFAULT_SERVICE_LABOR_TYPES;
  });
  const [gstSettings, setGstSettings] = useState(() => {
    return companyProfile?.gstSettings || defaultGstSettings;
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [localPrintSettings, setLocalPrintSettings] = useState(() => printSettings || DEFAULT_PRINT_SETTINGS);
  const [selectedDocumentPreset, setSelectedDocumentPreset] = useState('invoice');

  useEffect(() => {
    if (printSettings) setLocalPrintSettings(printSettings);
  }, [printSettings]);

  useEffect(() => {
    if (companyProfile?.quotationTerms) setQuotationTerms(companyProfile.quotationTerms);
    if (companyProfile?.invoiceTerms) setInvoiceTerms(companyProfile.invoiceTerms);
    if (companyProfile?.serviceLaborTypes) setLaborTypes(companyProfile.serviceLaborTypes);
    if (companyProfile?.gstSettings) setGstSettings(companyProfile.gstSettings);
  }, [companyProfile]);

  const handleSaveTerms = (e) => {
    e?.preventDefault();
    if (setCompanyProfile) {
      const normalizedPrintSettings = normalizePrintSettings(localPrintSettings);
      const updatedProfile = {
        ...(companyProfile || {}),
        quotationTerms: quotationTerms.trim(),
        invoiceTerms: invoiceTerms.trim(),
        serviceLaborTypes: laborTypes,
        gstSettings: {
          ...defaultGstSettings,
          ...gstSettings
        },
        printSettings: normalizedPrintSettings
      };
      setCompanyProfile(updatedProfile);
      if (setPrintSettings) setPrintSettings(normalizedPrintSettings);
      setSaveSuccess(true);
      if (typeof window !== 'undefined' && window.showAppToast) {
        window.showAppToast('Settings saved successfully.');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handlePrintTest = () => {
    const theme = getPrintTheme(localPrintSettings, selectedDocumentPreset);
    const docTitle = PRINT_DOCUMENT_TYPES.find(type => type.id === selectedDocumentPreset)?.label || 'Tax Invoice';
    const profile = companyProfile || {
      name: 'NANDHI MOTORS',
      tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
      address: '170/2, ITTERI ROAD, PALANI-624601',
      phone: '+91 7604857272',
      gstin: '33BCXPA4714R1Z2'
    };

    const bodyHtml = `
      <div class="doc-paper print-style-${localPrintSettings.style || 'classic'}">
        <div class="doc-header-banner">
          <div>
            <h1>${profile.name || 'NANDHI MOTORS'}</h1>
            <p>${profile.tagline || 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership'}</p>
            <p style="font-size: 11px; color: #6b7280;">
              ${profile.address || '170/2, ITTERI ROAD, PALANI-624601'} | Phone: ${profile.phone || '+91 7604857272'} | GSTIN: ${profile.gstin || '33BCXPA4714R1Z2'}
            </p>
          </div>
          <div class="doc-badge-title">${docTitle.toUpperCase()}</div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
          <div>Document No: <strong>#TEST-${new Date().getFullYear()}-001</strong></div>
          <div>Date: <strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
        </div>

        <div class="doc-grid-2">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: ${theme.primary}; text-transform: uppercase; margin-bottom: 4px;">Customer Details</div>
            <p style="margin: 2px 0;"><strong>Name:</strong> Rajesh Kumar</p>
            <p style="margin: 2px 0;"><strong>Phone:</strong> +91 98421 55670</p>
            <p style="margin: 2px 0;"><strong>Address:</strong> 12, Gandhi Nagar, Palani</p>
            <p style="margin: 2px 0;"><strong>Aadhaar:</strong> 9821 4412 9901</p>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: ${theme.secondary}; text-transform: uppercase; margin-bottom: 4px;">Vehicle & Job Details</div>
            <p style="margin: 2px 0;"><strong>Model:</strong> Honda Activa 6G (Matte Blue)</p>
            <p style="margin: 2px 0;"><strong>VIN / Reg:</strong> TN-57-AB-1234</p>
            <p style="margin: 2px 0;"><strong>Service Type:</strong> Periodic Maintenance</p>
            <p style="margin: 2px 0;"><strong>Layout:</strong> ${localPrintSettings.style.toUpperCase()} (${theme.colorLabel})</p>
          </div>
        </div>

        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Description / Particulars</th>
              <th style="width: 50px; text-align: center;">Qty</th>
              <th style="text-align: right;">Rate (₹)</th>
              <th style="text-align: right;">GST %</th>
              <th style="text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>General Periodic Service & Water Wash</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹450.00</td>
              <td style="text-align: right;">18%</td>
              <td style="text-align: right;">₹531.00</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Synthetic Engine Oil 10W-30 (1 Liter)</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹380.00</td>
              <td style="text-align: right;">18%</td>
              <td style="text-align: right;">₹448.40</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Front Disc Brake Shoe Replacement</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹280.00</td>
              <td style="text-align: right;">18%</td>
              <td style="text-align: right;">₹330.40</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
          <div class="doc-total-box" style="min-width: 260px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span>Subtotal:</span>
              <strong>₹1,110.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span>Total GST (18%):</span>
              <strong>₹199.80</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 6px;">
              <span>Grand Total:</span>
              <span style="color: ${theme.primary};">₹1,310.00</span>
            </div>
          </div>
        </div>

        <div class="doc-signatures" style="display: flex; justify-content: space-between; margin-top: 45px;">
          <div class="doc-sig-line">Customer Signature</div>
          <div class="doc-sig-line">For NANDHI MOTORS<br /><span style="font-size: 9px; font-weight: normal;">Authorised Signatory</span></div>
        </div>
      </div>
    `;

    openThemePrintWindow(`${docTitle} Test (${localPrintSettings.style})`, bodyHtml, localPrintSettings, selectedDocumentPreset);
  };

  const handleResetTerms = () => {
    if (confirm('Reset quotation, invoice terms, labor types, GST settings, and print preferences back to the system defaults?')) {
      const defaultSettings = normalizePrintSettings(DEFAULT_PRINT_SETTINGS);
      setQuotationTerms(DEFAULT_QUOTATION_TERMS);
      setInvoiceTerms(DEFAULT_INVOICE_TERMS);
      setLaborTypes(DEFAULT_SERVICE_LABOR_TYPES);
      setGstSettings(defaultGstSettings);
      setLocalPrintSettings(defaultSettings);
      if (setPrintSettings) setPrintSettings(defaultSettings);
      if (setCompanyProfile) {
        setCompanyProfile({
          ...(companyProfile || {}),
          quotationTerms: DEFAULT_QUOTATION_TERMS,
          invoiceTerms: DEFAULT_INVOICE_TERMS,
          serviceLaborTypes: DEFAULT_SERVICE_LABOR_TYPES,
          gstSettings: defaultGstSettings,
          printSettings: defaultSettings
        });
        setSaveSuccess(true);
        if (typeof window !== 'undefined' && window.showAppToast) {
          window.showAppToast('Settings reset and saved successfully.');
        }
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

        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }} 
          onClick={() => setActiveModal('gst')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card-body" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '12px', color: '#b45309' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>GST Controls</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Enable or disable GST for service labour and spares.</p>
            </div>
          </div>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', margin: 0 }} 
          onClick={() => setActiveModal('printing')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="card-body" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ede9fe', borderRadius: '12px', color: '#7c3aed' }}>
              <Palette size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>Printing Layouts & Styles</h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                  {PRINT_STYLE_OPTIONS.find(s => s.id === localPrintSettings.style)?.label || 'Classic Formal'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                3 latest showroom print layouts: Classic Formal, Modern Minimal, or Executive Premium.
              </p>
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
              maxWidth: activeModal === 'printing' ? '1080px' : activeModal === 'labor' ? '900px' : '650px',
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
                  {activeModal === 'gst' && <><ShieldAlert size={20} color="#b45309" /> GST Controls</>}
                  {activeModal === 'printing' && <><Palette size={20} color="#7c3aed" /> Printing Layout Studio (3 Showroom Styles)</>}
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

              {activeModal === 'gst' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ color: '#111827' }}>Labor GST</strong>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setGstSettings(prev => ({ ...prev, laborGstEnabled: !prev.laborGstEnabled }))}
                          style={{
                            border: 'none',
                            background: gstSettings.laborGstEnabled ? '#dcfce7' : '#e5e7eb',
                            color: gstSettings.laborGstEnabled ? '#166534' : '#374151',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            fontWeight: 700
                          }}
                        >
                          {gstSettings.laborGstEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>GST Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={gstSettings.laborRate}
                        onChange={(e) => setGstSettings(prev => ({ ...prev, laborRate: Number(e.target.value) || 0 }))}
                        disabled={!gstSettings.laborGstEnabled}
                      />
                    </div>

                    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ color: '#111827' }}>Spare GST</strong>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setGstSettings(prev => ({ ...prev, sparesGstEnabled: !prev.sparesGstEnabled }))}
                          style={{
                            border: 'none',
                            background: gstSettings.sparesGstEnabled ? '#dcfce7' : '#e5e7eb',
                            color: gstSettings.sparesGstEnabled ? '#166534' : '#374151',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            fontWeight: 700
                          }}
                        >
                          {gstSettings.sparesGstEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>GST Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={gstSettings.sparesRate}
                        onChange={(e) => setGstSettings(prev => ({ ...prev, sparesRate: Number(e.target.value) || 0 }))}
                        disabled={!gstSettings.sparesGstEnabled}
                      />
                    </div>
                  </div>
                  <div style={{ padding: '12px 14px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', color: '#9a5b00', fontSize: '0.82rem' }}>
                    Default GST for both labour and spares is set to 18%. You can turn each tax ON or OFF from here and keep the invoice system controlled centrally from settings.
                  </div>
                </div>
              )}

              {activeModal === 'printing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <style>{`
                    ${buildPrintThemeCss(localPrintSettings, selectedDocumentPreset)}
                  `}</style>

                  {/* Section 1: 3 Latest Printing Layout Cards */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#111827', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Layout size={18} color="#7c3aed" /> Select Dealership Print Layout
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                          Choose from the 3 latest automotive dealership printing styles for all invoices, quotes, and job cards.
                        </p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', backgroundColor: '#f3e8ff', padding: '3px 10px', borderRadius: '999px' }}>
                        3 Styles Available
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
                      {PRINT_STYLE_OPTIONS.map((option) => {
                        const isSelected = localPrintSettings.style === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() => {
                              const nextStyle = option.id;
                              setLocalPrintSettings(prev => {
                                const nextPresets = Object.fromEntries(
                                  Object.keys(prev.presets || {}).map(typeId => [typeId, { ...prev.presets[typeId], style: nextStyle, color: prev.color || DEFAULT_PRINT_SETTINGS.color }])
                                );
                                return {
                                  ...prev,
                                  style: nextStyle,
                                  presets: {
                                    ...nextPresets,
                                    ...PRINT_DOCUMENT_TYPES.reduce((acc, type) => {
                                      acc[type.id] = { style: nextStyle, color: prev.color || DEFAULT_PRINT_SETTINGS.color };
                                      return acc;
                                    }, {})
                                  }
                                };
                              });
                            }}
                            style={{
                              border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                              backgroundColor: isSelected ? '#faf5ff' : '#ffffff',
                              borderRadius: '14px',
                              padding: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.15)' : 'none',
                              position: 'relative'
                            }}
                          >
                            <div>
                              {/* Header Pill & Mini Diagram */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: isSelected ? '#7c3aed' : '#f3f4f6',
                                  color: isSelected ? '#ffffff' : '#4b5563'
                                }}>
                                  {option.badge}
                                </span>

                                {isSelected ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontWeight: 700, fontSize: '0.78rem' }}>
                                    <CheckCircle2 size={16} /> Selected
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Click to select</span>
                                )}
                              </div>

                              {/* Miniature Wireframe Visual */}
                              <div style={{
                                height: '54px',
                                backgroundColor: isSelected ? '#f5f3ff' : '#f8fafc',
                                border: isSelected ? '1px dashed #c084fc' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '6px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                              }}>
                                {option.id === 'classic' && (
                                  <>
                                    <div style={{ textAlign: 'center', borderBottom: '2px double #334155', paddingBottom: '2px' }}>
                                      <div style={{ width: '40%', height: '5px', backgroundColor: '#334155', margin: '0 auto 2px', borderRadius: '1px' }} />
                                      <div style={{ width: '25%', height: '3px', backgroundColor: '#94a3b8', margin: '0 auto', borderRadius: '1px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <div style={{ flex: 1, border: '1px solid #334155', height: '14px', borderRadius: '1px' }} />
                                      <div style={{ flex: 1, border: '1px solid #334155', height: '14px', borderRadius: '1px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <div style={{ width: '35%', height: '6px', border: '1px solid #334155', borderBottom: '2px double #334155' }} />
                                    </div>
                                  </>
                                )}

                                {option.id === 'minimal' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px' }}>
                                      <div style={{ width: '30%', height: '5px', backgroundColor: '#0f172a', borderRadius: '2px' }} />
                                      <div style={{ width: '15%', height: '4px', border: '1px solid #0f172a', borderRadius: '999px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', padding: '2px 0' }}>
                                      <div style={{ width: '40%', height: '10px', borderBottom: '1px solid #f1f5f9' }} />
                                      <div style={{ width: '40%', height: '10px', borderBottom: '1px solid #f1f5f9' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <div style={{ width: '30%', height: '4px', backgroundColor: '#0f172a', borderRadius: '1px' }} />
                                    </div>
                                  </>
                                )}

                                {option.id === 'premium' && (
                                  <>
                                    <div style={{ background: 'linear-gradient(90deg, #059669, #111827)', borderRadius: '4px', height: '14px', padding: '2px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div style={{ width: '30%', height: '4px', backgroundColor: '#ffffff', borderRadius: '1px' }} />
                                      <div style={{ width: '15%', height: '4px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '999px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
                                      <div style={{ flex: 1, height: '12px', borderLeft: '3px solid #059669', backgroundColor: '#ffffff', borderRadius: '2px' }} />
                                      <div style={{ flex: 1, height: '12px', borderLeft: '3px solid #059669', backgroundColor: '#ffffff', borderRadius: '2px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <div style={{ width: '35%', height: '8px', backgroundColor: '#111827', borderRadius: '3px' }} />
                                    </div>
                                  </>
                                )}
                              </div>

                              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', marginBottom: '2px' }}>
                                {option.label}
                              </div>
                              <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#7c3aed', marginBottom: '6px' }}>
                                {option.tagline}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.4, marginBottom: '10px' }}>
                                {option.description}
                              </div>

                              {/* Features Pill List */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {option.features.map((feat, fIdx) => (
                                  <div key={fIdx} style={{ fontSize: '0.72rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {feat}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Color Palette & Document Preset Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', backgroundColor: '#f9fafb', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    {/* Color Scheme */}
                    <div>
                      <label style={{ display: 'block', margin: '0 0 8px', color: '#111827', fontSize: '0.85rem', fontWeight: 700 }}>
                        Branded Color Accent
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {PRINT_COLOR_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              const nextColor = option.id;
                              setLocalPrintSettings(prev => {
                                const nextPresets = Object.fromEntries(
                                  Object.keys(prev.presets || {}).map(typeId => [typeId, { ...prev.presets[typeId], color: nextColor, style: prev.style || DEFAULT_PRINT_SETTINGS.style }])
                                );
                                return {
                                  ...prev,
                                  color: nextColor,
                                  presets: {
                                    ...nextPresets,
                                    ...PRINT_DOCUMENT_TYPES.reduce((acc, type) => {
                                      acc[type.id] = { style: prev.style || DEFAULT_PRINT_SETTINGS.style, color: nextColor };
                                      return acc;
                                    }, {})
                                  }
                                };
                              });
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: localPrintSettings.color === option.id ? '2px solid #7c3aed' : '1px solid #d1d5db',
                              backgroundColor: localPrintSettings.color === option.id ? '#f3e8ff' : '#ffffff',
                              borderRadius: '999px',
                              padding: '6px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: option.value, display: 'inline-block', border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#111827' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Document Type Switcher */}
                    <div>
                      <label style={{ display: 'block', margin: '0 0 8px', color: '#111827', fontSize: '0.85rem', fontWeight: 700 }}>
                        Preview Document Template
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {PRINT_DOCUMENT_TYPES.slice(0, 5).map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setSelectedDocumentPreset(type.id)}
                            style={{
                              borderRadius: '999px',
                              padding: '5px 12px',
                              border: selectedDocumentPreset === type.id ? '1.5px solid #7c3aed' : '1px solid #d1d5db',
                              backgroundColor: selectedDocumentPreset === type.id ? '#7c3aed' : '#ffffff',
                              cursor: 'pointer',
                              color: selectedDocumentPreset === type.id ? '#ffffff' : '#374151',
                              fontWeight: 600,
                              fontSize: '0.76rem'
                            }}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: LIVE INTERACTIVE DOCUMENT PREVIEW SHEET */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} color="#7c3aed" /> Live Layout Output Simulation
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                        Simulating <strong>{PRINT_STYLE_OPTIONS.find(s => s.id === localPrintSettings.style)?.label}</strong> in <strong>{PRINT_COLOR_OPTIONS.find(c => c.id === localPrintSettings.color)?.label}</strong>
                      </div>
                    </div>

                    {/* Mock Paper Canvas */}
                    <div style={{
                      backgroundColor: '#52525b',
                      padding: '20px',
                      borderRadius: '12px',
                      overflowX: 'auto',
                      maxHeight: '360px',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <div className={`doc-paper print-style-${localPrintSettings.style || 'classic'}`} style={{
                        maxWidth: '780px',
                        margin: '0 auto',
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        padding: '24px 28px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        fontSize: '12px',
                        lineHeight: 1.4
                      }}>
                        {/* Header Banner */}
                        <div className="doc-header-banner">
                          <div>
                            <h1>{companyProfile?.name || 'NANDHI MOTORS'}</h1>
                            <p>{companyProfile?.tagline || 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership'}</p>
                            <p style={{ fontSize: '11px', color: '#6b7280' }}>
                              {companyProfile?.address || '170/2, ITTERI ROAD, PALANI-624601'} | Phone: {companyProfile?.phone || '+91 7604857272'} | GSTIN: {companyProfile?.gstin || '33BCXPA4714R1Z2'}
                            </p>
                          </div>
                          <div className="doc-badge-title">
                            {PRINT_DOCUMENT_TYPES.find(t => t.id === selectedDocumentPreset)?.label?.toUpperCase() || 'TAX INVOICE'}
                          </div>
                        </div>

                        {/* Top Meta Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11.5px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                          <div>Doc Reference: <strong style={{ color: '#111827' }}>#INV-2026-0042</strong></div>
                          <div>Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                        </div>

                        {/* 2-Column Info Grid */}
                        <div className="doc-grid-2">
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Customer Particulars
                            </div>
                            <p style={{ margin: '2px 0' }}><strong>Name:</strong> Rajesh Kumar</p>
                            <p style={{ margin: '2px 0' }}><strong>Mobile:</strong> +91 98421 55670</p>
                            <p style={{ margin: '2px 0' }}><strong>Address:</strong> 12, Gandhi Nagar, Palani</p>
                            <p style={{ margin: '2px 0' }}><strong>Aadhaar:</strong> 9821 4412 9901</p>
                          </div>
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Vehicle Specifications
                            </div>
                            <p style={{ margin: '2px 0' }}><strong>Model:</strong> Honda Activa 6G (Matte Blue)</p>
                            <p style={{ margin: '2px 0' }}><strong>Reg No:</strong> TN-57-AB-1234</p>
                            <p style={{ margin: '2px 0' }}><strong>Chassis No:</strong> ME4JF911NK00892</p>
                            <p style={{ margin: '2px 0' }}><strong>Payment:</strong> Fully Paid</p>
                          </div>
                        </div>

                        {/* Itemized Table */}
                        <table className="doc-table">
                          <thead>
                            <tr>
                              <th style={{ width: '35px' }}>#</th>
                              <th>Item & Description</th>
                              <th style={{ width: '45px', textAlign: 'center' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Taxable Rate</th>
                              <th style={{ width: '60px', textAlign: 'center' }}>GST</th>
                              <th style={{ textAlign: 'right' }}>Total (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td><strong>Honda Activa 6G</strong> - Metallic Blue Edition</td>
                              <td style={{ textAlign: 'center' }}>1</td>
                              <td style={{ textAlign: 'right' }}>₹82,000.00</td>
                              <td style={{ textAlign: 'center' }}>5%</td>
                              <td style={{ textAlign: 'right' }}>₹86,100.00</td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>Mandatory ISI Full-Face Helmet & Kit</td>
                              <td style={{ textAlign: 'center' }}>1</td>
                              <td style={{ textAlign: 'right' }}>₹1,500.00</td>
                              <td style={{ textAlign: 'center' }}>18%</td>
                              <td style={{ textAlign: 'right' }}>₹1,770.00</td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Total Box */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <div className="doc-total-box" style={{ minWidth: '240px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                              <span>Total Taxable Amount:</span>
                              <strong>₹83,500.00</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                              <span>Applicable GST:</span>
                              <strong>₹4,370.00</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '5px' }}>
                              <span>Invoice Grand Total:</span>
                              <span>₹87,870.00</span>
                            </div>
                          </div>
                        </div>

                        {/* Signatures */}
                        <div className="doc-signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                          <div className="doc-sig-line">Customer Signature</div>
                          <div className="doc-sig-line">For {companyProfile?.name || 'NANDHI MOTORS'}<br /><span style={{ fontSize: '9px', fontWeight: 'normal' }}>Authorised Signatory</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Action Buttons Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      All documents (invoices, quotations, job cards, service bills, purchase vouchers) will automatically print in the selected layout.
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintTest}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#1e293b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Printer size={16} /> Print Full Test Page
                    </button>
                  </div>
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
