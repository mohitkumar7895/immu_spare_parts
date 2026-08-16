import { getCustomers } from '@/app/actions/customer-actions';
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
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and view history.</p>
        </div>
        <Link href="/dashboard/customers/add" className={buttonVariants({ variant: "default" })}>
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
            className="pl-8"
            defaultValue={searchParams.q}
          />
        </form>
      </div>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
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
              customers.map((customer) => (
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
  );
}
