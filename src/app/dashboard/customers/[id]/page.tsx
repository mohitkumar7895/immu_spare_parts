import { getCustomerById, getCustomerVehicles, getCustomerSalesHistory } from '@/app/actions/customer-actions';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Phone, Car, ShoppingCart } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customer = await getCustomerById(params.id);
  if (!customer) return { title: 'Not Found' };
  return { title: `${customer.name} | Customers` };
}

export default async function CustomerDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [customer, vehicles, sales, session] = await Promise.all([
    getCustomerById(params.id),
    getCustomerVehicles(params.id),
    getCustomerSalesHistory(params.id),
    auth()
  ]);
  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/customers" 
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground">
              Customer since {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {session?.user?.role === 'ADMIN' && (
          <Link href={`/dashboard/customers/${customer.id}/edit`} className={buttonVariants({ variant: "outline" })}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Phone className="w-5 h-5 mr-2 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Mobile:</span>
              <span className="font-medium">{customer.mobile}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Alternate Mobile:</span>
              <span className="font-medium">{customer.alternate_mobile || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Address & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{customer.location || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{customer.address || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Notes:</span>
              <span className="font-medium">{customer.notes || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Linked Vehicles & Sales History */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col h-full max-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Car className="w-5 h-5 mr-2" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto pr-2">
            {vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No vehicles registered for this customer.
              </p>
            ) : (
              <div className="space-y-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{v.vehicle_name}</h4>
                      <Badge variant="outline">{v.vehicle_number}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex gap-2">
                      {v.company && <span>{v.company}</span>}
                      {v.model && <span>• {v.model}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full max-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Sales History
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto pr-2">
            {sales.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No past purchases found.
              </p>
            ) : (
              <div className="space-y-4">
                {sales.map((s, idx) => (
                  <div key={`${s.id}-${idx}`} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1" title={s.part_name}>{s.part_name}</h4>
                        <p className="text-xs text-muted-foreground">{s.part_number} • Qty: {s.quantity}</p>
                      </div>
                      <span className="font-bold whitespace-nowrap ml-2">₹{s.item_total}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>{new Date(s.sale_date).toLocaleDateString()}</span>
                      {s.vehicle_number && <span>Gadi: {s.vehicle_number}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
