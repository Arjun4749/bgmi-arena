import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const rules = [
  { title: 'Eligibility', allowed: ['Must be 16+ years old', 'Valid BGMI account required', 'No banned accounts'], forbidden: ['Smurf accounts', 'Account sharing', 'Multiple team registrations'] },
  { title: 'Match Conduct', allowed: ['Respect all players and admins', 'Use official room IDs only', 'Report issues within 10 minutes'], forbidden: ['Cheating or hacks', 'Teaming with other squads', 'Abusive language in chat'] },
  { title: 'Device & Settings', allowed: ['Mobile or tablet devices', 'Original game settings', 'Screen recording when requested'], forbidden: ['Emulators (unless allowed)', 'Third-party mods', 'VPN manipulation'] },
  { title: 'Scoring', allowed: ['Placement points as configured', '1 kill = 1 point (default)', 'Chicken Dinner = 1st place'], forbidden: ['Disputing verified results', 'Match fixing', 'Intentional AFK for points'] },
];

const generalRules = [
  'Tournament brackets and schedules are set by admins and are final.',
  'Teams must check in 30 minutes before match start time.',
  'Room IDs and passwords unlock 15 minutes before each match (configurable per tournament).',
  'If a match is interrupted by server issues, admins may reschedule or replay.',
  'Prize money is distributed within 7 business days of tournament completion.',
  'Admin decisions are final. Disputes must be raised via the Contact page within 48 hours.',
  'By registering, you agree to all rules listed above and the general terms.',
];

export function RulesPage() {
  return (
    <div>
      <PageHeader title="Tournament Rules" subtitle="Fair play is the foundation of competitive BGMI. Review all rules before registering." />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {rules.map((r) => (
          <Card key={r.title} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-primary-400" />
              <h2 className="font-display text-xl font-bold text-white">{r.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Badge tone="green" className="mb-3">Allowed</Badge>
                <ul className="space-y-2">
                  {r.allowed.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                      <CheckCircle2 size={16} className="text-success-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Badge tone="red" className="mb-3">Forbidden</Badge>
                <ul className="space-y-2">
                  {r.forbidden.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-neutral-300">
                      <XCircle size={16} className="text-error-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-6">
          <h2 className="font-display text-xl font-bold text-white mb-4">General Tournament Rules</h2>
          <ol className="space-y-3 list-decimal list-inside">
            {generalRules.map((rule, i) => (
              <li key={i} className="text-sm text-neutral-300 leading-relaxed">{rule}</li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
