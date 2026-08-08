import { useState } from 'react';
import { Trophy, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast(error.message, 'error');
    } else {
      setSent(true);
      toast('Reset link sent! Check your email.', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-grid relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-500/10 blur-[100px] animate-glow-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">BGMI<span className="text-primary-500">ARENA</span></span>
          </button>
          <h1 className="font-display text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-neutral-400 mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        <Card className="p-7">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success-500/10 border border-success-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-success-500" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Check your inbox</h3>
              <p className="text-sm text-neutral-400 mb-6">We sent a password reset link to {email}</p>
              <Button variant="outline" onClick={() => navigate('/login')}>
                <ArrowLeft size={16} /> Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Email">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-10" required />
                </div>
              </Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={16} />
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-neutral-400 mt-6">
          Remembered it? <button onClick={() => navigate('/login')} className="text-primary-400 font-semibold hover:text-primary-300">Sign in</button>
        </p>
      </div>
    </div>
  );
}
