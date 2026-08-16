import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';

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

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
