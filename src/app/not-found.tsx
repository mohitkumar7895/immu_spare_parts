import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-5 animate-in fade-in-50 zoom-in-95 duration-300">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist, has been removed, or the link is broken.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full gap-2 h-10 text-xs sm:text-sm shadow-sm">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
