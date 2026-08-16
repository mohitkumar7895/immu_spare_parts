'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { auth } from '@/lib/auth';

export async function globalSearch(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const isAdmin = session.user.role === 'ADMIN';

  if (!query || query.length < 2) {
    return { parts: [], customers: [], sales: [] };
  }
  
  const searchParam = `%${query}%`;
  
  // Search parts
  const [parts] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM parts WHERE part_number LIKE ? OR part_name LIKE ? OR vehicle_name LIKE ? OR company_name LIKE ? LIMIT 20',
    [searchParam, searchParam, searchParam, searchParam]
  );
  
  if (!isAdmin) {
    parts.forEach(p => {
      p.secret_cost = 0;
      p.purchase_price = 0;
    });
  }
  
  // Search customers
  const [customers] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM customers WHERE name LIKE ? OR mobile LIKE ? OR location LIKE ? LIMIT 10',
    [searchParam, searchParam, searchParam]
  );
  
  // Search sales
  const [sales] = await pool.query<RowDataPacket[]>(
    'SELECT s.*, c.name as customer_name FROM sales s LEFT JOIN customers c ON s.customer_id = c.id WHERE s.sale_number LIKE ? OR c.name LIKE ? LIMIT 10',
    [searchParam, searchParam]
  );

  return { parts, customers, sales };
}
