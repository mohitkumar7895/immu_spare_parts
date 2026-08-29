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
import { SearchInput } from '@/components/shared/search-input';

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
        <SearchInput placeholder="Search parts..." />
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="hidden md:table-cell">Part No.</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                <TableHead className="hidden lg:table-cell">Company</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                {isAdmin && (
                  <>
                    <TableHead className="text-right text-indigo-400 hidden md:table-cell">Mechanic Price</TableHead>
                    <TableHead className="text-right text-muted-foreground hidden lg:table-cell">Purchase Price</TableHead>
                  </>
                )}
                <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
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
                    <TableCell className="font-medium hidden md:table-cell">{part.part_number}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{part.part_name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden flex flex-col gap-1 mt-1">
                        <span>{part.vehicle_name}</span>
                        <span>₹{part.mechanic_price} (Mech)</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{part.vehicle_name}</TableCell>
                    <TableCell className="hidden lg:table-cell">{part.company_name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <Badge variant={part.current_stock > part.minimum_stock ? "secondary" : "destructive"}>
                          {part.current_stock}
                        </Badge>
                        {part.current_stock <= part.minimum_stock && (
                          <span className="text-[10px] text-destructive mt-1 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{part.selling_price}</TableCell>
                    {isAdmin && (
                      <>
                        <TableCell className="text-right hidden md:table-cell">
                          <div className="flex justify-end">
                            <HiddenPrice price={part.mechanic_price} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right hidden lg:table-cell">
                          <div className="flex justify-end">
                            <HiddenPrice price={part.purchase_price} />
                          </div>
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-center hidden sm:table-cell">
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
