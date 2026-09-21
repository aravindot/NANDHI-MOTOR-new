const fs = require('fs');
let code = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

// 1. Remove Subtitle
code = code.replace(
  /<p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>[\\s\\S]*?<\/p>/g,
  ''
);

// 2. Shrink KPI Cards
// Find the exact KPI block
const oldGridStart = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>`;
const newGridStart = `<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>`;

code = code.replace(oldGridStart, newGridStart);

// Let's replace the inner divs of KPI cards to be sleek.
code = code.replace(/<div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba\(0,0,0,0\.05\)' }}>/g, 
  `<div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>`);

// Simplify the title text
code = code.replace(/<div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>/g, 
  `<div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>`);

// Simplify the stat numbers
code = code.replace(/<div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginTop: '6px' }}>/g, 
  `<div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>`);
code = code.replace(/<div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>/g, 
  `<div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>`);
code = code.replace(/<div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginTop: '6px' }}>/g, 
  `<div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>`);
code = code.replace(/<div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#047857', marginTop: '6px' }}>/g, 
  `<div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#047857' }}>`);

// Remove the subtext lines
code = code.replace(/<div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>All registered cases<\/div>/g, '');
code = code.replace(/<div style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', fontWeight: 500 }}>Awaiting manufacturer credit<\/div>/g, '');
code = code.replace(/<div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>\{\(stats\.total > 0 \? \(stats\.approved \/ stats\.total \* 100\)\.toFixed\(0\) : 0\)\}% acceptance rate<\/div>/g, '');
code = code.replace(/<div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>Parts credit received<\/div>/g, '');

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', code, 'utf8');
console.log("Successfully simplified WarrantyClaimPage using Regex!");
