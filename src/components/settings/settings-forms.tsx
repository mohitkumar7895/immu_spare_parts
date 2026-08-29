'use client';

import { useActionState, useState } from 'react';
import { updateProfileAction, updatePasswordAction } from '@/app/actions/auth-actions';
import { updateLogoAction } from '@/app/actions/settings-actions';
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

export function ProfileForm({ user }: { user: { name: string, username: string, avatar?: string } }) {
  const [state, formAction] = useActionState(updateProfileAction, undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [avatarBase64, setAvatarBase64] = useState<string>(user.avatar || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setAvatarBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your account's profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6 max-w-md">
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-md hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
              <input type="hidden" name="avatar" value={avatarBase64} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Profile Picture</h4>
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
            </div>
          </div>

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

export function LogoForm({ currentLogo }: { currentLogo?: string | null }) {
  const [state, formAction] = useActionState(updateLogoAction, undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo || null);
  const [logoBase64, setLogoBase64] = useState<string>(currentLogo || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setLogoBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
        <CardDescription>Upload your company logo to display on the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6 max-w-md">
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white/50 text-sm font-medium">
                    No Logo
                  </div>
                )}
              </div>
              <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-md hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </label>
              <input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
              <input type="hidden" name="logo" value={logoBase64} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Brand Image</h4>
              <p className="text-xs text-muted-foreground">Transparent PNG recommended. Max 2MB.</p>
            </div>
          </div>

          {state?.message && (
            <div className={`p-3 rounded-md flex items-center text-sm ${state.success ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {state.message}
            </div>
          )}

          <SubmitButton text="Save Logo" />
        </form>
      </CardContent>
    </Card>
  );
}
