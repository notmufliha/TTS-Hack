-- Fake demo data (no real patients). Dates are relative to "now" in Singapore
-- time, so the 24-hour swab and 3-day imaging checks and the monthly report have
-- something to show whenever the seed is run. Run with: npm run db:setup

INSERT INTO patient (patient_id, patient_name, nric, age, gender) VALUES
(21, 'John Lim', 'S1234567A', 45, 'Male'),
(22, 'Mary Tan', 'S2345678B', 67, 'Female'),
(23, 'Robert Chen', 'S3456789C', 52, 'Male'),
(24, 'Sarah Wong', 'S4567890D', 38, 'Female'),
(25, 'David Koh', 'S5678901E', 71, 'Male'),
(26, 'Lisa Ng', 'S6789012F', 29, 'Female'),
(27, 'Michael Teo', 'S7890123G', 63, 'Male'),
(28, 'Jennifer Lee', 'S8901234H', 41, 'Female'),
(29, 'Kevin Ong', 'S9012345I', 55, 'Male'),
(30, 'Amanda Chua', 'S0123456J', 34, 'Female'),
(31, 'Tan Ah Kow', 'S1122334K', 78, 'Male'),
(32, 'Siti Rahman', 'S2233445L', 69, 'Female'),
(33, 'Rajesh Kumar', 'S3344556M', 74, 'Male');
SELECT setval('patient_patient_id_seq', (SELECT MAX(patient_id) FROM patient));

INSERT INTO referral_workflow (referral_id, referral_source, referral_system, referring_discipline, requires_ich_pso_readiness_screening, ich_surveillance_screening_checklist, requires_bipap_cpap_check, requires_additional_screening, comments, status) VALUES
('REF031', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Orthopaedic Surgery - Total Knee Replacement/Hip Fracture/Lower limb Fracture', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF032', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Orthopaedic Surgery', 'YES', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF033', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Geriatric Medicine - Frailty / Dementia', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF034', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Geriatric Medicine - GMU', 'NO', 'YES', 'YES', 'NO', 'Provided approval given by GRM Gatekeeper', 'Active'),
('REF035', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Geriatric Medicine', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF036', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'General Medicine', 'YES', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF037', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Neurology - Stroke', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF038', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Neurology', 'YES', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF039', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'General Surgery - Breast / Mastectomy', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF040', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'General Surgery', 'YES', 'YES', 'YES', 'YES', 'Complex surgical case', 'Active'),
('REF041', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Rehabilitation Medicine', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF042', 'Tan Tock Seng Hospital (TTSH)', 'EPIC / NGEMR', 'Neurology - Stroke', 'NO', 'YES', 'YES', 'NO', NULL, 'Active'),
('REF043', 'External EPIC (NUH)', 'EPIC', 'General Medicine', 'YES', 'YES', 'YES', 'NO', NULL, 'Active');

-- Already-processed referrals spread over the past two weeks, plus pending ones to screen.
INSERT INTO referral_order (referral_id, patient_id, order_datetime, comments, provider, community_hospital, ward_type, psychiatric_issues, iv_chemo_radiotherapy, parenteral_nutrition, bipap_cpap, tracheostomy_freq, oxygen_requirement, dialysis, referral_recommended_pt_ot, discharge_planning, special_precautions, isolation_infection_status, referral_status, reviewed_datetime, accepted_withdrawn_datetime, case_escalated_to_clinician, rejected_reason, psa_name) VALUES
('REF031', 21, LOCALTIMESTAMP - INTERVAL '12 days 3 hours', 'Orthopaedic surgery follow-up', 'TTSH', 'ICH', 'neuro/neuro-surg/ortho-surg', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, 'Mobility assistance', 'Clear', 'Accepted', LOCALTIMESTAMP - INTERVAL '12 days 2 hours', LOCALTIMESTAMP - INTERVAL '12 days 1 hour', FALSE, NULL, 'PSA 1'),
('REF032', 22, LOCALTIMESTAMP - INTERVAL '3 hours', 'Joint replacement candidate', 'SingHealth', 'ICH', 'neuro/neuro-surg/ortho-surg', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, 'Fall risk', 'MRSA screening', 'Pending', NULL, NULL, NULL, NULL, NULL),
('REF033', 23, LOCALTIMESTAMP - INTERVAL '10 days 5 hours', 'Geriatric assessment', 'NUHS', 'ICH', 'dementia', TRUE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, FALSE, TRUE, 'Dementia care', 'Clear', 'Rejected', LOCALTIMESTAMP - INTERVAL '10 days 4 hours', LOCALTIMESTAMP - INTERVAL '10 days 3 hours', FALSE, 'Dialysis: Present; Psychiatric or behavioural issues: Present', 'PSA 2'),
('REF034', 24, LOCALTIMESTAMP - INTERVAL '8 days 6 hours', 'GMU transfer approved', 'TTSH', 'ICH', 'gmu', FALSE, FALSE, FALSE, FALSE, '<=4hr', 1.0, FALSE, TRUE, FALSE, 'Cognitive assessment', 'Clear', 'Rejected', LOCALTIMESTAMP - INTERVAL '8 days 5 hours', LOCALTIMESTAMP - INTERVAL '7 days 22 hours', TRUE, 'Parenteral nutrition: Present', 'PSA 1'),
('REF035', 25, LOCALTIMESTAMP - INTERVAL '2 hours', 'Elderly care management', 'SingHealth', 'ICH', 'frailty', FALSE, FALSE, FALSE, TRUE, '<=4hr', 2.0, FALSE, TRUE, TRUE, 'Full assistance', 'Clear', 'Pending', NULL, NULL, NULL, NULL, NULL),
('REF036', 26, LOCALTIMESTAMP - INTERVAL '6 days 2 hours', 'General medical condition', 'NUHS', 'ICH', 'general SA', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, 'Medication management', 'VRE screening', 'Rejected', LOCALTIMESTAMP - INTERVAL '6 days 1 hour', LOCALTIMESTAMP - INTERVAL '6 days 30 minutes', FALSE, 'Psychiatric or behavioural issues: Present; Suicidal precaution: Present', 'PSA 3'),
('REF037', 27, LOCALTIMESTAMP - INTERVAL '5 days 4 hours', 'Post-stroke rehabilitation', 'TTSH', 'ICH', 'general IR', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, FALSE, 'Physical therapy', 'Clear', 'Withdrawn', NULL, LOCALTIMESTAMP - INTERVAL '5 days', NULL, NULL, 'PSA 2'),
('REF038', 28, LOCALTIMESTAMP - INTERVAL '4 days 2 hours', 'Neurological disorder', 'NCID', 'ICH', 'neuro/neuro-surg/ortho-surg', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, 'Seizure precautions', 'Pending screening', 'Rejected', LOCALTIMESTAMP - INTERVAL '4 days 1 hour', LOCALTIMESTAMP - INTERVAL '4 days 40 minutes', FALSE, 'IV chemotherapy / radiotherapy: Present', 'PSA 4'),
('REF039', 29, LOCALTIMESTAMP - INTERVAL '90 minutes', 'Post-mastectomy care', 'NUHS', 'ICH', 'general SA', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, FALSE, TRUE, 'Wound care', 'Clear', 'Pending', NULL, NULL, NULL, NULL, NULL),
('REF040', 30, LOCALTIMESTAMP - INTERVAL '2 days 6 hours', 'Surgical follow-up', 'TTSH', 'ICH', 'general IR', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, FALSE, 'Pain management', 'Clear', 'Accepted', LOCALTIMESTAMP - INTERVAL '2 days 5 hours', LOCALTIMESTAMP - INTERVAL '2 days 2 hours', TRUE, NULL, 'PSA 3'),
('REF041', 31, LOCALTIMESTAMP - INTERVAL '1 hour', 'Hip fracture, for tertiary rehab', 'TTSH', 'ICH', 'general IR', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, 'Fall risk', 'Clear', 'Pending', NULL, NULL, NULL, NULL, NULL),
('REF042', 32, LOCALTIMESTAMP - INTERVAL '45 minutes', 'Stroke, for intermediate rehab', 'TTSH', 'ICH', 'general IR', FALSE, FALSE, FALSE, FALSE, '<=4hr', 1.0, FALSE, TRUE, TRUE, 'Dysphagia', 'Clear', 'Pending', NULL, NULL, NULL, NULL, NULL),
('REF043', 33, LOCALTIMESTAMP - INTERVAL '30 minutes', 'Pneumonia recovery, sub-acute care', 'NUH', 'ICH', 'general SA', FALSE, FALSE, FALSE, FALSE, '<=4hr', 0.0, FALSE, TRUE, TRUE, NULL, 'MRSA positive', 'Pending', NULL, NULL, NULL, NULL, NULL);

-- tracheostomy_freq: 'less_than_4hr' = suctioning less frequent than 4-hourly (OK),
-- 'more_than_4hr' = more frequent than 4-hourly (exclusion).
INSERT INTO patient_medical_history (patient_id, iv_chemo_radiotherapy, dialysis, parenteral_nutrition, psychiatric_issues, suicidal_precaution, bipap_cpap, tracheostomy_freq, temperature, systolic_bp, diastolic_bp, pulse, respiratory_rate, spo2, oxygen_level, special_circumstance, last_updated) VALUES
(21, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 36.8, 120, 80, 75, 16, 98, 0.0, NULL, LOCALTIMESTAMP - INTERVAL '12 days 4 hours'),
(22, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, 'less_than_4hr', 37.2, 135, 85, 82, 18, 95, 2.5, 'Hypertension', LOCALTIMESTAMP - INTERVAL '4 hours'),
(23, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, 'more_than_4hr', 36.5, 118, 78, 68, 14, 99, 0.0, 'Renal failure', LOCALTIMESTAMP - INTERVAL '10 days 6 hours'),
(24, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, 'less_than_4hr', 37.8, 125, 82, 88, 20, 96, 1.0, 'Post-surgery', LOCALTIMESTAMP - INTERVAL '8 days 7 hours'),
(25, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, 'more_than_4hr', 36.9, 142, 90, 92, 22, 92, 3.0, 'Multiple comorbidities', LOCALTIMESTAMP - INTERVAL '3 hours'),
(26, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'less_than_4hr', 37.1, 115, 75, 72, 16, 98, 0.0, 'Psychiatric care', LOCALTIMESTAMP - INTERVAL '6 days 3 hours'),
(27, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 36.7, 128, 84, 76, 15, 97, 0.0, 'Diabetes', LOCALTIMESTAMP - INTERVAL '5 days 5 hours'),
(28, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 37.3, 122, 79, 80, 17, 96, 1.5, 'Cancer treatment', LOCALTIMESTAMP - INTERVAL '4 days 3 hours'),
(29, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'more_than_4hr', 36.6, 138, 88, 84, 19, 94, 2.0, 'Renal dialysis', LOCALTIMESTAMP - INTERVAL '2 hours'),
(30, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 'less_than_4hr', 37.0, 119, 77, 70, 16, 98, 2.5, 'Sleep apnea', LOCALTIMESTAMP - INTERVAL '2 days 7 hours'),
-- New pending demo cases: 31 should be accepted, 32 escalated (fever + Doppler
-- tomorrow), 33 accepted with an isolation bed (MRSA positive, external).
(31, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 36.6, 132, 78, 72, 16, 97, 0.0, NULL, LOCALTIMESTAMP - INTERVAL '2 hours'),
(32, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 37.8, 158, 92, 96, 18, 95, 1.0, NULL, LOCALTIMESTAMP - INTERVAL '1 hour'),
(33, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'less_than_4hr', 36.9, 126, 74, 84, 18, 96, 0.0, NULL, LOCALTIMESTAMP - INTERVAL '50 minutes');

INSERT INTO appointment (patient_id, appointment_date, appointment_type, status, notes) VALUES
(21, LOCALTIMESTAMP - INTERVAL '20 days', 'Follow-up', 'Completed', 'Routine checkup'),
(22, CURRENT_DATE + INTERVAL '10 days 10 hours', 'Consultation', 'Scheduled', 'Post-treatment review'),
(23, LOCALTIMESTAMP - INTERVAL '9 days', 'Dialysis', 'Completed', 'Regular dialysis session'),
(25, CURRENT_DATE + INTERVAL '1 day 8 hours', 'Multi-disciplinary', 'Scheduled', 'Team meeting'),
(27, CURRENT_DATE + INTERVAL '6 days 15 hours', 'Diabetes Review', 'Scheduled', 'Blood sugar monitoring'),
(28, CURRENT_DATE + INTERVAL '5 days 9 hours', 'Chemotherapy', 'Scheduled', 'Cycle 3 treatment'),
(30, CURRENT_DATE + INTERVAL '9 days 10 hours', 'Sleep Study', 'Scheduled', 'CPAP adjustment'),
(31, CURRENT_DATE + INTERVAL '14 days 9 hours', 'Orthopaedic Clinic', 'Scheduled', 'Post-op review'),
(32, CURRENT_DATE + INTERVAL '1 day 14 hours', 'US Doppler Venous Limb Left', 'Scheduled', 'Rule out DVT'),
(33, LOCALTIMESTAMP - INTERVAL '3 days', 'Chest X-Ray', 'Completed', 'Follow-up film');

INSERT INTO readiness_screening_checklist (patient_id, history_id, screening_datetime, screening_result, notes) VALUES
(21, 1, LOCALTIMESTAMP - INTERVAL '12 days 2 hours', 'Ready', 'All readiness criteria met'),
(23, 3, LOCALTIMESTAMP - INTERVAL '10 days 4 hours', 'Not Ready', 'Dialysis: Present; Psychiatric or behavioural issues: Present'),
(24, 4, LOCALTIMESTAMP - INTERVAL '8 days 5 hours', 'Not Ready', 'Parenteral nutrition: Present'),
(26, 6, LOCALTIMESTAMP - INTERVAL '6 days 1 hour', 'Not Ready', 'Psychiatric or behavioural issues: Present; Suicidal precaution: Present'),
(28, 8, LOCALTIMESTAMP - INTERVAL '4 days 1 hour', 'Not Ready', 'IV chemotherapy / radiotherapy: Present'),
(30, 10, LOCALTIMESTAMP - INTERVAL '2 days 5 hours', 'Ready', 'Escalated to clinician: Oxygen out of range | Clinician decision: Accepted');

INSERT INTO swab (patient_id, swab_type, swab_date, result, result_date, swab_location, notes) VALUES
(21, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '12 days 6 hours', 'negative', LOCALTIMESTAMP - INTERVAL '12 days 2 hours', 'Rectal', 'Routine screening'),
(21, 'MRSA', LOCALTIMESTAMP - INTERVAL '12 days 6 hours', 'negative', LOCALTIMESTAMP - INTERVAL '12 days 2 hours', 'Nose', 'Routine screening'),
(22, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '5 days', 'positive', LOCALTIMESTAMP - INTERVAL '4 days', 'Rectal', 'Known CRE carrier'),
(22, 'MRSA', LOCALTIMESTAMP - INTERVAL '10 hours', 'negative', LOCALTIMESTAMP - INTERVAL '5 hours', 'Nose', 'Recent screening'),
(22, 'VRE', LOCALTIMESTAMP - INTERVAL '10 hours', 'negative', LOCALTIMESTAMP - INTERVAL '5 hours', 'Rectal', 'Recent screening'),
(24, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '8 days', 'pending', NULL, 'Rectal', 'Requested day of transfer'),
(24, 'MRSA', LOCALTIMESTAMP - INTERVAL '8 days', 'pending', NULL, 'Nose', 'Requested day of transfer'),
(25, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '6 hours', 'pending', NULL, 'Rectal', 'External referral'),
(25, 'MRSA', LOCALTIMESTAMP - INTERVAL '6 hours', 'negative', LOCALTIMESTAMP - INTERVAL '2 hours', 'Nose', 'External referral'),
(29, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '8 hours', 'negative', LOCALTIMESTAMP - INTERVAL '4 hours', 'Rectal', 'External referral'),
(29, 'MRSA', LOCALTIMESTAMP - INTERVAL '8 hours', 'negative', LOCALTIMESTAMP - INTERVAL '4 hours', 'Nose', 'External referral'),
(29, 'VRE', LOCALTIMESTAMP - INTERVAL '8 hours', 'pending', NULL, 'Rectal', 'External referral'),
(31, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '6 hours', 'negative', LOCALTIMESTAMP - INTERVAL '2 hours', 'Rectal', 'Pre-transfer screening'),
(31, 'MRSA', LOCALTIMESTAMP - INTERVAL '6 hours', 'negative', LOCALTIMESTAMP - INTERVAL '2 hours', 'Nose', 'Pre-transfer screening'),
(32, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '30 hours', 'negative', LOCALTIMESTAMP - INTERVAL '26 hours', 'Rectal', 'Routine screening'),
(33, 'CRE_CPO', LOCALTIMESTAMP - INTERVAL '20 hours', 'negative', LOCALTIMESTAMP - INTERVAL '16 hours', 'Rectal', 'External referral'),
(33, 'MRSA', LOCALTIMESTAMP - INTERVAL '20 hours', 'positive', LOCALTIMESTAMP - INTERVAL '16 hours', 'Nose', 'Isolation needed'),
(33, 'VRE', LOCALTIMESTAMP - INTERVAL '20 hours', 'negative', LOCALTIMESTAMP - INTERVAL '16 hours', 'Rectal', 'External referral');

INSERT INTO surveillance_checklist (patient_id, last_swab_datetime, cre_cpo_mrsa_vre_last24h, cre_cpo_status, mrsa_status, vre_screening) VALUES
(21, LOCALTIMESTAMP - INTERVAL '12 days 6 hours', 'No', 'negative', 'negative', 'internal'),
(22, LOCALTIMESTAMP - INTERVAL '10 hours', 'No', 'positive', 'negative', 'external'),
(31, LOCALTIMESTAMP - INTERVAL '6 hours', 'Yes', 'negative', 'negative', 'internal'),
(33, LOCALTIMESTAMP - INTERVAL '20 hours', 'No', 'negative', 'positive', 'external');
