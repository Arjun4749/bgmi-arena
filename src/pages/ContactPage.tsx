import { useState } from 'react';
import { Mail, MessageCircle, Send, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setSending(true);
    // Simulate send — future: edge function or email service
    setTimeout(() => {
      toast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 800);
  };

  return (
    <div>
      <PageHeader title="Contact Us" subtitle="Questions, partnerships, or issues? Reach out and our team will respond within 48 hours." />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info */}
          <div className="space-y-4">
            <Card className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Email</h3>
                <p className="text-sm text-neutral-400">contact@bgmiarena.gg</p>
              </div>
            </Card>
            <Card className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Discord</h3>
                <p className="text-sm text-neutral-400">discord.gg/bgmiarena</p>
              </div>
            </Card>
            <Card className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-accent-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Location</h3>
                <p className="text-sm text-neutral-400">Remote — India</p>
              </div>
            </Card>
          </div>

          {/* Form */}
          <Card className="p-6 lg:col-span-2">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name *">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </Field>
                <Field label="Email *">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </Field>
              </div>
              <Field label="Subject">
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
              </Field>
              <Field label="Message *">
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." />
              </Field>
              <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                <Send size={16} /> {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
