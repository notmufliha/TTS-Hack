// app/dashboard/components/ReferralTable.tsx
'use client';

import { useState } from 'react';

interface Referral {
  id: string;
  patientName: string;
  referringDoctor: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dateReferred: string;
  urgency: string;
}

const mockReferrals: Referral[] = [
  {
    id: 'REF-001',
    patientName: 'John Doe',
    referringDoctor: 'Dr. Wilson',
    department: 'Cardiology',
    status: 'pending',
    priority: 'high',
    dateReferred: '2024-01-15',
    urgency: 'Emergency',
  },
  {
    id: 'REF-002',
    patientName: 'Jane Smith',
    referringDoctor: 'Dr. Brown',
    department: 'Neurology',
    status: 'approved',
    priority: 'medium',
    dateReferred: '2024-01-14',
    urgency: 'Urgent',
  },
  {
    id: 'REF-003',
    patientName: 'Mike Johnson',
    referringDoctor: 'Dr. Davis',
    department: 'Orthopedics',
    status: 'completed',
    priority: 'low',
    dateReferred: '2024-01-13',
    urgency: 'Routine',
  },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function ReferralTable() {
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [filter, setFilter] = useState<'all' | Referral['status']>('all');

  const filteredReferrals = filter === 'all' 
    ? referrals 
    : referrals.filter(ref => ref.status === filter);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Referrals</h3>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referral ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReferrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {referral.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{referral.patientName}</div>
                  <div className="text-sm text-gray-500">{referral.referringDoctor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {referral.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[referral.status]}`}>
                    {referral.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[referral.priority]}`}>
                    {referral.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(referral.dateReferred).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}