"use client";

import React from 'react';
import { useApiData } from '../../../components/useApiData';


export default function PatientsTable() {
  const { data, loading, error, refetch } = useApiData();
  const { patients } = data;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Patient Management</h1>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">NRIC</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{patient.patient_id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{patient.patient_name}</td>
                    <td className="px-4 py-3 text-gray-800">{patient.nric}</td>
                    <td className="px-4 py-3 text-gray-800">{patient.age}</td>
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