'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, UserPlus, ArrowRight, User, Lock, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold mt-2"
      disabled={pending}
    >
      {pending ? 'Creating Account...' : 'Create Account'}
      {!pending && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
    </Button>
  );
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 py-12">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
            Join the Portal
          </h1>
          <p className="text-slate-300 text-sm">
            Create an account to manage your spare parts
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form action={formAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-200 ml-1">Full Name</Label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className={`pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors ${state?.errors?.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {state?.errors?.name && (
                <p className="text-sm text-red-400 ml-1">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-200 ml-1">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  className={`pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors ${state?.errors?.username ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {state?.errors?.username && (
                <p className="text-sm text-red-400 ml-1">{state.errors.username[0]}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-200 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className={`pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors ${state?.errors?.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {state?.errors?.password && (
                <p className="text-sm text-red-400 ml-1">{state.errors.password[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-slate-200 ml-1">Role</Label>
              <select
                id="role"
                name="role"
                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors appearance-none [&>option]:bg-slate-900 [&>option]:text-white"
                defaultValue="STAFF"
              >
                <option value="STAFF">Staff (Standard Access)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>

            {state?.message && (
              <div className={`p-4 rounded-xl flex items-center text-sm animate-in fade-in slide-in-from-top-2 ${state.success ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'}`}>
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                {state.message}
              </div>
            )}

            <SubmitButton />
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-indigo-300 hover:underline transition-colors font-medium">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
