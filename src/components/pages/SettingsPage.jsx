import React from 'react';
import { Settings, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export default function SettingsPage({ showPreviews, setShowPreviews }) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Bar */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Application Settings</h2>
        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Configure application features, layouts, and print preview visibility options</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Settings size={18} style={{ color: '#059669', marginRight: '6px' }} /> Feature Preview & Ledger Layouts
          </h3>
        </div>

        <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #d1fae5',
            fontSize: '0.84rem',
            color: '#065f46',
            marginBottom: '10px'
          }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>Simplify your editing space. By default, print previews and submitted ledgers are displayed side-by-side with your form inputs. You can toggle this setting to switch between side-by-side or focused full-width forms.</span>
          </div>

          {/* Master Toggle */}
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
              <span style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5, display: 'inline-block', maxWidth: '580px' }}>
                Display transaction ledger lists, printable receipts, and PDF preview documents next to your form inputs across Leads, Quotations, Invoices, and Bookings. Disable this to expand entry forms to the full width of the screen.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
              {showPreviews ? (
                <ToggleRight size={44} color="#059669" style={{ fill: '#d1fae5' }} />
              ) : (
                <ToggleLeft size={44} color="#9ca3af" />
              )}
            </div>
          </div>

          {/* Action Row */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontWeight: 600, padding: '8px 16px' }}
              onClick={() => setShowPreviews(true)}
            >
              Reset to Defaults
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
