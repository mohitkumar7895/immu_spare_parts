import dotenv from 'dotenv';
import path from 'path';

// Load env FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  // Use dynamic import so it happens AFTER env is loaded
  const { default: pool } = await import('../src/lib/db');

  console.log('Attempting to add columns using Next.js DB pool...');
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM users LIKE 'email'`);
    if ((columns as any[]).length === 0) {
      console.log('Columns missing. Adding them now...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN email VARCHAR(255) UNIQUE,
        ADD COLUMN reset_otp VARCHAR(10),
        ADD COLUMN reset_otp_expiry DATETIME
      `);
      console.log('SUCCESS: Added email and OTP columns!');
    } else {
      console.log('SUCCESS: Columns already exist!');
    }
  } catch (error: any) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
