'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Car, 
  BarChart3, 
  Settings, 
  Wrench,
  Receipt
} from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Purchases', href: '/dashboard/purchases', icon: Receipt },
  { name: 'Recent Sales', href: '/dashboard/sales', icon: ShoppingCart, exact: true },
  { name: 'All Sales', href: '/dashboard/sales/all', icon: ShoppingCart },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, requireAdmin: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, requireAdmin: true },
];

export function Sidebar({ userRole }: { userRole: 'ADMIN' | 'STAFF' }) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.requireAdmin || userRole === 'ADMIN'
  );

  return (
    <aside className="w-64 bg-background/30 backdrop-blur-2xl border-r border-white/10 h-screen flex flex-col fixed inset-y-0 left-0 z-20 hidden md:flex shadow-[4px_0_24px_-10px_rgba(0,0,0,0.5)]">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          SpareParts
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-4">
          {filteredItems.map((item: any) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : (pathname === item.href || pathname.startsWith(item.href + '/'));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl group transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-primary/20 to-blue-600/10 text-primary border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                )}
              >
                <Icon 
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(112,22,235,0.5)]" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-white font-bold shadow-inner">
            {userRole === 'ADMIN' ? 'A' : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {userRole === 'ADMIN' ? 'Administrator' : 'Staff Member'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
