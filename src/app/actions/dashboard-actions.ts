'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { auth } from '@/lib/auth';

export async function getDashboardStats() {
  const fallbackStats = {
    totalParts: 0,
    totalCustomers: 0,
    lowStock: 0,
    todaySalesCount: 0,
    todayRevenue: 0,
    todayProfit: 0,
  };

  const session = await auth();
  if (!session?.user) return fallbackStats;
  const isAdmin = session.user.role === 'ADMIN';

  try {
    // Total Parts
    const [partsRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM parts WHERE status = "ACTIVE"');
    const totalParts = partsRows[0]?.count || 0;

    // Total Customers
    const [custRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM customers');
    const totalCustomers = custRows[0]?.count || 0;

    // Low Stock Items
    const [lowStockRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM parts WHERE current_stock <= minimum_stock AND status = "ACTIVE"');
    const lowStock = lowStockRows[0]?.count || 0;

    // Today's Sales & Revenue
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    const [salesRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count, SUM(grand_total) as revenue FROM sales WHERE created_at >= ?',
      [todayStart]
    );
    
    const todaySalesCount = salesRows[0]?.count || 0;
    const todayRevenue = salesRows[0]?.revenue || 0;

    // Today's Profit (Admin Only)
    let todayProfit = 0;
    if (isAdmin) {
      try {
        const [profitRows] = await pool.query<RowDataPacket[]>(`
          SELECT SUM((si.selling_price - p.purchase_price) * si.quantity) as profit
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          JOIN parts p ON si.part_id = p.id
          WHERE s.created_at >= ?
        `, [todayStart]);
        todayProfit = profitRows[0]?.profit || 0;
      } catch (profErr) {
        console.error('Failed to calculate profit:', profErr);
      }
    }

    return {
      totalParts,
      totalCustomers,
      lowStock,
      todaySalesCount,
      todayRevenue,
      todayProfit
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return fallbackStats;
  }
}
