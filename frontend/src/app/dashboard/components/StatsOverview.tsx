// app/dashboard/components/StatsOverview.tsx
'use client';

import { useEffect, useState } from 'react';
import { reportsAPI } from '../../components/api';
import type { MonthlyReport } from '@/lib/types';

interface StatsOverviewProps {
  month: string;
}

export function formatMinutes(minutes: number | null) {
  if (minutes === null) return '—';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 60 * 24) return `${(minutes / 60).toFixed(1)} h`;
  return `${(minutes / 60 / 24).toFixed(1)} d`;
}

export default function StatsOverview({ month }: StatsOverviewProps) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    reportsAPI
      .monthly(month)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [month]);

  if (error) {
    return <div className="bg-red-50 text-red-700 rounded-lg p-4 text-sm">Could not load stats: {error}</div>;
  }

  const stats = [
    {
      name: 'Total Referrals',
      value: report ? String(report.totals.referrals) : '…',
      detail: report ? `${report.totals.accepted} accepted • ${report.totals.rejected} rejected` : '',
      icon: '📋',
    },
    {
      name: 'Awaiting Action',
      value: report ? String(report.totals.pending + report.totals.escalated) : '…',
      detail: report ? `${report.totals.escalated} escalated to clinician` : '',
      icon: '⏳',
    },
    {
      name: 'Avg. Referral → Decision',
      value: report ? formatMinutes(report.tat_minutes.order_to_decision_avg) : '…',
      detail: report ? `Median ${formatMinutes(report.tat_minutes.order_to_decision_median)}` : '',
      icon: '⏱️',
    },
    {
      name: 'Staff Time Saved (est.)',
      value: report ? formatMinutes(report.time_saved_minutes) : '…',
      detail: 'vs. 8 min manual review + transcription per case',
      icon: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm mt-1 text-gray-500">{stat.detail}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
