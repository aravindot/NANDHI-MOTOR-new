import React, { useState } from 'react';
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
  Sparkles,
  QrCode,
  Printer,
  Upload
} from 'lucide-react';

export default function CompanyProfilePage({
  companyProfile = {
    name: 'NANDHI MOTORS',
    tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
    address: 'SF No. 124/2, Trichy Main Road, Namakkal, Tamil Nadu - 637001',
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
    upiId: 'nandhimotors@hdfcbank'
  },
  setCompanyProfile
}) {
  const [formData, setFormData] = useState({ ...companyProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (setCompanyProfile) {
      setCompanyProfile(formData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Top Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 style={{ color: '#059669' }} /> Dealership Company Profile
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Manage showroom brand identity, registered GST credentials, contact details, and bank settlement accounts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="submit"
            form="profile-form"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5,150,105,0.25)'
            }}
          >
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            {savedSuccess ? 'Changes Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          padding: '12px 18px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <Check size={18} /> Company profile credentials updated successfully! Changes are synced across all invoices and prints.
        </div>
      )}

      {/* Main Profile Form Card */}
      <form id="profile-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: Brand & Logo Identity */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#059669' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              1. Brand Identity & Dealership Name
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                backgroundColor: '#ecfdf5',
                border: '2px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                flexShrink: 0
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40 }}>
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
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
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '2px' }}>
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
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
                    value={formData.gstin}
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
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Bank Account & Settlement */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: '#d97706' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              4. Bank Account & Digital Settlement Details
            </h3>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  Showroom UPI ID
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontWeight: 600, color: '#047857' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
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
              boxShadow: '0 2px 4px rgba(5,150,105,0.3)'
            }}
          >
            <Save size={18} /> Save Company Profile
          </button>
        </div>

      </form>
    </div>
  );
}
