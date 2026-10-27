// app/dashboard/components/QuickActions.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Screen Referrals',
      description: 'Run readiness screening on pending referrals',
      icon: '🩺',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => router.push('/routes/referral-management/referral-orders'),
    },
    {
      title: 'NOK Counselling',
      description: 'Financial counselling for next of kin',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => router.push('/nok'),
    },
    {
      title: 'Patient Records',
      description: 'Browse patients, vitals, swabs and appointments',
      icon: '🗂️',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => router.push('/routes'),
    },
    {
      title: 'Monthly Report',
      description: 'Referral outcomes and turnaround times',
      icon: '📊',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => router.push('/reports'),
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 rounded-lg text-left transition-colors duration-200`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h4 className="font-semibold">{action.title}</h4>
              <p className="text-sm opacity-90 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

