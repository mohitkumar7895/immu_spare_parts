'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard route error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-300">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We encountered an unexpected issue while loading this page. This can happen if the connection dropped or data is still syncing.
          </p>
        </div>

        {process.env.NODE_ENV !== 'production' && error?.message && (
          <div className="text-left bg-muted/60 p-3 rounded-lg border text-[11px] font-mono text-destructive overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 gap-2 h-10 text-xs sm:text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex-1 gap-2 h-10 text-xs sm:text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </Button>
        </div>

        <div className="pt-2 border-t flex justify-center">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
