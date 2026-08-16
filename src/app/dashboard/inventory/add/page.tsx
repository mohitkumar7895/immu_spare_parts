import { AddPartForm } from '@/components/inventory/add-part-form';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Add Part | Inventory',
};

export default async function AddPartPage() {
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard/inventory'); // Only ADMIN can add parts
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/inventory" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Part</h1>
          <p className="text-muted-foreground">Register a new spare part into the inventory.</p>
        </div>
      </div>

      <AddPartForm />
    </div>
  );
}
