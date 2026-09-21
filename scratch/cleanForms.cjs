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

  // 1. Remove placeholders
  content = content.replace(/placeholder=["']e\.g\.[^"']*["']/g, '');

  // 2. Add validation to standard fields across the app
  // Mobile numbers (9-10 digits standard)
  content = content.replace(/type="text"(\s*)value={([A-Za-z0-9_.]*mobile|.*Mobile.*)}/gi, 'type="tel" maxLength={10} pattern="[0-9]{10}"$1value={$2}');
  content = content.replace(/type="tel"(\s*)value={([A-Za-z0-9_.]*mobile|.*Mobile.*)}/gi, 'type="tel" maxLength={10} pattern="[0-9]{10}"$1value={$2}');

  // Email
  content = content.replace(/type="text"(\s*)value={([A-Za-z0-9_.]*email|.*Email.*)}/gi, 'type="email"$1value={$2}');

  // Aadhar
  content = content.replace(/value={([A-Za-z0-9_.]*aadhar|.*Aadhar.*)}(\s*)onChange/gi, 'maxLength={12} pattern="[0-9]{12}" value={$1}$2onChange');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    changed++;
  }
});

console.log('Processed forms in ' + changed + ' files.');
