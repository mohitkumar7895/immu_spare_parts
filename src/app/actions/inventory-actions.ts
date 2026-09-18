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

// Auto-migration cache to prevent running SHOW COLUMNS on every request
let isMechanicColumnChecked = false;

async function ensureMechanicColumn() {
  if (isMechanicColumnChecked) return;
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM parts LIKE 'mechanic_price'`);
    if ((columns as any[]).length === 0) {
      await pool.query(`ALTER TABLE parts ADD COLUMN mechanic_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER selling_price`);
      console.log('Auto-migration: Added mechanic_price column to parts table.');
    }
    isMechanicColumnChecked = true;
  } catch (migErr) {
    console.error('Auto-migration failed for parts table:', migErr);
  }
}

export async function getParts(searchQuery?: string): Promise<Part[]> {
  const session = await auth();
  if (!session?.user) return [];

  await ensureMechanicColumn();

  let query = `
    SELECT id, part_number, part_name, vehicle_name, company_name, 
           purchase_price, selling_price, mechanic_price, opening_stock, 
           current_stock, minimum_stock, status, created_at
    FROM parts 
    ORDER BY part_name ASC, vehicle_name ASC
  `;
  let params: any[] = [];

  if (searchQuery && searchQuery.trim()) {
    query = `
      SELECT id, part_number, part_name, vehicle_name, company_name, 
             purchase_price, selling_price, mechanic_price, opening_stock, 
             current_stock, minimum_stock, status, created_at
      FROM parts 
      WHERE part_number LIKE ? 
         OR part_name LIKE ? 
         OR vehicle_name LIKE ? 
         OR company_name LIKE ?
      ORDER BY part_name ASC, vehicle_name ASC
    `;
    const searchParam = `%${searchQuery.trim()}%`;
    params = [searchParam, searchParam, searchParam, searchParam];
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    // Expose purchase_price and mechanic_price only to ADMIN
    const isAdmin = session.user.role === 'ADMIN';
    
    return rows.map((row) => {
      const part = row as Part;
      if (!isAdmin) {
        part.purchase_price = 0; 
        part.mechanic_price = 0;
      }
      return part;
    });
  } catch (error) {
    console.error('Failed to get parts:', error);
    return [];
  }
}

export async function getPartById(id: string): Promise<Part | null> {
  const session = await auth();
  if (!session?.user) return null;

  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM parts WHERE id = ?', [id]);
    
    if (rows.length === 0) return null;

    const part = rows[0] as Part;
    
    if (session.user.role !== 'ADMIN') {
      part.purchase_price = 0;
      part.mechanic_price = 0;
    }
    
    return part;
  } catch (error) {
    console.error(`Failed to get part ${id}:`, error);
    return null;
  }
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
      purchase_price, selling_price, mechanic_price, opening_stock, 
      current_stock, minimum_stock, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.part_number, data.part_name, data.vehicle_name, data.company_name,
      data.purchase_price, data.selling_price, data.mechanic_price, data.opening_stock,
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
    'purchase_price', 'selling_price', 'mechanic_price', 
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

export async function deletePart(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { success: false, error: 'Only administrators can delete parts.' };
  }

  try {
    // 1. Check if used in sales bills
    const [sales] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM sale_items WHERE part_id = ?',
      [id]
    );
    if (sales[0]?.count > 0) {
      return {
        success: false,
        error: `Cannot delete: This part is used in ${sales[0].count} sales bill(s). You can mark it as INACTIVE instead.`,
      };
    }

    // 2. Check if used in purchase bills
    const [purchases] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM purchase_items WHERE part_id = ?',
      [id]
    );
    if (purchases[0]?.count > 0) {
      return {
        success: false,
        error: `Cannot delete: This part is used in ${purchases[0].count} purchase bill(s). You can mark it as INACTIVE instead.`,
      };
    }

    // 3. Remove stock movements for this part if any
    await pool.query('DELETE FROM stock_movements WHERE part_id = ?', [id]);

    // 4. Delete the part
    const [result]: any = await pool.query('DELETE FROM parts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return { success: false, error: 'Part not found or already deleted.' };
    }

    revalidatePath('/dashboard/inventory');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete part:', error);
    return { success: false, error: error.message || 'Failed to delete part.' };
  }
}

