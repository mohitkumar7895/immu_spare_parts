import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const metadata = {
  title: 'Dashboard | Spare Parts Portal',
  description: 'Spare Parts Inventory & Sales Management Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  let avatar = null;
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT avatar FROM users WHERE id = ?', [session.user.id]);
    if (rows[0] && rows[0].avatar) {
      avatar = rows[0].avatar;
    }
  } catch (e) {
    console.error('Failed to fetch user avatar in layout:', e);
  }

  let companyLogo = null;
  try {
    const [logoRows] = await pool.query<RowDataPacket[]>('SELECT setting_value FROM app_settings WHERE setting_key = "company_logo"');
    if (logoRows.length > 0) {
      companyLogo = logoRows[0].setting_value;
    }
  } catch (e) {
    // Table might not exist yet
  }

  const enrichedUser = {
    ...session.user,
    avatar: avatar
  };

  return <DashboardShell user={enrichedUser} companyLogo={companyLogo}>{children}</DashboardShell>;
}
