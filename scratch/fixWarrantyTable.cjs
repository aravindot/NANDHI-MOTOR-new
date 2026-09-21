const fs = require('fs');

let oldContent = fs.readFileSync('scratch/WarrantyClaimPage_old.jsx', 'utf8');
let currentContent = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// Extract the original table
const startIdx = oldContent.indexOf('{/* Claims Table */}');
const endIdx = oldContent.indexOf('<td style={{ padding: \'14px 18px\', textAlign: \'right\' }}>', startIdx);
let tableBlock = oldContent.slice(startIdx, endIdx);

// Modify headers
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>Claim ID & Date</th>', '<th style={{ padding: \'12px 18px\' }}>Claim ID</th>');
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>Customer & Vehicle</th>', '<th style={{ padding: \'12px 18px\' }}>Customer</th>');
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>Defective Component</th>', '<th style={{ padding: \'12px 18px\' }}>Defect</th>');
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>Category & KM</th>', '<th style={{ padding: \'12px 18px\' }}>Category</th>');
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>Claim Value</th>', '<th style={{ padding: \'12px 18px\' }}>Value</th>');
tableBlock = tableBlock.replace('<th style={{ padding: \'12px 18px\' }}>OEM Ref / Status</th>', '<th style={{ padding: \'12px 18px\' }}>Status</th>');

// Modify row contents
const rowSearch = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Submitted: {claim.submissionDate}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 500 }}>{claim.vehicleRegNo}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{claim.defectivePart}</div>
                      {claim.partCode && <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Code: {claim.partCode}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>
                        {claim.defectCategory}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{claim.odometerKm} KM</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>₹{claim.claimAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ marginBottom: '4px' }}>{getStatusBadge(claim.status)}</div>
                      {claim.oemRefNo ? (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>OEM: {claim.oemRefNo}</div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Pending OEM Ack</div>
                      )}
                      {claim.trackingNo && (
                        <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>
                          {claim.courierPartner} : {claim.trackingNo}
                        </div>
                      )}
                    </td>`;

const rowReplace = `<td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{claim.id}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{claim.submissionDate}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>{claim.customerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase' }}>{claim.vehicleRegNo}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{claim.defectivePart}</div>
                      {claim.partCode && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{claim.partCode}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#4b5563' }}>
                        {claim.defectCategory}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#374151' }}>₹{claim.claimAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div>{getStatusBadge(claim.status)}</div>
                    </td>`;

tableBlock = tableBlock.replace(rowSearch, rowReplace);

// Remove the broken part from currentContent and inject the fixed table block
const curStartIdx = currentContent.indexOf('          </div>\n        </div>\n                    <td style={{ padding: \'14px 18px\', textAlign: \'right\' }}>');

if (curStartIdx === -1) {
    console.log("Could not find the injection point.");
    process.exit(1);
}

const beforePart = currentContent.slice(0, curStartIdx + 33);
const afterPart = currentContent.slice(curStartIdx + 33);

const newContent = beforePart + '\\n' + tableBlock + afterPart;
fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', newContent, 'utf8');
console.log('Successfully fixed the table.');
