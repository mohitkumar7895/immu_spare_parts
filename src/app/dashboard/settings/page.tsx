import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm, PasswordForm, LogoForm } from '@/components/settings/settings-forms';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const metadata = {
  title: 'Settings | Dashboard',
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Auto-migration for avatar column and app_settings table
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM users LIKE 'avatar'`);
    if ((columns as any[]).length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN avatar LONGTEXT`);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } catch (migErr) {
    console.error('Auto-migration failed:', migErr);
  }

  // Fetch latest user details from DB
  const [rows] = await pool.query<RowDataPacket[]>('SELECT name, username, role, avatar FROM users WHERE id = ?', [session.user.id]);
  const user = rows[0] as { name: string, username: string, role: string, avatar?: string };

  let companyLogo = null;
  try {
    const [logoRows] = await pool.query<RowDataPacket[]>('SELECT setting_value FROM app_settings WHERE setting_key = "company_logo"');
    if (logoRows.length > 0) {
      companyLogo = logoRows[0].setting_value;
    }
  } catch(e) {}

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and set preferences.</p>
      </div>

      <div className="grid gap-6">
        <ProfileForm user={user} />
        {user.role === 'ADMIN' && <LogoForm currentLogo={companyLogo} />}
        <PasswordForm />
      </div>
    </div>
  );
}
