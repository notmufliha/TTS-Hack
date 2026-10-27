// app/dashboard/DashboardHeader.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
            <nav className="ml-8 flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-500"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/nok')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                NOK Counselling
              </button>
              <button
                onClick={() => router.push('/routes/referral-management/referral-orders')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Screening
              </button>
              <button
                onClick={() => router.push('/reports')}
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Reports
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Welcome, Dr. Anderson
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              DA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}