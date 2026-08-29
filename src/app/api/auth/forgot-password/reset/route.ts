import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if user exists
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found or invalid email' }, { status: 400 });
    }

    const user = users[0];

    // Verify OTP
    if (!user.reset_otp || user.reset_otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const now = new Date();
    const expiry = new Date(user.reset_otp_expiry);

    if (now > expiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Update password and clear OTP
    await pool.query(
      'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?',
      [password, user.id]
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
