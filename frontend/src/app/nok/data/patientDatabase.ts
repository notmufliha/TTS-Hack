// app/nok/data/patientDatabase.ts
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
  Financial_Status: 'Subsidized' | 'Private' | 'MediFund';
  Insurance_Coverage: boolean;
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
  NOK_Decision: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  NOK_Notes?: string;
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

// Comprehensive patient database
export const patientDatabase: Patient[] = [
  {
    Patient_ID: 1,
    Patient_Name: "John Tan",
    NRIC: "S1234567A",
    Age: 65,
    Gender: "Male",
    Community_Hospital: "Hospital A",
    Ward_Type: "General",
    Bed_Number: "A101",
    Accom_Code: "STANDARD",
    Attending_Clinician: "Dr. Smith",
    Financial_Status: "Subsidized",
    Insurance_Coverage: true
  },
  {
    Patient_ID: 2,
    Patient_Name: "Mary Lim",
    NRIC: "S2345678B",
    Age: 72,
    Gender: "Female",
    Community_Hospital: "Hospital B",
    Ward_Type: "ICU",
    Bed_Number: "B205",
    Accom_Code: "PREMIUM",
    Attending_Clinician: "Dr. Wong",
    Financial_Status: "Private",
    Insurance_Coverage: true
  },
  {
    Patient_ID: 3,
    Patient_Name: "Robert Chen",
    NRIC: "S3456789C",
    Age: 58,
    Gender: "Male",
    Community_Hospital: "Hospital C",
    Ward_Type: "General",
    Bed_Number: "C304",
    Accom_Code: "STANDARD",
    Attending_Clinician: "Dr. Kumar",
    Financial_Status: "MediFund",
    Insurance_Coverage: false
  },
  {
    Patient_ID: 4,
    Patient_Name: "Sarah Koh",
    NRIC: "S4567890D",
    Age: 45,
    Gender: "Female",
    Community_Hospital: "Hospital A",
    Ward_Type: "ICU",
    Bed_Number: "A102",
    Accom_Code: "PREMIUM",
    Attending_Clinician: "Dr. Lee",
    Financial_Status: "Private",
    Insurance_Coverage: true
  },
  {
    Patient_ID: 5,
    Patient_Name: "David Ng",
    NRIC: "S5678901E",
    Age: 80,
    Gender: "Male",
    Community_Hospital: "Hospital B",
    Ward_Type: "General",
    Bed_Number: "B206",
    Accom_Code: "STANDARD",
    Attending_Clinician: "Dr. Patel",
    Financial_Status: "Subsidized",
    Insurance_Coverage: false
  }
];

export const referralDatabase: Referral[] = [
  {
    Referral_ID: 1001,
    Patient_ID: 1,
    Referral_DateTime: new Date('2024-01-15'),
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
    Active_Pathways: "Stroke Rehab",
    NOK_Decision: "PENDING"
  },
  {
    Referral_ID: 1002,
    Patient_ID: 2,
    Referral_DateTime: new Date('2024-01-16'),
    Service: "Palliative Care",
    Department: "Oncology",
    Referral_Recommended_by_PT_OT: "No",
    Discharge_Planning_Established: "No",
    Special_Precautions: "Fall risk",
    Psychiatric_Behavioural_Issues: "Yes",
    IV_Chemotherapy_Radiotherapy: "Yes",
    On_Parenteral_Nutrition: "Yes",
    On_BiPAP_CPAP: "Yes",
    Tracheostomy_Freq_More_Than_4hr: "No",
    Oxygen_Requirement_2L: "Yes",
    On_Dialysis: "No",
    Isolation_Infection_Status: "Contact Precautions",
    Active_Pathways: "Palliative",
    NOK_Decision: "ACCEPTED",
    NOK_Notes: "Financial counselling completed, insurance verified"
  },
  {
    Referral_ID: 1003,
    Patient_ID: 3,
    Referral_DateTime: new Date('2024-01-17'),
    Service: "Chronic Care",
    Department: "Internal Medicine",
    Referral_Recommended_by_PT_OT: "Yes",
    Discharge_Planning_Established: "Yes",
    Special_Precautions: "Diabetic diet",
    Psychiatric_Behavioural_Issues: "No",
    IV_Chemotherapy_Radiotherapy: "No",
    On_Parenteral_Nutrition: "No",
    On_BiPAP_CPAP: "No",
    Tracheostomy_Freq_More_Than_4hr: "No",
    Oxygen_Requirement_2L: "No",
    On_Dialysis: "Yes",
    Isolation_Infection_Status: "None",
    Active_Pathways: "Renal Care",
    NOK_Decision: "REJECTED",
    NOK_Notes: "Financial constraints, unable to afford dialysis costs"
  },
  {
    Referral_ID: 1004,
    Patient_ID: 4,
    Referral_DateTime: new Date('2024-01-18'),
    Service: "Surgical Recovery",
    Department: "Surgery",
    Referral_Recommended_by_PT_OT: "Yes",
    Discharge_Planning_Established: "Yes",
    Special_Precautions: "Post-op monitoring",
    Psychiatric_Behavioural_Issues: "No",
    IV_Chemotherapy_Radiotherapy: "No",
    On_Parenteral_Nutrition: "Yes",
    On_BiPAP_CPAP: "No",
    Tracheostomy_Freq_More_Than_4hr: "Yes",
    Oxygen_Requirement_2L: "No",
    On_Dialysis: "No",
    Isolation_Infection_Status: "None",
    Active_Pathways: "Surgical Recovery",
    NOK_Decision: "PENDING"
  },
  {
    Referral_ID: 1005,
    Patient_ID: 5,
    Referral_DateTime: new Date('2024-01-19'),
    Service: "Geriatric Care",
    Department: "Geriatrics",
    Referral_Recommended_by_PT_OT: "No",
    Discharge_Planning_Established: "No",
    Special_Precautions: "Dementia care",
    Psychiatric_Behavioural_Issues: "Yes",
    IV_Chemotherapy_Radiotherapy: "No",
    On_Parenteral_Nutrition: "No",
    On_BiPAP_CPAP: "No",
    Tracheostomy_Freq_More_Than_4hr: "No",
    Oxygen_Requirement_2L: "No",
    On_Dialysis: "No",
    Isolation_Infection_Status: "None",
    Active_Pathways: "Geriatric Assessment",
    NOK_Decision: "PENDING"
  }
];

export const surveillanceDatabase: Surveillance[] = [
  {
    Surveillance_ID: 201,
    Patient_ID: 1,
    Swab_DateTime: new Date('2024-01-15T08:00:00'),
    CRE_CPO_MRSA_VRE_Last24h: "Yes",
    CRE_CPO_Status: "Negative",
    MRSA_Status: "Negative",
    VRE_Screening: "Negative"
  },
  {
    Surveillance_ID: 202,
    Patient_ID: 2,
    Swab_DateTime: new Date('2024-01-16T10:00:00'),
    CRE_CPO_MRSA_VRE_Last24h: "Yes",
    CRE_CPO_Status: "Positive",
    MRSA_Status: "Negative",
    VRE_Screening: "Negative"
  },
  {
    Surveillance_ID: 203,
    Patient_ID: 3,
    Swab_DateTime: new Date('2024-01-17T09:00:00'),
    CRE_CPO_MRSA_VRE_Last24h: "No",
    CRE_CPO_Status: "Negative",
    MRSA_Status: "Negative",
    VRE_Screening: "Negative"
  },
  {
    Surveillance_ID: 204,
    Patient_ID: 4,
    Swab_DateTime: new Date('2024-01-18T11:00:00'),
    CRE_CPO_MRSA_VRE_Last24h: "Yes",
    CRE_CPO_Status: "Negative",
    MRSA_Status: "Positive",
    VRE_Screening: "Negative"
  },
  {
    Surveillance_ID: 205,
    Patient_ID: 5,
    Swab_DateTime: new Date('2024-01-19T07:00:00'),
    CRE_CPO_MRSA_VRE_Last24h: "No",
    CRE_CPO_Status: "Negative",
    MRSA_Status: "Negative",
    VRE_Screening: "Positive"
  }
];