'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CreatePartDTO, UpdatePartDTO, Part } from '@/types/part';
import crypto from 'crypto';
import { auth } from '@/lib/auth';

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export async function getParts(searchQuery?: string): Promise<Part[]> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  let query = 'SELECT * FROM parts ORDER BY created_at DESC';
  let params: any[] = [];

  if (searchQuery) {
    query = `
      SELECT * FROM parts 
      WHERE part_number LIKE ? 
      OR part_name LIKE ? 
      OR vehicle_name LIKE ? 
      OR company_name LIKE ?
      ORDER BY part_name ASC
    `;
    const searchParam = `%${searchQuery}%`;
    params = [searchParam, searchParam, searchParam, searchParam];
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  
  // Expose purchase_price only to ADMIN
  const isAdmin = session.user.role === 'ADMIN';
  
  return rows.map((row) => {
    const part = row as Part;
    if (!isAdmin) {
      // Staff shouldn't see these fields
      // Using 0 or -1 as a masked value for frontend type consistency
      part.purchase_price = 0; 
    }
    return part;
  });
}

export async function getPartById(id: string): Promise<Part | null> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM parts WHERE id = ?', [id]);
  
  if (rows.length === 0) return null;

  const part = rows[0] as Part;
  
  if (session.user.role !== 'ADMIN') {
    part.purchase_price = 0;
  }
  
  return part;
}

export async function addPart(data: CreatePartDTO) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can add parts.');
  }

  const id = generateId('prt');
  const current_stock = data.opening_stock;

  // Validate part_number uniqueness
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM parts WHERE part_number = ?', [data.part_number]);
  if (existing.length > 0) {
    throw new Error(`Part with number ${data.part_number} already exists.`);
  }

  await pool.query(
    `INSERT INTO parts (
      id, part_number, part_name, vehicle_name, company_name, 
      purchase_price, selling_price, opening_stock, 
      current_stock, minimum_stock, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.part_number, data.part_name, data.vehicle_name, data.company_name,
      data.purchase_price, data.selling_price, data.opening_stock,
      current_stock, data.minimum_stock, data.description || null
    ]
  );

  revalidatePath('/dashboard/inventory');
  redirect('/dashboard/inventory');
}

export async function updatePart(id: string, data: UpdatePartDTO) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can edit parts.');
  }

  // Validate part_number uniqueness if updated
  if (data.part_number) {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM parts WHERE part_number = ? AND id != ?', [data.part_number, id]);
    if (existing.length > 0) {
      throw new Error(`Part with number ${data.part_number} already exists.`);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];

  const updateFields = [
    'part_number', 'part_name', 'vehicle_name', 'company_name', 
    'purchase_price', 'selling_price', 
    'current_stock', 'minimum_stock', 'description'
  ] as const;
  
  for (const field of updateFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field] === '' ? null : data[field]);
    }
  }

  if (updates.length > 0) {
    values.push(id);
    await pool.query(
      `UPDATE parts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  revalidatePath('/dashboard/inventory');
  revalidatePath(`/dashboard/inventory/${id}`);
  redirect(`/dashboard/inventory/${id}`);
}


export async function togglePartStatus(id: string, newStatus: 'ACTIVE' | 'INACTIVE') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can modify part status.');
  }

  await pool.query('UPDATE parts SET status = ? WHERE id = ?', [newStatus, id]);
  revalidatePath('/dashboard/inventory');
  revalidatePath(`/dashboard/inventory/${id}`);
}
