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

  const enrichedUser = {
    ...session.user,
    avatar: avatar
  };

  return <DashboardShell user={enrichedUser}>{children}</DashboardShell>;
}
