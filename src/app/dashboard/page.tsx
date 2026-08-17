import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/app/actions/dashboard-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, IndianRupee, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';
  const dbStats = await getDashboardStats();

  const stats = [
    {
      title: 'Total Parts',
      value: dbStats.totalParts.toLocaleString(),
      icon: Package,
      description: 'Active items in inventory',
      href: '/dashboard/inventory',
    },
    {
      title: "Today's Sales",
      value: dbStats.todaySalesCount.toLocaleString(),
      icon: ShoppingCart,
      description: 'Sales completed today',
      href: '/dashboard/sales',
    },
    {
      title: 'Low Stock Items',
      value: dbStats.lowStock.toLocaleString(),
      icon: AlertTriangle,
      description: 'Items below minimum stock',
      alert: dbStats.lowStock > 0,
      href: '/dashboard/inventory',
    },
    {
      title: 'Total Customers',
      value: dbStats.totalCustomers.toLocaleString(),
      icon: Users,
      description: 'Registered customers',
      href: '/dashboard/customers',
    },
  ];

  if (isAdmin) {
    stats.push(
      {
        title: "Today's Revenue",
        value: `₹${Number(dbStats.todayRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: IndianRupee,
        description: 'Gross revenue today',
        href: '/dashboard/sales',
      },
      {
        title: "Today's Profit",
        value: `₹${Number(dbStats.todayProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: IndianRupee,
        description: 'Net profit today',
        href: '/dashboard/reports',
      }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || 'User'}. Here's an overview of your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href} className="block transition-transform hover:scale-105">
              <Card className={`h-full ${stat.alert ? 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10' : ''} hover:border-primary cursor-pointer`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.alert ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.alert ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground py-10">
              Recent sales will appear here once connected to database.
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground py-10">
              Low stock items will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
