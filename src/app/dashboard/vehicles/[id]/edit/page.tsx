import { getVehicleById } from '@/app/actions/vehicle-actions';
import { getCustomers } from '@/app/actions/customer-actions';
import { EditVehicleForm } from '@/components/vehicles/edit-vehicle-form';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function EditVehiclePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard/vehicles');
  }

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();

  const customers = await getCustomers();

  // Create a proper vehicle object that the form expects
  // Usually the form expects customer_id
  const vehicleData = {
    ...vehicle,
    customer_id: vehicle.customer_id
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle</h1>
        <p className="text-muted-foreground">Modify details for {vehicle.vehicle_number}.</p>
      </div>
      <EditVehicleForm vehicle={vehicleData} customers={customers} />
    </div>
  );
}
