const fs = require('fs');
let c = fs.readFileSync('src/components/sales/new-sale-form.tsx', 'utf8');
c = c.replace(/\\\`/g, '\`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/sales/new-sale-form.tsx', c);
