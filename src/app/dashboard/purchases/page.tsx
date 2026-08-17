import { getPurchases } from '@/app/actions/transaction-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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

export default async function PurchasesPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  const purchases = await getPurchases();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Manage stock purchases from suppliers.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <form className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search purchases..."
            className="pl-8"
          />
        </form>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Purchase No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice Ref</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No purchases found.
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase: any) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchase_number}</TableCell>
                    <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.supplier_name}</TableCell>
                    <TableCell>{purchase.invoice_number || '-'}</TableCell>
                    <TableCell className="text-right font-bold">₹{purchase.total_amount}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/purchases/${purchase.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
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
