import { getCustomerById } from '@/app/actions/customer-actions';
import { EditCustomerForm } from '@/components/customers/edit-customer-form';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard/customers');
  }

  const customer = await getCustomerById(params.id);
  if (!customer) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
        <p className="text-muted-foreground">Modify details for {customer.name}.</p>
      </div>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
