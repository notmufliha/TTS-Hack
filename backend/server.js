const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const querystring = require("querystring");
const url = require("url");
const cheerio = require("cheerio");
const axios = require("axios");
const { Pool } = require("pg");
const routes = require("./routes/router");
// Create Express app
const app = express();
const port = process.env.PORT || 8000;
const hostname = "127.0.0.1";
const puppeteer = require("puppeteer");

// Database configuration
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Check appointments function at TOP LEVEL
async function checkPatientAppointments(patientIdAge) {
  try {
    // Scrape the appointments website
    const scraper = new MedicalTableScraper();
    await scraper.init();

    const appointmentsUrl =
      "http://localhost:3000/routes/referral-management/appointments";
    const appointmentData = await scraper.scrapeAppointmentTable(
      appointmentsUrl
    );

    if (scraper && typeof scraper.close === "function") {
      await scraper.close();
    }

    // Use ML classifier to analyze appointments with the original patient ID
    const appointmentAnalysis =
      await MyClassificationPipeline.analyzeAppointments(
        appointmentData,
        patientIdAge
      );

    return {
      ...appointmentAnalysis,
      input_patient_id: patientIdAge,
    };
  } catch (error) {
    console.error("Error checking appointments:", error);
    return {
      hasUpcomingAppointments: false,
      appointments: [],
      error: error.message,
    };
  }
}

// Transformers.js pipeline for zero-shot classification
class MyClassificationPipeline {
  static task = "zero-shot-classification";
  static model = "Xenova/mobilebert-uncased-mnli";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // Dynamically import the Transformers.js library
      let { pipeline, env } = await import("@huggingface/transformers");

      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
  // Parse table data and extract structured information
  static parseTableData(medicalHistories, patients) {
    return medicalHistories.map((history) => {
      const patient = patients.find((p) => p.patient_id === history.patient_id);
      return {
        patient_id: history.patient_id,
        patient_name: patient?.patient_name || `Patient ${history.patient_id}`,
        age: patient?.age,
        gender: patient?.gender,
        // Medical conditions
        iv_chemo_radiotherapy: history.iv_chemo_radiotherapy,
        dialysis: history.dialysis,
        parenteral_nutrition: history.parenteral_nutrition,
        psychiatric_issues: history.psychiatric_issues,
        suicidal_precaution: history.suicidal_precaution,
        bipap_cpap: history.bipap_cpap,
        tracheostomy_freq: history.tracheostomy_freq,
        // Vitals
        temperature: history.temperature,
        systolic_bp: history.systolic_bp,
        diastolic_bp: history.diastolic_bp,
        pulse: history.pulse,
        spo2: history.spo2,
        respiratory_rate: history.respiratory_rate,
        oxygen_level: history.oxygen_level,
        // Special notes
        special_circumstance: history.special_circumstance,
        last_updated: history.last_updated,
      };
    });
  }

  static evaluateTracheostomyFrequency(frequency) {
    if (!frequency || frequency === "null" || frequency === "NIL") return true; // No tracheostomy is acceptable

    // Handle various frequency formats
    const freqStr = frequency.toString().toLowerCase().trim();
    console.log(`Parsing tracheostomy frequency: "${freqStr}"`);

    // Check for "less than" patterns - this is what we want
    if (
      freqStr.includes("less than") ||
      freqStr.includes("<") ||
      freqStr.includes("less than_4hr")
    ) {
      // If it explicitly says "less than", it meets our criteria
      return true;
    }

    // Check for "X hourly" pattern - we want >4 hours
    const hourlyMatch = freqStr.match(/(\d+)\s*hourly/);
    if (hourlyMatch) {
      const hours = parseInt(hourlyMatch[1]);
      return hours > 4; // Less frequent than 4 hourly means >4 hours
    }

    // If we can't determine, assume it doesn't meet criteria
    return false;
  }

  static analyzePatientById(tableData, patientId, questions) {
    // Filter all rows for this patient ID
    const patientRows = tableData.filter((p) => p.patient_id === patientId);
    if (patientRows.length === 0) {
      return { error: `Patient with ID ${patientId} not found` };
    }

    // Sort by last_updated date (most recent first) and take the first one
    const patient = patientRows.sort((a, b) => {
      const dateA = new Date(a.last_updated);
      const dateB = new Date(b.last_updated);
      return dateB - dateA; // Descending order (most recent first)
    })[0];
    const results = {};

    questions.forEach((question) => {
      if (question.type === "boolean") {
        // For NIL conditions, we want them to be false
        results[question.key] = patient[question.key] === false;
      } else if (question.type === "numeric_range") {
        results[question.key] = this.evaluateNumericRange(
          patient[question.key],
          question.min,
          question.max,
          question.operator
        );
      } else if (question.type === "tracheostomy") {
        results[question.key] = this.evaluateTracheostomyFrequency(
          patient[question.key]
        );
      }
    });

    return {
      patient_id: patientId,
      patient_name: patient.patient_name,
      analysis: results,
      raw_data: patient,
    };
  }

  static evaluateNumericRange(value, min, max, operator) {
    if (value === null || value === undefined || isNaN(value)) return false;

    const numValue = parseFloat(value);

    switch (operator) {
      case "between":
        return numValue >= min && numValue <= max;
      case "less_than_equal":
        return numValue <= max;
      case "greater_than_equal":
        return numValue >= min;
      case "less_than":
        return numValue < max;
      case "greater_than":
        return numValue > min;
      default:
        return false;
    }
  }

  // Use ML for complex queries
  static async interpretComplexQuery(tableData, query) {
    const classifier = await this.getInstance();

    const candidate_labels = [
      "chemo therapy present",
      "oxygen level low",
      "high blood pressure",
      "psychiatric condition",
      "respiratory issues",
      "critical condition",
      "stable condition",
    ];

    const result = await classifier(query, candidate_labels);

    // Find the best matching label and analyze data accordingly
    const bestMatchIndex = result.scores.indexOf(Math.max(...result.scores));
    const bestLabel = result.labels[bestMatchIndex];

    return {
      query,
      interpretation: bestLabel,
      confidence: result.scores[bestMatchIndex],
      relevant_patients: this.findRelevantPatients(tableData, bestLabel),
    };
  }

  static findRelevantPatients(tableData, condition) {
    switch (condition.toLowerCase()) {
      case "chemo therapy present":
        return tableData.filter((p) => p.iv_chemo_radiotherapy);
      case "oxygen level low":
        return tableData.filter((p) => p.oxygen_level < 2);
      case "high blood pressure":
        return tableData.filter(
          (p) => p.systolic_bp > 140 || p.diastolic_bp > 90
        );
      case "psychiatric condition":
        return tableData.filter(
          (p) => p.psychiatric_issues || p.suicidal_precaution
        );
      case "respiratory issues":
        return tableData.filter((p) => p.bipap_cpap || p.respiratory_rate > 20);
      default:
        return [];
    }
  }
  static async analyzeAppointments(appointmentData, patientId) {
    try {
      const classifier = await this.getInstance();

      const patientAppointments = appointmentData.filter(
        (app) => app.patient_id === patientId.toString()
      );

      // Modalities & keywords for deterministic checks
      const modalityKeywords = {
        xrays_and_aims_modalities: ["x-ray", "xrays", "aims"],
        ultrasound_doppler: ["doppler"],
        ultrasound_scans: ["ultrasound", "usg"],
      };

      // Helper: Check appointment type and date via deterministic logic
      const appointmentIsRelevant = (type, dateStr, todayStr) => {
        const dateObj = new Date(dateStr);
        const todayObj = new Date(todayStr);
        const diffDays = Math.ceil(
          (dateObj - todayObj) / (1000 * 60 * 60 * 24)
        );
        if (diffDays < 0 || diffDays > 3) return null; // Not within next 3 days

        for (const [modality, keywords] of Object.entries(modalityKeywords)) {
          if (
            keywords.some((keyword) => type.toLowerCase().includes(keyword))
          ) {
            return modality;
          }
        }
        return null; // No match
      };

      const today = new Date().toISOString().split("T")[0];

      if (patientAppointments.length === 0) {
        return {
          hasUpcomingAppointments: false,
          appointments: [],
          modalityResults: {
            xrays_and_aims_modalities: false,
            ultrasound_doppler: false,
            ultrasound_scans: false,
          },
          message: "No appointments found for patient",
        };
      }

      const modalityResults = {
        xrays_and_aims_modalities: false,
        ultrasound_doppler: false,
        ultrasound_scans: false,
      };

      const relevantAppointments = [];

      for (const appointment of patientAppointments) {
        // Run classifier
        const classificationCheck = await classifier(
          `Medical appointment classification:\n- Type: ${appointment.appointment_type}\n- Date: ${appointment.appointment_date}\n- Today: ${today}\n\nIs this appointment for X-rays and AIMS modalities OR Ultrasound Doppler OR Ultrasound scans, AND occurring within the next 3 days?`,
          [
            "xrays_and_aims_within_3_days",
            "ultrasound_doppler_within_3_days",
            "ultrasound_scans_within_3_days",
            "not_relevant_appointment",
          ]
        );

        // Higher confidence threshold
        const bestMatch = classificationCheck.labels[0];
        const confidence = classificationCheck.scores[0];
        const fullScores = Object.fromEntries(
          classificationCheck.labels.map((label, i) => [
            label,
            classificationCheck.scores[i],
          ])
        );

        // Deterministic rule check
        const deterministicModality = appointmentIsRelevant(
          appointment.appointment_type,
          appointment.appointment_date,
          today
        );

        let isRelevant = false;
        let finalModality = null;
        // Accept classifier if confidence is very high
        if (confidence >= 0.7 && bestMatch !== "not_relevant_appointment") {
          isRelevant = true;
          finalModality = bestMatch.replace("_within_3_days", "");
        }
        // Else, trust deterministic rule if classifier is unsure
        else if (deterministicModality) {
          isRelevant = true;
          finalModality = deterministicModality;
        }

        if (isRelevant) {
          modalityResults[finalModality] = true;
          relevantAppointments.push({
            appointment_id: appointment.appointment_id,
            patient_id: appointment.patient_id,
            patient_name: appointment.patient_name,
            type: appointment.appointment_type,
            date: appointment.appointment_date,
            status: appointment.status,
            matched_modality: finalModality,
            classifier_label: bestMatch,
            classifier_confidence: confidence,
            classifier_scores: fullScores,
            is_within_three_days: true,
          });
        }
      }

      const hasUpcomingAppointments = Object.values(modalityResults).some(
        (value) => value === true
      );

      const result = {
        hasUpcomingAppointments,
        appointments: relevantAppointments,
        modalityResults,
        totalAppointments: patientAppointments.length,
        relevantCount: relevantAppointments.length,
        check_period: "next_3_days",
        check_timestamp: new Date().toISOString(),
      };

      // For debugging: result includes classifier scores per appointment
      return result;
    } catch (error) {
      console.error("Error analyzing appointments:", error);
      return {
        hasUpcomingAppointments: false,
        appointments: [],
        modalityResults: {
          xrays_and_aims_modalities: false,
          ultrasound_doppler: false,
          ultrasound_scans: false,
        },
        error: error.message,
      };
    }
  }

  static async analyzeSwabScreening(patientSwabs, patientId, providerSource) {
    try {
      const classifier = await MyClassificationPipeline.getInstance();

      // Get current time for context
      const now = new Date();
      const currentTimeISO = now.toISOString();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const windowStartISO = twentyFourHoursAgo.toISOString();

      // PRE-VALIDATION: Check obvious cases before using classifier
      const requiredTypes = ["cre", "cpo", "mrsa", "vre"];

      // Count how many required types have valid negative swabs within 24 hours
      let validTypeCount = 0;

      for (const type of requiredTypes) {
        const hasValidSwab = patientSwabs.some((swab) => {
          if (!swab.swab_type || !swab.result || !swab.swab_date) return false;

          const swabType = swab.swab_type.toLowerCase();
          const swabResult = swab.result.toLowerCase();
          const swabDate = new Date(swab.swab_date);
          console.log(swabType, swabResult);

          // Check if this swab matches the type and is valid
          const typeMatch =
            (type === "cre" &&
              (swabType.includes("cre") || swabType === "cre_cpo")) ||
            (type === "cpo" &&
              (swabType.includes("cpo") || swabType === "cre_cpo")) ||
            (type === "mrsa" && swabType.includes("mrsa")) ||
            (type === "vre" && swabType.includes("vre"));

          return (
            typeMatch &&
            swabResult === "negative" &&
            swabDate >= twentyFourHoursAgo &&
            swabDate <= now
          );
        });

        if (hasValidSwab) validTypeCount++;
      }

      // If we don't have all 4 types with valid negative swabs, skip to detailed screening
      if (validTypeCount < 4) {
        console.log(
          `Pre-validation failed: Only ${validTypeCount}/4 required types have valid negative swabs within 24 hours`
        );

        // Continue with individual screenings...
        const swabSummary = patientSwabs
          .map((s) => `${s.swab_type}:${s.result}:${s.swab_date}`)
          .join("; ");

        // STEP 2: CRE/CPO Screening
        const step2Prompt = `Swabs: ${swabSummary}. Current: ${currentTimeISO}. CRE CPO status?`;
        const step2Choices = [
          "known_positive_isolate",
          "known_negative_no_action",
          "unknown_request_swab",
        ];
        const step2Result = await classifier(step2Prompt, step2Choices);
        const step2Label = step2Result.labels[0];

        // STEP 3: MRSA Screening
        const step3Prompt = `Swabs: ${swabSummary}. Current: ${currentTimeISO}. MRSA status?`;
        const step3Choices = [
          "known_positive_isolate",
          "known_negative_no_action",
          "unknown_request_swab",
        ];
        const step3Result = await classifier(step3Prompt, step3Choices);
        const step3Label = step3Result.labels[0];

        // STEP 4: VRE Screening
        let step4Result;
        const providerLower = (providerSource || "").toLowerCase();

        if (providerLower.includes("ttsh") || providerLower.includes("ncid")) {
          step4Result = {
            type: "VRE Screening",
            status: "internal",
            result: null,
            recommendation:
              "No VRE screening needed (Internal TTSH/NCID patient)",
            is_internal_patient: true,
          };
        } else {
          const step4Prompt = `Swabs: ${swabSummary}. Current: ${currentTimeISO}. VRE status?`;
          const step4Choices = [
            "known_positive_isolate",
            "known_negative_no_action",
            "unknown_request_swab",
          ];
          const step4ResultRaw = await classifier(step4Prompt, step4Choices);
          const step4Label = step4ResultRaw.labels[0];

          step4Result = {
            type: "VRE Screening",
            status:
              step4Label === "known_positive_isolate"
                ? "known_positive"
                : step4Label === "known_negative_no_action"
                ? "known_negative"
                : "unknown",
            result:
              step4Label === "known_positive_isolate"
                ? "positive"
                : step4Label === "known_negative_no_action"
                ? "negative"
                : null,
            recommendation:
              step4Label === "known_positive_isolate"
                ? "Plan admission + Inform BMU for isolation bed"
                : step4Label === "known_negative_no_action"
                ? "No action needed"
                : "Request swab on transfer day",
            is_internal_patient: false,
            classifier_confidence: step4ResultRaw.scores[0],
          };
        }

        // Common result mapping
        const getScreeningResult = (label) => ({
          status:
            label === "known_positive_isolate"
              ? "known_positive"
              : label === "known_negative_no_action"
              ? "known_negative"
              : "unknown",
          result:
            label === "known_positive_isolate"
              ? "positive"
              : label === "known_negative_no_action"
              ? "negative"
              : null,
          recommendation:
            label === "known_positive_isolate"
              ? "Plan admission + Inform BMU for isolation bed"
              : label === "known_negative_no_action"
              ? "No action needed"
              : "Request swab on transfer day",
        });

        const step2Final = getScreeningResult(step2Label);
        const step3Final = getScreeningResult(step3Label);

        const screeningResults = [
          step2Final,
          step3Final,
          step4Result.is_internal_patient ? null : step4Result,
        ].filter(Boolean);

        const pending_swabs = screeningResults.filter(
          (s) => s.status === "unknown"
        ).length;
        const requires_isolation = screeningResults.some(
          (s) => s.result === "positive"
        );

        return {
          step_1: {
            question: "Valid negative swabs within 24 hours?",
            has_valid_recent_swabs: false,
            classifier_confidence: 0,
            pre_validation_result: `Only ${validTypeCount}/4 types valid`,
            recommendation: "Continue to Step 2",
          },
          step_2: {
            type: "CRE/CPO Screening",
            ...step2Final,
            classifier_confidence: step2Result.scores[0],
          },
          step_3: {
            type: "MRSA Screening",
            ...step3Final,
            classifier_confidence: step3Result.scores[0],
          },
          step_4: step4Result,
          screening_summary: {
            can_transfer_directly: false,
            requires_isolation,
            pending_swabs,
          },
        };
      }

      // Only use classifier for step 1 if pre-validation passes
      const step1Prompt = `Swabs: ${patientSwabs
        .map((s) => `${s.swab_type}:${s.result}:${s.swab_date}`)
        .join(
          "; "
        )}. Current: ${currentTimeISO}. All four negative CRE CPO MRSA VRE in last 24 hours?`;

      const step1Choices = [
        "yes_valid_recent_negative_swabs",
        "no_valid_recent_swabs",
      ];
      const step1Result = await classifier(step1Prompt, step1Choices);
      const hasValidRecentSwabs =
        step1Result.labels[0] === "yes_valid_recent_negative_swabs" &&
        step1Result.scores[0] > 0.6;

      if (hasValidRecentSwabs) {
        return {
          step_1: {
            question: "Valid negative swabs within 24 hours?",
            has_valid_recent_swabs: true,
            classifier_confidence: step1Result.scores[0],
            recommendation: "Transfer directly to ICH",
          },
          step_2: null,
          step_3: null,
          step_4: null,
          screening_summary: {
            can_transfer_directly: true,
            requires_isolation: false,
            pending_swabs: 0,
          },
        };
      }

      // ... rest of the individual screening logic
    } catch (error) {
      console.error("Error in swab screening analysis:", error);

      return {
        step_1: {
          question: "Valid negative swabs within 24 hours?",
          has_valid_recent_swabs: false,
          classifier_confidence: 0,
          recommendation: "System error - proceed with screening",
        },
        step_2: {
          type: "CRE/CPO Screening",
          status: "unknown",
          result: null,
          recommendation: "Request swab on transfer day",
          classifier_confidence: 0,
        },
        step_3: {
          type: "MRSA Screening",
          status: "unknown",
          result: null,
          recommendation: "Request swab on transfer day",
          classifier_confidence: 0,
        },
        step_4: {
          type: "VRE Screening",
          status: "unknown",
          result: null,
          recommendation: "Request swab on transfer day",
          is_internal_patient: false,
        },
        screening_summary: {
          can_transfer_directly: false,
          requires_isolation: false,
          pending_swabs: 3,
        },
        error: "Classification failed",
      };
    }
  }

  static isWithin24Hours(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return date >= twentyFourHoursAgo && date <= now;
  }
}

class MedicalTableScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1200, height: 800 });
  }

  async scrapeMedicalTable(websiteUrl, authCredentials = null) {
    try {
      console.log(`Navigating to: ${websiteUrl}`);
      await this.page.goto(websiteUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Handle authentication if provided
      if (authCredentials) {
        await this.handleAuthentication(authCredentials);
      }

      // Wait for the table to load with more specific selector
      await this.page.waitForSelector("table.w-full", { timeout: 15000 });

      // Wait a bit more for React to finish rendering
      (await this.page.waitForTimeout)
        ? await this.page.waitForTimeout(2000)
        : await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Table found, starting data extraction...");

      const tableData = await this.page.evaluate(() => {
        const table = document.querySelector("table.w-full");
        if (!table) {
          throw new Error("Table not found");
        }

        const rows = Array.from(table.querySelectorAll("tbody tr"));

        return rows
          .map((row, index) => {
            try {
              const cells = Array.from(row.querySelectorAll("td"));

              if (cells.length < 5) {
                console.warn(
                  `Row ${index} has insufficient cells: ${cells.length}`
                );
                return null;
              }

              // Cell 0: Patient Information
              const patientCell = cells[0];
              const patientName =
                patientCell
                  .querySelector(".font-semibold.text-gray-800")
                  ?.textContent?.trim() ||
                patientCell
                  .querySelector(".font-semibold")
                  ?.textContent?.trim();

              // Extract patient ID - look for "ID: {id}" pattern
              const idText = patientCell.textContent;
              const idMatch = idText.match(/ID:\s*(\S+)/);
              const patientId = idMatch ? idMatch[1].trim() : null;

              // Extract age and gender
              const ageMatch = idText.match(/(\d+)\s*yrs/);
              const genderMatch = idText.match(/(Male|Female|Other)/i);

              // Cell 1: Medical Conditions
              const conditionsCell = cells[1];
              const ivChemo =
                conditionsCell.querySelector(".bg-blue-100") !== null;
              const dialysis =
                conditionsCell.querySelector(".bg-orange-100") !== null;
              const parenteralNutrition =
                conditionsCell.querySelector(".bg-purple-100") !== null;
              const psychiatric =
                conditionsCell.querySelector(".bg-red-100") !== null;
              const suicidalPrecaution = Array.from(
                conditionsCell.querySelectorAll(".bg-red-100")
              ).some((el) => el.textContent.includes("Suicidal"));
              const bipapCpap =
                conditionsCell.querySelector(".bg-green-100") !== null;

              // Extract tracheostomy frequency
              const tracheoText = conditionsCell.textContent;
              const tracheoMatch = tracheoText.match(/Tracheostomy:\s*(.+)/i);

              // Cell 2: Vitals - parse the grid structure
              const vitalsCell = cells[2];
              const vitalPairs = vitalsCell.querySelectorAll(
                ".grid .text-gray-600, .grid .text-gray-600.font-medium"
              );
              const vitals = {};

              // Parse the grid structure (label-value pairs)
              for (let i = 0; i < vitalPairs.length; i += 2) {
                const labelElement = vitalPairs[i];
                const valueElement = vitalPairs[i + 1];

                if (labelElement && valueElement) {
                  const label = labelElement.textContent
                    .replace(":", "")
                    .trim()
                    .toLowerCase();
                  const value = valueElement.textContent.trim();

                  // Map labels to consistent keys
                  const keyMap = {
                    temp: "temperature",
                    "systolic bp": "systolic_bp",
                    "diastolic bp": "diastolic_bp",
                    pulse: "pulse",
                    spo2: "spo2",
                    "resp rate": "respiratory_rate",
                    "o2 level": "oxygen_level",
                  };

                  const key = keyMap[label];
                  if (key) {
                    // Convert numeric values
                    vitals[key] = isNaN(value) ? value : parseFloat(value);
                  }
                }
              }

              // Cell 3: Special Notes
              const notesCell = cells[3];
              const specialNotes =
                notesCell.querySelector(".bg-yellow-50")?.textContent?.trim() ||
                (notesCell.textContent.includes("No special notes")
                  ? null
                  : notesCell.textContent.trim());

              // Cell 4: Last Updated
              const lastUpdatedCell = cells[4];
              const dateText = lastUpdatedCell.textContent.trim();

              // Try to parse the date
              let lastUpdated = null;
              try {
                // Try to create a date from the text
                lastUpdated = new Date(dateText).toISOString();
                if (lastUpdated === "Invalid Date") {
                  lastUpdated = new Date().toISOString(); // fallback to current date
                }
              } catch (e) {
                lastUpdated = new Date().toISOString();
              }

              const patientData = {
                patient_id: patientId,
                patient_name: patientName,
                age: ageMatch ? parseInt(ageMatch[1]) : null,
                gender: genderMatch ? genderMatch[1] : null,
                iv_chemo_radiotherapy: ivChemo,
                dialysis: dialysis,
                parenteral_nutrition: parenteralNutrition,
                psychiatric_issues: psychiatric,
                suicidal_precaution: suicidalPrecaution,
                bipap_cpap: bipapCpap,
                tracheostomy_freq: tracheoMatch ? tracheoMatch[1].trim() : null,
                temperature: vitals.temperature || 0,
                systolic_bp: vitals.systolic_bp || 0,
                diastolic_bp: vitals.diastolic_bp || 0,
                pulse: vitals.pulse || 0,
                spo2: vitals.spo2 || 0,
                respiratory_rate: vitals.respiratory_rate || 0,
                oxygen_level: vitals.oxygen_level || 0,
                special_circumstance: specialNotes,
                last_updated: lastUpdated,
              };
              return patientData;
            } catch (error) {
              console.error(`Error parsing row ${index}:`, error);
              return null;
            }
          })
          .filter((patient) => patient !== null && patient.patient_id !== null);
      });

      console.log(`Successfully parsed ${tableData.length} patients`);
      console.log("Parsed patient data:", JSON.stringify(tableData, null, 2));
      return tableData;
    } catch (error) {
      console.error("Scraping error:", error);

      // Debug: Check what's actually on the page
      const pageContent = await this.page.content();
      console.log("Page title:", await this.page.title());
      console.log("Table exists:", (await this.page.$("table")) !== null);

      throw new Error(`Failed to scrape website: ${error.message}`);
    }
  }

  async scrapeAppointmentTable(websiteUrl, authCredentials = null) {
    try {
      console.log(`Navigating to appointments: ${websiteUrl}`);
      await this.page.goto(websiteUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      if (authCredentials) {
        await this.handleAuthentication(authCredentials);
      }

      await this.page.waitForSelector("table.w-full", { timeout: 15000 });

      const appointmentData = await this.page.evaluate(() => {
        const table = document.querySelector("table.w-full");
        if (!table) throw new Error("Appointment table not found");

        const rows = Array.from(table.querySelectorAll("tbody tr"));
        console.log(`Found ${rows.length} appointment rows`);

        return rows
          .map((row, index) => {
            try {
              const cells = Array.from(row.querySelectorAll("td"));
              console.log(`Appointment row ${index}: ${cells.length} cells`);

              if (cells.length < 5) {
                console.warn(
                  `Appointment row ${index} has insufficient cells: ${cells.length}`
                );
                return null;
              }

              const patientId = cells[0]?.textContent?.trim();
              const patientName = cells[1]?.textContent?.trim();
              const appointmentType = cells[2]?.textContent?.trim();
              const dateText = cells[3]?.textContent?.trim();
              const status = cells[4]?.textContent?.trim();

              const appointment = {
                appointment_id: `appt-${index}-${patientId}`,
                patient_id: patientId,
                patient_name: patientName,
                appointment_type: appointmentType,
                appointment_date: dateText,
                status: status,
                raw_date_text: dateText,
              };

              console.log(
                `Parsed appointment: ${patientId} - ${appointmentType}`
              );
              return appointment;
            } catch (error) {
              console.error(`Error parsing appointment row ${index}:`, error);
              return null;
            }
          })
          .filter(
            (appointment) => appointment !== null && appointment.patient_id
          );
      });

      console.log(`Successfully parsed ${appointmentData.length} appointments`);
      return appointmentData;
    } catch (error) {
      console.error("Appointment scraping error:", error);
      throw error;
    }
  }

  async scrapeSwabTable(websiteUrl, authCredentials = null) {
    try {
      console.log(`Navigating to swabs: ${websiteUrl}`);
      await this.page.goto(websiteUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      if (authCredentials) {
        await this.handleAuthentication(authCredentials);
      }

      await this.page.waitForSelector("table.w-full", { timeout: 15000 });

      const swabData = await this.page.evaluate(() => {
        const table = document.querySelector("table.w-full");
        if (!table) throw new Error("Swab table not found");

        const rows = Array.from(table.querySelectorAll("tbody tr"));
        console.log(`Found ${rows.length} swab rows`);

        return rows
          .map((row, index) => {
            try {
              const cells = Array.from(row.querySelectorAll("td"));
              console.log(`Swab row ${index}: ${cells.length} cells`);

              if (cells.length < 6) {
                console.warn(
                  `Swab row ${index} has insufficient cells: ${cells.length}`
                );
                return null;
              }

              // Cell structure based on your table:
              // 0: Swab ID, 1: Swab Date, 2: Patient, 3: Swab Type, 4: Result
              const swabId = cells[0]?.textContent?.trim();
              const dateText = cells[1]?.textContent?.trim();
              const patientCell = cells[2];
              const provider = cells[3]?.textContent?.trim();
              const swabType = cells[4]?.textContent?.trim();
              const result = cells[5]?.textContent?.trim();
              // Extract patient ID and name from patient cell
              const patientId = patientCell
                .querySelector(".font-semibold")
                ?.textContent?.replace("ID:", "")
                .trim();
              const patientName = patientCell.textContent
                .replace(/ID:\s*\S+\s*/, "")
                .trim();

              let swabDate = null;
              try {
                if (dateText && dateText !== "-") {
                  swabDate = new Date(dateText).toISOString();
                  if (isNaN(new Date(swabDate).getTime())) {
                    console.warn(`Invalid date for swab: ${dateText}`);
                    swabDate = null;
                  }
                }
              } catch (e) {
                console.warn(`Error parsing swab date: ${dateText}`, e);
                swabDate = null;
              }

              const swab = {
                swab_id: swabId,
                swab_date: swabDate,
                patient_id: patientId,
                patient_name: patientName,
                provider: provider,
                swab_type: swabType,
                result: result.toLowerCase(),
                raw_date_text: dateText,
              };

              console.log(`Parsed swab: ${swabId} - ${swabType} - ${result}`);
              return swab;
            } catch (error) {
              console.error(`Error parsing swab row ${index}:`, error);
              return null;
            }
          })
          .filter((swab) => swab !== null && swab.patient_id);
      });

      console.log(`Successfully parsed ${swabData.length} swabs`);
      return swabData;
    } catch (error) {
      console.error("Swab scraping error:", error);
      throw error;
    }
  }
}

app.get("/patient/:id/:orderId/comprehensive-assessment", async (req, res) => {
  const scraper = new MedicalTableScraper();

  try {
    const { id, orderId } = req.params;
    const { websiteUrl, auth } = req.query;

    if (!websiteUrl) {
      return res
        .status(400)
        .json({ error: "websiteUrl query parameter is required" });
    }

    await scraper.init();
    const tableData = await scraper.scrapeMedicalTable(
      websiteUrl,
      auth ? JSON.parse(auth) : null
    );

    const questions = [
      // Medical Conditions - All should be NIL (false)
      {
        key: "iv_chemo_radiotherapy",
        type: "boolean",
        question: "NIL IV chemotherapy/radiotherapy",
        expected: false,
      },
      {
        key: "dialysis",
        type: "boolean",
        question: "NIL Dialysis",
        expected: false,
      },
      {
        key: "parenteral_nutrition",
        type: "boolean",
        question: "NIL Parenteral Nutrition",
        expected: false,
      },
      {
        key: "psychiatric_issues",
        type: "boolean",
        question: "NIL Psychiatric or behavioural issues",
        expected: false,
      },
      {
        key: "suicidal_precaution",
        type: "boolean",
        question: "NIL Suicidal precaution",
        expected: false,
      },
      {
        key: "bipap_cpap",
        type: "boolean",
        question: "NIL BIPAP/CPAP",
        expected: false,
      },
      // Tracheostomy - less frequent than 4 hourly
      {
        key: "tracheostomy_freq",
        type: "tracheostomy",
        question: "Tracheostomy suctioning less frequent than 4 hourly",
        expected: "less_than_4_hour",
      },
      // Vitals with specific ranges
      {
        key: "temperature",
        type: "numeric_range",
        question: "Temperature less than 37.5",
        min: null,
        max: 37.5,
        operator: "less_than_equal",
      },
      {
        key: "systolic_bp",
        type: "numeric_range",
        question: "Blood Pressure SBP 100-170",
        min: 100,
        max: 170,
        operator: "between",
      },
      {
        key: "pulse",
        type: "numeric_range",
        question: "Pulse per Minute 50-100",
        min: 50,
        max: 100,
        operator: "between",
      },
      {
        key: "respiratory_rate",
        type: "numeric_range",
        question: "Respiratory Rate 12-20",
        min: 12,
        max: 20,
        operator: "between",
      },
      {
        key: "spo2",
        type: "numeric_range",
        question: "SpO2 ≥95 (Unless special circumstances)",
        min: 95,
        max: null,
        operator: "greater_than_equal",
      },
      {
        key: "oxygen_level",
        type: "numeric_range",
        question: "Oxygen Level ≤2 of Oxygen",
        min: null,
        max: 2,
        operator: "less_than_equal",
      },
    ];

    const analysis = MyClassificationPipeline.analyzePatientById(
      tableData,
      id,
      questions
    );

    console.log(analysis);

    if (analysis.error) {
      return res.status(404).json(analysis);
    }
    // Check appointments for the patient
    const PatientId = id.slice(0, -2);
    const appointmentCheck = await checkPatientAppointments(PatientId);

    // Calculate overall assessment
    const criteriaResults = analysis.analysis;
    const passedCriteria = Object.values(criteriaResults).filter(
      (result) => result === true
    ).length;
    const totalCriteria = questions.length;
    const overallStatus = passedCriteria === totalCriteria ? "PASS" : "FAIL";

    const response = {
      patient_id: id,
      patient_name: analysis.patient_name,
      website_source: websiteUrl,
      overall_assessment: {
        status: overallStatus,
        passed_criteria: passedCriteria,
        total_criteria: totalCriteria,
        pass_percentage: Math.round((passedCriteria / totalCriteria) * 100),
      },
      detailed_criteria: {
        // Medical Conditions (All should be NIL)
        iv_chemo_radiotherapy: {
          question: "NIL IV chemotherapy/radiotherapy",
          status:
            criteriaResults.iv_chemo_radiotherapy === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        dialysis: {
          question: "NIL Dialysis",
          status: criteriaResults.dialysis === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        parenteral_nutrition: {
          question: "NIL Parenteral Nutrition",
          status:
            criteriaResults.parenteral_nutrition === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        psychiatric_issues: {
          question: "NIL Psychiatric or behavioural issues",
          status:
            criteriaResults.psychiatric_issues === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        suicidal_precaution: {
          question: "NIL Suicidal precaution",
          status:
            criteriaResults.suicidal_precaution === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        bipap_cpap: {
          question: "NIL BIPAP/CPAP",
          status: criteriaResults.bipap_cpap === false ? "PASS" : "FAIL",
          expected: "NIL (false)",
        },
        // Tracheostomy
        tracheostomy: {
          question: "Tracheostomy suctioning less frequent than 4 hourly",
          status: criteriaResults.tracheostomy_freq === true ? "PASS" : "FAIL",
          expected: "Less than 4 hourl",
        },
        // Vitals
        temperature: {
          question: "Temperature < 37.5",
          status: criteriaResults.temperature === true ? "PASS" : "FAIL",
          expected: "Less than 37.5",
        },
        systolic_bp: {
          question: "Systolic BP 100-170",
          status: criteriaResults.systolic_bp === true ? "PASS" : "FAIL",
          expected: "100-170 mmHg",
        },
        pulse: {
          question: "Pulse 50-100 bpm",
          status: criteriaResults.pulse === true ? "PASS" : "FAIL",
          expected: "50-100 bpm",
        },
        respiratory_rate: {
          question: "Respiratory Rate 12-20",
          status: criteriaResults.respiratory_rate === true ? "PASS" : "FAIL",
          expected: "12-20 breaths/min",
        },
        spo2: {
          question: "SpO2 ≥95",
          status: criteriaResults.spo2 === true ? "PASS" : "FAIL",
          expected: "≥95",
          note: "Unless special circumstances such as Type II RF",
        },
        oxygen_level: {
          question: "Oxygen Level ≤2",
          status: criteriaResults.oxygen_level === true ? "PASS" : "FAIL",
          expected: "≤2L/min",
        },
        upcoming_appointments: {
          question: "Upcoming imaging appointments within 3 days",
          has_upcoming_appointments: appointmentCheck.hasUpcomingAppointments,
          modality_results: appointmentCheck.modalityResults,
          status: appointmentCheck.hasUpcomingAppointments ? "PASS" : "FAIL",
        },
      },
      assessment_timestamp: new Date().toISOString(),
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (scraper && typeof scraper.close === "function") {
      await scraper.close();
    }
  }
});

// API endpoint to update both screening and referral order
app.post("/update-screening-and-referral", async (req, res) => {
  const {
    patient_id,
    history_id,
    order_id,
    comprehensive_assessment, // Your full JSON response
  } = req.body;

  try {
    const criteria = comprehensive_assessment.detailed_criteria;

    // Extract boolean values from status fields
    const screening_results = {
      // Medical criteria - true if PASS, false if FAIL
      iv_chemo_radiotherapy: criteria.iv_chemo_radiotherapy.status === "PASS",
      dialysis: criteria.dialysis.status === "PASS",
      parenteral_nutrition: criteria.parenteral_nutrition.status === "PASS",
      psychiatric_issues: criteria.psychiatric_issues.status === "PASS",
      suicidal_precaution: criteria.suicidal_precaution.status === "PASS",
      bipap_cpap: criteria.bipap_cpap.status === "PASS",
      tracheostomy_freq: criteria.tracheostomy.status === "PASS",
      temperature: criteria.temperature.status === "PASS",
      systolic_bp: criteria.systolic_bp.status === "PASS",
      pulse: criteria.pulse.status === "PASS",
      respiratory_rate: criteria.respiratory_rate.status === "PASS",
      spo2: criteria.spo2.status === "PASS",
      oxygen_level: criteria.oxygen_level.status === "PASS",

      // Imaging criteria - true if appointments exist
      xrays_and_aims_modalities:
        criteria.upcoming_appointments.modality_results
          .xrays_and_aims_modalities,
      ultrasound_doppler:
        criteria.upcoming_appointments.modality_results.ultrasound_doppler,
      ultrasound_scans:
        criteria.upcoming_appointments.modality_results.ultrasound_scans,
    };

    // Calculate counts and determine screening result
    const failCount = Object.values(screening_results).filter(
      (result) => result === false
    ).length;
    const totalCriteria = Object.keys(screening_results).length;

    let screening_result;
    let screening_notes;
    let referral_status;
    let escalated_to_clinician = false;

    // Check if all medical criteria failed but all imaging appointments passed
    const medicalCriteria = [
      "iv_chemo_radiotherapy",
      "dialysis",
      "parenteral_nutrition",
      "psychiatric_issues",
      "suicidal_precaution",
      "bipap_cpap",
    ];
    const imagingCriteria = [
      "xrays_and_aims_modalities",
      "ultrasound_doppler",
      "ultrasound_scans",
      "tracheostomy_freq",
      "temperature",
      "systolic_bp",
      "pulse",
      "respiratory_rate",
      "spo2",
      "oxygen_level",
    ];

    const allMedicalFailed = medicalCriteria.every(
      (criterion) => screening_results[criterion] === false
    );
    const allImagingPassed = imagingCriteria.every(
      (criterion) => screening_results[criterion] === true
    );

    if (allMedicalFailed && allImagingPassed) {
      screening_result = "Accepted";
      screening_notes =
        "All medical criteria failed but imaging appointments confirmed";
      referral_status = "Accepted";
    } else if (failCount <= 3) {
      screening_result = "Pending";
      screening_notes = "Escalate to clinician";
      referral_status = "Pending";
      escalated_to_clinician = true;
    } else {
      screening_result = "Rejected";
      screening_notes = `Failed ${failCount} out of ${totalCriteria} criteria`;
      referral_status = "Rejected";
    }

    // Update Readiness Screening Checklist
    const screeningUpdateQuery = `
      UPDATE readiness_screening_checklist 
      SET 
        screening_datetime = TIMEZONE('Asia/Singapore', CURRENT_TIMESTAMP),
        screening_result = $1,
        notes = $2
      WHERE patient_id = $3 AND history_id = $4
      RETURNING *;
    `;

    const screeningResult = await pool.query(screeningUpdateQuery, [
      screening_result,
      screening_notes,
      patient_id,
      history_id,
    ]);

    console.log(history_id, patient_id);

    console.log("Screening update result:", screeningResult.rows);
    console.log("Rows affected:", screeningResult.rowCount);

    // Update Referral Order
    const referralUpdateQuery = `
      UPDATE referral_order 
      SET 
        iv_chemo_radiotherapy = $1,
        dialysis = $2,
        parenteral_nutrition = $3,
        psychiatric_issues = $4,
        suicidal_precaution = $5,
        bipap_cpap = $6,
        tracheostomy = $7,
        temperature = $8,
        systolic_bp = $9,
        pulse = $10,
        respiratory_rate = $11,
        spo2 = $12,
        oxygen_level = $13,
        xray_aims_modalities = $14,
        ultrasound_doppler = $15,
        ultrasound_scans = $16,
        referral_status = $17,
        case_escalated_to_clinician = $18,
        reviewed_datetime = TIMEZONE('Asia/Singapore', CURRENT_TIMESTAMP)
      WHERE order_id = $19
      RETURNING *;
    `;

    // Map screening results to referral order columns
    const referralParams = [
      !screening_results.iv_chemo_radiotherapy, // true if failed (opposite of screening result)
      !screening_results.dialysis,
      !screening_results.parenteral_nutrition,
      !screening_results.psychiatric_issues,
      !screening_results.suicidal_precaution,
      !screening_results.bipap_cpap,
      screening_results.tracheostomy_freq,
      screening_results.temperature,
      screening_results.systolic_bp,
      screening_results.pulse,
      screening_results.respiratory_rate,
      screening_results.spo2,
      screening_results.oxygen_level,
      screening_results.xrays_and_aims_modalities, // true if passed
      screening_results.ultrasound_doppler,
      screening_results.ultrasound_scans,
      referral_status,
      escalated_to_clinician,
      order_id,
    ];

    const referralResult = await pool.query(
      referralUpdateQuery,
      referralParams
    );

    res.json({
      success: true,
      message: "Screening and referral order updated successfully",
      screening_update: screeningResult.rows[0],
      referral_update: referralResult.rows[0],
      screening_summary: {
        result: screening_result,
        notes: screening_notes,
        fail_count: failCount,
        total_criteria: totalCriteria,
        referral_status: referral_status,
        escalated_to_clinician: escalated_to_clinician,
      },
    });
  } catch (error) {
    console.error("Error updating screening and referral:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/patient/:id/swab-screening", async (req, res) => {
  const scraper = new MedicalTableScraper();

  try {
    const { id } = req.params;
    const { websiteUrl, auth } = req.query;

    if (!websiteUrl) {
      return res
        .status(400)
        .json({ error: "websiteUrl query parameter is required" });
    }

    await scraper.init();
    const swabData = await scraper.scrapeSwabTable(
      websiteUrl,
      auth ? JSON.parse(auth) : null
    );

    // Filter swabs for this patient
    const patientSwabs = swabData.filter(
      (swab) => swab.patient_id === id.toString()
    );

    const provider =
      patientSwabs.length > 0 ? patientSwabs[0].provider : "Unknown";

    // ✅ Create classifier instance and initialize model
    const classifier = new MyClassificationPipeline2();
    await classifier.init();

    // ✅ Convert swab data into text summary
    const swabSummary = patientSwabs
      .map(
        (s) =>
          `${s.type}: ${s.result || "unknown"} (${s.date || "no date"})`
      )
      .join("\n");

    // ✅ Run classification
    const screeningAnalysis = await classifier.analyzeSwabScreening(
      swabSummary,
      new Date().toISOString()
    );

    const response = {
      patient_id: id,
      provider,
      screening_timestamp: new Date().toISOString(),
      all_patient_swabs: patientSwabs,
      ...screeningAnalysis,
    };

    res.json(response);
  } catch (error) {
    console.error("Error in swab screening:", error);
    res.status(500).json({ error: error.message });
  } finally {
    if (scraper && typeof scraper.close === "function") {
      await scraper.close();
    }
  }
});

// Get all users
app.use("/api/", routes);

// Start server
app.listen(port, hostname, () => {
  console.log(`
🚀 Combined API running at http://${hostname}:${port})`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down server gracefully...");

  // Close database pool
  await pool.end();
  console.log("✅ Database connections closed");

  process.exit(0);
});
