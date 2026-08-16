'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Vehicle, VehicleWithCustomer, CreateVehicleDTO, UpdateVehicleDTO } from '@/types/vehicle';
import crypto from 'crypto';
import { auth } from '@/lib/auth';

const generateId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export async function getVehicles(searchQuery?: string): Promise<VehicleWithCustomer[]> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  let query = `
    SELECT v.*, c.name as customer_name, c.mobile as customer_mobile
    FROM vehicles v
    LEFT JOIN customers c ON v.customer_id = c.id
    ORDER BY v.created_at DESC
  `;
  let params: any[] = [];

  if (searchQuery) {
    query = `
      SELECT v.*, c.name as customer_name, c.mobile as customer_mobile
      FROM vehicles v
      LEFT JOIN customers c ON v.customer_id = c.id
      WHERE v.vehicle_number LIKE ? 
      OR v.vehicle_name LIKE ? 
      OR c.name LIKE ?
      ORDER BY v.created_at DESC
    `;
    const searchParam = `%${searchQuery}%`;
    params = [searchParam, searchParam, searchParam];
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as VehicleWithCustomer[];
}

export async function getVehicleById(id: string): Promise<VehicleWithCustomer | null> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT v.*, c.name as customer_name, c.mobile as customer_mobile
    FROM vehicles v
    LEFT JOIN customers c ON v.customer_id = c.id
    WHERE v.id = ?
  `, [id]);
  
  if (rows.length === 0) return null;

  return rows[0] as VehicleWithCustomer;
}

export async function addVehicle(data: CreateVehicleDTO) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const id = generateId('veh');

  // Validate vehicle number uniqueness
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM vehicles WHERE vehicle_number = ?', [data.vehicle_number]);
  if (existing.length > 0) {
    throw new Error(`Vehicle with number ${data.vehicle_number} already exists.`);
  }

  await pool.query(
    `INSERT INTO vehicles (id, vehicle_number, vehicle_name, model, company, notes, customer_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id, 
      data.vehicle_number, 
      data.vehicle_name, 
      data.model || null,
      data.company || null, 
      data.notes || null, 
      data.customer_id
    ]
  );

  revalidatePath('/dashboard/vehicles');
  redirect('/dashboard/vehicles');
}

export async function updateVehicle(id: string, data: UpdateVehicleDTO) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can edit vehicles.');
  }

  // If vehicle_number is being updated, check uniqueness
  if (data.vehicle_number) {
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM vehicles WHERE vehicle_number = ? AND id != ?', [data.vehicle_number, id]);
    if (existing.length > 0) {
      throw new Error(`Vehicle with number ${data.vehicle_number} already exists.`);
    }
  }

  const updates: string[] = [];
  const values: any[] = [];

  const updateFields = ['vehicle_number', 'vehicle_name', 'model', 'company', 'notes', 'customer_id'] as const;
  
  for (const field of updateFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field] === '' ? null : data[field]);
    }
  }

  if (updates.length > 0) {
    values.push(id);
    await pool.query(
      `UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  revalidatePath('/dashboard/vehicles');
  revalidatePath(`/dashboard/vehicles/${id}`);
  redirect('/dashboard/vehicles');
}
