import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Check if user exists and get OTP details
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid OTP or expired' }, { status: 400 });
    }

    const user = users[0];

    if (!user.reset_otp || user.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const now = new Date();
    const expiry = new Date(user.reset_otp_expiry);

    if (now > expiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
