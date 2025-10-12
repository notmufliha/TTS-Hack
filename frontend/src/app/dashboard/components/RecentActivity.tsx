// app/dashboard/components/RecentActivity.tsx
interface Activity {
  id: string;
  type: 'referral' | 'approval' | 'completion' | 'update';
  description: string;
  user: string;
  time: string;
  department: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'referral',
    description: 'New referral created for John Doe',
    user: 'Dr. Wilson',
    time: '2 hours ago',
    department: 'Cardiology',
  },
  {
    id: '2',
    type: 'approval',
    description: 'Referral approved for Jane Smith',
    user: 'Dr. Brown',
    time: '4 hours ago',
    department: 'Neurology',
  },
  {
    id: '3',
    type: 'completion',
    description: 'Treatment completed for Mike Johnson',
    user: 'Dr. Davis',
    time: '1 day ago',
    department: 'Orthopedics',
  },
  {
    id: '4',
    type: 'update',
    description: 'Referral status updated',
    user: 'Dr. Taylor',
    time: '2 days ago',
    department: 'Pediatrics',
  },
];

const typeIcons = {
  referral: '📋',
  approval: '✅',
  completion: '🎯',
  update: '🔄',
};

export default function RecentActivity() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50">
            <div className="flex space-x-3">
              <div className="text-xl">{typeIcons[activity.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.user} • {activity.department}
                </p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}