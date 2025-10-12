"use client";

import React, { useState } from 'react';

interface Referral {
  id: number;
  name: string;
  email: string;
  referredBy: string;
  referralDate: string;
  touchpoints: number;
  lastTouchpoint: string;
}

export default function ReferralManagement() {
  const [filterCount] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const referrals: Referral[] = [
    {
      id: 1,
      name: 'Otila Bogisch',
      email: 'otilila.bogisch@fakernember.com',
      referredBy: 'Doro\'thea Holliday, MD.',
      referralDate: '04/26/20',
      touchpoints: 0,
      lastTouchpoint: '--'
    },
    {
      id: 2,
      name: 'Christophe Kub',
      email: 'christophe.kub@fakernember.com',
      referredBy: 'Doro\'thea Holliday, MD.',
      referralDate: '04/26/20',
      touchpoints: 0,
      lastTouchpoint: '--'
    },
    {
      id: 3,
      name: 'Samantha Kulic',
      email: 'samantha.kulic@fakernember.com',
      referredBy: 'Doro\'thea Holliday, MD.',
      referralDate: '04/26/20',
      touchpoints: 0,
      lastTouchpoint: '--'
    },
    {
      id: 4,
      name: 'Novat Lynch',
      email: 'lekjuk.vnch@fakernember.com',
      referredBy: 'Doro\'thea Holliday, MD.',
      referralDate: '04/26/20',
      touchpoints: 0,
      lastTouchpoint: '--'
    }
  ];

  const tabs: string[] = ['ALL', 'NEW REFERRALS', 'PRE-ENROLLMENT', 'ENROLLED', 'POST-ENROLLMENT'];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Tabs and Navigation */}
      <div className="w-64 bg-gray-800 py-5 flex flex-col">
        {/* Navigation Icons */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">🏠</div>
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">📊</div>
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">👥</div>
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">📋</div>
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">⚙️</div>
        </div>

        {/* Tabs */}
        <div className="flex-1 px-4">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Referral Types</h3>
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Utility Icons at bottom */}
        <div className="px-4 space-y-2">
          <div className="text-xl text-gray-300 cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">🔔</div>
          <div className="text-xl text-gray-300 cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">👤</div>
        </div>
      </div>

      {/* Main Content - Occupies remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Referral Management</h1>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Search for a participant by name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="filters">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    FILTERS ({filterCount})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <strong>Search all locations</strong>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Active Tab and Count */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{activeTab} REFERRALS</h2>
              <p className="text-gray-600 text-sm mt-1">
                <strong>{referrals.length} enrollments</strong> • Sorted by Name
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm whitespace-nowrap">
                      Name / Preferred contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm whitespace-nowrap">
                      Referred by
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm whitespace-nowrap">
                      Referral date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm whitespace-nowrap">
                      Touchpoints / Last touchpoint
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-800 truncate">{referral.name}</div>
                          <div className="text-gray-600 text-sm truncate">{referral.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {referral.referredBy}
                      </td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {referral.referralDate}
                      </td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {referral.touchpoints} {referral.lastTouchpoint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty state for demonstration */}
          {referrals.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">No referrals found</div>
              <div className="text-gray-500 text-sm">
                There are no {activeTab.toLowerCase()} referrals matching your criteria.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}