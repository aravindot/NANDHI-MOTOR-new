import React, { useRef, useState } from 'react';
import { Printer, X, Download, Check, ShieldCheck, Wrench, FileText, ShoppingCart, Award, MessageCircle, FileDown, Receipt } from 'lucide-react';
import { generateInvoicePdfAndShare, generateQuotationPdfAndShare, buildTaxInvoicePdf, buildQuotationPdf } from '../utils/pdfShareUtil';
import { getPrintTheme, readPrintSettingsFromStorage, openThemePrintWindow, buildPrintThemeCss } from '../utils/printSettings';
import { formatAadhar } from '../utils/formatUtils';

export default function PrintPreviewModal({
  isOpen,
  onClose,
  type = 'invoice', // 'invoice' | 'quotation' | 'booking' | 'jobsheet' | 'servicebill' | 'purchase' | 'warranty'
  data = {},
  companyProfile: propProfile,
  onConvertQuoteToInvoice,
  onConvertBookingToInvoice
}) {
  const docRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const savedSettings = React.useMemo(() => {
    const baseSettings = propProfile?.printSettings || readPrintSettingsFromStorage();
    return baseSettings && Object.keys(baseSettings).length ? baseSettings : readPrintSettingsFromStorage();
  }, [propProfile, isOpen]);

  const printSettings = React.useMemo(() => {
    return savedSettings || readPrintSettingsFromStorage();
  }, [savedSettings]);

  const theme = React.useMemo(() => getPrintTheme(printSettings, type), [printSettings, type]);

  const profile = React.useMemo(() => {
    if (propProfile && propProfile.name) return propProfile;
    try {
      const primary = localStorage.getItem('nandhi_app_company_profile');
      if (primary) {
        const parsed = JSON.parse(primary);
        if (parsed && parsed.name) return parsed;
      }
      const legacy = localStorage.getItem('nandhi_company_profile');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {}
    return {
      name: 'NANDHI MOTORS',
      tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
      address: '170/2, ITTERI ROAD, PALANI-624601',
      phone: '+91 7604857272',
      altPhone: '+91 7604847272',
      email: 'nandhimotorspalani@gmail.com',
      website: 'www.nandhimotors.com',
      gstin: '33BCXPA4714R1Z2',
      state: 'Tamil Nadu (33)',
      bankName: 'IDBI BANK',
      accountName: 'NANDHI MOTORS',
      accountNumber: '0920102000007825',
      ifscCode: 'IBKL0000920',
      branch: 'PALANI BRANCH',
      upiId: 'nandhimotors@hdfcbank'
    };
  }, [propProfile, isOpen]);

  const companyPhones = [profile.phone, profile.altPhone].filter(Boolean).join(' / ');
  const accentColor = theme.primary;
  const secondaryColor = theme.secondary;
  const softFill = theme.soft;

  if (!isOpen || !data) return null;

  const hypothecation = data.hypothecation || data.finance || data.financier || data.hypothecationDetails || '';

  const handlePrint = () => {
    if (docRef.current) {
      openThemePrintWindow('Print Document', docRef.current.innerHTML, printSettings, type);
    } else {
      window.print();
    }
  };

  const handleWhatsAppShare = async () => {
    setIsGeneratingPdf(true);
    try {
      if (type === 'quotation') {
        await generateQuotationPdfAndShare(data, profile, false, printSettings, type);
      } else {
        await generateInvoicePdfAndShare(data, profile, false, printSettings, type);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (type === 'quotation') {
        await generateQuotationPdfAndShare(data, profile, true, printSettings, type);
      } else {
        await generateInvoicePdfAndShare(data, profile, true, printSettings, type);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="print-modal-overlay">
      <style>{`
        ${buildPrintThemeCss(printSettings, type)}
        .print-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(17, 24, 39, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
        }

        .print-modal-container {
          background-color: #ffffff;
          border-radius: 12px;
          width: 100%;
          max-width: 860px;
          height: 92vh;
          max-height: 92vh;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          margin: auto;
          overflow: hidden;
          position: relative;
        }

        .print-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 24px;
          background-color: #1f2937;
          color: #ffffff;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 20;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .print-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 28px 36px 40px;
          background-color: #ffffff;
          color: #111827;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.4;
          font-size: 13px;
          scroll-behavior: smooth;
        }

        /* Custom Scrollbar */
        .print-modal-body::-webkit-scrollbar {
          width: 9px;
        }
        .print-modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        .print-modal-body::-webkit-scrollbar-thumb {
          background: ${accentColor};
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        .print-modal-body::-webkit-scrollbar-thumb:hover {
          background: ${secondaryColor};
        }

        .print-modal-footer-bar {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #6b7280;
          flex-shrink: 0;
        }

        /* Printable Paper Document Styling */
        .doc-paper {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 24px;
          border-radius: 4px;
        }

        .doc-header-banner {
          text-align: center;
          border-bottom: 2px solid #111827;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }

        .doc-header-banner h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: ${theme.primary};
          letter-spacing: 0.5px;
        }

        .doc-header-banner p {
          margin: 2px 0 0;
          color: #4b5563;
          font-size: 12px;
        }

        .doc-badge-title {
          display: inline-block;
          margin-top: 10px;
          background-color: ${theme.secondary};
          color: #ffffff;
          padding: 4px 16px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 1px;
          border-radius: 20px;
        }

        .doc-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 12px;
        }

        .doc-grid-2 p {
          margin: 3px 0;
        }

        .doc-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 12px;
        }

        .doc-table th {
          background-color: #f3f4f6;
          border-top: 1.5px solid #111827;
          border-bottom: 1.5px solid #111827;
          padding: 8px;
          text-align: left;
          font-weight: 700;
        }

        .doc-table td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .doc-total-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-top: 14px;
          font-size: 13px;
        }

        .doc-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          padding-top: 10px;
        }

        .doc-sig-line {
          border-top: 1px solid #111827;
          width: 180px;
          text-align: center;
          padding-top: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* PRINT ISOLATION */
        @media print {
          body * {
            visibility: hidden;
          }
          .print-modal-body, .print-modal-body * {
            visibility: visible;
          }
          .print-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-modal-container {
            box-shadow: none !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .print-modal-header, .print-modal-footer-bar {
            display: none !important;
          }
          .print-modal-body {
            padding: 0 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .doc-paper {
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="print-modal-container">
        {/* Top Sticky Control Header */}
        <div className="print-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={20} style={{ color: accentColor }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                Print Preview &bull; {type === 'invoice' ? 'Tax Invoice' : type === 'quotation' ? 'Quotation' : type === 'booking' ? 'Booking Confirmation' : type === 'jobsheet' ? 'Job Card' : type === 'purchase' ? 'Purchase Voucher' : type === 'warranty' ? 'Warranty Claim Voucher' : 'Service Bill'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppShare}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accentColor,
                color: '#ffffff',
                border: 'none',
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '8px',
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                opacity: isGeneratingPdf ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              title="Send official PDF directly to customer mobile on WhatsApp"
            >
              <MessageCircle size={18} />
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accentColor,
                color: '#ffffff',
                border: 'none',
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '8px',
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                opacity: isGeneratingPdf ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              title="Download high-resolution A4 PDF document"
            >
              <FileDown size={18} />
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accentColor,
                color: '#ffffff',
                border: 'none',
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease'
              }}
              title="Print Document"
            >
              <Printer size={18} />
            </button>

            {/* Convert to Invoice Button (only for quotation preview) */}
            {type === 'quotation' && onConvertQuoteToInvoice && (
              <button
                onClick={() => onConvertQuoteToInvoice(data)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: secondaryColor,
                  color: '#ffffff',
                  border: 'none',
                  width: '38px',
                  height: '38px',
                  padding: 0,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                title="Convert this Quotation directly to a Tax Invoice"
              >
                <Receipt size={18} />
              </button>
            )}

            {/* Convert to Invoice Button (for booking preview) */}
            {type === 'booking' && onConvertBookingToInvoice && (
              <button
                onClick={() => onConvertBookingToInvoice(data)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: secondaryColor,
                  color: '#ffffff',
                  border: 'none',
                  width: '38px',
                  height: '38px',
                  padding: 0,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                title="Convert this Booking to Sale / Tax Invoice"
              >
                <Receipt size={18} />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#374151',
                color: '#ffffff',
                border: 'none',
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Close Preview Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Printable Paper Body with Dedicated Scroll */}
        <div id="print-scroll-container" className="print-modal-body">
          <div ref={docRef} className={`doc-paper print-style-${theme.style || 'classic'}`}>
            {/* Header Title */}
            <div className="doc-header-banner">
              <div>
                <h1>{profile.name}</h1>
                <p>{profile.tagline}</p>
                <p style={{ fontSize: '11px', color: '#6b7280' }}>
                  {profile.address} | Phone: {companyPhones} | GSTIN: {profile.gstin}
                </p>
              </div>
              <div className="doc-badge-title">
                {type === 'invoice' && 'TAX INVOICE'}
                {type === 'quotation' && 'OFFICIAL PRICE QUOTATION'}
                {type === 'booking' && 'CUSTOMER VEHICLE BOOKING SLIP'}
                {type === 'jobsheet' && 'WORKSHOP SERVICE JOB CARD'}
                {type === 'servicebill' && 'SERVICE & SPARE PARTS TAX INVOICE'}
                {type === 'purchase' && 'GOODS INWARD & PURCHASE VOUCHER'}
                {type === 'warranty' && 'OEM PARTS WARRANTY CLAIM SHEET'}
              </div>
            </div>

            {/* 1. TAX INVOICE PREVIEW */}
            {type === 'invoice' && (
              <div>
                {/* Top Invoice Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
                    Invoice No: <span style={{ fontFamily: 'monospace', color: accentColor, fontSize: '1rem' }}>#{data.invoiceNo || '01'}</span>
                  </span>

                  <span style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'right' }}>
                    Date: <strong>{data.invoiceDate || data.createdOn || new Date().toLocaleDateString('en-IN')}</strong>
                  </span>
                </div>

                {/* 2-Column Customer & Vehicle Identity */}
                <div className="doc-grid-2" style={{ gap: '16px', marginBottom: '12px' }}>
                  
                  {/* Left Column: Customer Bill To Details */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      Customer Details
                    </div>
                    <p style={{ margin: '2px 0' }}><strong>Customer Name:</strong> {data.customerName || data.name || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}><strong>Mobile Number:</strong> {data.customerPhone || data.customerMobile || data.mobile || 'N/A'}</p>
                    <p style={{ margin: '2px 0' }}><strong>Billing Address:</strong> {data.customerAddress || data.address || 'Showroom Direct Delivery'}</p>
                    <p style={{ margin: '2px 0' }}><strong>Aadhaar Number:</strong> {formatAadhar(data.customerAadhar) || data.customerAadhar || 'N/A (Verified)'}</p>
                    {data.customerGst && <p style={{ margin: '2px 0' }}><strong>Customer GSTIN:</strong> <span style={{ fontFamily: 'monospace' }}>{data.customerGst}</span></p>}
                  </div>

                  {/* Right Column: Vehicle Technical & Serial Numbers */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: secondaryColor, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      Vehicle Specifications
                    </div>
                    <p style={{ margin: '2px 0' }}><strong>Color:</strong> {data.vehicleColor || 'Standard'}</p>
                    <p style={{ margin: '2px 0' }}><strong>VIN No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{data.vinNumber || data.vin || data.chassisNo || 'ME4JF911NK00892'}</span></p>
                    <p style={{ margin: '2px 0' }}><strong>Motor No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{data.engineNo || data.motorNumber || 'JF91E918231'}</span></p>
                    <p style={{ margin: '2px 0' }}><strong>Battery Serial No:</strong> {data.batteryNumber || data.batteryNo || 'BAT-2026-NANDHI'}</p>
                    <p style={{ margin: '2px 0' }}><strong>Charger / Controller:</strong> {data.chargerNumber || data.chargerNo || 'CHG-9921'} / {data.controllerNumber || data.controllerNo || 'CTRL-8812'}</p>
                    {hypothecation && <p style={{ margin: '2px 0' }}><strong>Finance / Hypothecation:</strong> {hypothecation}</p>}
                  </div>
                </div>

                {/* Warranty Coverage Banner */}
                <div style={{ backgroundColor: softFill, border: `1px solid ${theme.accent}`, padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', color: accentColor, marginBottom: '12px' }}>
                  <strong>Warranty Coverage:</strong> {data.warrantyDetails || '3 Years or 40,000 KMs for Motor, Controller, Cluster & Battery (Whichever is earlier)'}
                </div>

                {/* Itemized Commercial Table */}
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Sl.</th>
                      <th>Description</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>HSN/SAC</th>
                      <th style={{ width: '45px', textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Taxable Value (₹)</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>GST %</th>
                      <th style={{ textAlign: 'right' }}>Tax Amount (₹)</th>
                      <th style={{ textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <strong>{data.vehicleModel}</strong> ({data.vehicleColor})
                      </td>
                      <td style={{ textAlign: 'center' }}>87112029</td>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(data.exShowroom || (data.grandTotal * 0.78) || 75000).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'center' }}>{data.gstRate || 5}%</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(data.gstAmount || Math.round(Number(data.exShowroom || 75000) * ((data.gstRate || 5) / 100))).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: accentColor }}>₹{(Number(data.exShowroom || 75000) + Number(data.gstAmount || Math.round(Number(data.exShowroom || 75000) * ((data.gstRate || 5) / 100)))).toLocaleString('en-IN')}</td>
                    </tr>

                    {Number(data.subsidy || 0) > 0 && (
                      <tr style={{ color: accentColor, backgroundColor: softFill }}>
                        <td>4</td>
                        <td><strong>Government FAME-II / State EV Promotion Subsidy (-)</strong></td>
                        <td style={{ textAlign: 'center' }}>9999</td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>-₹{Number(data.subsidy).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'center' }}>0%</td>
                        <td style={{ textAlign: 'right' }}>₹0</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>-₹{Number(data.subsidy).toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    {Number(data.discount || 0) > 0 && (
                      <tr style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}>
                        <td>{Number(data.subsidy || 0) > 0 ? '5' : '4'}</td>
                        <td><strong>Dealership Festive / Special Discount Benefit (-)</strong></td>
                        <td style={{ textAlign: 'center' }}>--</td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>-₹{Number(data.discount).toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'center' }}>0%</td>
                        <td style={{ textAlign: 'right' }}>₹0</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>-₹{Number(data.discount).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Financial Summary & Roundoff */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '12px 0', gap: '20px' }}>
                  
                  {/* Right: Totals Box */}
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.825rem', marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#6b7280' }}>Sub Total (Ex-Showroom):</span>
                      <span style={{ fontWeight: 600 }}>₹{Number(data.exShowroom || (data.grandTotal * 0.78) || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span style={{ color: '#6b7280' }}>Total GST Tax:</span>
                      <span style={{ fontWeight: 600 }}>₹{Number(data.gstAmount || Math.round(Number(data.exShowroom || 0) * 0.05)).toLocaleString('en-IN')}</span>
                    </div>

                    {Number(data.subsidy || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: accentColor, fontWeight: 600 }}>
                        <span>Subsidy Deduction:</span>
                        <span>-₹{Number(data.subsidy).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {Number(data.discount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#dc2626', fontWeight: 600 }}>
                        <span>Discount:</span>
                        <span>-₹{Number(data.discount).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {data.roundoffAdjustment !== undefined && data.roundoffAdjustment !== 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#6b7280' }}>
                        <span>Round-Off:</span>
                        <span>₹{data.roundoffAdjustment}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: `2px solid ${secondaryColor}`, fontWeight: 800, fontSize: '1rem', color: accentColor, marginTop: '4px' }}>
                      <span>Grand Total:</span>
                      <span>₹{Number(data.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Terms & Conditions */}
                <div style={{ marginTop: '16px', fontSize: '0.72rem', color: '#4b5563', lineHeight: 1.4 }}>
                  <strong style={{ display: 'block', color: '#111827', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    Terms & Conditions:
                  </strong>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.invoiceTerms || `1. Goods once sold will not be taken back or exchanged.
2. Warranty is subject to manufacturer's policy and applies from the date of this invoice.
3. Dealership is not liable for indirect damages or delays beyond our control.
4. All disputes are subject to local city jurisdiction only.
5. E. & O.E. (Errors and Omissions Excepted)`}
                  </div>
                </div>

                {/* Signature Block */}
              </div>
            )}

            {/* 2. QUOTATION PREVIEW */}
            {type === 'quotation' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Quote ID:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>#{data.quoteId || 'QT-01'}</span></p>
                    <p><strong>Quote Date:</strong> {data.createdOn || new Date().toLocaleDateString('en-IN')}</p>
                    <p><strong>Customer Name:</strong> {data.customerName || 'Valued Customer'}</p>
                    <p><strong>Mobile:</strong> {data.customerPhone || data.mobile || 'N/A'}</p>
                    {(data.customerAddress || data.address) && <p><strong>Address:</strong> {data.customerAddress || data.address}</p>}
                    {data.customerEmail && <p><strong>Email:</strong> {data.customerEmail}</p>}
                    {data.customerAadhar && <p><strong>Aadhar:</strong> {formatAadhar(data.customerAadhar) || data.customerAadhar}</p>}
                    {data.customerGst && <p><strong>GSTIN:</strong> {data.customerGst}</p>}
                  </div>
                  <div>
                    <p><strong>Model:</strong> {data.vehicleModel}</p>
                    <p><strong>Color:</strong> {data.vehicleColor || 'Subject to Availability'}</p>
                    <p><strong>Validity:</strong> 7 Days from date of issuance</p>
                    {data.executive && <p><strong>Sales Executive:</strong> {data.executive}</p>}
                  </div>
                </div>

                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Cost Component</th>
                      <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ex-Showroom Base Vehicle Price</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(data.exShowroom || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    {(Number(data.gstRate || 0) > 0 || Number(data.gstAmount || 0) > 0) && (
                      <tr>
                        <td>Applicable GST ({data.gstRate !== undefined ? data.gstRate : 5}%)</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: accentColor }}>
                          +₹{Number(data.gstAmount !== undefined ? data.gstAmount : Math.round(Number(data.exShowroom || 0) * ((data.gstRate !== undefined ? data.gstRate : 5) / 100))).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>Life Tax & RTO Registration Fees</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(data.rto || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td>Comprehensive Insurance (1 Yr Own Damage + 5 Yr TP)</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(data.insurance || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    {Number(data.accessories || 0) > 0 && (
                      <tr>
                        <td>Essential Accessories Kit & Helmet</td>
                        <td style={{ textAlign: 'right' }}>₹{Number(data.accessories).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {Number(data.handling || 0) > 0 && (
                      <tr>
                        <td>Logistics, Handling & Showroom PDI</td>
                        <td style={{ textAlign: 'right' }}>₹{Number(data.handling).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {Number(data.extendedWarranty || 0) > 0 && (
                      <tr>
                        <td>5-Year Extended Warranty Shield</td>
                        <td style={{ textAlign: 'right' }}>₹{Number(data.extendedWarranty).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    {Number(data.discount || 0) > 0 && (
                      <tr style={{ color: '#dc2626' }}>
                        <td>Dealer Special Discount (-)</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>-₹{Number(data.discount).toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="doc-total-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px', padding: '6px 0', borderTop: '2px solid #111827', fontWeight: 800, fontSize: '15px', color: accentColor }}>
                    <span>Estimated On-Road Price:</span>
                    <span>₹{Number(data.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Terms & Conditions Section */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  margin: '18px 0 14px',
                  fontSize: '10.5px',
                  lineHeight: 1.5,
                  color: '#4b5563'
                }}>
                  <div style={{ fontWeight: 700, color: accentColor, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
                    Terms & Conditions:
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {profile.quotationTerms || `1. Prices quoted are valid for 7 days from the date of issuance and subject to manufacturer price revisions.
2. Final delivery is subject to availability of vehicle stock and color chosen at the time of final booking.
3. RTO registration, road tax, and insurance charges are subject to statutory revisions by Government authorities.
4. Full on-road payment is required prior to vehicle invoicing and registration dispatch.
5. Standard accessories and helmet are supplied according to dealership delivery policy.`}
                  </div>
                </div>

                <div className="doc-signatures">
                  <div className="doc-sig-line">Customer Acknowledgment</div>
                  <div className="doc-sig-line">Sales Executive Sign</div>
                </div>
              </div>
            )}

            {/* 3. BOOKING RECEIPT PREVIEW */}
            {type === 'booking' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Booking Ref:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>#{data.bookingId || 'BK-01'}</span></p>
                    <p><strong>Booking Date:</strong> {data.createdOn || new Date().toLocaleDateString('en-IN')}</p>
                    <p><strong>Customer Name:</strong> {data.customerName || data.name}</p>
                    <p><strong>Mobile:</strong> {data.customerPhone || data.mobile}</p>
                    {(data.customerAddress || data.address) && <p><strong>Address:</strong> {data.customerAddress || data.address}</p>}
                  </div>
                  <div>
                    <p><strong>Booked Vehicle:</strong> {data.vehicleModel}</p>
                    <p><strong>Color Choice:</strong> {data.vehicleColor}</p>
                    <p><strong>Payment Mode:</strong> {data.paymentMode || 'Cash / GPay'}</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: '6px', textAlign: 'center', margin: '20px 0' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: secondaryColor, fontWeight: 700 }}>Advance Booking Amount Received</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: accentColor, marginTop: '4px' }}>
                    ₹{Number(data.advancePaid || 5000).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                    Tentative Delivery Schedule: Within 7 to 10 Working Days
                  </div>
                </div>

                <div className="doc-signatures">
                  <div className="doc-sig-line">Customer Signature</div>
                  <div className="doc-sig-line">Cashier / Billing In-charge</div>
                </div>
              </div>
            )}

            {/* 4. WORKSHOP JOB CARD */}
            {type === 'jobsheet' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Job Sheet ID:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>{data.id || 'JS-01'}</span></p>
                    <p><strong>Customer Name:</strong> {data.customerName}</p>
                    <p><strong>Mobile:</strong> {data.customerMobile || data.mobile || 'N/A'}</p>
                    <p><strong>Service Date:</strong> {data.date || new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p><strong>Vehicle Reg No:</strong> <span style={{ fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>{(data.vehicleNo || data.vehicleRegNo || '').toUpperCase()}</span></p>
                    <p><strong>Odometer (KM):</strong> {data.vehicleKm || data.odometerKm || '0'} KM</p>
                    <p><strong>Service Type:</strong> {data.serviceType || 'Paid Service'}</p>
                    <p><strong>Current Status:</strong> {data.status || 'In Progress'}</p>
                  </div>
                </div>

                <div style={{ border: '1px solid #d1d5db', padding: '12px', borderRadius: '4px', backgroundColor: '#f9fafb', margin: '14px 0' }}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: '#374151' }}>Reported Customer Complaints & Work Requisition:</strong>
                  <div style={{ whiteSpace: 'pre-line', color: '#111827', lineHeight: 1.6 }}>
                    {data.complaints || '1. General periodic service\n2. Engine oil change\n3. Front and rear brake inspection\n4. Water wash & lubrication'}
                  </div>
                </div>

                <div className="doc-signatures">
                  <div className="doc-sig-line">Customer Signature (Inward)</div>
                  <div className="doc-sig-line">Assigned Mechanic / Advisor</div>
                </div>
              </div>
            )}

            {/* 5. SERVICE BILLING INVOICE */}
            {type === 'servicebill' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Service Bill No:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>{data.id || 'SB-01'}</span></p>
                    <p><strong>Customer Name:</strong> {data.customerName}</p>
                    <p><strong>Vehicle Reg No:</strong> <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{(data.vehicleNo || data.vehicleRegNo || '').toUpperCase()}</span></p>
                  </div>
                  <div>
                    <p><strong>Bill Date:</strong> {data.date || new Date().toLocaleDateString('en-IN')}</p>
                    <p><strong>Service Type:</strong> {data.serviceType || 'Paid Service'}</p>
                    <p><strong>Job Sheet Ref:</strong> {data.jobSheetId || 'JS-Auto'}</p>
                  </div>
                </div>

                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.laborItems || [{ desc: 'General Labor Charges', amount: 350 }]).map((l, i) => (
                      <tr key={`l-${i}`}>
                        <td>[Labor] {l.desc}</td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>₹{l.amount}</td>
                        <td style={{ textAlign: 'right' }}>₹{l.amount}</td>
                      </tr>
                    ))}
                    {(data.parts || []).map((p, i) => (
                      <tr key={`p-${i}`}>
                        <td>[Spare Part] {p.name}</td>
                        <td style={{ textAlign: 'center' }}>{p.qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{p.price}</td>
                        <td style={{ textAlign: 'right' }}>₹{p.price * p.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="doc-total-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', padding: '4px 0' }}>
                    <span>Subtotal:</span>
                    <span>₹{Number(data.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', padding: '4px 0' }}>
                    <span>GST (18% / 5%):</span>
                    <span>₹{Number(data.gst || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', padding: '4px 0', borderTop: '2px solid #111827', fontWeight: 800, fontSize: '15px', color: accentColor }}>
                    <span>Total Paid:</span>
                    <span>₹{Number(data.grandTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="doc-signatures">
                  <div className="doc-sig-line">Customer Signature (Vehicle Received)</div>
                  <div className="doc-sig-line">Service Advisor</div>
                </div>
              </div>
            )}

            {/* 6. PURCHASE VOUCHER */}
            {type === 'purchase' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Voucher No:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>{data.id}</span></p>
                    <p><strong>Supplier Name:</strong> {data.supplierName}</p>
                    <p><strong>Supplier GSTIN:</strong> {data.supplierGst || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Supplier Invoice No:</strong> {data.invoiceNo}</p>
                    <p><strong>Purchase Date:</strong> {data.date}</p>
                    <p><strong>Category:</strong> {data.purchaseType}</p>
                  </div>
                </div>

                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Tax (GST)</th>
                      <th style={{ textAlign: 'right' }}>Total Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>{data.itemDetails}</strong></td>
                      <td style={{ textAlign: 'center' }}>{data.qty || 1}</td>
                      <td style={{ textAlign: 'right' }}>₹{(data.gstAmount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(data.totalAmount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="doc-signatures">
                  <div className="doc-sig-line">Stores / Goods Inward</div>
                  <div className="doc-sig-line">Authorized Signatory</div>
                </div>
              </div>
            )}

            {/* 7. WARRANTY CLAIM VOUCHER */}
            {type === 'warranty' && (
              <div>
                <div className="doc-grid-2">
                  <div>
                    <p><strong>Claim ID:</strong> <span style={{ fontFamily: 'monospace', color: accentColor, fontWeight: 700 }}>{data.id}</span></p>
                    <p><strong>Customer Name:</strong> {data.customerName}</p>
                    <p><strong>Vehicle Reg No:</strong> <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{(data.vehicleRegNo || data.vehicleNo || '').toUpperCase()}</span></p>
                  </div>
                  <div>
                    <p><strong>Vehicle Model:</strong> {data.vehicleModel}</p>
                    <p><strong>Odometer:</strong> {data.odometerKm} KM</p>
                    <p><strong>Submission Date:</strong> {data.submissionDate}</p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '14px', border: '1px solid #d1d5db', borderRadius: '4px', margin: '14px 0' }}>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Defective Component:</strong> {data.defectivePart} ({data.defectCategory})</p>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Claim Amount:</strong> ₹{Number(data.claimAmount || 0).toLocaleString('en-IN')}</p>
                  <p style={{ margin: 0 }}><strong>Failure Notes:</strong> {data.issueDescription || 'Standard manufacturing defect verification'}</p>
                </div>

                {/* Courier & Dispatch Tracking Information */}
                {(data.courierPartner || data.trackingNo || data.courierStatus) && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', border: '1px solid #bbf7d0', borderRadius: '4px', margin: '14px 0', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🚚 Courier & Dispatch Tracking
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', color: '#1f2937' }}>
                      <div><strong>Courier Partner:</strong> {data.courierPartner || 'N/A'}</div>
                      <div><strong>Tracking / AWB No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{data.trackingNo || 'N/A'}</span></div>
                      <div><strong>Courier Status:</strong> <span style={{ fontWeight: 600, color: data.courierStatus === 'Delivered' ? '#16a34a' : data.courierStatus === 'In Transit' ? '#2563eb' : '#d97706' }}>{data.courierStatus || 'Not Dispatched'}</span></div>
                      {data.dispatchDate && <div><strong>Dispatch Date:</strong> {data.dispatchDate}</div>}
                      {data.deliveryDate && <div><strong>Delivery Date:</strong> {data.deliveryDate}</div>}
                    </div>
                    {data.courierNotes && (
                      <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#4b5563' }}>
                        <strong>Dispatch Notes:</strong> {data.courierNotes}
                      </div>
                    )}
                  </div>
                )}

                <div className="doc-signatures">
                  <div className="doc-sig-line">Service Advisor Sign</div>
                  <div className="doc-sig-line">OEM Warranty Coordinator</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Quick Scroll & Navigation Bar */}
        <div className="print-modal-footer-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>Document Preview &bull; Scroll up/down to review all fields & terms</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('print-scroll-container');
                if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⬆️ Top
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('print-scroll-container');
                if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⬇️ Bottom (Signatures)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
