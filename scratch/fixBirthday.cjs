const fs = require('fs');
let appCode = fs.readFileSync('src/App.jsx', 'utf8');

const oldApp = `<BirthdayWishesPage
              customers={customers}
            />`;
const newApp = `<BirthdayWishesPage
              customers={customers}
              invoices={invoices}
            />`;
appCode = appCode.replace(oldApp, newApp);
fs.writeFileSync('src/App.jsx', appCode, 'utf8');

let bdayCode = fs.readFileSync('src/components/pages/BirthdayWishesPage.jsx', 'utf8');

const oldBdayComp = `export default function BirthdayWishesPage({ customers = [] }) {`;
const newBdayComp = `import { useEffect } from 'react';\n\nexport default function BirthdayWishesPage({ customers = [], invoices = [] }) {`;
bdayCode = bdayCode.replace(oldBdayComp, newBdayComp);

// Wait, the original `useEffect` import isn't there because the previous grep showed no results.
// But wait, line 1 of BirthdayWishesPage is: `import React, { useState, useMemo } from 'react';`
// Let's replace line 1 instead:
const oldLine1 = `import React, { useState, useMemo } from 'react';`;
const newLine1 = `import React, { useState, useMemo, useEffect } from 'react';`;
bdayCode = bdayCode.replace(oldLine1, newLine1);

const oldBdayComp2 = `export default function BirthdayWishesPage({ customers = [] }) {`;
const newBdayComp2 = `export default function BirthdayWishesPage({ customers = [], invoices = [] }) {`;
bdayCode = bdayCode.replace(oldBdayComp2, newBdayComp2);

const oldEvents = `  const [events, setEvents] = useState(() => {
    return [];
  });`;
const newEvents = `  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadedEvents = [];
    
    // Parse Invoices for Birthdays and Anniversaries
    if (invoices && invoices.length > 0) {
      invoices.forEach((inv, index) => {
        // Birthdays
        if (inv.customerBirthday) {
          loadedEvents.push({
            id: \`bday-\${inv.invoiceNo || index}\`,
            type: 'Birthday',
            date: inv.customerBirthday, // YYYY-MM-DD
            customerName: inv.customerName || 'Unknown',
            mobile: inv.customerPhone || inv.customerMobile || '',
            vehicleRegNo: inv.vehicleModel || '',
            discountCode: 'BDAY15'
          });
        }
        
        // Anniversaries
        if (inv.invoiceDate || inv.createdOn) {
          const dateStr = inv.invoiceDate || inv.createdOn; // Usually YYYY-MM-DD or DD/MM/YYYY
          // Only process if it's in YYYY-MM-DD format for simple demo
          if (dateStr.includes('-')) {
             loadedEvents.push({
                id: \`anni-\${inv.invoiceNo || index}\`,
                type: 'Anniversary',
                date: dateStr,
                customerName: inv.customerName || 'Unknown',
                mobile: inv.customerPhone || inv.customerMobile || '',
                vehicleRegNo: inv.vehicleModel || '',
                discountCode: 'ANNI10'
             });
          }
        }
      });
    }
    
    setEvents(loadedEvents);
  }, [invoices]);`;

bdayCode = bdayCode.replace(oldEvents, newEvents);

fs.writeFileSync('src/components/pages/BirthdayWishesPage.jsx', bdayCode, 'utf8');
console.log("Updated BirthdayWishesPage and App.jsx");
