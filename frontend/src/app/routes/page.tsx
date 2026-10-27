"use client";

import React, { useState } from 'react';
import { useApiData } from '../components/useApiData';

export default function ReferralManagement() {
  const [filterCount] = useState<number>(3);
  const [activeTable, setActiveTable] = useState<string>('referrals');
  const [referralTypeTab, setReferralTypeTab] = useState<string>('ALL');

  // Use the API hook
  const { data, loading, error, refetch } = useApiData();

  // Destructure the data
  const { patients, appointments, medicalHistories, swabs,referralOrders } = data;


  const referralTabs: string[] = ['ALL', 'NEW REFERRALS', 'PRE-ENROLLMENT', 'ENROLLED', 'POST-ENROLLMENT'];

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data from API...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderReferralOrdersTable = () => (
  <table className="w-full min-w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Order ID</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Order Date</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Provider</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Hospital</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Status</th>
        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Medical Conditions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {referralOrders.length === 0 ? (
        <tr>
          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
            No referral orders found in database
          </td>
        </tr>
      ) : (
        referralOrders.map((order) => (
          <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-800 font-semibold">{order.order_id}</td>
            <td className="px-4 py-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  {order.patient_name || `Patient ${order.patient_id}`}
                </div>
                <div className="text-gray-600 text-xs">
                  {order.nric && `NRIC: ${order.nric}`}
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-gray-800 text-sm">
              {new Date(order.order_datetime).toLocaleDateString()}
            </td>
            <td className="px-4 py-3 text-gray-800 text-sm">{order.provider}</td>
            <td className="px-4 py-3 text-gray-800 text-sm">{order.community_hospital}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                order.referral_status === 'Accepted' ? 'bg-green-100 text-green-800' :
                order.referral_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                order.referral_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                order.referral_status === 'Withdrawn' ? 'bg-gray-100 text-gray-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {order.referral_status}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {order.iv_chemo_radiotherapy && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Chemo</span>
                )}
                {order.dialysis && (
                  <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Dialysis</span>
                )}
                {order.bipap_cpap && (
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">BIPAP</span>
                )}
                {order.psychiatric_issues && (
                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Psych</span>
                )}
                {order.tracheostomy_freq && (
                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Trach</span>
                )}
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);


  const renderPatientsTable = () => (
    <table className="w-full min-w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient ID</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Name</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">NRIC</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Age</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Gender</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {patients.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
              No patients found in database
            </td>
          </tr>
        ) : (
          patients.map((patient) => (
            <tr key={patient.patient_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{patient.patient_id}</td>
              <td className="px-4 py-3 font-semibold text-gray-800">{patient.patient_name}</td>
              <td className="px-4 py-3 text-gray-800">{patient.nric}</td>
              <td className="px-4 py-3 text-gray-800">{patient.age}</td>
              <td className="px-4 py-3 text-gray-800">{patient.gender}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderAppointmentsTable = () => (
    <table className="w-full min-w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Appointment ID</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Date</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Type</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {appointments.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
              No appointments found in database
            </td>
          </tr>
        ) : (
          appointments.map((appt) => (
            <tr key={appt.appointment_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{appt.appointment_id}</td>
              <td className="px-4 py-3 text-gray-800">
                {appt.patient_name || `Patient ${appt.patient_id}`}
              </td>
              <td className="px-4 py-3 text-gray-800">
                {new Date(appt.appointment_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-800">{appt.appointment_type}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  appt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                  appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {appt.status}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderMedicalHistoryTable = () => (
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
        {medicalHistories.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
              No medical history records found in database
            </td>
          </tr>
        ) : (
          medicalHistories.map((history) => {
            const patient = patients.find(p => p.patient_id === history.patient_id);
            return (
              <tr key={history.history_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">
                      {patient?.patient_name || history.patient_name || `Patient ${history.patient_id}`}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      ID: {history.patient_id}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {patient?.age || ''} {patient?.age ? 'yrs' : ''} {patient?.age && patient?.gender ? '•' : ''} {patient?.gender || ''}
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
                      <div className="text-gray-600 font-medium">{history.temperature}°C</div>
                      
                      <div className="text-gray-600">BP:</div>
                      <div className="text-gray-600 font-medium">{history.systolic_bp}/{history.diastolic_bp}</div>
                      
                      <div className="text-gray-600">Pulse:</div>
                      <div className="text-gray-600 font-medium">{history.pulse} bpm</div>
                      
                      <div className="text-gray-600">SPO2:</div>
                      <div className="text-gray-600 font-medium">{history.spo2}%</div>
                      
                      <div className="text-gray-600">Resp Rate:</div>
                      <div className="text-gray-600 font-medium">{history.respiratory_rate}</div>
                      
                      <div className="text-gray-600">O2 Level:</div>
                      <div className="text-gray-600 font-medium">{history.oxygen_level}%</div>
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
                    {new Date(history.last_updated).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(history.last_updated).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  const renderSwabsTable = () => (
    <table className="w-full min-w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Swab ID</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Patient</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Type</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Date</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Result</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">Location</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {swabs.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
              No swab tests found in database
            </td>
          </tr>
        ) : (
          swabs.map((swab) => (
            <tr key={swab.swab_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800">{swab.swab_id}</td>
              <td className="px-4 py-3 text-gray-800">
                {swab.patient_name || `Patient ${swab.patient_id}`}
              </td>
              <td className="px-4 py-3 text-gray-800">{swab.swab_type}</td>
              <td className="px-4 py-3 text-gray-800">
                {swab.swab_date ? new Date(swab.swab_date).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  swab.result === 'negative' ? 'bg-green-100 text-green-800' :
                  swab.result === 'positive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {swab.result}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-800">{swab.swab_location}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const getTableTitle = () => {
    switch (activeTable) {
      case 'referral-orders': return 'Referral Order Management';
      case 'patients': return 'Patient Management';
      case 'appointments': return 'Appointment Management';
      case 'medical': return 'Medical History Management';
      case 'swabs': return 'Swab Test Management';
      default: return 'Referral Management';
    }
  };

  const getRecordCount = () => {
    switch (activeTable) {
      case 'referral-orders': return referralOrders.length;
      case 'patients': return patients.length;
      case 'appointments': return appointments.length;
      case 'medical': return medicalHistories.length;
      case 'swabs': return swabs.length;
      default: return 0;
    }
  };

  const getRecordType = () => {
    switch (activeTable) {
    case 'referral-orders': return 'referral orders';
      case 'patients': return 'patients';
      case 'appointments': return 'appointments';
      case 'medical': return 'medical records';
      case 'swabs': return 'swab tests';
      default: return 'records';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Tabs and Navigation */}
      <div className="w-64 bg-gray-800 py-5 flex flex-col">
        {/* Navigation Icons */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">🏠</div>
          <div 
            className={`text-2xl cursor-pointer p-2 rounded-lg transition-colors ${
               activeTable === 'referral-orders' ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
  }`}
  onClick={() => setActiveTable('referral-orders')}
          >
            📊
          </div>
          <div 
            className={`text-2xl cursor-pointer p-2 rounded-lg transition-colors ${
              activeTable === 'patients' ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTable('patients')}
          >
            👥
          </div>
          <div 
            className={`text-2xl cursor-pointer p-2 rounded-lg transition-colors ${
              activeTable === 'appointments' ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTable('appointments')}
          >
            📋
          </div>
          <div 
            className={`text-2xl cursor-pointer p-2 rounded-lg transition-colors ${
              activeTable === 'medical' ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTable('medical')}
          >
            🏥
          </div>
          <div 
            className={`text-2xl cursor-pointer p-2 rounded-lg transition-colors ${
              activeTable === 'swabs' ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTable('swabs')}
          >
            🧪
          </div>
          <div className="text-2xl text-white cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors">⚙️</div>
        </div>

        {/* Referral Type Tabs - Only show for referrals table */}
        {activeTable === 'referrals' && (
          <div className="flex-1 px-4">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Referral Types</h3>
            <div className="space-y-2">
              {referralTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setReferralTypeTab(tab)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    referralTypeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Utility Icons at bottom */}
        <div className="px-4 space-y-2 mt-auto">
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
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">{getTableTitle()}</h1>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <input 
                    type="text" 
                    placeholder={`Search for a ${getRecordType().slice(0, -1)} by name`}
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
              {activeTable === 'referrals' ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">{referralTypeTab} REFERRALS</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>{getRecordCount()} {getRecordType()}</strong> • Sorted by Name
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800">{getTableTitle().toUpperCase()}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>{getRecordCount()} {getRecordType()}</strong> • Data loaded from API
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
{activeTable === 'referral-orders' && renderReferralOrdersTable()}
              {activeTable === 'patients' && renderPatientsTable()}
              {activeTable === 'appointments' && renderAppointmentsTable()}
              {activeTable === 'medical' && renderMedicalHistoryTable()}
              {activeTable === 'swabs' && renderSwabsTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}