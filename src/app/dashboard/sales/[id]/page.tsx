import { getSaleById } from '@/app/actions/transaction-actions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShoppingCart, Calendar, ChevronLeft, FileText, User, Car, CheckCircle2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const sale = await getSaleById(id);
    if (!sale) return { title: 'Sale Not Found' };
    return { title: `${sale.sale_number} | Sale Details` };
  } catch {
    return { title: 'Sale Details' };
  }
}

export default async function SaleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link href="/dashboard/sales">
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Sale Details</h1>
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                {sale.sale_number}
              </Badge>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Processed on {new Date(sale.created_at).toLocaleDateString()} at {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/dashboard/sales/${sale.id}/invoice`}
            className={buttonVariants({ variant: 'default', className: 'w-full sm:w-auto gap-2 shadow-sm' })}
          >
            <FileText className="h-4 w-4" />
            <span>View & Print Invoice</span>
          </Link>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/40 border-b p-4 sm:p-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer Name:</span>
              <span className="font-semibold text-foreground">{sale.customer_name || 'Walk-in Customer'}</span>
            </div>
            {sale.customer_mobile && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mobile Number:</span>
                <a href={`tel:${sale.customer_mobile}`} className="font-medium text-primary hover:underline">
                  {sale.customer_mobile}
                </a>
              </div>
            )}
            {sale.customer_address && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium text-foreground text-right">{sale.customer_address}</span>
              </div>
            )}
            {sale.vehicle_number && (
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" /> Vehicle No:
                </span>
                <span className="font-bold text-foreground font-mono">{sale.vehicle_number}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary Card */}
        <Card className="border shadow-sm">
          <CardHeader className="bg-muted/40 border-b p-4 sm:p-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">₹{Number(sale.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount Applied:</span>
              <span className="text-destructive font-medium">-₹{Number(sale.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t">
              <span>Grand Total:</span>
              <span className="text-primary text-xl">₹{Number(sale.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {sale.notes && (
              <div className="pt-2 text-xs text-muted-foreground border-t">
                <span className="font-semibold text-foreground">Notes:</span> {sale.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Section */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5 border-b bg-muted/40">
          <CardTitle className="text-base sm:text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Items Sold ({sale.items?.length || 0})
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              Total Units: {sale.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card List for Items (< sm) */}
          <div className="divide-y sm:hidden">
            {sale.items?.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground leading-snug">{item.part_name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{item.part_number}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹{Number(item.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                  <span>Unit Price: ₹{Number(item.selling_price).toLocaleString()}</span>
                  <span className="font-semibold text-foreground">Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items?.map((item: any, index: number) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{item.part_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.part_number}</TableCell>
                    <TableCell className="text-right">₹{Number(item.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
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
