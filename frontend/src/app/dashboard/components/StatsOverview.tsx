// app/dashboard/components/StatsOverview.tsx
interface StatsOverviewProps {
  timeRange: 'today' | 'week' | 'month' | 'year';
}

const stats = [
  {
    name: 'Total Referrals',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: '📋',
  },
  {
    name: 'Pending Approval',
    value: '23',
    change: '+5%',
    changeType: 'negative',
    icon: '⏳',
  },
  {
    name: 'Completed',
    value: '1,089',
    change: '+8%',
    changeType: 'positive',
    icon: '✅',
  },
  {
    name: 'Avg. Response Time',
    value: '2.4h',
    change: '-15%',
    changeType: 'positive',
    icon: '⏱️',
  },
];

export default function StatsOverview({ timeRange }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-sm mt-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last {timeRange}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}