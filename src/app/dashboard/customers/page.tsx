import { getCustomers } from '@/app/actions/customer-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function CustomersPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const customers = await getCustomers(searchParams.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Manage your customer database and view history.</p>
        </div>
        <Link href="/dashboard/customers/add" className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <form className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search customers by name, mobile..."
            className="pl-8 text-xs sm:text-sm"
            defaultValue={searchParams.q}
          />
        </form>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="space-y-3 md:hidden">
        {customers.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No customers found.
          </div>
        ) : (
          customers.map((customer: any) => (
            <div key={customer.id} className="rounded-xl border bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base text-foreground leading-snug">{customer.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link href={`/dashboard/customers/${customer.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-2.5 text-xs gap-1" })}>
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link>
              </div>

              <div className="text-xs bg-muted/40 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mobile:</span>
                  <a href={`tel:${customer.mobile}`} className="font-medium text-primary flex items-center gap-1 hover:underline">
                    <Phone className="h-3 w-3" />
                    {customer.mobile}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {customer.location || 'N/A'}
                  </span>
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
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.location || '-'}</TableCell>
                    <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/customers/${customer.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
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
