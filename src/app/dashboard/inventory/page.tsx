import { getParts } from '@/app/actions/inventory-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Search, Eye, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HiddenPrice } from '@/components/inventory/hidden-price';

export default async function InventoryPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';
  const parts = await getParts(searchParams.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your spare parts stock.</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/inventory/add" className={buttonVariants({ variant: "default" })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Link>
        )}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <form className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            placeholder="Search parts..."
            className="pl-8"
            defaultValue={searchParams.q}
          />
        </form>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Part No.</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                {isAdmin && <TableHead className="text-right text-muted-foreground">Purchase Price</TableHead>}
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
                    No parts found.
                  </TableCell>
                </TableRow>
              ) : (
                parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.part_number}</TableCell>
                    <TableCell>{part.part_name}</TableCell>
                    <TableCell>{part.vehicle_name}</TableCell>
                    <TableCell>{part.company_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <Badge variant={part.current_stock > part.minimum_stock ? "secondary" : "destructive"}>
                          {part.current_stock}
                        </Badge>
                        {part.current_stock <= part.minimum_stock && (
                          <span className="text-[10px] text-destructive mt-1 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">₹{part.selling_price}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right flex justify-end">
                        <HiddenPrice price={part.purchase_price} />
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge variant={part.status === 'ACTIVE' ? 'default' : 'outline'} className={part.status === 'ACTIVE' ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {part.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/inventory/${part.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
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
