const fs = require('fs');
let code = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// 1. Remove the subtitle
const subtitleText = `          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Track manufacturer OEM parts replacement warranty claims, inspect defect categories, and manage reimbursement status.
          </p>`;
code = code.replace(subtitleText, "");

// 2. Simplify KPI Cards
const oldKPI = `{/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Claims Filed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>All registered cases</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Under OEM Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>{stats.underReview + stats.submitted}</div>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 500 }}>Awaiting manufacturer credit</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Approved / Settled</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>{stats.approved}</div>
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>{(stats.total > 0 ? (stats.approved / stats.total * 100).toFixed(0) : 0)}% acceptance rate</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Reimbursed Value</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857', marginTop: '6px' }}>₹{stats.totalReimbursed.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>Parts credit received</div>
        </div>
      </div>`;

const newKPI = `{/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Total Claims Filed</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{stats.total}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Under OEM Review</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>{stats.underReview + stats.submitted}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Approved / Settled</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>{stats.approved}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Reimbursed Value</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857' }}>₹{stats.totalReimbursed.toLocaleString('en-IN')}</div>
        </div>
      </div>`;

code = code.replace(oldKPI, newKPI);

// 3. Remove "Search by Claim ID..." text and shrink filter buttons.
const oldSearch = `placeholder="Search by Claim ID, Customer, Vehicle Reg, or Part..."`;
const newSearch = `placeholder="Search claims..."`;
code = code.replace(oldSearch, newSearch);

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', code, 'utf8');
console.log("Successfully simplified WarrantyClaimPage even more.");
