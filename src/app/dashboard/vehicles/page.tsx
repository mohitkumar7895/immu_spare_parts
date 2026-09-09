import { getVehicles } from '@/app/actions/vehicle-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye, Car, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Manage customer vehicles and track their details.</p>
        </div>
        <Link href="/dashboard/vehicles/add" className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}>
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
            className="pl-8 text-xs sm:text-sm"
            defaultValue={searchParams.q}
          />
        </form>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="space-y-3 md:hidden">
        {vehicles.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No vehicles found.
          </div>
        ) : (
          vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="rounded-xl border bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary">
                    {vehicle.vehicle_number}
                  </Badge>
                  <h3 className="font-semibold text-base text-foreground mt-1.5 leading-snug">
                    {vehicle.vehicle_name} {vehicle.company ? `(${vehicle.company})` : ''}
                  </h3>
                </div>
                <Link href={`/dashboard/vehicles/${vehicle.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-2.5 text-xs gap-1" })}>
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link>
              </div>

              <div className="text-xs bg-muted/40 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="font-semibold text-foreground">{vehicle.customer_name}</span>
                </div>
                {vehicle.customer_mobile && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <a href={`tel:${vehicle.customer_mobile}`} className="font-medium text-primary flex items-center gap-1 hover:underline">
                      <Phone className="h-3 w-3" />
                      {vehicle.customer_mobile}
                    </a>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground pt-0.5">
                  <span>Registered:</span>
                  <span>{new Date(vehicle.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
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
                    <TableCell className="font-medium font-mono">{vehicle.vehicle_number}</TableCell>
                    <TableCell>{vehicle.vehicle_name} {vehicle.company ? `(${vehicle.company})` : ''}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.customer_name}</span>
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
    </div>
  );
}
