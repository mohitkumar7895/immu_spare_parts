'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HiddenPrice({ price }: { price: number | string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (show) {
      timeout = setTimeout(() => {
        setShow(false);
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [show]);
  
  if (!show) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6" 
        onClick={() => setShow(true)}
        title="Show Price"
      >
        <Eye className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-muted-foreground">
        ₹{price}
      </span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6" 
        onClick={() => setShow(false)}
        title="Hide Price"
      >
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
