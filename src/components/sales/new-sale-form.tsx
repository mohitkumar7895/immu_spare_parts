'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSale } from '@/app/actions/transaction-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash2, User as UserIcon, Package, Phone, MapPin, Car } from 'lucide-react';
import { toast } from 'sonner';

// Props passed down from server containing all customers and active parts
export function NewSaleForm({ customers, parts }: { customers: any[], parts: any[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerMobile(val);
    
    // Auto-fill logic
    const existing = customers.find(c => c.mobile === val);
    if (existing) {
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
    }
  };
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cart, setCart] = useState<any[]>([]);
  const [searchPart, setSearchPart] = useState('');
  const [isPending, setIsPending] = useState(false);

  const filteredParts = parts.filter(p => 
    p.status === 'ACTIVE' && 
    (p.part_name.toLowerCase().includes(searchPart.toLowerCase()) || 
     p.part_number.toLowerCase().includes(searchPart.toLowerCase()))
  );

  const addToCart = (part: any) => {
    if (part.current_stock <= 0) {
      toast.error('Part is out of stock!');
      return;
    }
    
    const existing = cart.find(item => item.part_id === part.id);
    if (existing) {
      if (existing.quantity >= part.current_stock) {
        toast.error('Cannot add more than available stock!');
        return;
      }
      setCart(cart.map(item => item.part_id === part.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { part_id: part.id, part_name: part.part_name, selling_price: part.selling_price, quantity: 1, max_stock: part.current_stock }]);
    }
  };

  const updateQuantity = (part_id: string, qty: number) => {
    const item = cart.find(i => i.part_id === part_id);
    if (qty > item.max_stock) {
      toast.error('Exceeds available stock!');
      return;
    }
    if (qty <= 0) {
      removeFromCart(part_id);
      return;
    }
    setCart(cart.map(i => i.part_id === part_id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (part_id: string) => {
    setCart(cart.filter(item => item.part_id !== part_id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const grandTotal = subtotal - discountAmount;

  const handleSubmit = async () => {
    if (!customerName.trim() || !customerMobile.trim()) {
      toast.error('Customer Name and Mobile are required');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsPending(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_mobile: customerMobile,
        customer_address: customerAddress,
        vehicle_number: vehicleNumber,
        discount: discountAmount,
        items: cart.map(i => ({ part_id: i.part_id, quantity: i.quantity, selling_price: i.selling_price }))
      };
      
      const res = await createSale(payload);
      if (res.success) {
        toast.success('Sale created successfully!');
        router.push(`/dashboard/sales/${res.saleId}/invoice`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create sale');
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-6">
      
      {/* Left side: Search & Parts */}
      <div className="lg:col-span-2 space-y-4">
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
                placeholder="Search part by name or number..." 
                className="pl-8"
                value={searchPart}
                onChange={e => setSearchPart(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[350px] lg:max-h-[520px] overflow-y-auto pr-1 sm:pr-2">
              {filteredParts.slice(0, 12).map(part => (
                <div key={part.id} className="border rounded-xl p-3 hover:border-primary cursor-pointer transition-all active:scale-95 bg-card/60" onClick={() => addToCart(part)}>
                  <p className="font-semibold text-sm truncate" title={part.part_name}>{part.part_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{part.part_number}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary">₹{part.selling_price}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${part.current_stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'}`}>
                      Stock: {part.current_stock}
                    </span>
                  </div>
                </div>
              ))}
              {filteredParts.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                  No parts found matching search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side: POS Cart & Checkout */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Mobile Number <span className="text-destructive">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. 9876543210" 
                  value={customerMobile}
                  onChange={handleMobileChange}
                  className="pl-9 h-9 text-sm"
                  type="tel"
                />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Auto-fills details if customer exists</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Customer Name <span className="text-destructive">*</span></label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Rahul Kumar" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Location / Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Delhi, India" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t mt-1">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground">Vehicle Number</label>
              <div className="relative">
                <Car className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. DL 1C AB 1234 (Optional)" 
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="pl-9 h-9 text-sm uppercase"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col flex-grow">
          <CardHeader className="bg-muted/50 border-b p-4 pb-3">
            <CardTitle className="text-base sm:text-lg">Current Sale</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-3">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Cart is empty. Add parts to continue.
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.part_id} className="flex justify-between items-center border-b pb-2.5 gap-2">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="font-semibold text-xs sm:text-sm truncate">{item.part_name}</p>
                      <p className="text-[11px] text-muted-foreground">₹{item.selling_price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input 
                        type="number" 
                        min="1" 
                        max={item.max_stock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.part_id, parseInt(e.target.value) || 1)}
                        className="w-14 h-8 text-center px-1 text-xs sm:text-sm"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.part_id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="border-t p-4 bg-muted/50 space-y-2.5">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-muted-foreground">Discount (%)</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">
                  (-₹{discountAmount.toFixed(2)})
                </span>
                <Input 
                  type="number" 
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 h-8 text-right text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="border-t pt-2.5 flex justify-between items-center text-base sm:text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-500">₹{grandTotal.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full mt-4" 
              size="lg" 
              onClick={handleSubmit} 
              disabled={cart.length === 0 || !customerName || !customerMobile || isPending}
            >
              {isPending ? 'Processing...' : 'Complete Sale'}
            </Button>
          </div>
        </Card>
      </div>
      
    </div>
  );
}
