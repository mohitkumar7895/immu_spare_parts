import { getSaleById } from '@/app/actions/transaction-actions';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from "@/components/ui/button";
import { PrintInvoiceButton } from '@/components/sales/print-button';

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sale = await getSaleById(params.id);
  if (!sale) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Non-printable Action Bar */}
      <div className="print:hidden flex justify-between items-center bg-card p-3 sm:p-4 rounded-lg border shadow-sm">
        <Link href="/dashboard/sales" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Sales
        </Link>
        <PrintInvoiceButton />
      </div>

      {/* Printable Invoice Area */}
      <div className="bg-card p-4 sm:p-6 md:p-10 border rounded-lg shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-6 sm:pb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">INVOICE</h1>
            <p className="text-muted-foreground mt-1 font-mono font-medium text-sm">{sale.sale_number}</p>
          </div>
          <div className="text-left sm:text-right">
            <h2 className="text-lg sm:text-xl font-bold text-primary">Spare Parts Auto Hub</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">123 Auto Market Street</p>
            <p className="text-muted-foreground text-xs sm:text-sm">New Delhi, DL 110001</p>
            <p className="text-muted-foreground text-xs sm:text-sm">Phone: +91 98765 43210</p>
          </div>
        </div>

        {/* Customer & Meta Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-6 sm:py-8">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Billed To</p>
            <h3 className="text-base sm:text-lg font-bold text-foreground">{sale.customer_name || 'Walk-in Customer'}</h3>
            {sale.customer_mobile && <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Phone: {sale.customer_mobile}</p>}
            {sale.customer_address && <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">{sale.customer_address}</p>}
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm">
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
        <div className="mt-4 sm:mt-6 overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="border-b-2 border-primary/20 text-foreground text-xs sm:text-sm uppercase tracking-wider">
                <th className="py-2.5 font-bold">Item Description</th>
                <th className="py-2.5 font-bold text-center">Qty</th>
                <th className="py-2.5 font-bold text-right">Price</th>
                <th className="py-2.5 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground divide-y text-xs sm:text-sm">
              {sale.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="font-semibold text-foreground">{item.part_name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{item.part_number}</p>
                  </td>
                  <td className="py-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.selling_price}</td>
                  <td className="py-3 text-right font-bold text-foreground">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
          <div className="w-full sm:w-80 space-y-2.5 text-xs sm:text-sm">
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
            <div className="flex justify-between border-t border-primary/20 pt-2.5 text-base sm:text-lg font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-green-600">₹{sale.grand_total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 sm:mt-20 pt-6 border-t text-center text-muted-foreground text-xs sm:text-sm">
          <p className="font-medium text-foreground mb-0.5">Thank you for your business!</p>
          <p className="text-[11px] text-muted-foreground">Goods once sold will not be taken back or exchanged.</p>
        </div>

      </div>
    </div>
  );
}
