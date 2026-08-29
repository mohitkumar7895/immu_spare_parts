import dotenv from 'dotenv';
import path from 'path';
import { sendOTP } from '../src/lib/mailer';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  console.log('Testing SMTP connection with credentials:', {
    user: process.env.SMTP_EMAIL || process.env.SMTP_USER,
    from: process.env.SMTP_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER,
  });

  try {
    await sendOTP('muhfata859@gmail.com', '123456');
    console.log('Successfully sent OTP test email!');
  } catch (error) {
    console.error('Failed to send email:', error);
    process.exit(1);
  }
}

main();
