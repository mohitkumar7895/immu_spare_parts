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
import { DeletePartButton } from '@/components/inventory/delete-part-button';

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

      {/* Mobile Card List View (< md) */}
      <div className="space-y-3 md:hidden">
        {parts.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No parts found.
          </div>
        ) : (
          parts.map((part) => (
            <div key={part.id} className="rounded-xl border bg-card/80 backdrop-blur-md p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-foreground leading-snug">{part.part_name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{part.part_number}</p>
                </div>
                <Badge 
                  variant={part.status === 'ACTIVE' ? 'default' : 'outline'} 
                  className={part.status === 'ACTIVE' ? 'bg-green-600/90 hover:bg-green-700 text-[11px] shrink-0' : 'text-[11px] shrink-0'}
                >
                  {part.status}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium text-foreground">{part.vehicle_name}</span>
                {part.company_name && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span>{part.company_name}</span>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Retail Price</div>
                  <div className="text-lg font-bold text-primary">₹{part.selling_price}</div>
                  {isAdmin && (
                    <div className="text-[11px] text-indigo-400 font-medium">
                      Mech: ₹{part.mechanic_price}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Stock</div>
                  <div className="flex items-center justify-end gap-1.5">
                    <Badge variant={part.current_stock > part.minimum_stock ? "secondary" : "destructive"}>
                      {part.current_stock}
                    </Badge>
                    {part.current_stock <= part.minimum_stock && (
                      <span className="text-[10px] text-destructive flex items-center font-medium">
                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                        Low
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <Link 
                  href={`/dashboard/inventory/${part.id}`} 
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-3 text-xs gap-1.5" })}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </Link>
                {isAdmin && (
                  <DeletePartButton partId={part.id} partName={part.part_name} variant="icon" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block rounded-md border bg-card shadow-sm">
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
                        <span className="font-semibold text-primary">₹{part.selling_price} (Retail)</span>
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/inventory/${part.id}`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                        </Link>
                        {isAdmin && (
                          <DeletePartButton partId={part.id} partName={part.part_name} variant="icon" />
                        )}
                      </div>
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
