import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  sub?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100', val: 'text-blue-700' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', iconBg: 'bg-green-100', val: 'text-green-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100', val: 'text-amber-700' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', iconBg: 'bg-red-100', val: 'text-red-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', iconBg: 'bg-purple-100', val: 'text-purple-700' },
};

export default function StatCard({ label, value, icon: Icon, color = 'blue', sub }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-xl p-5 border border-white/60`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold ${c.val} mt-1`}>{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 ${c.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
