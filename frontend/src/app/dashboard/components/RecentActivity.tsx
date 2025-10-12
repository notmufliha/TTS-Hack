// app/dashboard/components/RecentActivity.tsx
'use client';

import { patientDatabase, referralDatabase } from '../../nok/data/patientDatabase';

interface Activity {
  id: string;
  type: 'referral' | 'approval' | 'completion' | 'update' | 'counselling';
  description: string;
  user: string;
  time: string;
  department: string;
}

// Generate activities from your actual data
const getRecentActivities = (): Activity[] => {
  const activities: Activity[] = [];
  
  referralDatabase.forEach(referral => {
    const patient = patientDatabase.find(p => p.Patient_ID === referral.Patient_ID);
    if (!patient) return;
    
    const baseActivity = {
      id: `REF-${referral.Referral_ID}`,
      user: patient.Attending_Clinician,
      department: referral.Department,
      time: 'Recently'
    };
    
    if (referral.NOK_Decision === 'ACCEPTED') {
      activities.push({
        ...baseActivity,
        type: 'approval',
        description: `NOK accepted referral for ${patient.Patient_Name}`
      });
    } else if (referral.NOK_Decision === 'REJECTED') {
      activities.push({
        ...baseActivity,
        type: 'update',
        description: `NOK rejected referral for ${patient.Patient_Name}`
      });
    } else {
      activities.push({
        ...baseActivity,
        type: 'referral',
        description: `New referral created for ${patient.Patient_Name}`
      });
    }
  });
  
  return activities.slice(0, 4); // Return only 4 most recent
};

const typeIcons = {
  referral: '📋',
  approval: '✅',
  completion: '🎯',
  update: '🔄',
  counselling: '💬',
};

export default function RecentActivity() {
  const activities = getRecentActivities();

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