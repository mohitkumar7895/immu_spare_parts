import { NewSaleForm } from '@/components/sales/new-sale-form';
import { getCustomers } from '@/app/actions/customer-actions';
import { getParts } from '@/app/actions/inventory-actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'New Sale | Point of Sale',
};

export default async function NewSalePage() {
  const [customers, parts] = await Promise.all([
    getCustomers(),
    getParts()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/sales" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Create a new sale invoice.</p>
        </div>
      </div>

      <NewSaleForm customers={customers} parts={parts} />
    </div>
  );
}
