'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deletePart } from '@/app/actions/inventory-actions';

interface DeletePartButtonProps {
  partId: string;
  partName: string;
  variant?: 'icon' | 'button';
  redirectToInventory?: boolean;
}

export function DeletePartButton({
  partId,
  partName,
  variant = 'icon',
  redirectToInventory = false,
}: DeletePartButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsPending(true);
    setErrorMessage(null);

    try {
      const res = await deletePart(partId);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete part.');
        setIsPending(false);
        return;
      }

      setIsOpen(false);
      setIsPending(false);

      if (redirectToInventory) {
        router.push('/dashboard/inventory');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsPending(false);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => {
            setErrorMessage(null);
            setIsOpen(true);
          }}
          title={`Delete ${partName}`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {partName}</span>
        </Button>
      ) : (
        <Button
          variant="destructive"
          onClick={() => {
            setErrorMessage(null);
            setIsOpen(true);
          }}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Part
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Spare Part
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="text-foreground">{partName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 text-xs text-red-700 dark:text-red-300 bg-red-500/10 border border-red-500/20 rounded-md">
              {errorMessage}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Yes, Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
