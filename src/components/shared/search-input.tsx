'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') || '';
  const [value, setValue] = useState(currentQuery);
  const lastPushedQuery = useRef(currentQuery);

  // Sync external changes to query param (e.g. back button)
  useEffect(() => {
    if (currentQuery !== lastPushedQuery.current) {
      setValue(currentQuery);
      lastPushedQuery.current = currentQuery;
    }
  }, [currentQuery]);

  useEffect(() => {
    if (value === lastPushedQuery.current) return;

    const timer = setTimeout(() => {
      lastPushedQuery.current = value;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
      } else {
        params.delete('q');
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 pr-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
