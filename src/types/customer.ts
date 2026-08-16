export interface Customer {
  id: string;
  name: string;
  mobile: string;
  alternate_mobile: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CreateCustomerDTO {
  name: string;
  mobile: string;
  alternate_mobile?: string;
  location?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  mobile?: string;
  alternate_mobile?: string;
  location?: string;
  address?: string;
  notes?: string;
}
