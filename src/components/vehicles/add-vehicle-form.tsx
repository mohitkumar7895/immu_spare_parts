'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addVehicle } from '@/app/actions/vehicle-actions';
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

export function AddVehicleForm({ customers }: { customers: Customer[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_number: '',
      vehicle_name: '',
      customer_id: '',
      company: '',
      model: '',
      notes: '',
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    setIsSubmitting(true);
    try {
      await addVehicle({
        ...data,
        model: data.model || null,
        company: data.company || null,
        notes: data.notes || null,
      });
      toast.success('Vehicle added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add vehicle');
      setIsSubmitting(false); // Only reset if failed, otherwise it redirects
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
                {...register('company')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model / Year</Label>
              <Input
                id="model"
                placeholder="e.g. 2018 LXI"
                {...register('model')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              {...register('notes')}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
