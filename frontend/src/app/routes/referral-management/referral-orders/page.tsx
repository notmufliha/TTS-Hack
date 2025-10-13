"use client";

import React, { useState } from "react";
import { useApiData } from "../../../components/useApiData";
import dynamic from "next/dynamic";
const createAndDownloadPDFChecklist = async (
  assessment,
  screeningResult,
  referralUpdate
) => {
  // Dynamically import jsPDF
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  // Defensive defaults
  const referralId = referralUpdate?.referral_id ?? "N/A";
  const orderId = referralUpdate?.order_id ?? "N/A";
  const patientId = assessment?.patient_id ?? "N/A";

  // Set PDF properties
  pdf.setProperties({
    title: `Referral Screening Checklist - ${referralId}`,
    subject: "Patient Readiness Assessment",
    author: "Healthcare System",
    keywords: "referral, screening, checklist, medical",
  });

  let yPosition = 20;

  // --- Header ---
  pdf.setFontSize(16);
  pdf.setFont(undefined, "bold");
  pdf.text("PATIENT READINESS SCREENING CHECKLIST", 105, yPosition, {
    align: "center",
  });
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");
  pdf.text(`Referral ID: ${referralId}`, 20, yPosition);
  pdf.text(`Order ID: ${orderId}`, 105, yPosition);
  pdf.text(`Patient ID: ${patientId}`, 160, yPosition);
  yPosition += 6;

  pdf.text(`Patient Name: ${assessment?.patient_name ?? "N/A"}`, 20, yPosition);
  pdf.text(
    `Assessment Date: ${
      assessment?.assessment_timestamp
        ? new Date(assessment.assessment_timestamp).toLocaleDateString()
        : "N/A"
    }`,
    105,
    yPosition
  );
  yPosition += 15;

  // --- Assessment Summary ---
  pdf.setFont(undefined, "bold");
  pdf.text("OVERALL ASSESSMENT SUMMARY", 20, yPosition);
  yPosition += 8;

  pdf.setFont(undefined, "normal");
  pdf.text(
    `Status: ${assessment?.overall_assessment?.status ?? "N/A"}`,
    25,
    yPosition
  );
  yPosition += 5;
  pdf.text(
    `Passed Criteria: ${
      assessment?.overall_assessment?.passed_criteria ?? "N/A"
    }/${assessment?.overall_assessment?.total_criteria ?? "N/A"} (${
      assessment?.overall_assessment?.pass_percentage ?? "N/A"
    }%)`,
    25,
    yPosition
  );
  yPosition += 5;
  pdf.text(
    `Screening Result: ${screeningResult?.result ?? "N/A"}`,
    25,
    yPosition
  );
  yPosition += 5;
  pdf.text(
    `Referral Status: ${screeningResult?.referral_status ?? "N/A"}`,
    25,
    yPosition
  );
  yPosition += 5;
  pdf.text(`Notes: ${screeningResult?.notes ?? "N/A"}`, 25, yPosition);
  yPosition += 10;

  // --- Medical Criteria Table ---
  pdf.setFont(undefined, "bold");
  pdf.text("DETAILED MEDICAL CRITERIA", 20, yPosition);
  yPosition += 8;

  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPosition, 170, 8, "F");
  pdf.text("Criteria", 22, yPosition + 6);
  pdf.text("Status", 140, yPosition + 6);
  pdf.text("Expected", 160, yPosition + 6);
  yPosition += 10;

  // Criteria rows, with overflow handling
  const medicalCriteria = assessment?.detailed_criteria ?? {};
  Object.entries(medicalCriteria).forEach(([key, criteria]) => {
    if (key !== "upcoming_appointments") {
      if (yPosition > 270) {
        // Overflow
        pdf.addPage();
        yPosition = 20;
      }
      const status = criteria?.status ?? "N/A";
      const statusColor = status === "PASS" ? [0, 128, 0] : [255, 0, 0];
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(0, 0, 0);
      const questionLines = pdf.splitTextToSize(criteria?.question ?? "-", 100);
      pdf.text(questionLines, 22, yPosition + 4);
      pdf.setTextColor(...statusColor);
      pdf.text(status, 140, yPosition + 4);
      pdf.setTextColor(0, 0, 0);
      const expectedLines = pdf.splitTextToSize(criteria?.expected ?? "-", 35);
      pdf.text(expectedLines, 160, yPosition + 4);
      yPosition += Math.max(
        questionLines.length * 5,
        expectedLines.length * 5,
        8
      );
    }
  });

  yPosition += 5;

  // --- Imaging Appointments ---
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("IMAGING APPOINTMENTS", 20, yPosition);
  yPosition += 8;

  // Defensive extraction
  const imagingData =
    medicalCriteria?.upcoming_appointments?.modality_results ?? {};

  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, yPosition, 170, 8, "F");
  pdf.text("Modality Type", 22, yPosition + 6);
  pdf.text("Scheduled", 120, yPosition + 6);
  pdf.text("Status", 160, yPosition + 6);
  yPosition += 10;

  [
    {
      key: "xrays_and_aims_modalities",
      label: "X-rays & AIMS Modalities",
    },
    { key: "ultrasound_doppler", label: "Ultrasound Doppler" },
    { key: "ultrasound_scans", label: "Ultrasound Scans" },
  ].forEach((type) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    const isScheduled = !!imagingData[type.key];
    const status = isScheduled ? "PASS" : "FAIL";
    const statusColor = isScheduled ? [0, 128, 0] : [255, 0, 0];

    pdf.setFont(undefined, "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(type.label, 22, yPosition + 4);
    pdf.text(isScheduled ? "Yes" : "No", 120, yPosition + 4);
    pdf.setTextColor(...statusColor);
    pdf.text(status, 160, yPosition + 4);

    yPosition += 8;
  });

  yPosition += 10;

  // --- Footer ---
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
  pdf.text(
    `Assessment Source: ${assessment?.website_source ?? "N/A"}`,
    20,
    yPosition + 4
  );
  pdf.text(
    `Readiness ID: ${screeningResult?.screening_update?.readiness_id ?? "N/A"}`,
    120,
    yPosition
  );
  pdf.text(
    `History ID: ${screeningResult?.screening_update?.history_id ?? "N/A"}`,
    120,
    yPosition + 4
  );

  // --- Save and Log ---
  const filename = `Referral_${referralId}_Order_${orderId}_Checklist.pdf`;
  pdf.save(filename);
  console.log(`PDF checklist downloaded: ${filename}`);
};
export default function ReferralOrdersTable() {
  const { data, loading, error, refetch } = useApiData();
  const { referralOrders } = data;
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const startProcess = async (
    orderId: number,
    patientId: number,
    age: number
  ) => {
    setProcessingOrder(orderId);
    setMessage(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/referral-orders/start-process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            patient_id: patientId,
            psa_name: "muf",
          }),
        }
      );

      const result = await response.json();
      console.log(result);
      const history_id = result.data.history_id;

      if (result.success) {
        setMessage({
          type: "success",
          text: "Process started successfully! Readiness screening created.",
        });
        // Refresh the data immediately to show updated status

        const patientIdAge = patientId.toString() + age.toString();
        const assessmentResponse = await fetch(
          `http://127.0.0.1:8000/patient/${patientIdAge}/${orderId}/comprehensive-assessment?websiteUrl=http://localhost:3000/routes/referral-management/medical-history`
        );
        const assessmentResult = await assessmentResponse.json();
        console.log("Comprehensive Assessment:", assessmentResult);
        // NOW call the update endpoint with all the data
        const updateResponse = await fetch(
          "http://127.0.0.1:8000/update-screening-and-referral",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              patient_id: patientId,
              history_id: history_id, // From the assessment response
              order_id: orderId, // From your process
              comprehensive_assessment: assessmentResult, // The full assessment result
            }),
          }
        );

        const updateResult = await updateResponse.json();
        console.log("Screening update result:", updateResult);

        if (updateResult.success) {
          setMessage({
            type: "success",
            text: `Screening completed: ${updateResult.screening_summary.result}`,
          });

          // Create and download PDF
          createAndDownloadPDFChecklist(
            assessmentResult,
            updateResult.screening_summary,
            updateResult.referral_update
          );
        } else {
          throw new Error(updateResult.error || "Failed to update screening");
        }

        console.log("PDF checklist created and downloaded successfully!");

        await refetch();
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to start process",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setProcessingOrder(null);
    }
  };

  // Format date in Singapore timezone
  const formatSingaporeTime = (dateString: string) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Referral Order Management
          </h1>
          {message && (
            <div
              className={`mt-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Order Details
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Patient Info
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Medical Conditions
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Referral Details
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referralOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No referral orders found in database
                    </td>
                  </tr>
                ) : (
                  referralOrders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Order Details Column */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-800">
                            Order #{order.order_id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatSingaporeTime(
                              order.order_datetime_sg || order.order_datetime
                            )}
                          </div>
                          <div className="text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.referral_status === "Started"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.referral_status === "Accepted"
                                  ? "bg-green-100 text-green-800"
                                  : order.referral_status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.referral_status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : order.referral_status === "Withdrawn"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {order.referral_status}
                            </span>
                          </div>
                          {order.reviewed_datetime_sg && (
                            <div className="text-xs text-gray-500">
                              Reviewed:{" "}
                              {formatSingaporeTime(order.reviewed_datetime_sg)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Patient Info Column */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-800">
                            {order.patient_name ||
                              `Patient ${order.patient_id}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.nric && `NRIC: ${order.nric}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.age && `${order.age} yrs`}{" "}
                            {order.gender && `• ${order.gender}`}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">
                              Provider: {order.provider}
                            </div>
                            <div className="text-gray-600">
                              {order.community_hospital}
                            </div>
                            <div className="text-gray-600">
                              {order.ward_type}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Medical Conditions Column */}
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {order.iv_chemo_radiotherapy && (
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                IV Chemo
                              </span>
                            )}
                            {order.dialysis && (
                              <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                Dialysis
                              </span>
                            )}
                            {order.parenteral_nutrition && (
                              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                Parent Nutrition
                              </span>
                            )}
                            {order.psychiatric_issues && (
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                Psychiatric
                              </span>
                            )}
                            {order.bipap_cpap && (
                              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                BIPAP/CPAP
                              </span>
                            )}
                            {order.tracheostomy_freq && (
                              <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                                Trach: {order.tracheostomy_freq}
                              </span>
                            )}
                          </div>

                          {order.oxygen_requirement > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">O₂: </span>
                              {order.oxygen_requirement}%
                            </div>
                          )}

                          {(order.referral_recommended_pt_ot ||
                            order.discharge_planning) && (
                            <div className="text-sm space-y-1">
                              {order.referral_recommended_pt_ot && (
                                <div className="text-green-600">
                                  ✓ PT/OT Recommended
                                </div>
                              )}
                              {order.discharge_planning && (
                                <div className="text-blue-600">
                                  ✓ Discharge Planning
                                </div>
                              )}
                            </div>
                          )}

                          {order.special_precautions && (
                            <div className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                              ⚠️ {order.special_precautions}
                            </div>
                          )}

                          {order.isolation_infection_status && (
                            <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                              🦠 {order.isolation_infection_status}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Referral Details Column */}
                      <td className="px-4 py-3">
                        <div className="text-gray-600 space-y-2 text-sm">
                          {order.comments && (
                            <div>
                              <div className="font-medium">Comments:</div>
                              <div className="text-gray-600 text-xs mt-1">
                                {order.comments}
                              </div>
                            </div>
                          )}

                          {order.additional_comments && (
                            <div>
                              <div className="font-medium">
                                Additional Notes:
                              </div>
                              <div className="text-gray-600 text-xs mt-1">
                                {order.additional_comments}
                              </div>
                            </div>
                          )}

                          {order.case_escalated_to_clinician && (
                            <div className="text-red-600 font-medium">
                              ⚠️ Escalated to Clinician
                            </div>
                          )}

                          {order.rejected_reason && (
                            <div>
                              <div className="font-medium text-red-600">
                                Rejection Reason:
                              </div>
                              <div className="text-red-600 text-xs mt-1">
                                {order.rejected_reason}
                              </div>
                            </div>
                          )}

                          {order.psa_name && (
                            <div className="text-gray-600">
                              PSA: {order.psa_name}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {order.referral_status === "Pending" && (
                            <button
                              onClick={() =>
                                startProcess(
                                  order.order_id,
                                  order.patient_id,
                                  order.age
                                )
                              }
                              disabled={processingOrder === order.order_id}
                              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors text-sm font-medium"
                            >
                              {processingOrder === order.order_id
                                ? "Processing..."
                                : "Start Process"}
                            </button>
                          )}

                          {(order.referral_status === "Started" ||
                            order.referral_status === "Accepted") && (
                            <div
                              className={`text-sm font-medium text-center ${
                                order.referral_status === "Started"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              ✓{" "}
                              {order.referral_status === "Started"
                                ? "Process Started"
                                : "Process Accepted"}
                            </div>
                          )}

                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Referral ID: {order.referral_id}</div>
                            <div>Patient ID: {order.patient_id}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
