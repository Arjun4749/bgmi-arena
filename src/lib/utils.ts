export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(date: string | null): string {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return 'TBA';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeUntil(date: string | null): string {
  if (!date) return '';
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export function formatMoney(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return String(amount);
  return '₹' + n.toLocaleString('en-IN');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function isRoomUnlocked(match: { room_locked_until: string | null; scheduled_at: string | null }): boolean {
  if (!match.room_locked_until) return true;
  return new Date(match.room_locked_until).getTime() <= Date.now();
}
