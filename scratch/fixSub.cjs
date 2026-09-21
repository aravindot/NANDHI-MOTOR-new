const fs = require('fs');

let content = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// 1. Remove subtitle
const subtitleText = `          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Track manufacturer OEM parts replacement warranty claims, inspect defect categories, and manage reimbursement status.
          </p>`;
content = content.replace(subtitleText, "");

// 2. We need to inject the tracking view!
// Find `{/* File Warranty Claim Modal */}`
const trackingView = `
        </>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: '#059669' }} /> Manage Courier & Return Dispatch
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f9fafb', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Claim Details</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Customer & Vehicle</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Defective Part</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Dispatch Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Update Tracking</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      No claims found.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
                    <tr key={claim.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{claim.dateOfSale}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 500, color: '#374151' }}>{claim.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Reg: {claim.vehicleRegNo}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 500, color: '#374151' }}>{claim.defectivePart}</div>
                        {claim.partCode && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Code: {claim.partCode}</div>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: claim.dispatchStatus === 'Delivered' ? '#ecfdf5' : claim.dispatchStatus === 'Dispatched' ? '#eff6ff' : claim.dispatchStatus === 'In Transit' ? '#fffbeb' : '#f3f4f6',
                          color: claim.dispatchStatus === 'Delivered' ? '#059669' : claim.dispatchStatus === 'Dispatched' ? '#2563eb' : claim.dispatchStatus === 'In Transit' ? '#d97706' : '#4b5563'
                        }}>
                          {claim.dispatchStatus || 'Pending Dispatch'}
                        </div>
                        {claim.trackingNo && (
                          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>
                            {claim.courierPartner} : {claim.trackingNo}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => setTrackingModalConfig({
                            isOpen: true,
                            claim: claim,
                            courierPartner: claim.courierPartner || '',
                            trackingNo: claim.trackingNo || '',
                            dispatchStatus: claim.dispatchStatus || 'Pending Dispatch'
                          })}
                          style={{
                            background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          <Edit3 size={14} /> Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

`;

// Inject trackingView before `{/* File Warranty Claim Modal */}`
if (!content.includes(trackingView)) {
    content = content.replace('{/* File Warranty Claim Modal */}', trackingView + '{/* File Warranty Claim Modal */}');
}

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', content, 'utf8');
console.log("Done.");
