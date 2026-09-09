'use client';

import { Menu, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { navItems } from './sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

import { Wrench } from 'lucide-react';

export function Header({ user, companyLogo }: { user: any, companyLogo?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.requireAdmin || user?.role === 'ADMIN'
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-background/30 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 w-full shadow-sm">
      <div className="flex items-center flex-1 min-w-0">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden mr-1.5 sm:mr-2 shrink-0 h-9 w-9" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r border-white/10 flex flex-col bg-background/95 backdrop-blur-xl">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Sidebar navigation</SheetDescription>
            
            <div className="h-16 flex items-center px-6 border-b border-white/10 pr-12">
              {companyLogo ? (
                <div className="h-8 max-w-[140px] mr-3 flex items-center justify-start">
                  <img src={companyLogo} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-md" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-primary/20 shrink-0">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 whitespace-nowrap">
                Spare Parts
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1.5 px-3">
                {filteredItems.map((item: any) => {
                  const isActive = item.exact 
                    ? pathname === item.href 
                    : (pathname === item.href || pathname.startsWith(item.href + '/'));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl group transition-all",
                        isActive 
                          ? "bg-gradient-to-r from-primary/20 to-blue-600/10 text-primary border border-primary/20 shadow-sm" 
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "mr-3 flex-shrink-0 h-5 w-5",
                          isActive ? "text-primary drop-shadow-[0_0_8px_rgba(112,22,235,0.5)]" : "text-muted-foreground group-hover:text-foreground"
                        )} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer User Footer */}
            <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-white font-bold shadow-inner overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0)?.toUpperCase() || (user?.role === 'ADMIN' ? 'A' : 'S')}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.name || (user?.role === 'ADMIN' ? 'Administrator' : 'Staff Member')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {user?.role ? user.role.toLowerCase() : 'Staff'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 border-t border-white/10">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                >
                  <UserIcon className="mr-1.5 h-3.5 w-3.5" />
                  Profile
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="max-w-md w-full ml-1 sm:ml-2 md:ml-0 min-w-0 flex-1">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-4 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              type="search" 
              placeholder="Search parts, customers..." 
              className="pl-8 sm:pl-11 pr-2 sm:pr-4 rounded-full h-8 sm:h-10 text-xs sm:text-sm bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:bg-white/10 focus:border-primary/50 transition-all shadow-inner" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
      <div className="ml-2 sm:ml-4 flex items-center md:ml-6 gap-1.5 sm:gap-2 shrink-0">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/50 focus-visible:ring-primary/50" />}>
            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="px-2 py-1.5 text-sm font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Role: {user?.role}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
