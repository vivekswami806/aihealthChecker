import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      toast.info('OTP sent to your email');
      setStep(2);
    } else if (step === 2) {
      toast.info('OTP verified');
      setStep(3);
    } else {
      toast.success('Password successfully reset!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">
          {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </h1>
        <p className="text-muted-foreground">
          {step === 1 
            ? "No worries, we'll send you reset instructions." 
            : step === 2 
              ? "We've sent a code to alex@healthai.pro" 
              : "Enter your new secure password."
          }
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="name@example.com" required className="h-12 rounded-xl" />
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Input key={i} maxLength={1} className="h-14 text-center text-xl font-bold rounded-xl" required />
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" required className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input id="confirm-new-password" type="password" required className="h-12 rounded-xl" />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl text-lg shadow-lg shadow-primary/20">
          {step === 1 ? 'Send OTP' : step === 2 ? 'Verify Code' : 'Reset Password'}
        </Button>
      </form>

      <div className="text-center">
        <Link to="/auth/login" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-2">
           Back to sign in
        </Link>
      </div>
    </div>
  );
}
