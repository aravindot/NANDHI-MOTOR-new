const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changed = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const original = content;

  // Auto uppercase for specific fields: vehicleRegNo, vehicleNo, chassisNo, engineNo, pan, gst, hsnCode, partCode, partNo
  const uppercaseFields = [
    'vehicleRegNo', 'vehicleNo', 'chassisNo', 'engineNo', 
    'pan', 'gst', 'gstin', 'supplierGst', 'hsnCode', 'partCode', 'partNo', 'discountCode', 'couponCode'
  ];

  uppercaseFields.forEach(field => {
    // Replace: onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
    // With: onChange={(e) => setFormData({ ...formData, fieldName: e.target.value.toUpperCase() })}
    
    // Using Regex to capture variants of state setters safely
    const regex = new RegExp(`(${field}:\\s*e\\.target\\.value)(?!\\.toUpperCase)`, 'gi');
    content = content.replace(regex, `$1.toUpperCase()`);
  });

  // Make sure mobile inputs enforce numbers only via regex if not using type="number"
  // React onChange for mobile to strip non-digits:
  content = content.replace(/(mobile:\s*e\.target\.value)(?!\.replace)/gi, "$1.replace(/\\\\D/g, '')");

  // Fix pan/gst maxlengths
  content = content.replace(/value={([A-Za-z0-9_.]*pan|.*Pan.*)}(\s*)onChange/gi, 'maxLength={10} value={$1}$2onChange');
  content = content.replace(/value={([A-Za-z0-9_.]*gst|.*Gst.*)}(\s*)onChange/gi, 'maxLength={15} value={$1}$2onChange');

  // Fix chassis/engine maxlengths (usually 17 for VIN, but let's just leave maxLength default)

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    changed++;
  }
});

console.log('Uppercase/Validation applied to ' + changed + ' files.');
