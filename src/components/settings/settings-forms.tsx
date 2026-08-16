'use client';

import { useActionState } from 'react';
import { updateProfileAction, updatePasswordAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStatus } from 'react-dom';
import { AlertCircle } from 'lucide-react';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : text}
    </Button>
  );
}

export function ProfileForm({ user }: { user: { name: string, username: string } }) {
  const [state, formAction] = useActionState(updateProfileAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account's profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={user.username} required />
          </div>

          {state?.message && (
            <div className={`p-3 rounded-md flex items-center text-sm ${state.success ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {state.message}
            </div>
          )}

          <SubmitButton text="Save Profile" />
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
          </div>

          {state?.message && (
            <div className={`p-3 rounded-md flex items-center text-sm ${state.success ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {state.message}
            </div>
          )}

          <SubmitButton text="Update Password" />
        </form>
      </CardContent>
    </Card>
  );
}
