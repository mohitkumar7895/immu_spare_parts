export interface Part {
  id: string;
  part_number: string;
  part_name: string;
  vehicle_name: string;
  company_name: string;
  purchase_price: number;
  selling_price: number;
  mechanic_price: number;
  opening_stock: number;
  current_stock: number;
  minimum_stock: number;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string | Date;
  updated_at: string | Date;
}

// DTO for creating a new part
export interface CreatePartDTO {
  part_number: string;
  part_name: string;
  vehicle_name: string;
  company_name: string;
  purchase_price: number;
  selling_price: number;
  mechanic_price: number;
  opening_stock: number;
  minimum_stock: number;
  description?: string;
}

// DTO for updating an existing part
export interface UpdatePartDTO {
  part_number?: string;
  part_name?: string;
  vehicle_name?: string;
  company_name?: string;
  purchase_price?: number;
  selling_price?: number;
  mechanic_price?: number;
  current_stock?: number;
  minimum_stock?: number;
  description?: string;
}
