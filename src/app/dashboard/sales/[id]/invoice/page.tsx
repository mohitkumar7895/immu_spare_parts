import { getSaleById } from '@/app/actions/transaction-actions';
import { notFound } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sale = await getSaleById(params.id);
  if (!sale) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Non-printable Action Bar */}
      <div className="print:hidden flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <Link href="/dashboard/sales" className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Link>
        {/* We use a simple window.print() inside a client wrapper or a button with onClick. Since this is a server component, we'll inline a small script or just use a basic button that triggers it. */}
        <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Printer className="w-4 h-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      {/* Printable Invoice Area */}
      <div className="bg-card p-10 border rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">INVOICE</h1>
            <p className="text-muted-foreground mt-1 font-medium">{sale.sale_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-primary">Spare Parts Auto Hub</h2>
            <p className="text-muted-foreground text-sm mt-1">123 Auto Market Street</p>
            <p className="text-muted-foreground text-sm">New Delhi, DL 110001</p>
            <p className="text-muted-foreground text-sm">Phone: +91 98765 43210</p>
          </div>
        </div>

        {/* Customer & Meta Info */}
        <div className="flex justify-between items-start py-8">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Billed To</p>
            <h3 className="text-lg font-bold text-foreground">{sale.customer_name || 'Walk-in Customer'}</h3>
            {sale.customer_mobile && <p className="text-muted-foreground text-sm mt-1">Phone: {sale.customer_mobile}</p>}
            {sale.customer_address && <p className="text-muted-foreground text-sm mt-1">{sale.customer_address}</p>}
          </div>
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <span className="text-muted-foreground font-medium">Invoice Date:</span>
              <span className="text-foreground font-bold">{new Date(sale.created_at).toLocaleDateString()}</span>
              
              {sale.vehicle_number && (
                <>
                  <span className="text-muted-foreground font-medium">Vehicle No:</span>
                  <span className="text-foreground font-bold">{sale.vehicle_number}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900 text-foreground text-sm uppercase tracking-wider">
                <th className="py-3 font-bold">Item Description</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Price</th>
                <th className="py-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground divide-y">
              {sale.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4">
                    <p className="font-bold text-foreground">{item.part_name}</p>
                    <p className="text-xs text-muted-foreground">{item.part_number}</p>
                  </td>
                  <td className="py-4 text-center font-medium">{item.quantity}</td>
                  <td className="py-4 text-right">₹{item.selling_price}</td>
                  <td className="py-4 text-right font-bold text-foreground">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-8 border-t pt-8">
          <div className="w-1/2 max-w-sm space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">₹{sale.subtotal}</span>
            </div>
            {Number(sale.discount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span className="font-medium text-red-600">- ₹{sale.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-900 pt-3 text-lg font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-green-700">₹{sale.grand_total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t text-center text-muted-foreground text-sm">
          <p className="font-medium text-foreground mb-1">Thank you for your business!</p>
          <p>Goods once sold will not be taken back or exchanged.</p>
        </div>

      </div>
      
      {/* Inline Script for Print Button */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelector('button[onClick={() => window.print()}]').addEventListener('click', function(e) {
          e.preventDefault();
          window.print();
        });
      ` }} />
    </div>
  );
}
