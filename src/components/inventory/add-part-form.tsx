'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPart } from '@/app/actions/inventory-actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  part_number: z.string().min(2, 'Part number is required'),
  part_name: z.string().min(2, 'Part name is required'),
  vehicle_name: z.string().min(2, 'Vehicle name is required'),
  company_name: z.string().min(2, 'Company name is required'),
  purchase_price: z.coerce.number().min(0, 'Must be positive'),
  selling_price: z.coerce.number().min(0, 'Must be positive'),
  secret_cost: z.coerce.number().min(0, 'Must be positive'),
  opening_stock: z.coerce.number().min(0).int(),
  minimum_stock: z.coerce.number().min(0).int(),
  description: z.string().optional(),
});

export function AddPartForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: '',
      part_name: '',
      vehicle_name: '',
      company_name: '',
      purchase_price: 0,
      selling_price: 0,
      secret_cost: 0,
      opening_stock: 0,
      minimum_stock: 0,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    setError(null);
    try {
      await addPart(values);
      // Redirection is handled by the server action
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the part.');
      setIsPending(false);
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            {error}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Basic Details</h3>
                
                <FormField
                  control={form.control}
                  name="part_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BRK-1025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="part_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Brake Pad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicle_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tata Ace" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Brand</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Tata Motors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Pricing & Stock</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="selling_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secret_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Cost (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>ADMIN only visibility</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="opening_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="minimum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Alert Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes about this part..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Part'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
