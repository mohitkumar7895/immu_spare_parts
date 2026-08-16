import { getVehicleById } from '@/app/actions/vehicle-actions';
import { getCustomers } from '@/app/actions/customer-actions';
import { EditVehicleForm } from '@/components/vehicles/edit-vehicle-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const vehicle = await getVehicleById(params.id);
  if (!vehicle) return { title: 'Vehicle Not Found' };
  
  return {
    title: `${vehicle.vehicle_number} | Edit Vehicle`,
  };
}

export default async function EditVehiclePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [vehicle, customers, session] = await Promise.all([
    getVehicleById(params.id),
    getCustomers(),
    auth()
  ]);
  
  if (!vehicle) {
    notFound();
  }
  
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle: {vehicle.vehicle_number}</h1>
          <p className="text-muted-foreground">Update the details for this vehicle.</p>
        </div>
      </div>

      <EditVehicleForm vehicle={vehicle} customers={customers} isReadOnly={session?.user?.role !== 'ADMIN'} />
    </div>
  );
}
