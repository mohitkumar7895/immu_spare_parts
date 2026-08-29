import { getSales } from '@/app/actions/transaction-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/shared/search-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function SalesPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';
  const session = await auth();
  const sales = await getSales(true, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recent Sales</h1>
          <p className="text-muted-foreground">Showing sales from the last 24 hours.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/sales/all" className={buttonVariants({ variant: "outline" })}>
            View All Sales
          </Link>
          <Link href="/dashboard/sales/new" className={buttonVariants({ variant: "default" })}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <SearchInput placeholder="Search sales by customer or vehicle..." />
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="hidden md:table-cell">Sale No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No sales found.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium hidden md:table-cell">{sale.sale_number}</TableCell>
                    <TableCell>
                      {new Date(sale.created_at).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground md:hidden mt-1">
                        {sale.sale_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{sale.customer_name || 'Walk-in'}</div>
                      <div className="text-xs text-muted-foreground sm:hidden mt-1">
                        {sale.vehicle_number || 'No Vehicle'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{sale.vehicle_number || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{sale.grand_total}</TableCell>
                    <TableCell className="text-right space-x-2 flex justify-end">
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
