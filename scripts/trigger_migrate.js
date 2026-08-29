const http = require('http');

async function triggerMigration() {
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    console.log(`Trying port ${port}...`);
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}/api/auth/forgot-password/migrate`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            console.log(`Response from port ${port}:`, data);
            resolve(true);
          });
        });
        req.on('error', (err) => {
          reject(err);
        });
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      // If we get a response, stop trying other ports
      break;
    } catch (e) {
      console.log(`Port ${port} failed: ${e.message}`);
    }
  }
}

triggerMigration();
