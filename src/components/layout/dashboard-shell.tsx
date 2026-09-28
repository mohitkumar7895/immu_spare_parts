import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardShell({ children, user, companyLogo }: { children: React.ReactNode, user: any, companyLogo?: string | null }) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} companyLogo={companyLogo} />
      <div className="relative z-10 flex-1 flex flex-col md:pl-64 min-w-0">
        <Header user={user} companyLogo={companyLogo} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
