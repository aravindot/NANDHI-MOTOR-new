const fs = require('fs');
let code = fs.readFileSync('src/components/pages/WarrantyClaimPage.jsx', 'utf8');

const brokenPartStart = code.indexOf(`      case 'Rejected':
        return (
          <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>`);

if (brokenPartStart === -1) {
    console.log("Could not find start");
    process.exit(1);
}

const brokenPartEnd = code.indexOf(`          }}
        >
          <Plus size={18} /> File Warranty Claim`, brokenPartStart);

if (brokenPartEnd === -1) {
    console.log("Could not find end");
    process.exit(1);
}

const before = code.slice(0, brokenPartStart);
const after = code.slice(brokenPartEnd);

const fixedPart = `      case 'Rejected':
        return (
          <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={13} /> Rejected
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck style={{ color: '#059669' }} /> Warranty Claims Hub
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(5,150,105,0.2)',
`;

fs.writeFileSync('src/components/pages/WarrantyClaimPage.jsx', before + fixedPart + after, 'utf8');
console.log("Fixed!");
