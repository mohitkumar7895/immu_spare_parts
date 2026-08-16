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
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header({ user }: { user: any }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 w-full">
      <div className="flex items-center flex-1">
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="max-w-md w-full ml-4 md:ml-0">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder="Search parts, customers, invoices..." 
              className="pl-10 w-full bg-muted border-transparent focus:bg-background" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
      <div className="ml-4 flex items-center md:ml-6 gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/50 focus-visible:ring-primary/50" />}>
            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
