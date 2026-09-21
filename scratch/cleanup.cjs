const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/pages/**/*.jsx');
files.push('src/components/PrintPreviewModal.jsx');
files.push('src/components/DashboardOverview.jsx');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace Honda fallbacks
  content = content.replace(/\|\|\s*'Honda Activa 6G'/g, "|| ''");
  content = content.replace(/'Honda Activa 6G'/g, "''");
  content = content.replace(/\|\|\s*'Honda Model'/g, "|| 'Vehicle'");
  content = content.replace(/'Honda Model'/g, "'Vehicle'");
  content = content.replace(/\|\|\s*'Honda Two-Wheeler'/g, "|| 'Vehicle'");
  content = content.replace(/'Honda Two-Wheeler'/g, "'Vehicle'");

  // Replace specific arrays in specific files
  // BirthdayWishesPage
  if (file.includes('BirthdayWishesPage.jsx')) {
    content = content.replace(/const \[birthdayList\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/, 'const [birthdayList] = useState([]);');
    content = content.replace(/const \[recentWishes\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/, 'const [recentWishes] = useState([]);');
  }

  // AlertsPage
  if (file.includes('AlertsPage.jsx')) {
    content = content.replace(/const \[alerts, setAlerts\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/g, 'const [alerts, setAlerts] = useState([]);');
  }

  // VehicleListPage mock data
  if (file.includes('VehicleListPage.jsx')) {
    content = content.replace(/const \[vehicles, setVehicles\] = useState\(\(\) => \{\s*const saved = localStorage.getItem\('nandhi_app_vehicles'\);\s*return saved \? JSON.parse\(saved\) : \[\s*\{[\s\S]*?\}\s*\];\s*\}\);/g, "const [vehicles, setVehicles] = useState(() => {\n    const saved = localStorage.getItem('nandhi_app_vehicles');\n    return saved ? JSON.parse(saved) : [];\n  });");
  }

  // CustomersPage mock data
  if (file.includes('CustomersPage.jsx')) {
    content = content.replace(/const \[customers, setCustomers\] = useState\(\(\) => \{\s*const saved = localStorage.getItem\('nandhi_app_customers'\);\s*return saved \? JSON.parse\(saved\) : \[\s*\{[\s\S]*?\}\s*\];\s*\}\);/g, "const [customers, setCustomers] = useState(() => {\n    const saved = localStorage.getItem('nandhi_app_customers');\n    return saved ? JSON.parse(saved) : [];\n  });");
  }

  // RedeemPointsPage mock data
  if (file.includes('RedeemPointsPage.jsx')) {
    content = content.replace(/const \[members, setMembers\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/g, "const [members, setMembers] = useState([]);");
    content = content.replace(/const \[redemptionHistory, setRedemptionHistory\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/g, "const [redemptionHistory, setRedemptionHistory] = useState([]);");
  }
  
  // SpareInventoryPage mock data
  if (file.includes('SpareInventoryPage.jsx')) {
    content = content.replace(/const \[spares, setSpares\] = useState\(\(\) => \{\s*const saved = localStorage.getItem\('nandhi_app_spares'\);\s*return saved \? JSON.parse\(saved\) : \[\s*\{[\s\S]*?\}\s*\];\s*\}\);/g, "const [spares, setSpares] = useState(() => {\n    const saved = localStorage.getItem('nandhi_app_spares');\n    return saved ? JSON.parse(saved) : [];\n  });");
  }

  // ExecutivesPage mock data
  if (file.includes('ExecutivesPage.jsx')) {
    content = content.replace(/const \[executives, setExecutives\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/g, "const [executives, setExecutives] = useState([]);");
    content = content.replace(/const \[attendance, setAttendance\] = useState\(\[\s*\{[\s\S]*?\}\s*\]\);/g, "const [attendance, setAttendance] = useState([]);");
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
