import { getPurchaseById } from '@/app/actions/transaction-actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, Truck, Calendar, Receipt, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/dashboard/purchases">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Purchase Details</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">{purchase.purchase_number}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-muted/50 border-b p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">Supplier Name:</span>
              <span className="font-semibold">{purchase.supplier_name}</span>
            </div>
            <div className="grid grid-cols-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">Invoice Number:</span>
              <span className="font-semibold">{purchase.invoice_number || 'N/A'}</span>
            </div>
            {purchase.notes && (
              <div className="grid grid-cols-2 text-xs sm:text-sm">
                <span className="text-muted-foreground">Notes:</span>
                <span className="font-medium text-muted-foreground italic">{purchase.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-muted/50 border-b p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Purchase Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:pt-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">Purchase Number:</span>
              <span className="font-semibold font-mono">{purchase.purchase_number}</span>
            </div>
            <div className="grid grid-cols-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-semibold">
                {new Date(purchase.created_at).toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 pt-2 border-t mt-2 text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium">Total Amount:</span>
              <span className="font-bold text-lg sm:text-xl text-primary">₹{purchase.total_amount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-muted/50 border-b p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Purchased Items
          </CardTitle>
          <CardDescription>All spare parts included in this purchase</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 sm:pl-6 min-w-[160px]">Part Details</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right min-w-[100px]">Unit Price</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-6 min-w-[100px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4 sm:pl-6">
                      <div className="font-medium text-sm">{item.part_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{item.part_number}</div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">₹{item.purchase_price}</TableCell>
                    <TableCell className="text-right pr-4 sm:pr-6 font-bold text-primary">₹{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
