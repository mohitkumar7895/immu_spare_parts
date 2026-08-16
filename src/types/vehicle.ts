export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_name: string;
  model: string | null;
  company: string | null;
  notes: string | null;
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithCustomer extends Vehicle {
  customer_name: string;
  customer_mobile: string;
}

export type CreateVehicleDTO = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type UpdateVehicleDTO = Partial<CreateVehicleDTO>;
