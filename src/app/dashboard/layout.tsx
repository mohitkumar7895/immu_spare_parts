import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getCompanyLogo, getDashboardUser } from '@/lib/dashboard-data';

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

  if (!session?.user) {
    redirect('/login');
  }

  let dashboardUser = null;
  let companyLogo = null;

  const [userResult, logoResult] = await Promise.allSettled([
    getDashboardUser(session.user.id),
    getCompanyLogo(),
  ]);

  if (userResult.status === 'fulfilled') dashboardUser = userResult.value;
  if (logoResult.status === 'fulfilled') companyLogo = logoResult.value;

  const enrichedUser = {
    ...session.user,
    ...(dashboardUser ?? {}),
  };

  return <DashboardShell user={enrichedUser} companyLogo={companyLogo}>{children}</DashboardShell>;
}
