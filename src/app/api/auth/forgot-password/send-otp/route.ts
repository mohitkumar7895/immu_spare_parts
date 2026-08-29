import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { sendOTP } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if a user exists or not for security reasons, just simulate success
      return NextResponse.json({ success: true, message: 'If the email exists, an OTP has been sent.' });
    }

    const user = users[0];

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    // Save OTP to database
    await pool.query(
      'UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE id = ?',
      [otp, expiry, user.id]
    );

    // Send email using custom mailer
    try {
      await sendOTP(email, otp);
    } catch (error) {
      console.error('Mailer Error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
