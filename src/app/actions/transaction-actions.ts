'use server';

import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader, Connection } from 'mysql2/promise';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { Sale, SaleItem } from '@/types/transaction';

const generateId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

// Generate Sale Number SAL-000001
async function generateSaleNumber(connection: any): Promise<string> {
  const [rows] = await connection.query('SELECT sale_number FROM sales ORDER BY id DESC LIMIT 1');
  if (rows.length === 0) return 'SAL-000001';
  
  const lastNumber = rows[0].sale_number;
  const numPart = parseInt(lastNumber.replace('SAL-', ''), 10);
  const nextNum = numPart + 1;
  return `SAL-${nextNum.toString().padStart(6, '0')}`;
}

export interface CreateSaleDTO {
  customer_name: string;
  customer_mobile: string;
  customer_address?: string;
  vehicle_number?: string;
  discount: number;
  notes?: string;
  items: {
    part_id: string;
    quantity: number;
    selling_price: number;
  }[];
}

export async function createSale(data: CreateSaleDTO) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const saleId = generateId('sal');
    const saleNumber = await generateSaleNumber(connection);
    
    // Find or create customer by mobile
    let customerId = '';
    const [existingCustomers] = await connection.query<RowDataPacket[]>('SELECT id FROM customers WHERE mobile = ?', [data.customer_mobile]);
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      customerId = generateId('cus');
      await connection.query(
        'INSERT INTO customers (id, name, mobile, address) VALUES (?, ?, ?, ?)',
        [customerId, data.customer_name, data.customer_mobile, data.customer_address || null]
      );
    }

    let subtotal = 0;
    
    // Process items and check stock BEFORE creating sale
    for (const item of data.items) {
      const [partRows] = await connection.query<RowDataPacket[]>(
        'SELECT current_stock, part_name FROM parts WHERE id = ? FOR UPDATE', 
        [item.part_id]
      );
      
      if (partRows.length === 0) {
        throw new Error(`Part not found`);
      }
      
      const part = partRows[0];
      if (part.current_stock < item.quantity) {
        throw new Error(`Insufficient stock for ${part.part_name}. Available: ${part.current_stock}`);
      }
      
      const itemTotal = item.selling_price * item.quantity;
      subtotal += itemTotal;
    }
    
    const grandTotal = subtotal - data.discount;

    let vehicleId = null;
    if (data.vehicle_number && data.vehicle_number.trim() !== '') {
      const vNum = data.vehicle_number.trim();
      const [vRows] = await connection.query<RowDataPacket[]>('SELECT id FROM vehicles WHERE vehicle_number = ?', [vNum]);
      if (vRows.length > 0) {
        vehicleId = vRows[0].id;
      } else {
        vehicleId = generateId('veh');
        await connection.query('INSERT INTO vehicles (id, vehicle_number, vehicle_name, customer_id) VALUES (?, ?, ?, ?)', [vehicleId, vNum, 'Added via Sale', customerId]);
      }
    }

    // Create Sale
    await connection.query(
      `INSERT INTO sales (id, sale_number, customer_id, vehicle_id, subtotal, discount, grand_total, notes, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [saleId, saleNumber, customerId, vehicleId, subtotal, data.discount, grandTotal, data.notes || null, session.user.id]
    );

    // Create Sale Items, Deduct Stock, Create Stock Movements
    for (const item of data.items) {
      const itemId = generateId('sit');
      const itemTotal = item.selling_price * item.quantity;
      
      await connection.query(
        'INSERT INTO sale_items (id, sale_id, part_id, quantity, selling_price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, saleId, item.part_id, item.quantity, item.selling_price, itemTotal]
      );
      
      // Get current stock again to be safe
      const [partRows] = await connection.query<RowDataPacket[]>('SELECT current_stock FROM parts WHERE id = ?', [item.part_id]);
      const previousStock = partRows[0].current_stock;
      const newStock = previousStock - item.quantity;
      
      // Update Stock
      await connection.query('UPDATE parts SET current_stock = ? WHERE id = ?', [newStock, item.part_id]);
      
      // Stock Movement
      const movementId = generateId('mov');
      await connection.query(
        `INSERT INTO stock_movements (id, part_id, type, quantity, previous_stock, new_stock, reference_id, note, created_by_id)
         VALUES (?, ?, 'SALE', ?, ?, ?, ?, ?, ?)`,
        [movementId, item.part_id, -item.quantity, previousStock, newStock, saleId, `Sale ${saleNumber}`, session.user.id]
      );
    }

    await connection.commit();
    return { success: true, saleId };
  } catch (error: any) {
    await connection.rollback();
    throw new Error(error.message || 'Transaction failed');
  } finally {
    connection.release();
  }
}

export async function getSales(last24Hours: boolean = false, query: string = ''): Promise<Sale[]> {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  let sqlQuery = `
    SELECT s.*, c.name as customer_name, v.vehicle_number 
    FROM sales s 
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    WHERE 1=1
  `;
  
  const params: any[] = [];

  if (last24Hours) {
    sqlQuery += ` AND s.created_at >= NOW() - INTERVAL 1 DAY `;
  }

  if (query && query.trim() !== '') {
    sqlQuery += ` AND (s.sale_number LIKE ? OR c.name LIKE ? OR v.vehicle_number LIKE ?) `;
    const q = `%${query.trim()}%`;
    params.push(q, q, q);
  }
  
  sqlQuery += ` ORDER BY s.created_at DESC`;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, params);
  
  return rows as any; // Cast generic row to extended sale object for UI
}

export async function getSaleById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [saleRows] = await pool.query<RowDataPacket[]>(`
    SELECT s.*, c.name as customer_name, c.mobile as customer_mobile, c.address as customer_address, v.vehicle_number 
    FROM sales s 
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN vehicles v ON s.vehicle_id = v.id
    WHERE s.id = ?
  `, [id]);
  
  if (saleRows.length === 0) return null;
  const sale = saleRows[0] as any;

  const [itemRows] = await pool.query<RowDataPacket[]>(`
    SELECT si.*, p.part_name, p.part_number 
    FROM sale_items si 
    JOIN parts p ON si.part_id = p.id
    WHERE si.sale_id = ?
  `, [id]);
  
  return {
    ...sale,
    items: itemRows as SaleItem[]
  };
}

export interface CreatePurchaseDTO {
  supplier_name: string;
  invoice_number?: string;
  notes?: string;
  items: {
    part_id: string;
    quantity: number;
    purchase_price: number;
  }[];
}

export async function createPurchase(data: CreatePurchaseDTO) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Only administrators can add purchases.');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const purchaseId = generateId('pur');
    
    // Generate Purchase Number PUR-000001
    const [rows] = await connection.query<RowDataPacket[]>('SELECT purchase_number FROM purchases ORDER BY id DESC LIMIT 1');
    let purchaseNumber = 'PUR-000001';
    if (rows.length > 0) {
      const lastNumber = rows[0].purchase_number;
      const numPart = parseInt(lastNumber.replace('PUR-', ''), 10);
      const nextNum = numPart + 1;
      purchaseNumber = `PUR-${nextNum.toString().padStart(6, '0')}`;
    }
    
    let totalAmount = 0;
    
    for (const item of data.items) {
      totalAmount += item.purchase_price * item.quantity;
    }

    // Create Purchase
    await connection.query(
      `INSERT INTO purchases (id, purchase_number, supplier_name, invoice_number, total_amount, notes, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [purchaseId, purchaseNumber, data.supplier_name, data.invoice_number || null, totalAmount, data.notes || null, session.user.id]
    );

    // Create Purchase Items, Increase Stock, Create Stock Movements
    for (const item of data.items) {
      const itemId = generateId('pit');
      const itemTotal = item.purchase_price * item.quantity;
      
      await connection.query(
        'INSERT INTO purchase_items (id, purchase_id, part_id, quantity, purchase_price, total) VALUES (?, ?, ?, ?, ?, ?)',
        [itemId, purchaseId, item.part_id, item.quantity, item.purchase_price, itemTotal]
      );
      
      // Update Stock (increase)
      const [partRows] = await connection.query<RowDataPacket[]>('SELECT current_stock FROM parts WHERE id = ? FOR UPDATE', [item.part_id]);
      const previousStock = partRows[0].current_stock;
      const newStock = previousStock + item.quantity;
      
      await connection.query('UPDATE parts SET current_stock = ?, purchase_price = ? WHERE id = ?', [newStock, item.purchase_price, item.part_id]);
      
      // Stock Movement
      const movementId = generateId('mov');
      await connection.query(
        `INSERT INTO stock_movements (id, part_id, type, quantity, previous_stock, new_stock, reference_id, note, created_by_id)
         VALUES (?, ?, 'PURCHASE', ?, ?, ?, ?, ?, ?)`,
        [movementId, item.part_id, item.quantity, previousStock, newStock, purchaseId, `Purchase ${purchaseNumber}`, session.user.id]
      );
    }

    await connection.commit();
    return { success: true, purchaseId };
  } catch (error: any) {
    await connection.rollback();
    throw new Error(error.message || 'Transaction failed');
  } finally {
    connection.release();
  }
}

export async function getPurchases(query: string = '') {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  let sqlQuery = `SELECT * FROM purchases WHERE 1=1`;
  const params: any[] = [];

  if (query && query.trim() !== '') {
    sqlQuery += ` AND (purchase_number LIKE ? OR supplier_name LIKE ? OR invoice_number LIKE ?) `;
    const q = `%${query.trim()}%`;
    params.push(q, q, q);
  }

  sqlQuery += ` ORDER BY created_at DESC`;

  const [rows] = await pool.query<RowDataPacket[]>(sqlQuery, params);
  
  return rows;
}

export async function getPurchaseById(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const [purchaseRows] = await pool.query<RowDataPacket[]>(`
    SELECT * FROM purchases WHERE id = ?
  `, [id]);
  
  if (purchaseRows.length === 0) return null;
  const purchase = purchaseRows[0] as any;

  const [itemRows] = await pool.query<RowDataPacket[]>(`
    SELECT pi.*, p.part_name, p.part_number 
    FROM purchase_items pi 
    JOIN parts p ON pi.part_id = p.id
    WHERE pi.purchase_id = ?
  `, [id]);
  
  return {
    ...purchase,
    items: itemRows
  };
}
