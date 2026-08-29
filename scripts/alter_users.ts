import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('Database connection details missing in .env');
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  console.log('Connected to database. Altering users table...');
  
  try {
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'email'`);
    if ((columns as any[]).length === 0) {
      console.log('Adding email, reset_otp, and reset_otp_expiry columns...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN email VARCHAR(255) UNIQUE,
        ADD COLUMN reset_otp VARCHAR(10),
        ADD COLUMN reset_otp_expiry DATETIME
      `);
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist.');
    }
  } catch (error) {
    console.error('Alter failed:', error);
  } finally {
    await connection.end();
  }
}

main();
