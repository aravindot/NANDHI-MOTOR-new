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

  // We want to remove all placeholder="..." attributes that are not for searching
  // Regex to match placeholder="some text" or placeholder={`some text`}
  // But we skip if it contains the word "Search" (case insensitive) inside it.
  
  const placeholderRegex = /placeholder=(["'{\`])([\s\S]*?)(["'}\`])/g;
  
  content = content.replace(placeholderRegex, (match, p1, p2, p3) => {
    // If it's a search input placeholder, keep it
    if (p2 && p2.toLowerCase().includes('search')) {
      return match;
    }
    // Remove the placeholder attribute completely for everything else
    return '';
  });

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    changed++;
  }
});

console.log('Removed example placeholders from ' + changed + ' files.');
