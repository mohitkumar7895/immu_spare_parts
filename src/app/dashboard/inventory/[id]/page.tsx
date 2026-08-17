import { getPartById } from '@/app/actions/inventory-actions';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Activity, ShoppingCart, Receipt } from 'lucide-react';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HiddenPrice } from '@/components/inventory/hidden-price';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const part = await getPartById(params.id);
  if (!part) return { title: 'Not Found' };
  return { title: `${part.part_name} | Inventory` };
}

export default async function PartDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  const part = await getPartById(params.id);
  if (!part) notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory" 
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{part.part_name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Part No: <span className="font-medium text-foreground">{part.part_number}</span>
              <Badge variant={part.status === 'ACTIVE' ? 'default' : 'secondary'}>{part.status}</Badge>
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href={`/dashboard/inventory/${part.id}/edit`} className={buttonVariants({ variant: "outline" })}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Part
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Vehicle:</span>
              <span className="font-medium">{part.vehicle_name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Company:</span>
              <span className="font-medium">{part.company_name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Description:</span>
              <span className="font-medium">{part.description || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Stock Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Current Stock:</span>
              <span className={`font-bold text-lg ${part.current_stock <= part.minimum_stock ? 'text-red-600' : 'text-green-600'}`}>
                {part.current_stock}
              </span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Minimum Stock:</span>
              <span className="font-medium">{part.minimum_stock}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Opening Stock:</span>
              <span className="font-medium">{part.opening_stock}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-primary" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Selling Price:</span>
              <span className="font-bold text-lg">₹{part.selling_price}</span>
            </div>
            {isAdmin && (
              <>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <div className="flex justify-start">
                    <HiddenPrice price={part.purchase_price} />
                  </div>
                </div>
                <div className="grid grid-cols-2 pt-2 border-t mt-2">
                  <span className="text-muted-foreground">Est. Profit Margin:</span>
                  <span className="font-medium text-green-600">
                    {(((part.selling_price - part.purchase_price) / part.selling_price) * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction History Placeholders */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sales history will appear here once the Sales module is implemented.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Receipt className="w-5 h-5 mr-2" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-4 text-center">
              Purchase history will appear here once the Purchases module is implemented.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
