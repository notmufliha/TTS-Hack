"use client";

import React from 'react';
import { useApiData } from '../../../components/useApiData';

export default function AppointmentsTable() {
  const { data, loading, error, refetch } = useApiData();
  const { appointments } = data;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Appointment Management</h1>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{appt.patient_id}</td>
                    <td className="px-4 py-3 text-gray-800">{appt.patient_name}</td>
                                        <td className="px-4 py-3 text-gray-800">{appt.appointment_type}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {new Date(appt.appointment_date).toLocaleDateString()} {new Date(appt.appointment_date).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}