"use client";

import React from 'react';
import { useApiData } from '../../../components/useApiData';

export default function MedicalHistoryTable() {
  const { data, loading, error, refetch } = useApiData();
  const { medicalHistories, patients } = data;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Medical History Management</h1>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Medical Conditions</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Vitals</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Special Notes</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {medicalHistories.map((history) => {
                  const patient = patients.find(p => p.patient_id === history.patient_id);
                  return (
                    <tr key={history.history_id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3">
  <div className="min-w-0">
    <div className="font-semibold text-gray-800 text-sm">
      {patient?.patient_name || `Patient ${history.patient_id}`}
    </div>
    
    {/* Add specific classes for each data field */}
    <div className="text-gray-600 text-xs mt-1 patient-data-id">
      ID: <span className="patient-id-value">{history.patient_id}</span>
    </div>
    
    <div className="text-gray-600 text-xs patient-data-age">
      <span className="patient-age-value">{patient?.age}</span> yrs
    </div>
    
    <div className="text-gray-600 text-xs patient-data-gender">
      <span className="patient-gender-value">{patient?.gender}</span>
    </div>
  </div>
</td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {history.iv_chemo_radiotherapy && (
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">IV Chemo</span>
                            )}
                            {history.dialysis && (
                              <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Dialysis</span>
                            )}
                            {history.parenteral_nutrition && (
                              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Parent Nutrition</span>
                            )}
                            {history.psychiatric_issues && (
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Psychiatric</span>
                            )}
                            {history.suicidal_precaution && (
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Suicidal Prec</span>
                            )}
                            {history.bipap_cpap && (
                              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">BIPAP/CPAP</span>
                            )}
                          </div>
                          {history.tracheostomy_freq && (
                            <div className="text-xs text-gray-600">
                              Tracheostomy: {history.tracheostomy_freq.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1 text-sm">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className="text-gray-600">Temp:</div>
                            <div className="text-gray-600 font-medium">{history.temperature}</div>
                            
                            <div className="text-gray-600">Systolic BP:</div>
                            <div className="text-gray-600 font-medium">{history.systolic_bp}</div>

                             <div className="text-gray-600">Diastloic BP:</div>
                            <div className="text-gray-600 font-medium">{history.diastolic_bp}</div>
                            
                            <div className="text-gray-600">Pulse:</div>
                            <div className="text-gray-600 font-medium">{history.pulse}</div>
                            
                            <div className="text-gray-600">SPO2:</div>
                            <div className="text-gray-600 font-medium">{history.spo2}</div>
                            
                            <div className="text-gray-600">Resp Rate:</div>
                            <div className="text-gray-600 font-medium">{history.respiratory_rate}</div>
                            
                            <div className="text-gray-600">O2 Level:</div>
                            <div className="text-gray-600 font-medium">{history.oxygen_level}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          {history.special_circumstance ? (
                            <div className="text-sm text-gray-800 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                              {history.special_circumstance}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No special notes</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {new Date(history.last_updated).toLocaleDateString()} {new Date(history.last_updated).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}