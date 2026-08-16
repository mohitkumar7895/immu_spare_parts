import { AddPurchaseForm } from '@/components/purchases/add-purchase-form';
import { getParts } from '@/app/actions/inventory-actions';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Record Purchase | Purchases',
};

export default async function AddPurchasePage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard/purchases');
  }

  const parts = await getParts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/purchases" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record New Purchase</h1>
          <p className="text-muted-foreground">Add stock from suppliers.</p>
        </div>
      </div>

      <AddPurchaseForm parts={parts} />
    </div>
  );
}
