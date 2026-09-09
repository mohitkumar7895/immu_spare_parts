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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Sales</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5">Complete history of all sales transactions.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <Link href="/dashboard/sales" className={buttonVariants({ variant: "outline", className: "flex-1 sm:flex-none justify-center" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Recent Sales
          </Link>
          <Link href="/dashboard/sales/new" className={buttonVariants({ variant: "default", className: "flex-1 sm:flex-none justify-center" })}>
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

      {/* Mobile Card List View (< md) */}
      <div className="space-y-3 md:hidden">
        {sales.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No sales found.
          </div>
        ) : (
          sales.map((sale: any) => (
            <div key={sale.id} className="rounded-xl border bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-semibold text-primary">{sale.sale_number}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-base font-bold text-green-500">₹{sale.grand_total}</span>
              </div>

              <div className="text-xs bg-muted/40 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold text-foreground">{sale.customer_name || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium text-foreground">{sale.vehicle_number || 'None'}</span>
                </div>
                {Number(sale.discount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount:</span>
                    <span className="text-red-500">-₹{sale.discount}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                <Link href={`/dashboard/sales/${sale.id}/invoice`} className={buttonVariants({ variant: "default", size: "sm", className: "h-8 px-3 text-xs gap-1.5 flex-1 justify-center sm:flex-none" })}>
                  <FileText className="h-3.5 w-3.5" />
                  <span>Invoice</span>
                </Link>
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
