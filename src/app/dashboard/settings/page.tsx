import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm, PasswordForm } from '@/components/settings/settings-forms';
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

  // Auto-migration for avatar column
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM users LIKE 'avatar'`);
    if ((columns as any[]).length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN avatar LONGTEXT`);
      console.log('Auto-migration: Added avatar column to users table.');
    }
  } catch (migErr) {
    console.error('Auto-migration failed for users table:', migErr);
  }

  // Fetch latest user details from DB
  const [rows] = await pool.query<RowDataPacket[]>('SELECT name, username, role, avatar FROM users WHERE id = ?', [session.user.id]);
  const user = rows[0] as { name: string, username: string, role: string, avatar?: string };

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
        <PasswordForm />
      </div>
    </div>
  );
}
