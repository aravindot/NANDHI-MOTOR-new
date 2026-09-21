const fs = require('fs');
let code = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// 1. Simplify Headers
const oldHeaders = `<th style={{ padding: '12px 18px' }}>Claim ID & Date</th>
                <th style={{ padding: '12px 18px' }}>Customer & Vehicle</th>
                <th style={{ padding: '12px 18px' }}>Defective Component</th>
                <th style={{ padding: '12px 18px' }}>Category & KM</th>
                <th style={{ padding: '12px 18px' }}>Claim Value</th>
                <th style={{ padding: '12px 18px' }}>OEM Ref / Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>`;

const newHeaders = `<th style={{ padding: '12px 18px' }}>CLAIM ID</th>
                <th style={{ padding: '12px 18px' }}>CUSTOMER / VEHICLE</th>
                <th style={{ padding: '12px 18px' }}>DEFECTIVE PART</th>
                <th style={{ padding: '12px 18px' }}>CATEGORY</th>
                <th style={{ padding: '12px 18px' }}>VALUE</th>
                <th style={{ padding: '12px 18px' }}>STATUS</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>ACTIONS</th>`;

code = code.replace(oldHeaders, newHeaders);

// 2. Simplify Claim ID & Date Cell
const oldCol1 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Submitted: {claim.submissionDate}</div>
                    </td>`;
const newCol1 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                    </td>`;
code = code.replace(oldCol1, newCol1);

// 3. Simplify Customer & Vehicle Cell
const oldCol2 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 500 }}>{claim.vehicleRegNo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{claim.vehicleModel}</div>
                    </td>`;
const newCol2 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase' }}>{claim.vehicleRegNo}</div>
                    </td>`;
code = code.replace(oldCol2, newCol2);

// 4. Simplify Defective Part Cell
const oldCol3 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{claim.defectivePart}</div>
                      {claim.partCode && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Code: {claim.partCode}</div>}
                    </td>`;
const newCol3 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{claim.defectivePart}</div>
                      {claim.partCode && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{claim.partCode}</div>}
                    </td>`;
code = code.replace(oldCol3, newCol3);

// 5. Simplify Category Cell
const oldCol4 = `<td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>
                        {claim.defectCategory}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{claim.odometerKm} KM</div>
                    </td>`;
const newCol4 = `<td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#4b5563' }}>
                        {claim.defectCategory}
                      </span>
                    </td>`;
code = code.replace(oldCol4, newCol4);

// 6. Simplify Value Cell
const oldCol5 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>₹{claim.claimAmount.toLocaleString('en-IN')}</div>
                    </td>`;
const newCol5 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>₹{claim.claimAmount.toLocaleString('en-IN')}</div>
                    </td>`;
code = code.replace(oldCol5, newCol5);

// 7. Simplify OEM Ref / Status Cell
const oldCol6 = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ marginBottom: '4px' }}>{getStatusBadge(claim.status)}</div>
                      {claim.oemRefNo ? (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>OEM: {claim.oemRefNo}</div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Pending OEM Ack</div>
                      )}
                    </td>`;
const newCol6 = `<td style={{ padding: '14px 18px' }}>
                      <div>{getStatusBadge(claim.status)}</div>
                    </td>`;
code = code.replace(oldCol6, newCol6);

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', code, 'utf8');
console.log("Successfully simplified table.");
