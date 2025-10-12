// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import StatsOverview from './components/StatsOverview';
import ReferralTable from './components/ReferralTable';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';

export default function ReferralDashboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Range Filter */}
        <div className="mb-6 flex justify-end">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Stats Overview */}
        <StatsOverview timeRange={timeRange} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />
            <ReferralTable />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}