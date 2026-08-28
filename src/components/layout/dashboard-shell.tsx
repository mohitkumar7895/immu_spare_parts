import { Sidebar } from './sidebar';
import { Header } from './header';

export function DashboardShell({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <Sidebar userRole={user?.role} />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
