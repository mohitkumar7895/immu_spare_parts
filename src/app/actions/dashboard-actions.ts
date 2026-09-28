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
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    // Fetch the dashboard in one round trip instead of serially waiting for
    // five or six independent database queries.
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM parts WHERE status = 'ACTIVE') AS totalParts,
        (SELECT COUNT(*) FROM customers) AS totalCustomers,
        (
          SELECT COUNT(*)
          FROM parts
          WHERE current_stock <= minimum_stock AND status = 'ACTIVE'
        ) AS lowStock,
        (
          SELECT COUNT(*)
          FROM sales
          WHERE created_at >= ?
        ) AS todaySalesCount,
        (
          SELECT COALESCE(SUM(grand_total), 0)
          FROM sales
          WHERE created_at >= ?
        ) AS todayRevenue,
        (
          SELECT COALESCE(SUM((si.selling_price - p.purchase_price) * si.quantity), 0)
          FROM sale_items si
          JOIN sales s ON si.sale_id = s.id
          JOIN parts p ON si.part_id = p.id
          WHERE s.created_at >= ?
        ) AS todayProfit
    `, [todayStart, todayStart, todayStart]);

    const stats = rows[0] ?? {};

    return {
      totalParts: Number(stats.totalParts || 0),
      totalCustomers: Number(stats.totalCustomers || 0),
      lowStock: Number(stats.lowStock || 0),
      todaySalesCount: Number(stats.todaySalesCount || 0),
      todayRevenue: Number(stats.todayRevenue || 0),
      todayProfit: isAdmin ? Number(stats.todayProfit || 0) : 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return fallbackStats;
  }
}
