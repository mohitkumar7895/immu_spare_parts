import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'STAFF') DEFAULT 'STAFF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parts (
  id VARCHAR(30) PRIMARY KEY,
  part_number VARCHAR(100) UNIQUE NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  secret_cost DECIMAL(10, 2) NOT NULL,
  opening_stock INT DEFAULT 0,
  current_stock INT DEFAULT 0,
  minimum_stock INT DEFAULT 0,
  description TEXT,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  alternate_mobile VARCHAR(20),
  location VARCHAR(255),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(30) PRIMARY KEY,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  company VARCHAR(255),
  notes TEXT,
  customer_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id VARCHAR(30) PRIMARY KEY,
  purchase_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100),
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_by_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id VARCHAR(30) PRIMARY KEY,
  purchase_id VARCHAR(30) NOT NULL,
  part_id VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(30) PRIMARY KEY,
  sale_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(30) NOT NULL,
  vehicle_id VARCHAR(30),
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_by_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id VARCHAR(30) PRIMARY KEY,
  sale_id VARCHAR(30) NOT NULL,
  part_id VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(30) PRIMARY KEY,
  part_id VARCHAR(30) NOT NULL,
  type ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT') NOT NULL,
  quantity INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reference_id VARCHAR(50),
  note TEXT,
  created_by_id VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (part_id) REFERENCES parts(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id)
);
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('Connected to database. Running migrations...');
  
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  try {
    for (const stmt of statements) {
      console.log(`Executing: ${stmt.substring(0, 50)}...`);
      await connection.query(stmt);
    }
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

main();
