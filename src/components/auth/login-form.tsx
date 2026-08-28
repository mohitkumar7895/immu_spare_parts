'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, ArrowRight, Lock, User } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold"
      disabled={pending}
    >
      {pending ? 'Authenticating...' : 'Sign In'}
      {!pending && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-600/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-600/30 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-sm">
            Enter your credentials to access the Spare Parts Portal
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200 ml-1">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="username" 
                  name="username" 
                  placeholder="admin" 
                  required 
                  autoComplete="username"
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  required 
                  autoComplete="current-password"
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors"
                />
              </div>
            </div>
            
            {state?.success === false && (
              <div className="text-sm text-red-200 bg-red-500/20 border border-red-500/50 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                {state.message}
              </div>
            )}

            <SubmitButton />
          </form>
          
          <div className="mt-8 flex flex-col space-y-3 text-center text-sm text-slate-400">
            <div>
              Don't have an account?{' '}
              <Link href="/register" className="text-white hover:text-blue-300 hover:underline transition-colors font-medium">
                Create one now
              </Link>
            </div>
            <div>
              <Link href="/forgot-password" className="text-slate-400 hover:text-white hover:underline transition-colors text-sm">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
