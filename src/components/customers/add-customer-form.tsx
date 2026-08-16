'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomer } from '@/app/actions/customer-actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  alternate_mobile: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function AddCustomerForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mobile: '',
      alternate_mobile: '',
      location: '',
      address: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true);
    setError(null);
    try {
      await addCustomer(values);
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the customer.');
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
                <h3 className="text-lg font-medium border-b pb-2">Contact Details</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Rahul Kumar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternate_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Mobile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 9123456780" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Location & Notes</h3>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete address..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Any specific details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Customer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
