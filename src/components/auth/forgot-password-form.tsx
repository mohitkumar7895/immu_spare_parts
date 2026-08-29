'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    setIsSendingOtp(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      setOtpSent(true);
      setMessage('OTP has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setError('Please request an OTP first.');
      return;
    }
    if (otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setMessage('');
    setIsResetting(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsResetting(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 py-12">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md p-6 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
              Password Reset!
            </h1>
            <p className="text-slate-300 text-sm">
              Your password has been successfully reset.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center animate-in fade-in zoom-in-95">
            <p className="text-slate-300 mb-6">Redirecting you to the login page...</p>
            <Button onClick={() => router.push('/login')} className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-xl h-12 text-base font-semibold">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 py-12">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
            Reset Password
          </h1>
          <p className="text-slate-300 text-sm">
            Enter your email to receive an OTP and set a new password.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-center text-sm bg-red-500/20 text-red-200 border border-red-500/50 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 rounded-xl flex items-center text-sm bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
              {message}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in zoom-in-95">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 ml-1">Email Address</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="name@company.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors disabled:opacity-50"
                  />
                </div>
                <Button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || otpSent || !email}
                  className="h-12 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all"
                >
                  {isSendingOtp ? 'Sending...' : otpSent ? 'Sent!' : 'Send OTP'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-slate-200 ml-1">OTP</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="otp" 
                  type="text"
                  placeholder="Enter 6-digit OTP" 
                  required 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors tracking-widest font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-200 ml-1">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="new-password" 
                  type="password"
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-200 ml-1">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="••••••••" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold mt-4"
              disabled={isResetting || !otpSent}
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
              {!isResetting && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link href="/login" className="text-white hover:text-cyan-300 hover:underline transition-colors font-medium">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
