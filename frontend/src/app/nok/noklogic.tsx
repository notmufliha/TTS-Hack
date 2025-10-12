// noklogic.ts
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
  Oxygen_Requirement_2L: 'Yes' | 'No'; // Fixed variable name
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

// nokFinancialCounselling.ts
export class NOKFinancialCounselling {
  private static readonly ICH_PSO_EMAIL = "ichpso@hospital.gov.sg";
  private static readonly ICH_PSO_PHONE = "+65 6123 4567";
  private static readonly ICH_PSO_WORKING_HOURS = "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 8:00 AM - 1:00 PM";

  /**
   * Main logic for NOK financial counselling when referral is accepted
   */
  public static conductFinancialCounselling(
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance
  ): FinancialCounsellingResult {
    
    // Financial counselling triggers based on patient/referral data
    const counsellingTriggers: CounsellingTriggers = {
      high_cost_treatment: referral.IV_Chemotherapy_Radiotherapy === 'Yes',
      premium_accommodation: patient.Accom_Code === 'PREMIUM',
      extended_care_needed: referral.On_Dialysis === 'Yes' || referral.On_Parenteral_Nutrition === 'Yes',
      special_equipment: referral.On_BiPAP_CPAP === 'Yes' || referral.Oxygen_Requirement_2L === 'Yes', // Fixed variable name
      isolation_required: surveillance.CRE_CPO_Status === 'Positive' || surveillance.MRSA_Status === 'Positive'
    };
    
    // Generate financial counselling recommendations
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
    
    // Default recommendations for all patients
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
  }

  /**
   * Generate swab instructions based on surveillance screening checklist
   */
  private static generateSwabInstructions(surveillance: Surveillance): string[] {
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
  }

  /**
   * Process PT/NOK Acceptance workflow
   */
  public static processNOKAcceptance(
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance,
    followUpAppointments: string[] = []
  ): NOKAcceptanceWorkflow {
    
    const swabInstructions = this.generateSwabInstructions(surveillance);
    
    return {
      acceptanceOutcome: `Referral accepted for ${patient.Patient_Name} (NRIC: ${patient.NRIC})`,
      swabInstructions: swabInstructions,
      ichPSOContact: {
        email: this.ICH_PSO_EMAIL,
        phone: this.ICH_PSO_PHONE,
        workingHours: this.ICH_PSO_WORKING_HOURS
      },
      dischargeMedication: "Prepare 1 week's worth of discharge medication",
      followUpAppointments: followUpAppointments,
      swabResultsProvided: false, // To be updated when referring institution provides results
      newOrderPlaced: false, // To be updated when ICH PSO places order
      surveillanceInfoAdded: false, // To be updated when surveillance info is input
      epicAdmissionPlanned: false // To be updated when EPIC admission is planned
    };
  }

  /**
   * Process PT/NOK Rejection workflow
   */
  public static processNOKRejection(
    patient: Patient,
    referral: Referral,
    rejectionCriteria: string[]
  ): NOKRejectionWorkflow {
    
    return {
      rejectionReason: `Referral rejected for ${patient.Patient_Name} (NRIC: ${patient.NRIC})`,
      criteriaCited: rejectionCriteria,
      compiledForClinician: true,
      referralCeased: true
    };
  }

  /**
   * Update workflow when referring institution provides swab results
   */
  public static updateSwabResultsProvided(workflow: NOKAcceptanceWorkflow): NOKAcceptanceWorkflow {
    return {
      ...workflow,
      swabResultsProvided: true
    };
  }

  /**
   * Update workflow when ICH PSO places new order
   */
  public static updateNewOrderPlaced(workflow: NOKAcceptanceWorkflow): NOKAcceptanceWorkflow {
    return {
      ...workflow,
      newOrderPlaced: true,
      surveillanceInfoAdded: true
    };
  }

  /**
   * Update workflow when EPIC admission is planned
   */
  public static updateEpicAdmissionPlanned(workflow: NOKAcceptanceWorkflow): NOKAcceptanceWorkflow {
    return {
      ...workflow,
      epicAdmissionPlanned: true
    };
  }

  /**
   * Complete workflow analysis for NOK decision
   */
  public static completeNOKWorkflowAnalysis(
    patient: Patient,
    referral: Referral,
    surveillance: Surveillance,
    isAccepted: boolean,
    rejectionCriteria?: string[],
    followUpAppointments?: string[]
  ): {
    decision: string;
    financialCounselling: FinancialCounsellingResult;
    acceptanceWorkflow?: NOKAcceptanceWorkflow;
    rejectionWorkflow?: NOKRejectionWorkflow;
  } {
    const financialCounselling = this.conductFinancialCounselling(patient, referral, surveillance);
    
    if (isAccepted) {
      const acceptanceWorkflow = this.processNOKAcceptance(
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
      const rejectionWorkflow = this.processNOKRejection(
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
  }
}

// Example usage and test data
export const samplePatient: Patient = {
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

export const sampleReferral: Referral = {
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
  Oxygen_Requirement_2L: "No", // Fixed variable name
  On_Dialysis: "No",
  Isolation_Infection_Status: "None",
  Active_Pathways: "Stroke Rehab"
};

export const sampleSurveillance: Surveillance = {
  Surveillance_ID: 201,
  Patient_ID: 1,
  Swab_DateTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  CRE_CPO_MRSA_VRE_Last24h: "Yes",
  CRE_CPO_Status: "Negative",
  MRSA_Status: "Negative",
  VRE_Screening: "Negative"
};

// Utility function to create test data
export function createTestData(
  patientData: Partial<Patient> = {},
  referralData: Partial<Referral> = {},
  surveillanceData: Partial<Surveillance> = {}
): { patient: Patient; referral: Referral; surveillance: Surveillance } {
  const patient: Patient = { ...samplePatient, ...patientData };
  const referral: Referral = { ...sampleReferral, ...referralData };
  const surveillance: Surveillance = { ...sampleSurveillance, ...surveillanceData };
  
  return { patient, referral, surveillance };
}

// Export all types and classes for use in other modules
export default NOKFinancialCounselling;