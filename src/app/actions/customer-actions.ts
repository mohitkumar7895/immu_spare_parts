'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@/types/customer';
import crypto from 'crypto';
import { auth } from '@/lib/auth';

const generateId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  let query = 'SELECT * FROM customers ORDER BY created_at DESC';
  let params: any[] = [];

  if (searchQuery) {
    query = `
      SELECT * FROM customers 
      WHERE name LIKE ? 
      OR mobile LIKE ? 
      OR location LIKE ? 
      ORDER BY created_at DESC
    `;
    const searchParam = `%${searchQuery}%`;
    params = [searchParam, searchParam, searchParam];
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as Customer[];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM customers WHERE id = ?', [id]);
  if (rows.length === 0) return null;

  return rows[0] as Customer;
}

export async function addCustomer(data: CreateCustomerDTO) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const id = generateId('cus');

  // Validate mobile uniqueness
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM customers WHERE mobile = ?', [data.mobile]);
  if (existing.length > 0) {
    throw new Error(`Customer with mobile ${data.mobile} already exists.`);
  }

  await pool.query(
    `INSERT INTO customers (id, name, mobile, alternate_mobile, location, address, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.name, data.mobile, data.alternate_mobile || null,
      data.location || null, data.address || null, data.notes || null
    ]
  );

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function updateCustomer(id: string, data: UpdateCustomerDTO) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can edit customers.');
  }

  // If mobile is being updated, check uniqueness
  if (data.mobile) {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM customers WHERE mobile = ? AND id != ?', [data.mobile, id]);
    if (existing.length > 0) {
      throw new Error(`Customer with mobile ${data.mobile} already exists.`);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];

  const updateFields = ['name', 'mobile', 'alternate_mobile', 'location', 'address', 'notes'] as const;
  
  for (const field of updateFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field] === '' ? null : data[field]);
    }
  }

  if (updates.length > 0) {
    values.push(id);
    await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/customers/${id}`);
  redirect(`/dashboard/customers/${id}`);
}


export async function getCustomerVehicles(customerId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
  return rows as any[];
}

export async function getCustomerSalesHistory(customerId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const query = `
    SELECT 
      s.id, 
      s.sale_date, 
      s.grand_total,
      s.sale_number,
      si.selling_price, 
      si.quantity,
      si.total as item_total,
      p.part_name, 
      p.part_number, 
      v.vehicle_number,
      v.vehicle_name
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN parts p ON si.part_id = p.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    WHERE s.customer_id = ?
    ORDER BY s.sale_date DESC
  `;
  
  const [rows] = await pool.query<RowDataPacket[]>(query, [customerId]);
  return rows as any[];
}
