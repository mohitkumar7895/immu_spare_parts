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

const files = walk('src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

files.forEach(f => {
  let originalContent = fs.readFileSync(f, 'utf8');
  let newContent = originalContent;
  
  // In javascript, \` inside a string literal matches \`
  // We want to replace the literal string \` (two characters: backslash then backtick)
  // with a single backtick character `
  newContent = newContent.replace(/\\\`/g, '\`');
  
  // We also want to replace \$ (backslash then dollar sign)
  // with a single dollar sign $
  newContent = newContent.replace(/\\\$/g, '$');
  
  if (originalContent !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Fixed:', f);
  }
});
