import { getSales } from '@/app/actions/transaction-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function AllSalesPage() {
  const session = await auth();
  const sales = await getSales(false); // Fetch ALL sales without the 24h limit

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Sales</h1>
          <p className="text-muted-foreground">Complete history of all sales transactions.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/sales" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recent Sales
          </Link>
          <Link href="/dashboard/sales/new" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <form className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search sale number, customer..."
            className="pl-8"
          />
        </form>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Sale No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No sales found.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.sale_number}</TableCell>
                    <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.customer_name || 'Walk-in Customer'}</TableCell>
                    <TableCell>{sale.vehicle_number || '-'}</TableCell>
                    <TableCell className="text-right">₹{sale.subtotal}</TableCell>
                    <TableCell className="text-right">₹{sale.discount}</TableCell>
                    <TableCell className="text-right font-bold text-green-700">₹{sale.grand_total}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/dashboard/sales/${sale.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                      </Link>
                      <Link href={`/dashboard/sales/${sale.id}/invoice`} title="Invoice" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="sr-only">Invoice</span>
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
