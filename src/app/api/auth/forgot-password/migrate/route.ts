import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Check if email column exists
    const [columns] = await pool.query(`SHOW COLUMNS FROM users LIKE 'email'`);
    
    if ((columns as any[]).length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN email VARCHAR(255) UNIQUE,
        ADD COLUMN reset_otp VARCHAR(10),
        ADD COLUMN reset_otp_expiry DATETIME
      `);
      return NextResponse.json({ success: true, message: 'Database successfully updated! Columns added.' });
    } else {
      return NextResponse.json({ success: true, message: 'Columns already exist.' });
    }
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
