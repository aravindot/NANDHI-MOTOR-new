const fs = require('fs');

let content = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// 1. Import Truck icon
content = content.replace(/Mail, MessageCircle, Copy } from 'lucide-react';/, "Mail, MessageCircle, Copy, Truck, Edit3 } from 'lucide-react';");

// 2. Add state for tabs and tracking modal
content = content.replace(
  "const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'warranty', data: null });",
  "const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'warranty', data: null });\n  const [activeTab, setActiveTab] = useState('claims');\n  const [trackingModalConfig, setTrackingModalConfig] = useState({ isOpen: false, claim: null, courierPartner: '', trackingNo: '', dispatchStatus: 'Pending Dispatch' });\n"
);

// 3. Add dispatchStatus to initial states
content = content.replace(/trackingNo:\s*'',/g, "trackingNo: '',\n    dispatchStatus: 'Pending Dispatch',");

// 4. Create handleUpdateTracking function
const handleUpdateTrackingFunc = `
  const handleUpdateTracking = (e) => {
    e.preventDefault();
    const nextClaims = claims.map(c => {
      if (c.id === trackingModalConfig.claim.id) {
        return {
          ...c,
          courierPartner: trackingModalConfig.courierPartner,
          trackingNo: trackingModalConfig.trackingNo,
          dispatchStatus: trackingModalConfig.dispatchStatus
        };
      }
      return c;
    });
    setClaims(nextClaims);
    localStorage.setItem('nandhi_app_warranty_claims', JSON.stringify(nextClaims));
    setTrackingModalConfig({ isOpen: false, claim: null, courierPartner: '', trackingNo: '', dispatchStatus: 'Pending Dispatch' });
  };
`;

content = content.replace('const handleUpdateStatus = async (id, newStatus) => {', handleUpdateTrackingFunc + '\n  const handleUpdateStatus = async (id, newStatus) => {');

// 5. Add tabs UI above KPI cards
const tabsUI = `
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0px', marginBottom: '8px', marginTop: '10px' }}>
        <button
          onClick={() => setActiveTab('claims')}
          style={{
            background: 'none', border: 'none', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'claims' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'claims' ? '3px solid #059669' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Claims Hub
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          style={{
            background: 'none', border: 'none', padding: '12px 16px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'tracking' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'tracking' ? '3px solid #059669' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Truck size={16} /> Courier & Dispatch Tracking
        </button>
      </div>

      {activeTab === 'claims' ? (
        <>
`;

content = content.replace("{/* KPI Cards */}", tabsUI + "\n      {/* KPI Cards */}");

// 6. Close activeTab === 'claims' and add tracking view before modal render
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

content = content.replace('{/* Modal Overlay for Add/Edit Form */}', trackingView + '\n\n      {/* Modal Overlay for Add/Edit Form */}');

// 7. Add Tracking Update Modal at the very end
const trackingModal = `
      {/* Tracking Details Modal */}
      {trackingModalConfig.isOpen && trackingModalConfig.claim && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#059669" /> Update Tracking Status
              </h3>
              <button onClick={() => setTrackingModalConfig({ ...trackingModalConfig, isOpen: false, claim: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTracking}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Dispatch Status</label>
                  <select
                    value={trackingModalConfig.dispatchStatus}
                    onChange={(e) => setTrackingModalConfig({ ...trackingModalConfig, dispatchStatus: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  >
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Courier Partner</label>
                  <select
                    value={trackingModalConfig.courierPartner}
                    onChange={(e) => setTrackingModalConfig({ ...trackingModalConfig, courierPartner: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  >
                    <option value="">Select Partner</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Professional Couriers">Professional Couriers</option>
                    <option value="India Post">India Post</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Tracking Number (AWB)</label>
                  <input
                    type="text"
                    value={trackingModalConfig.trackingNo}
                    onChange={(e) => setTrackingModalConfig({ ...trackingModalConfig, trackingNo: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTrackingModalConfig({ ...trackingModalConfig, isOpen: false, claim: null })}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Tracking Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace('{/* Mail Options Modal */}', trackingModal + '\n      {/* Mail Options Modal */}');


// 8. Let's remove the courier fields from the original File Warranty Claim form since they're in a separate place now.
content = content.replace(/\{\/\* Courier Tracking \*\/\}[\s\S]*?\{\/\* Submit Buttons \*\/\}/, '{/* Submit Buttons */}');

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', content, 'utf8');
console.log('Done mapping tracking details.');
