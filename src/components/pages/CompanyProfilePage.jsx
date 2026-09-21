import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  FileCheck2,
  Save,
  Check,
  Copy,
  ShieldCheck,
  RotateCcw,
  QrCode,
  Printer,
  Download,
  Upload,
  CheckCircle2
} from 'lucide-react';

export default function CompanyProfilePage({
  companyProfile = {
    name: 'NANDHI MOTORS',
    tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
    address: 'No. 12, Palani Main Road, Palani, Dindigul, Tamil Nadu - 624601',
    phone: '+91 98421 55670',
    altPhone: '+91 94432 19800',
    email: 'contact@nandhimotors.com',
    website: 'www.nandhimotors.com',
    gstin: '33AABCN1234F1Z9',
    state: 'Tamil Nadu (33)',
    pan: 'AABCN1234F',
    bankName: 'HDFC Bank',
    accountName: 'NANDHI MOTORS',
    accountNumber: '50200088991234',
    ifscCode: 'HDFC0001234',
    branch: 'Namakkal Main Branch',
    upiId: 'nandhimotors@hdfcbank',
    upiQrImage: ''
  },
  setCompanyProfile
}) {
  const [formData, setFormData] = useState({ ...companyProfile });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [testAmount, setTestAmount] = useState('');

  useEffect(() => {
    if (companyProfile && Object.keys(companyProfile).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...companyProfile,
        upiId: companyProfile.upiId || prev.upiId || ''
      }));
    }
  }, [companyProfile]);

  // UPI QR String
  const upiIdVal = formData.upiId || 'nandhimotors@hdfcbank';
  const payeeNameVal = formData.accountName || formData.name || 'NANDHI MOTORS';
  let upiUri = `upi://pay?pa=${encodeURIComponent(upiIdVal)}&pn=${encodeURIComponent(payeeNameVal)}&cu=INR`;
  if (testAmount && Number(testAmount) > 0) {
    upiUri += `&am=${encodeURIComponent(testAmount)}`;
  }
  const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}&margin=8`;
  const activeQrCodeUrl = formData.upiQrImage || generatedQrUrl;

  // 1. Save Full Company Profile
  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (setCompanyProfile) {
      await setCompanyProfile(formData);
    }
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3500);
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, upiQrImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintStandee = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Showroom UPI QR Standee - ${formData.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; text-align: center; color: #1f2937; }
            .standee-card { max-width: 420px; margin: 0 auto; border: 3px solid #059669; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header-title { font-size: 24px; font-weight: 800; color: #059669; margin: 0 0 4px 0; text-transform: uppercase; }
            .header-subtitle { font-size: 13px; color: #6b7280; margin: 0 0 20px 0; }
            .qr-box { border: 2px dashed #059669; border-radius: 12px; padding: 15px; display: inline-block; background: #ffffff; margin-bottom: 20px; }
            .qr-img { width: 240px; height: 240px; }
            .upi-id-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-family: monospace; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 8px; display: inline-block; margin-bottom: 15px; }
            .apps-row { font-size: 12px; color: #4b5563; font-weight: 600; margin-top: 15px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            .bank-info { font-size: 12px; color: #6b7280; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <h1 class="header-title">${formData.name}</h1>
            <p class="header-subtitle">Scan & Pay with Any UPI App</p>
            <div class="qr-box">
              <img class="qr-img" src="${activeQrCodeUrl}" alt="UPI QR Code" />
            </div>
            <div>
              <div class="upi-id-badge">UPI ID: ${formData.upiId || 'nandhimotors@hdfcbank'}</div>
            </div>
            <div class="bank-info">
              Account: <strong>${formData.accountName || formData.name}</strong> | Bank: <strong>${formData.bankName || 'HDFC Bank'}</strong>
            </div>
            <div class="apps-row">
              ACCEPTED APPS: Google Pay • PhonePe • Paytm • BHIM • Cred • Any UPI App
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease', color: '#1f2937' }}>
      
      {/* Title Header */}
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', width: '100%' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Building2 style={{ color: '#059669' }} /> Dealership Company Profile & Settings
        </h2>
      </div>

      {/* Success Toasts */}
      {profileSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '14px 18px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease'
        }}>
          <Check size={18} /> Company profile credentials saved successfully in MongoDB Atlas!
        </div>
      )}
      {/* ======================================================== */}
      {/* PART A: COMPANY PROFILE DETAILS (FORM 1)                 */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: Brand & Logo Identity */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#059669' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              1. Brand Identity & Dealership Name
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                backgroundColor: '#ecfdf5',
                border: '2px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                flexShrink: 0
              }}>
                <Building2 size={32} />
              </div>

              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                    {formData.name}
                  </span>
                  <span style={{ backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.725rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> Active Dealership
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '2px', marginBottom: 0 }}>
                  {formData.tagline}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Dealership / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tagline / Business Nature
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Showroom Address & Contact Info */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: '#059669' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              2. Showroom Location & Contact Channels
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Complete Showroom Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Primary Contact / Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Alternate Hotline / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.altPhone}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tax & GST Credentials */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={18} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              3. GSTIN & Tax Identification Details
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  GSTIN Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={15} value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700, color: '#111827' }}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.gstin, 'gstin')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: copiedField === 'gstin' ? '#059669' : '#9ca3af', cursor: 'pointer', padding: 0 }}
                    title="Copy GSTIN"
                  >
                    {copiedField === 'gstin' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  State & Code
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Business PAN Number
                </label>
                <input
                  type="text"
                  maxLength={10} value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Bank Account & UPI QR Code */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              4. Bank Account & Showroom UPI QR Code
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Branch Name
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Current Account Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.accountNumber, 'acc')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: copiedField === 'acc' ? '#059669' : '#9ca3af', cursor: 'pointer', padding: 0 }}
                    title="Copy Account No"
                  >
                    {copiedField === 'acc' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Showroom UPI ID *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={formData.upiId || ''}
                    
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.upiId, 'upi')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: copiedField === 'upi' ? '#059669' : '#9ca3af', cursor: 'pointer', padding: 0 }}
                    title="Copy UPI ID"
                  >
                    {copiedField === 'upi' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE DYNAMIC UPI QR CODE DISPLAY CARD */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #dcfce7', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={20} style={{ color: '#059669' }} />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#065f46' }}>
                    Showroom Official UPI QR Code
                  </h4>
                  <span style={{ backgroundColor: '#dcfce7', color: '#065f46', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                    BHIM UPI Standard
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handlePrintStandee}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#ffffff',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={13} /> Print Counter Standee
                  </button>
                  <a
                    href={activeQrCodeUrl}
                    download={`NandhiMotors_UPI_QR_${formData.upiId || 'pay'}.png`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={13} /> Download QR PNG
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                
                {/* QR Code Container */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #059669',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  flexShrink: 0
                }}>
                  <img
                    src={activeQrCodeUrl}
                    alt="UPI QR Code"
                    style={{ width: '180px', height: '180px', borderRadius: '6px', display: 'block' }}
                  />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>
                    SCAN TO PAY
                  </span>
                </div>

                {/* QR Code Details & Settings */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.76rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Payee Name</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                      {formData.accountName || formData.name || 'NANDHI MOTORS'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.76rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Active UPI ID</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#047857', fontFamily: 'monospace' }}>
                        {formData.upiId || 'nandhimotors@hdfcbank'}
                      </span>
                    </div>
                  </div>

                  {/* Test Amount Generator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 500 }}>Preset Test Amount (₹):</span>
                    <input
                      type="number"
                      
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      style={{ width: '130px', padding: '5px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                    {testAmount && (
                      <button
                        type="button"
                        onClick={() => setTestAmount('')}
                        style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Accepted Payment Apps Row */}
                  <div style={{ borderTop: '1px solid #dcfce7', paddingTop: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#4b5563', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Accepted on all UPI Apps: Google Pay • PhonePe • Paytm • BHIM • Amazon Pay
                    </span>
                  </div>

                  {/* Upload Custom Bank Standee Image Option */}
                  <div style={{ marginTop: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Or Upload Official Bank Standee Photo:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#4b5563'
                      }}>
                        <Upload size={12} /> Choose Image
                        <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} />
                      </label>
                      {formData.upiQrImage && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, upiQrImage: '' }))}
                          style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Remove Custom & Use Auto QR
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SAVE OPTION 1: SAVE COMPANY PROFILE */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleSaveProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5,150,105,0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            {profileSuccess ? <Check size={18} /> : <Save size={18} />}
            {profileSuccess ? 'Company Profile Saved!' : 'Save Company Profile'}
          </button>
        </div>

      </div>

    </div>
  );
}
