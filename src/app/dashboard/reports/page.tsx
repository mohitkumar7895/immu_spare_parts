import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDashboardStats } from '@/app/actions/dashboard-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Package, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Reports | Spare Parts Portal',
};

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const dbStats = await getDashboardStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Financial and operational reports for Administrators.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Sales Report Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Sales Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              View detailed sales history, total revenue, and performance by date.
            </p>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Today's Revenue:</span>
                <span className="font-bold">₹{Number(dbStats.todayRevenue).toLocaleString()}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <FileText className="w-4 h-4 mr-2" /> View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stock Report Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="w-5 h-5 mr-2 text-indigo-600" />
              Stock Report
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Analyze inventory valuation, stock movements, and current levels.
            </p>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Active Parts:</span>
                <span className="font-bold">{dbStats.totalParts}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <FileText className="w-4 h-4 mr-2" /> View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="flex flex-col border-red-100 bg-red-50/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Items that have fallen below their minimum required stock levels.
            </p>
            <div className="mt-4 pt-4 border-t border-red-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-700 font-medium">Items to Reorder:</span>
                <span className="font-bold text-red-700">{dbStats.lowStock}</span>
              </div>
              <Button className="w-full mt-4" variant="destructive">
                <FileText className="w-4 h-4 mr-2" /> View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profit Report Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Profitability
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Gross and net profit margins calculated from sales vs purchase costs.
            </p>
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Today's Est. Profit:</span>
                <span className="font-bold text-green-700">₹{Number(dbStats.todayProfit).toLocaleString()}</span>
              </div>
              <Button className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50" variant="outline">
                <FileText className="w-4 h-4 mr-2" /> View P&L
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
