const fs = require('fs');
let c = fs.readFileSync('src/components/layout/header.tsx', 'utf8');
c = c.replace(/\\\`/g, '\`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/layout/header.tsx', c);
