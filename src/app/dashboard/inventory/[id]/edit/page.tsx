import { getPartById } from '@/app/actions/inventory-actions';
import { EditPartForm } from '@/components/inventory/edit-part-form';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function EditPartPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard/inventory');
  }

  const part = await getPartById(params.id);
  if (!part) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Part</h1>
        <p className="text-muted-foreground">Modify details for {part.part_name}.</p>
      </div>
      <EditPartForm part={part} />
    </div>
  );
}
