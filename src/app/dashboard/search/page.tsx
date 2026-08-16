import { globalSearch } from '@/app/actions/search-actions';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Package, Users, ShoppingCart, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Global Search | Spare Parts Portal',
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const results = await globalSearch(query);

  const totalResults = results.parts.length + results.customers.length + results.sales.length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SearchIcon className="w-8 h-8 text-primary" />
          Search Results
        </h1>
        <p className="text-muted-foreground mt-2">
          {query ? `Found ${totalResults} results for "${query}"` : 'Enter a search term in the top bar to find parts, customers, or sales.'}
        </p>
      </div>

      {query && totalResults === 0 && (
        <div className="text-center py-20 bg-card rounded-lg border">
          <p className="text-lg text-muted-foreground">No matches found across any module.</p>
        </div>
      )}

      {results.parts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center border-b pb-2">
            <Package className="mr-2" /> Parts ({results.parts.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.parts.map(part => (
              <Link href={`/dashboard/inventory/${part.id}`} key={part.id}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex justify-between">
                      <span className="truncate" title={part.part_name}>{part.part_name}</span>
                      <span className="text-xs text-muted-foreground font-normal">{part.part_number}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{part.vehicle_name} • {part.company_name}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold">₹{part.selling_price}</span>
                      <Badge variant={part.current_stock > 0 ? 'default' : 'destructive'}>
                        Stock: {part.current_stock}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.customers.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center border-b pb-2">
            <Users className="mr-2" /> Customers ({results.customers.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.customers.map(customer => (
              <Link href={`/dashboard/customers/${customer.id}`} key={customer.id}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{customer.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{customer.mobile}</p>
                    <p className="text-sm text-muted-foreground">{customer.location || 'No location'}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.sales.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center border-b pb-2">
            <ShoppingCart className="mr-2" /> Sales ({results.sales.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.sales.map(sale => (
              <Link href={`/dashboard/sales/${sale.id}`} key={sale.id}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">{sale.sale_number}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{sale.customer_name || 'Walk-in'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">{new Date(sale.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-green-700">₹{sale.grand_total}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
