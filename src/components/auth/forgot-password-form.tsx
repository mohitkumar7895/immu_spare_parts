'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock, Mail, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 is success state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // TODO: Integrate actual OTP send logic here
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // TODO: Integrate actual OTP verify logic here
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    
    // TODO: Integrate actual password reset logic here
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 py-12">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            {step === 1 && <Mail className="w-8 h-8 text-white" />}
            {step === 2 && <ShieldCheck className="w-8 h-8 text-white" />}
            {step === 3 && <KeyRound className="w-8 h-8 text-white" />}
            {step === 4 && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-sans">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
            {step === 4 && 'Password Reset!'}
          </h1>
          <p className="text-slate-300 text-sm">
            {step === 1 && 'Enter your registered email address to receive an OTP.'}
            {step === 2 && `We've sent a code to ${email}`}
            {step === 3 && 'Enter your new secure password.'}
            {step === 4 && 'Your password has been successfully reset.'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl flex items-center text-sm bg-red-500/20 text-red-200 border border-red-500/50 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="name@company.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-200 ml-1">One-Time Password (OTP)</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input 
                    id="otp" 
                    type="text"
                    placeholder="Enter 6-digit OTP" 
                    required 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/10 focus:border-white/30 transition-colors text-center tracking-widest font-mono text-lg"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Change Email Address
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in zoom-in-95">
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
                className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 group rounded-xl h-12 text-base font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center animate-in fade-in zoom-in-95">
              <p className="text-slate-300 mb-6">
                Redirecting you to the login page...
              </p>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-xl h-12 text-base font-semibold"
              >
                Go to Login
              </Button>
            </div>
          )}
          
          {step === 1 && (
            <div className="mt-8 text-center text-sm text-slate-400">
              Remember your password?{' '}
              <Link href="/login" className="text-white hover:text-cyan-300 hover:underline transition-colors font-medium">
                Log in instead
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
