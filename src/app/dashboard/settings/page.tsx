import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileForm, PasswordForm, LogoForm } from '@/components/settings/settings-forms';
import { getCompanyLogo, getDashboardUser } from '@/lib/dashboard-data';

export const metadata = {
  title: 'Settings | Dashboard',
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [user, companyLogo] = await Promise.all([
    getDashboardUser(session.user.id),
    getCompanyLogo(),
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Manage your account settings and set preferences.</p>
      </div>

      <div className="grid gap-6">
        <ProfileForm user={user} />
        {user.role === 'ADMIN' && <LogoForm currentLogo={companyLogo} />}
        <PasswordForm />
      </div>
    </div>
  );
}
