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
  { name: 'Sales', href: '/dashboard/sales', icon: ShoppingCart },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, requireAdmin: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, requireAdmin: true },
];

export function Sidebar({ userRole }: { userRole: 'ADMIN' | 'STAFF' }) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.requireAdmin || userRole === 'ADMIN'
  );

  return (
    <aside className="w-64 border-r bg-background h-screen flex flex-col fixed inset-y-0 left-0 z-10 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Wrench className="w-6 h-6 text-primary mr-2" />
        <span className="font-bold text-lg tracking-tight">SpareParts</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {userRole === 'ADMIN' ? 'A' : 'S'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
              {userRole === 'ADMIN' ? 'Administrator' : 'Staff Member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
