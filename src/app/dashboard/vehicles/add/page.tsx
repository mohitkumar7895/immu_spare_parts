import { AddVehicleForm } from '@/components/vehicles/add-vehicle-form';
import { getCustomers } from '@/app/actions/customer-actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Add Vehicle | Vehicles',
};

export default async function AddVehiclePage() {
  const customers = await getCustomers();
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/vehicles" 
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
          <p className="text-muted-foreground">Register a new customer vehicle in the system.</p>
        </div>
      </div>

      <AddVehicleForm customers={customers} />
    </div>
  );
}
