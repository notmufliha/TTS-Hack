// app/nok/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui';
import { initializeNOKFinancialCounselling } from './noklogic';
import { patientDatabase, referralDatabase, surveillanceDatabase, Patient, Referral, Surveillance } from './data/patientDatabase';

// Create a proper update function that actually modifies the data
const updateReferralDecision = (patientId: number, decision: 'ACCEPTED' | 'REJECTED', notes?: string) => {
  const referralIndex = referralDatabase.findIndex(ref => ref.Patient_ID === patientId);
  if (referralIndex !== -1) {
    referralDatabase[referralIndex].NOK_Decision = decision;
    referralDatabase[referralIndex].NOK_Notes = notes;
    console.log(`Updated patient ${patientId} to ${decision} with notes: ${notes}`);
    return true;
  }
  return false;
};

export default function NOKPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const getPendingReferrals = () => {
    return referralDatabase.filter(ref => ref.NOK_Decision === 'PENDING');
  };

  // Auto-select the first pending patient when component loads or after decisions
  useEffect(() => {
    const pendingReferrals = getPendingReferrals();
    if (pendingReferrals.length > 0 && !selectedPatientId) {
      const firstPendingPatientId = pendingReferrals[0].Patient_ID;
      setSelectedPatientId(firstPendingPatientId);
      handlePatientSelect(firstPendingPatientId);
    } else if (pendingReferrals.length === 0) {
      // No pending referrals, show overview
      setSelectedPatientId(null);
      setTimeout(() => {
        initializeNOKFinancialCounselling('nok-counselling-container');
      }, 50);
    }
  }, [refreshKey]); // This will run whenever refreshKey changes

  const handlePatientSelect = (patientId: number) => {
    console.log('Selecting patient:', patientId);
    setSelectedPatientId(patientId);
    
    const patient = patientDatabase.find(p => p.Patient_ID === patientId);
    const referral = referralDatabase.find(r => r.Patient_ID === patientId);
    const surveillance = surveillanceDatabase.find(s => s.Patient_ID === patientId);

    if (patient && referral && surveillance) {
      console.log('Found patient data:', patient.Patient_Name);
      setRefreshKey(prev => prev + 1);
      
      setTimeout(() => {
        initializeNOKFinancialCounselling('nok-counselling-container', patient, referral, surveillance);
      }, 50);
    }
  };

  const processNOKDecision = (patientId: number, decision: 'ACCEPTED' | 'REJECTED', notes?: string) => {
    const success = updateReferralDecision(patientId, decision, notes);
    const patient = patientDatabase.find(p => p.Patient_ID === patientId);
    
    if (success && patient) {
      alert(`Successfully ${decision.toLowerCase()} referral for ${patient.Patient_Name}`);
      
      // Find the next pending patient
      const pendingReferrals = getPendingReferrals();
      const currentPatientIndex = pendingReferrals.findIndex(ref => ref.Patient_ID === patientId);
      
      // Remove the current patient from selection
      setSelectedPatientId(null);
      
      // Auto-select the next pending patient
      if (pendingReferrals.length > 0) {
        let nextPatientId;
        if (currentPatientIndex !== -1 && currentPatientIndex < pendingReferrals.length - 1) {
          // Select next patient in the list
          nextPatientId = pendingReferrals[currentPatientIndex + 1].Patient_ID;
        } else {
          // Select first patient in the list
          nextPatientId = pendingReferrals[0].Patient_ID;
        }
        
        setTimeout(() => {
          setSelectedPatientId(nextPatientId);
          handlePatientSelect(nextPatientId);
        }, 500);
      } else {
        // No more pending patients, refresh to show overview
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
          initializeNOKFinancialCounselling('nok-counselling-container');
        }, 100);
      }
    } else {
      alert('Error updating referral decision');
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      const pendingReferrals = getPendingReferrals();
      if (pendingReferrals.length > 0) {
        const firstPendingPatientId = pendingReferrals[0].Patient_ID;
        setSelectedPatientId(firstPendingPatientId);
        handlePatientSelect(firstPendingPatientId);
      } else {
        initializeNOKFinancialCounselling('nok-counselling-container');
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const pendingReferrals = getPendingReferrals();

  return (
    <div>
      <div>
        <PageHeader
          title="NOK financial counselling"
          description={
            pendingReferrals.length > 0
              ? `${pendingReferrals.length} accepted referrals waiting for a next-of-kin decision`
              : 'All next-of-kin decisions recorded'
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Patient Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Referrals</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {pendingReferrals.length} pending • {referralDatabase.length - pendingReferrals.length} decided
                </p>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {referralDatabase.map((referral) => {
                  const patient = patientDatabase.find(p => p.Patient_ID === referral.Patient_ID);
                  const surveillance = surveillanceDatabase.find(s => s.Patient_ID === referral.Patient_ID);
                  
                  if (!patient) return null;
                  
                  return (
                    <button
                      key={`${referral.Referral_ID}-${refreshKey}`}
                      onClick={() => handlePatientSelect(patient.Patient_ID)}
                      className={`w-full p-4 text-left hover:bg-blue-50 transition-colors duration-200 ${
                        selectedPatientId === patient.Patient_ID 
                          ? 'bg-blue-100 border-l-4 border-blue-500' 
                          : 'bg-white'
                      } ${
                        referral.NOK_Decision !== 'PENDING' ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-medium ${
                            selectedPatientId === patient.Patient_ID ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {patient.Patient_Name}
                          </h4>
                          <p className="text-sm text-gray-500">{patient.NRIC}</p>
                          <p className="text-sm text-gray-600 mt-1">{referral.Service}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: <span className={`font-semibold ${
                              referral.NOK_Decision === 'ACCEPTED' ? 'text-green-600' :
                              referral.NOK_Decision === 'REJECTED' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {referral.NOK_Decision}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            referral.NOK_Decision === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            referral.NOK_Decision === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {referral.NOK_Decision}
                          </span>
                          {surveillance?.CRE_CPO_Status === 'Positive' && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mt-1">
                              CRE+
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Bed: {patient.Bed_Number}</span>
                        <span className="mx-2">•</span>
                        <span>{patient.Community_Hospital}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {referralDatabase.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No referrals found
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div key={refreshKey} id="nok-counselling-container"></div>
            
            {/* Decision Buttons - Only show for pending patients */}
            {selectedPatientId && (() => {
              const patient = patientDatabase.find(p => p.Patient_ID === selectedPatientId);
              const referral = referralDatabase.find(r => r.Patient_ID === selectedPatientId);
              
              if (!patient || !referral) return null;
              
              // Only show buttons if the referral is still pending
              if (referral.NOK_Decision === 'PENDING') {
                return (
                  <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Record NOK Decision for {patient.Patient_Name}
                    </h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => processNOKDecision(selectedPatientId, 'ACCEPTED', 'Financial counselling completed successfully')}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <span>✅</span>
                        <span>Accept Referral</span>
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter rejection reason:');
                          if (notes) {
                            processNOKDecision(selectedPatientId, 'REJECTED', notes);
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <span>❌</span>
                        <span>Reject Referral</span>
                      </button>
                    </div>
                  </div>
                );
              }
              
              // Show completion message for decided patients
              return (
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <div className={`p-4 rounded-md ${
                    referral.NOK_Decision === 'ACCEPTED' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <h3 className={`text-lg font-medium ${
                      referral.NOK_Decision === 'ACCEPTED' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {referral.NOK_Decision === 'ACCEPTED' ? '✅ Referral Accepted' : '❌ Referral Rejected'}
                    </h3>
                    <p className={`mt-2 ${
                      referral.NOK_Decision === 'ACCEPTED' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Decision recorded for {patient.Patient_Name}
                      {referral.NOK_Notes && ` - ${referral.NOK_Notes}`}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}