const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('scripts').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(f => {
  let originalContent = fs.readFileSync(f, 'utf8');
  let newContent = originalContent;
  
  // Replace escaped backticks
  newContent = newContent.replace(/\\\`/g, '\`');
  
  // Replace escaped dollar signs
  newContent = newContent.replace(/\\\$/g, '$');
  
  if (originalContent !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Fixed:', f);
  }
});
