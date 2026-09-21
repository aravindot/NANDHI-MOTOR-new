const fs = require('fs');
let code = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

const target = `      {activeTab === 'claims' ? (
        <>

              placeholder="Search claims..."`;

const replacement = `      {activeTab === 'claims' ? (
        <>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
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
      </div>

      {/* Main Claims Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Search & Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '450px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search claims..."`;

// We use an index based approach to be safe from line endings.
// Actually, let's just do standard replace, it will match if line endings are consistent.
// But to be completely safe against CR LF vs LF:
const escapedTarget = target.replace(/\\r\\n/g, '\\n').split('\\n');

let lines = code.split(/\\r?\\n/);
let foundIdx = -1;
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes("{activeTab === 'claims' ? (")) {
    if (lines[i+3].includes('placeholder="Search claims..."')) {
      foundIdx = i;
      break;
    }
  }
}

if (foundIdx !== -1) {
  // Remove lines i to i+3
  lines.splice(foundIdx, 4);
  // Insert new content
  lines.splice(foundIdx, 0, replacement);
  fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', lines.join('\\n'), 'utf8');
  console.log("Successfully fixed HTML structure!");
} else {
  console.log("Could not find the target lines.");
}
