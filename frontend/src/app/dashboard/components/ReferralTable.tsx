// app/dashboard/components/ReferralTable.tsx
'use client';

import { useState } from 'react';
import { patientDatabase, referralDatabase } from '../../nok/data/patientDatabase';

// Define proper types for our referral data
interface DashboardReferral {
  id: string;
  patientName: string;
  referringDoctor: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dateReferred: string;
  urgency: string;
}

// Use your actual patient data instead of mock data
const getDashboardReferrals = (): DashboardReferral[] => {
  return referralDatabase.map(referral => {
    const patient = patientDatabase.find(p => p.Patient_ID === referral.Patient_ID);
    
    // Convert NOK_Decision to the correct status type
    let status: 'pending' | 'approved' | 'rejected' | 'completed';
    switch (referral.NOK_Decision) {
      case 'ACCEPTED':
        status = 'approved';
        break;
      case 'REJECTED':
        status = 'rejected';
        break;
      case 'PENDING':
      default:
        status = 'pending';
        break;
    }
    
    // Determine priority
    let priority: 'low' | 'medium' | 'high';
    if (referral.IV_Chemotherapy_Radiotherapy === 'Yes' || referral.On_Dialysis === 'Yes') {
      priority = 'high';
    } else if (referral.On_BiPAP_CPAP === 'Yes' || referral.Oxygen_Requirement_2L === 'Yes') {
      priority = 'medium';
    } else {
      priority = 'low';
    }
    
    return {
      id: `REF-${referral.Referral_ID}`,
      patientName: patient?.Patient_Name || 'Unknown Patient',
      referringDoctor: patient?.Attending_Clinician || 'Unknown Doctor',
      department: referral.Department,
      status: status,
      priority: priority,
      dateReferred: referral.Referral_DateTime.toISOString().split('T')[0],
      urgency: referral.IV_Chemotherapy_Radiotherapy === 'Yes' ? 'Emergency' : 
               referral.On_Dialysis === 'Yes' ? 'Urgent' : 'Routine'
    };
  });
};

const statusColors: Record<'pending' | 'approved' | 'rejected' | 'completed', string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityColors: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function ReferralTable() {
  const [referrals] = useState<DashboardReferral[]>(getDashboardReferrals());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');

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
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'completed')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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