'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintInvoiceButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-9 px-4 text-xs sm:text-sm"
    >
      <Printer className="w-4 h-4 mr-2" />
      Print Invoice
    </Button>
  );
}
