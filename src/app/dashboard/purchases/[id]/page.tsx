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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/purchases">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Details</h1>
          <p className="text-muted-foreground">{purchase.purchase_number}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Supplier Name:</span>
                <span className="font-semibold">{purchase.supplier_name}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-semibold">{purchase.invoice_number || 'N/A'}</span>
              </div>
              {purchase.notes && (
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Notes:</span>
                  <span className="font-medium text-sm text-muted-foreground italic">{purchase.notes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Purchase Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Purchase Number:</span>
                <span className="font-semibold">{purchase.purchase_number}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">
                  {new Date(purchase.created_at).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 pt-2 border-t mt-2">
                <span className="text-muted-foreground font-medium">Total Amount:</span>
                <span className="font-bold text-xl text-primary">₹{purchase.total_amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Purchased Items
          </CardTitle>
          <CardDescription>All spare parts included in this purchase</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Part Details</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right pr-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <div className="font-medium">{item.part_name}</div>
                    <div className="text-xs text-muted-foreground">{item.part_number}</div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">₹{item.purchase_price}</TableCell>
                  <TableCell className="text-right pr-6 font-semibold">₹{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
