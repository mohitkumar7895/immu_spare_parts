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
  let companyLogo = null;

  try {
    const [avatarResult, logoResult] = await Promise.allSettled([
      pool.query<RowDataPacket[]>('SELECT avatar FROM users WHERE id = ?', [session.user.id]),
      pool.query<RowDataPacket[]>('SELECT setting_value FROM app_settings WHERE setting_key = "company_logo"')
    ]);

    if (avatarResult.status === 'fulfilled' && avatarResult.value[0].length > 0) {
      avatar = avatarResult.value[0][0].avatar || null;
    }

    if (logoResult.status === 'fulfilled' && logoResult.value[0].length > 0) {
      companyLogo = logoResult.value[0][0].setting_value || null;
    }
  } catch (e) {
    console.error('Failed to fetch global layout data:', e);
  }

  const enrichedUser = {
    ...session.user,
    avatar: avatar
  };

  return <DashboardShell user={enrichedUser} companyLogo={companyLogo}>{children}</DashboardShell>;
}
