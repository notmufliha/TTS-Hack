-- Mock EPIC database for the ICH PSO referral triage demo.
-- Based on the team schema, with fixes: referral_workflow.status added, the
-- referral_order ALTER statements merged in, and referral_order defined once.

DROP TABLE IF EXISTS swab, surveillance_checklist, readiness_screening_checklist,
  referral_order, referral_workflow, appointment, patient_medical_history, patient CASCADE;

CREATE TABLE patient (
    patient_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    nric VARCHAR(20) UNIQUE NOT NULL,
    age INT,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_medical_history (
    history_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    iv_chemo_radiotherapy BOOLEAN DEFAULT FALSE,
    dialysis BOOLEAN DEFAULT FALSE,
    parenteral_nutrition BOOLEAN DEFAULT FALSE,
    psychiatric_issues BOOLEAN DEFAULT FALSE,
    suicidal_precaution BOOLEAN DEFAULT FALSE,
    bipap_cpap BOOLEAN DEFAULT FALSE,
    tracheostomy_freq VARCHAR(20) CHECK (tracheostomy_freq IN ('less_than_4hr', 'more_than_4hr')) DEFAULT 'less_than_4hr',
    temperature DECIMAL(4,1),
    systolic_bp INT,
    diastolic_bp INT,
    pulse INT,
    respiratory_rate INT,
    spo2 INT,
    oxygen_level DECIMAL(3,1),
    special_circumstance VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    appointment_date TIMESTAMP,
    appointment_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('Scheduled','Completed','Cancelled','No-Show')) DEFAULT 'Scheduled',
    notes TEXT
);

CREATE TABLE referral_workflow (
    referral_id VARCHAR(10) PRIMARY KEY,
    referral_source VARCHAR(100),
    referral_system VARCHAR(100),
    referring_discipline VARCHAR(200),
    requires_ich_pso_readiness_screening VARCHAR(3) CHECK (requires_ich_pso_readiness_screening IN ('YES', 'NO')),
    ich_surveillance_screening_checklist VARCHAR(3) CHECK (ich_surveillance_screening_checklist IN ('YES', 'NO')),
    requires_bipap_cpap_check VARCHAR(3) CHECK (requires_bipap_cpap_check IN ('YES', 'NO')),
    requires_additional_screening VARCHAR(3) CHECK (requires_additional_screening IN ('YES', 'NO')),
    comments TEXT,
    status VARCHAR(20)
);

CREATE TABLE referral_order (
    order_id SERIAL PRIMARY KEY,
    referral_id VARCHAR(10) NOT NULL REFERENCES referral_workflow(referral_id),
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    order_datetime TIMESTAMP NOT NULL,
    comments TEXT,
    provider VARCHAR(100),
    community_hospital VARCHAR(100),
    ward_type VARCHAR(50),
    psychiatric_issues BOOLEAN,
    iv_chemo_radiotherapy BOOLEAN,
    parenteral_nutrition BOOLEAN,
    bipap_cpap BOOLEAN,
    tracheostomy_freq VARCHAR(10) CHECK (tracheostomy_freq IN ('>4hr', '<=4hr')),
    oxygen_requirement DECIMAL(3,1),
    dialysis BOOLEAN,
    referral_recommended_pt_ot BOOLEAN,
    discharge_planning BOOLEAN,
    special_precautions TEXT,
    isolation_infection_status TEXT,
    reviewed_datetime TIMESTAMP NULL,
    accepted_withdrawn_datetime TIMESTAMP NULL,
    referral_status VARCHAR(20) CHECK (referral_status IN ('Pending','Accepted','Rejected','Withdrawn','Cancelled')) DEFAULT 'Pending',
    case_escalated_to_clinician BOOLEAN NULL,
    rejected_reason TEXT NULL,
    additional_comments TEXT NULL,
    psa_name VARCHAR(100) NULL,
    case_cancelled_reason TEXT NULL,
    case_cancelled_date DATE NULL,
    case_cancelled_time TIME NULL,
    case_cancelled_by VARCHAR(10) CHECK (case_cancelled_by IN ('PSA 1','PSA 2','PSA 3','PSA 4')),
    tat_order_to_accept TIME NULL,
    tat_order_to_reject TIME NULL,
    tat_order_to_withdraw TIME NULL,
    tat_order_to_cancel TIME NULL,
    -- Screening results written back by the triage app
    xray_aims_modalities BOOLEAN DEFAULT FALSE,
    ultrasound_doppler BOOLEAN DEFAULT FALSE,
    ultrasound_scans BOOLEAN DEFAULT FALSE,
    temperature BOOLEAN DEFAULT FALSE,
    systolic_bp BOOLEAN DEFAULT FALSE,
    pulse BOOLEAN DEFAULT FALSE,
    respiratory_rate BOOLEAN DEFAULT FALSE,
    spo2 BOOLEAN DEFAULT FALSE,
    oxygen_level BOOLEAN DEFAULT FALSE,
    suicidal_precaution BOOLEAN DEFAULT FALSE,
    tracheostomy BOOLEAN DEFAULT FALSE
);

CREATE TABLE readiness_screening_checklist (
    readiness_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    history_id INT NOT NULL REFERENCES patient_medical_history(history_id),
    screening_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    screening_result VARCHAR(20) CHECK (screening_result IN ('Ready', 'Not Ready', 'Pending')) DEFAULT 'Pending',
    notes TEXT
);

CREATE TABLE surveillance_checklist (
    checklist_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    last_swab_datetime TIMESTAMP,
    cre_cpo_mrsa_vre_last24h VARCHAR(3) CHECK (cre_cpo_mrsa_vre_last24h IN ('Yes', 'No')),
    cre_cpo_status VARCHAR(20) CHECK (cre_cpo_status IN ('positive', 'pending', 'external', 'unknown','negative')),
    mrsa_status VARCHAR(20) CHECK (mrsa_status IN ('positive', 'pending', 'external', 'unknown','negative')),
    vre_screening VARCHAR(20) CHECK (vre_screening IN ('internal', 'external', 'unknown'))
);

CREATE TABLE swab (
    swab_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(patient_id),
    swab_type VARCHAR(20) CHECK (swab_type IN ('CRE_CPO', 'MRSA', 'VRE')) NOT NULL,
    swab_date TIMESTAMP NOT NULL,
    result VARCHAR(20) CHECK (result IN ('positive', 'negative', 'pending')) NOT NULL,
    result_date TIMESTAMP,
    swab_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
