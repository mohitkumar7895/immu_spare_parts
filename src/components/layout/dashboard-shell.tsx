import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardShell({ children, user, companyLogo }: { children: React.ReactNode, user: any, companyLogo?: string | null }) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <Sidebar user={user} companyLogo={companyLogo} />
      <div className="relative z-10 flex-1 flex flex-col md:pl-64 min-w-0 bg-transparent">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
