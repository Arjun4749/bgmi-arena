import { Trophy, Target, Users, Zap, Heart, Gamepad2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const values = [
  { icon: Trophy, title: 'Competitive Integrity', desc: 'Fair play, transparent scoring, and verified results. Every match counts.' },
  { icon: Users, title: 'Community First', desc: 'Built by gamers, for gamers. Your voice shapes the platform.' },
  { icon: Zap, title: 'Seamless Experience', desc: 'From registration to results — everything automated and instant.' },
  { icon: Heart, title: 'Passion Driven', desc: 'We love BGMI as much as you do. Every feature is crafted with care.' },
];

const milestones = [
  { year: '2024', event: 'BGMI Arena founded with a vision for grassroots esports.' },
  { year: '2025', event: 'Hosted 50+ tournaments with 5,000+ active players.' },
  { year: '2026', event: 'Launched automated scoring, winner gallery, and live streams.' },
];

export function AboutPage() {
  return (
    <div>
      <PageHeader title="About BGMI Arena" subtitle="India's home for competitive BGMI. We empower players, teams, and organizers with a professional tournament platform." />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Mission */}
        <Card className="p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="relative">
            <Badge tone="orange">Our Mission</Badge>
            <h2 className="font-display text-2xl font-bold text-white mt-4 mb-3">Level the playing field</h2>
            <p className="text-neutral-300 leading-relaxed">
              BGMI Arena exists to make competitive esports accessible to every player in India. Whether you are a solo grinder
              or a seasoned squad, our platform gives you the tools to compete, track your progress, and win real prizes —
              all in one place. No clunky spreadsheets, no manual scorekeeping. Just pure, automated competition.
            </p>
          </div>
        </Card>

        {/* Values */}
        <div>
          <div className="text-center mb-8">
            <Badge tone="blue">What We Stand For</Badge>
            <h2 className="font-display text-2xl font-bold text-white mt-3">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <Card key={v.title} hover className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
                  <v.icon size={24} className="text-primary-400" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="text-center mb-8">
            <Badge tone="orange">Our Journey</Badge>
            <h2 className="font-display text-2xl font-bold text-white mt-3">Milestones</h2>
          </div>
          <div className="space-y-4">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-display font-bold text-white text-sm shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-px h-12 bg-border-subtle mt-2" />}
                </div>
                <Card className="p-5 flex-1 mb-4">
                  <p className="font-display font-bold text-primary-400">{m.year}</p>
                  <p className="text-sm text-neutral-300 mt-1">{m.event}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
          <Gamepad2 size={40} className="text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Ready to compete?</h2>
          <p className="text-neutral-400 mb-6">Join thousands of players battling for glory on BGMI Arena.</p>
        </Card>
      </div>
    </div>
  );
}
