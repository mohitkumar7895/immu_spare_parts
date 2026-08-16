'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPurchase } from '@/app/actions/transaction-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash2, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';

export function AddPurchaseForm({ parts }: { parts: any[] }) {
  const router = useRouter();
  const [supplierName, setSupplierName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [searchPart, setSearchPart] = useState('');
  const [isPending, setIsPending] = useState(false);

  const filteredParts = parts.filter(p => 
    p.status === 'ACTIVE' && 
    (p.part_name.toLowerCase().includes(searchPart.toLowerCase()) || 
     p.part_number.toLowerCase().includes(searchPart.toLowerCase()))
  );

  const addToCart = (part: any) => {
    const existing = cart.find(item => item.part_id === part.id);
    if (existing) {
      setCart(cart.map(item => item.part_id === part.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { part_id: part.id, part_name: part.part_name, purchase_price: part.purchase_price, quantity: 1 }]);
    }
  };

  const updateQuantity = (part_id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(part_id);
      return;
    }
    setCart(cart.map(i => i.part_id === part_id ? { ...i, quantity: qty } : i));
  };

  const updatePrice = (part_id: string, price: number) => {
    setCart(cart.map(i => i.part_id === part_id ? { ...i, purchase_price: price } : i));
  };

  const removeFromCart = (part_id: string) => {
    setCart(cart.filter(item => item.part_id !== part_id));
  };

  const grandTotal = cart.reduce((acc, item) => acc + (item.purchase_price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!supplierName.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    if (cart.length === 0) {
      toast.error('Add parts to purchase');
      return;
    }

    setIsPending(true);
    try {
      const payload = {
        supplier_name: supplierName,
        invoice_number: invoiceNumber,
        notes: notes,
        items: cart.map(i => ({ part_id: i.part_id, quantity: i.quantity, purchase_price: i.purchase_price }))
      };
      
      const res = await createPurchase(payload);
      if (res.success) {
        toast.success('Purchase recorded successfully!');
        router.push('/dashboard/purchases');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to record purchase');
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Search & Parts */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Select Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search part..." 
                className="pl-8"
                value={searchPart}
                onChange={e => setSearchPart(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredParts.slice(0, 10).map(part => (
                <div key={part.id} className="border rounded-lg p-3 hover:border-primary cursor-pointer transition-colors" onClick={() => addToCart(part)}>
                  <p className="font-semibold text-sm truncate">{part.part_name}</p>
                  <p className="text-xs text-muted-foreground">{part.part_number}</p>
                </div>
              ))}
              {filteredParts.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No parts found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side: Purchase Details */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Purchase Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Supplier Name</label>
                <Input 
                  placeholder="e.g. Auto Parts Co."
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Supplier Invoice Ref</label>
                <Input 
                  placeholder="e.g. INV-99238"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <Textarea 
                placeholder="Any notes about this shipment..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col flex-grow">
          <CardHeader className="bg-muted/50 border-b pb-4">
            <CardTitle className="text-lg">Items Received</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow pt-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No items added. Select parts from the left.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.part_id} className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.part_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-muted-foreground">Qty</label>
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.part_id, parseInt(e.target.value) || 1)}
                          className="w-20 text-center h-8"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-muted-foreground">Unit Cost (₹)</label>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={item.purchase_price}
                          onChange={(e) => updatePrice(item.part_id, parseFloat(e.target.value) || 0)}
                          className="w-28 text-center h-8"
                        />
                      </div>
                      <div className="flex flex-col items-end w-20">
                        <label className="text-xs text-muted-foreground">Total</label>
                        <span className="font-medium text-sm pt-1">₹{(item.quantity * item.purchase_price).toFixed(2)}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.part_id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 mt-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="border-t p-4 bg-muted/50 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Purchase Value</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg" 
              onClick={handleSubmit} 
              disabled={cart.length === 0 || !supplierName.trim() || isPending}
            >
              {isPending ? 'Processing...' : 'Confirm Purchase (Update Stock)'}
            </Button>
          </div>
        </Card>
      </div>
      
    </div>
  );
}
