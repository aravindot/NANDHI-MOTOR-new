const fs = require('fs');

let content = fs.readFileSync('src/components/pages/AccountingLedgerPage.jsx', 'utf8');

const startMarker = '{/* ============================================================ */}\n      {/* 1. VISUAL FLOWCHART ARCHITECTURE NAVIGATOR (AS PER USER FLOW) */}';
const endMarker = '{/* ============================================================ */}\n      {/* 2. NAVIGATION SUBTABS BAR */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // Extract Export and Print buttons
  const buttonsHtml = `
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              backgroundColor: '#065f46', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrintStatement}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem'
            }}
          >
            <Printer size={15} /> Print
          </button>
        </div>
`;

  // We cut out the dashboard section completely
  const beforeDashboard = content.substring(0, startIndex);
  let afterDashboard = content.substring(endIndex);
  
  // Now we insert the buttons into the Nav Bar flex container
  // The nav bar ends at:
  //           })}
  //         </div>
  //       </div>
  // We want to insert the buttons after the inner `</div>` but before the outer `</div>` because the outer div has `justifyContent: 'space-between'`!
  
  const navBarEndStr = `          })}
        </div>
      </div>`;
  const newNavBarEndStr = `          })}
        </div>
${buttonsHtml}
      </div>`;

  afterDashboard = afterDashboard.replace(navBarEndStr, newNavBarEndStr);

  content = beforeDashboard + afterDashboard;
  
  fs.writeFileSync('src/components/pages/AccountingLedgerPage.jsx', content, 'utf8');
  console.log("Dashboard removed and buttons relocated.");
} else {
  console.log("Markers not found.");
}
