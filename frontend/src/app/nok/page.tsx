// noklogic.tsx
"use client";

import React, { useEffect, useState } from 'react';

// Types (same as before)
export interface Patient {
  Patient_ID: number;
  Patient_Name: string;
  NRIC: string;
  Age: number;
  Gender: string;
  Community_Hospital: string;
  Ward_Type: string;
  Bed_Number: string;
  Accom_Code: string;
  Attending_Clinician: string;
}

export interface Referral {
  Referral_ID: number;
  Patient_ID: number;
  Referral_DateTime: Date;
  Service: string;
  Department: string;
  Referral_Recommended_by_PT_OT: 'Yes' | 'No';
  Discharge_Planning_Established: 'Yes' | 'No';
  Special_Precautions: string;
  Psychiatric_Behavioural_Issues: 'Yes' | 'No';
  IV_Chemotherapy_Radiotherapy: 'Yes' | 'No';
  On_Parenteral_Nutrition: 'Yes' | 'No';
  On_BiPAP_CPAP: 'Yes' | 'No';
  Tracheostomy_Freq_More_Than_4hr: 'Yes' | 'No';
  Oxygen_Requirement_2L: 'Yes' | 'No';
  On_Dialysis: 'Yes' | 'No';
  Isolation_Infection_Status: string;
  Active_Pathways: string;
}

export interface Surveillance {
  Surveillance_ID: number;
  Patient_ID: number;
  Swab_DateTime: Date;
  CRE_CPO_MRSA_VRE_Last24h: 'Yes' | 'No';
  CRE_CPO_Status: 'Positive' | 'Negative' | 'Unknown';
  MRSA_Status: 'Positive' | 'Negative' | 'Unknown';
  VRE_Screening: 'Positive' | 'Negative' | 'Unknown';
}

export interface CounsellingTriggers {
  high_cost_treatment: boolean;
  premium_accommodation: boolean;
  extended_care_needed: boolean;
  special_equipment: boolean;
  isolation_required: boolean;
}

export interface FinancialCounsellingResult {
  patient_info: {
    name: string;
    nric: string;
    age: number;
    hospital: string;
  };
  referral_info: {
    service: string;
    department: string;
    special_precautions: string;
  };
  counselling_triggers: CounsellingTriggers;
  recommendations: string[];
  surveillance_status: {
    last_swab: Date;
    cre_cpo_status: string;
    mrsa_status: string;
  };
}

export interface NOKAcceptanceWorkflow {
  acceptanceOutcome: string;
  swabInstructions: string[];
  ichPSOContact: {
    email: string;
    phone: string;
    workingHours: string;
  };
  dischargeMedication: string;
  followUpAppointments: string[];
  swabResultsProvided: boolean;
  newOrderPlaced: boolean;
  surveillanceInfoAdded: boolean;
  epicAdmissionPlanned: boolean;
}

export interface NOKRejectionWorkflow {
  rejectionReason: string;
  criteriaCited: string[];
  compiledForClinician: boolean;
  referralCeased: boolean;
}

export interface WorkflowResult {
  decision: 'ACCEPTED' | 'REJECTED';
  financialCounselling: FinancialCounsellingResult;
  acceptanceWorkflow?: NOKAcceptanceWorkflow;
  rejectionWorkflow?: NOKRejectionWorkflow;
}

// Main NOK Financial Counselling Component
export const initializeNOKFinancialCounselling = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Sample data (same as before)
  const samplePatient: Patient = {
    Patient_ID: 1,
    Patient_Name: "John Tan",
    NRIC: "S1234567A",
    Age: 65,
    Gender: "Male",
    Community_Hospital: "Hospital A",
    Ward_Type: "General",
    Bed_Number: "A101",
    Accom_Code: "STANDARD",
    Attending_Clinician: "Dr. Smith"
  };

  const sampleReferral: Referral = {
    Referral_ID: 1001,
    Patient_ID: 1,
    Referral_DateTime: new Date(),
    Service: "Rehabilitation",
    Department: "Physiotherapy",
    Referral_Recommended_by_PT_OT: "Yes",
    Discharge_Planning_Established: "Yes",
    Special_Precautions: "None",
    Psychiatric_Behavioural_Issues: "No",
    IV_Chemotherapy_Radiotherapy: "No",
    On_Parenteral_Nutrition: "No",
    On_BiPAP_CPAP: "No",
    Tracheostomy_Freq_More_Than_4hr: "No",
    Oxygen_Requirement_2L: "No",
    On_Dialysis: "No",
    Isolation_Infection_Status: "None",
    Active_Pathways: "Stroke Rehab"
  };

  const sampleSurveillance: Surveillance = {
    Surveillance_ID: 201,
    Patient_ID: 1,
    Swab_DateTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
    CRE_CPO_MRSA_VRE_Last24h: "Yes",
    CRE_CPO_Status: "Negative",
    MRSA_Status: "Negative",
    VRE_Screening: "Negative"
  };

  // Financial Counselling Logic (same as before)
  const conductFinancialCounselling = (
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance
  ): FinancialCounsellingResult => {
    
    const counsellingTriggers: CounsellingTriggers = {
      high_cost_treatment: referral.IV_Chemotherapy_Radiotherapy === 'Yes',
      premium_accommodation: patient.Accom_Code === 'PREMIUM',
      extended_care_needed: referral.On_Dialysis === 'Yes' || referral.On_Parenteral_Nutrition === 'Yes',
      special_equipment: referral.On_BiPAP_CPAP === 'Yes' || referral.Oxygen_Requirement_2L === 'Yes',
      isolation_required: surveillance.CRE_CPO_Status === 'Positive' || surveillance.MRSA_Status === 'Positive'
    };
    
    const recommendations: string[] = [];
    
    if (counsellingTriggers.high_cost_treatment) {
      recommendations.push("Discuss chemotherapy/radiotherapy cost coverage options");
    }
    
    if (counsellingTriggers.premium_accommodation) {
      recommendations.push("Review premium accommodation charges and insurance coverage");
    }
    
    if (counsellingTriggers.extended_care_needed) {
      recommendations.push("Financial planning for long-term dialysis/nutrition support");
    }
    
    if (counsellingTriggers.special_equipment) {
      recommendations.push("Discuss equipment rental/purchase costs for home care");
    }
    
    if (counsellingTriggers.isolation_required) {
      recommendations.push("Review additional costs for isolation precautions");
    }
    
    recommendations.push(
      "Verify medical insurance coverage limits",
      "Discuss government subsidies eligibility",
      "Review out-of-pocket expense estimates",
      "Provide payment plan options if needed"
    );
    
    return {
      patient_info: {
        name: patient.Patient_Name,
        nric: patient.NRIC,
        age: patient.Age,
        hospital: patient.Community_Hospital
      },
      referral_info: {
        service: referral.Service,
        department: referral.Department,
        special_precautions: referral.Special_Precautions
      },
      counselling_triggers: counsellingTriggers,
      recommendations: recommendations,
      surveillance_status: {
        last_swab: surveillance.Swab_DateTime,
        cre_cpo_status: surveillance.CRE_CPO_Status,
        mrsa_status: surveillance.MRSA_Status
      }
    };
  };

  // Generate swab instructions (same as before)
  const generateSwabInstructions = (surveillance: Surveillance): string[] => {
    const instructions: string[] = [];
    
    if (surveillance.CRE_CPO_MRSA_VRE_Last24h === 'No') {
      instructions.push("Perform CRE/CPO/MRSA/VRE swabs within 24 hours prior to transfer");
    }
    
    if (surveillance.CRE_CPO_Status === 'Positive') {
      instructions.push("Maintain contact precautions for CRE/CPO positive status");
    }
    
    if (surveillance.MRSA_Status === 'Positive') {
      instructions.push("Maintain contact precautions for MRSA positive status");
    }
    
    if (surveillance.VRE_Screening === 'Positive') {
      instructions.push("Maintain contact precautions for VRE positive status");
    }
    
    instructions.push("Ensure swab results are documented and communicated to ICH PSO");
    
    return instructions;
  };

  // Process NOK Acceptance (same as before)
  const processNOKAcceptance = (
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance,
    followUpAppointments: string[] = []
  ): NOKAcceptanceWorkflow => {
    
    const swabInstructions = generateSwabInstructions(surveillance);
    
    return {
      acceptanceOutcome: `Referral accepted for ${patient.Patient_Name} (NRIC: ${patient.NRIC})`,
      swabInstructions: swabInstructions,
      ichPSOContact: {
        email: "ichpso@hospital.gov.sg",
        phone: "+65 6123 4567",
        workingHours: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 8:00 AM - 1:00 PM"
      },
      dischargeMedication: "Prepare 1 week's worth of discharge medication",
      followUpAppointments: followUpAppointments,
      swabResultsProvided: false,
      newOrderPlaced: false,
      surveillanceInfoAdded: false,
      epicAdmissionPlanned: false
    };
  };

  // Process NOK Rejection (same as before)
  const processNOKRejection = (
    patient: Patient,
    referral: Referral,
    rejectionCriteria: string[]
  ): NOKRejectionWorkflow => {
    
    return {
      rejectionReason: `Referral rejected for ${patient.Patient_Name} (NRIC: ${patient.NRIC})`,
      criteriaCited: rejectionCriteria,
      compiledForClinician: true,
      referralCeased: true
    };
  };

  // Complete workflow analysis (same as before)
  const completeNOKWorkflowAnalysis = (
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance,
    isAccepted: boolean,
    rejectionCriteria?: string[],
    followUpAppointments?: string[]
  ): WorkflowResult => {
    const financialCounselling = conductFinancialCounselling(patient, referral, surveillance);
    
    if (isAccepted) {
      const acceptanceWorkflow = processNOKAcceptance(
        patient, 
        referral, 
        surveillance, 
        followUpAppointments || []
      );
      
      return {
        decision: 'ACCEPTED',
        financialCounselling,
        acceptanceWorkflow
      };
    } else {
      const rejectionWorkflow = processNOKRejection(
        patient,
        referral,
        rejectionCriteria || ['Criteria not specified']
      );
      
      return {
        decision: 'REJECTED',
        financialCounselling,
        rejectionWorkflow
      };
    }
  };

  // Test the functionality
  const testResult = completeNOKWorkflowAnalysis(
    samplePatient,
    sampleReferral,
    sampleSurveillance,
    true,
    [],
    ['Cardiology follow-up in 2 weeks', 'Physiotherapy weekly']
  );

  // Helper function to safely render acceptance workflow
  const renderAcceptanceWorkflow = (workflow: NOKAcceptanceWorkflow) => {
    return `
      <div style="margin-bottom: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <h3 style="color: #2e7d32; margin-top: 0;">✅ Acceptance Workflow</h3>
        <p><strong style="color: #333;">Outcome:</strong> <span style="color: #555;">${workflow.acceptanceOutcome}</span></p>
        <p><strong style="color: #333;">Discharge Medication:</strong> <span style="color: #555;">${workflow.dischargeMedication}</span></p>
        
        <h4 style="color: #2e7d32;">Swab Instructions</h4>
        <ul style="color: #555;">
          ${workflow.swabInstructions.map(instruction => `<li>${instruction}</li>`).join('')}
        </ul>

        <h4 style="color: #2e7d32;">ICH PSO Contact</h4>
        <p><strong style="color: #333;">Email:</strong> <span style="color: #555;">${workflow.ichPSOContact.email}</span></p>
        <p><strong style="color: #333;">Phone:</strong> <span style="color: #555;">${workflow.ichPSOContact.phone}</span></p>
        <p><strong style="color: #333;">Working Hours:</strong> <span style="color: #555;">${workflow.ichPSOContact.workingHours}</span></p>

        <h4 style="color: #2e7d32;">Follow-up Appointments</h4>
        <ul style="color: #555;">
          ${workflow.followUpAppointments.map(appt => `<li>${appt}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Helper function to safely render rejection workflow
  const renderRejectionWorkflow = (workflow: NOKRejectionWorkflow) => {
    return `
      <div style="margin-bottom: 20px; padding: 15px; background: #ffebee; border-radius: 8px; border-left: 4px solid #f44336;">
        <h3 style="color: #c62828; margin-top: 0;">❌ Rejection Workflow</h3>
        <p><strong style="color: #333;">Reason:</strong> <span style="color: #555;">${workflow.rejectionReason}</span></p>
        <h4 style="color: #c62828;">Criteria Cited</h4>
        <ul style="color: #555;">
          ${workflow.criteriaCited.map(criteria => `<li>${criteria}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  // Render the component with proper styling
  container.innerHTML = `
    <div style="padding: 25px; border: 2px solid #e0e0e0; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1976d2; margin-top: 0; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">NOK Financial Counselling System</h2>
      
      <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #1976d2; margin-top: 0;">👤 Patient Information</h3>
        <p><strong style="color: #333;">Name:</strong> <span style="color: #555;">${testResult.financialCounselling.patient_info.name}</span></p>
        <p><strong style="color: #333;">NRIC:</strong> <span style="color: #555;">${testResult.financialCounselling.patient_info.nric}</span></p>
        <p><strong style="color: #333;">Age:</strong> <span style="color: #555;">${testResult.financialCounselling.patient_info.age}</span></p>
        <p><strong style="color: #333;">Hospital:</strong> <span style="color: #555;">${testResult.financialCounselling.patient_info.hospital}</span></p>
      </div>

      <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #1976d2; margin-top: 0;">🎯 Financial Counselling Triggers</h3>
        <ul style="color: #555;">
          ${Object.entries(testResult.financialCounselling.counselling_triggers)
            .map(([key, value]) => `
              <li>
                <strong style="color: #333;">${key.replace(/_/g, ' ').toUpperCase()}:</strong> 
                <span style="color: ${value ? '#d32f2f' : '#388e3c'}; font-weight: bold;">
                  ${value ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </li>`)
            .join('')}
        </ul>
      </div>

      <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #1976d2; margin-top: 0;">💡 Recommendations</h3>
        <ul style="color: #555;">
          ${testResult.financialCounselling.recommendations.map(rec => `
            <li style="margin-bottom: 8px; padding-left: 10px; border-left: 3px solid #1976d2;">
              ${rec}
            </li>`).join('')}
        </ul>
      </div>

      ${testResult.decision === 'ACCEPTED' && testResult.acceptanceWorkflow 
        ? renderAcceptanceWorkflow(testResult.acceptanceWorkflow)
        : testResult.decision === 'REJECTED' && testResult.rejectionWorkflow
        ? renderRejectionWorkflow(testResult.rejectionWorkflow)
        : '<p style="color: #555;">No workflow data available</p>'
      }

      <div style="margin-top: 25px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #1976d2;">
        <p style="margin: 0;"><strong style="color: #1976d2;">Status:</strong> <span style="color: #555;">System initialized successfully</span></p>
        <p style="margin: 8px 0 0 0;">
          <strong style="color: #1976d2;">Decision:</strong> 
          <span style="color: ${testResult.decision === 'ACCEPTED' ? '#4CAF50' : '#f44336'}; font-weight: bold;">
            ${testResult.decision}
          </span>
        </p>
      </div>
    </div>
  `;
};

// React Component for NOK Financial Counselling
export const NOKFinancialCounsellingComponent: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeNOKFinancialCounselling('nok-counselling-container');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return <div id="nok-counselling-container" style={{ marginTop: '20px' }}></div>;
};

export default NOKFinancialCounsellingComponent;