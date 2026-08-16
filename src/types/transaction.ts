export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_name: string;
  invoice_number: string | null;
  purchase_date: string | Date;
  total_amount: number;
  notes: string | null;
  created_by_id: string;
  created_at: string | Date;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  part_id: string;
  quantity: number;
  purchase_price: number;
  total: number;
}

export interface Sale {
  id: string;
  sale_number: string;
  customer_id: string;
  vehicle_id: string | null;
  sale_date: string | Date;
  subtotal: number;
  discount: number;
  grand_total: number;
  notes: string | null;
  created_by_id: string;
  created_at: string | Date;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  part_id: string;
  quantity: number;
  selling_price: number;
  total: number;
  // Extended info for UI
  part_name?: string;
  part_number?: string;
}

export interface StockMovement {
  id: string;
  part_id: string;
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id: string | null;
  note: string | null;
  created_by_id: string;
  created_at: string | Date;
}
