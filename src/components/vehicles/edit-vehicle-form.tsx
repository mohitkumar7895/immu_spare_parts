'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateVehicle } from '@/app/actions/vehicle-actions';
import { VehicleWithCustomer } from '@/types/vehicle';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  vehicle_name: z.string().min(1, 'Vehicle name is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  company: z.string().optional(),
  model: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function EditVehicleForm({ 
  vehicle, 
  customers,
  isReadOnly = false 
}: { 
  vehicle: VehicleWithCustomer, 
  customers: Customer[],
  isReadOnly?: boolean 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_number: vehicle.vehicle_number,
      vehicle_name: vehicle.vehicle_name,
      customer_id: vehicle.customer_id,
      company: vehicle.company || '',
      model: vehicle.model || '',
      notes: vehicle.notes || '',
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      await updateVehicle(vehicle.id, {
        ...data,
        model: data.model || null,
        company: data.company || null,
        notes: data.notes || null,
      });
      toast.success('Vehicle updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update vehicle');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicle_number">Vehicle Number *</Label>
              <Input
                id="vehicle_number"
                placeholder="e.g. MH12 AB 1234"
                disabled={isReadOnly}
                {...register('vehicle_number')}
              />
              {errors.vehicle_number && (
                <p className="text-sm text-red-500">{errors.vehicle_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_name">Vehicle Name *</Label>
              <Input
                id="vehicle_name"
                placeholder="e.g. Swift Dzire"
                disabled={isReadOnly}
                {...register('vehicle_name')}
              />
              {errors.vehicle_name && (
                <p className="text-sm text-red-500">{errors.vehicle_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer *</Label>
              <select
                id="customer_id"
                disabled={isReadOnly}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('customer_id')}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile})
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p className="text-sm text-red-500">{errors.customer_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Make / Company</Label>
              <Input
                id="company"
                placeholder="e.g. Maruti Suzuki"
                disabled={isReadOnly}
                {...register('company')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model / Year</Label>
              <Input
                id="model"
                placeholder="e.g. 2018 LXI"
                disabled={isReadOnly}
                {...register('model')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              disabled={isReadOnly}
              {...register('notes')}
              rows={4}
            />
          </div>

          {!isReadOnly && (
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update Vehicle'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
