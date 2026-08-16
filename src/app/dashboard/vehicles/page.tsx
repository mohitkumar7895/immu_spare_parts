import { getVehicles } from '@/app/actions/vehicle-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function VehiclesPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const vehicles = await getVehicles(searchParams.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage customer vehicles and track their details.</p>
        </div>
        <Link href="/dashboard/vehicles/add" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <form className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search by number, name, or customer..."
            className="pl-8"
            defaultValue={searchParams.q}
          />
        </form>
      </div>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Vehicle Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No vehicles found.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.vehicle_number}</TableCell>
                  <TableCell>{vehicle.vehicle_name} {vehicle.company ? `(${vehicle.company})` : ''}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{vehicle.customer_name}</span>
                      <span className="text-xs text-muted-foreground">{vehicle.customer_mobile}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(vehicle.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
