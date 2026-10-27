"use client";

import React, { useState } from "react";
import { useApiData } from "../../../components/useApiData";
import { referralOrdersAPI } from "../../../components/api";
import type { Criterion, ScreeningResponse } from "@/lib/types";

const PSA_NAME = "PSA";

const createAndDownloadPDFChecklist = async ({
  order,
  assessment,
  history_id,
  readiness_id,
}: ScreeningResponse) => {
  // Dynamically import jsPDF
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const black: [number, number, number] = [0, 0, 0];
  const statusColors: Record<string, [number, number, number]> = {
    PASS: [0, 128, 0],
    FAIL: [200, 0, 0],
    REVIEW: [200, 120, 0],
  };

  pdf.setProperties({
    title: `Referral Screening Checklist - ${order.referral_id}`,
    subject: "Patient Readiness Assessment",
    author: "TTSH ICH PSO",
    keywords: "referral, screening, checklist, medical",
  });

  let yPosition = 20;
  const newPageIfNeeded = () => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // --- Header ---
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT READINESS SCREENING CHECKLIST", 105, yPosition, {
    align: "center",
  });
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Referral ID: ${order.referral_id ?? "N/A"}`, 20, yPosition);
  pdf.text(`Order ID: ${order.order_id}`, 90, yPosition);
  pdf.text(`Patient ID: ${order.patient_id}`, 150, yPosition);
  yPosition += 6;
  pdf.text(`Patient Name: ${order.patient_name ?? "N/A"}`, 20, yPosition);
  pdf.text(`Provider: ${order.provider ?? "N/A"}`, 90, yPosition);
  yPosition += 6;
  pdf.text(
    `Screened: ${new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}`,
    20,
    yPosition
  );
  pdf.text(`Screened by: ${order.psa_name ?? "N/A"}`, 90, yPosition);
  yPosition += 12;

  // --- Outcome ---
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `OUTCOME: ${
      assessment.decision === "Escalated"
        ? "ESCALATED TO CLINICIAN"
        : assessment.decision.toUpperCase()
    }`,
    20,
    yPosition
  );
  yPosition += 6;
  pdf.setFont("helvetica", "normal");
  for (const reason of assessment.reasons) {
    newPageIfNeeded();
    const lines = pdf.splitTextToSize(`- ${reason}`, 165);
    pdf.text(lines, 25, yPosition);
    yPosition += lines.length * 5;
  }
  yPosition += 5;

  // --- Criteria tables ---
  const criteriaSection = (title: string, rows: Criterion[]) => {
    newPageIfNeeded();
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...black);
    pdf.text(title, 20, yPosition);
    yPosition += 4;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, yPosition, 170, 8, "F");
    pdf.text("Criterion", 22, yPosition + 6);
    pdf.text("Expected", 85, yPosition + 6);
    pdf.text("Actual", 130, yPosition + 6);
    pdf.text("Status", 172, yPosition + 6);
    yPosition += 13;

    pdf.setFont("helvetica", "normal");
    for (const criterion of rows) {
      newPageIfNeeded();
      const label = pdf.splitTextToSize(criterion.label, 60);
      const expected = pdf.splitTextToSize(criterion.expected, 42);
      const actual = pdf.splitTextToSize(criterion.actual, 40);
      pdf.setTextColor(...black);
      pdf.text(label, 22, yPosition);
      pdf.text(expected, 85, yPosition);
      pdf.text(actual, 130, yPosition);
      pdf.setTextColor(...(statusColors[criterion.status] ?? black));
      pdf.text(criterion.status, 172, yPosition);
      yPosition += Math.max(label.length, expected.length, actual.length) * 5 + 2;
    }
    pdf.setTextColor(...black);
    yPosition += 4;
  };

  criteriaSection("EXCLUSION CRITERIA", assessment.exclusions);
  criteriaSection("VITALS", assessment.vitals);

  // --- Imaging Appointments ---
  newPageIfNeeded();
  pdf.setFont("helvetica", "bold");
  pdf.text("IMAGING WITHIN 3 DAYS", 20, yPosition);
  yPosition += 6;
  pdf.setFont("helvetica", "normal");
  const imaging: [string, boolean][] = [
    ["X-rays & AIMS modalities", assessment.imaging.xrays_and_aims_modalities],
    ["Ultrasound Doppler", assessment.imaging.ultrasound_doppler],
    ["Ultrasound scans", assessment.imaging.ultrasound_scans],
  ];
  for (const [label, scheduled] of imaging) {
    newPageIfNeeded();
    pdf.text(`${label}: ${scheduled ? "Scheduled" : "None"}`, 25, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  // --- Swabs ---
  newPageIfNeeded();
  pdf.setFont("helvetica", "bold");
  pdf.text("SWAB SCREENING", 20, yPosition);
  yPosition += 6;
  pdf.setFont("helvetica", "normal");
  if (assessment.swabs.all_negative_within_24h) {
    pdf.text(
      "All required swabs negative within 24 hours: transfer directly to ICH",
      25,
      yPosition
    );
    yPosition += 5;
  }
  for (const check of assessment.swabs.checks) {
    newPageIfNeeded();
    pdf.text(
      `${check.type}: ${check.status.replace("_", " ")} - ${check.recommendation}`,
      25,
      yPosition
    );
    yPosition += 5;
  }
  yPosition += 8;

  // --- Footer ---
  newPageIfNeeded();
  pdf.setFontSize(8);
  pdf.text(
    `Readiness ID: ${readiness_id ?? "N/A"}    History ID: ${history_id}`,
    20,
    yPosition
  );

  pdf.save(`Referral_${order.referral_id}_Order_${order.order_id}_Checklist.pdf`);
};

export default function ReferralOrdersTable() {
  const { data, loading, error, refetch } = useApiData();
  const { referralOrders } = data;
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const startProcess = async (orderId: number) => {
    setProcessingOrder(orderId);
    setMessage(null);

    try {
      const result = await referralOrdersAPI.screen(orderId, PSA_NAME);
      const { decision, reasons } = result.assessment;
      setMessage({
        type: "success",
        text:
          decision === "Escalated"
            ? `Order #${orderId} escalated to clinician: ${reasons.join("; ")}`
            : `Order #${orderId} ${decision.toLowerCase()}: ${reasons.join("; ")}`,
      });
      await createAndDownloadPDFChecklist(result);
      await refetch();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Screening failed",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const clinicianDecision = async (
    orderId: number,
    decision: "Accepted" | "Rejected"
  ) => {
    let reason: string | undefined;
    if (decision === "Rejected") {
      reason = window.prompt("Reason for rejection")?.trim();
      if (!reason) return;
    }
    setProcessingOrder(orderId);
    setMessage(null);
    try {
      await referralOrdersAPI.decide(orderId, decision, reason);
      setMessage({
        type: "success",
        text: `Order #${orderId} ${decision.toLowerCase()} by clinician`,
      });
      await refetch();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Update failed",
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  // Format date in Singapore timezone
  const formatSingaporeTime = (dateString: string | null) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Invalid Date";
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
                            {formatSingaporeTime(order.order_datetime)}
                          </div>
                          <div className="text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                order.referral_status === "Accepted"
                                  ? "bg-green-100 text-green-800"
                                  : order.referral_status === "Pending" &&
                                    order.case_escalated_to_clinician
                                  ? "bg-amber-100 text-amber-800"
                                  : order.referral_status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.referral_status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : order.referral_status === "Withdrawn"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {order.referral_status === "Pending" &&
                              order.case_escalated_to_clinician
                                ? "Escalated"
                                : order.referral_status}
                            </span>
                          </div>
                          {order.reviewed_datetime && (
                            <div className="text-xs text-gray-500">
                              Reviewed:{" "}
                              {formatSingaporeTime(order.reviewed_datetime)}
                            </div>
                          )}
                          {order.accepted_withdrawn_datetime && (
                            <div className="text-xs text-gray-500">
                              Decided:{" "}
                              {formatSingaporeTime(order.accepted_withdrawn_datetime)}
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

                          {Number(order.oxygen_requirement) > 0 && (
                            <div className="text-sm">
                              <span className="font-medium">O₂: </span>
                              {order.oxygen_requirement} L/min
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
                          {order.referral_status === "Pending" &&
                            !order.case_escalated_to_clinician && (
                              <button
                                onClick={() => startProcess(order.order_id)}
                                disabled={processingOrder !== null}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors text-sm font-medium"
                              >
                                {processingOrder === order.order_id
                                  ? "Screening..."
                                  : "Start Screening"}
                              </button>
                            )}

                          {order.referral_status === "Pending" &&
                            order.case_escalated_to_clinician && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-amber-700 text-center">
                                  Awaiting clinician
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      clinicianDecision(order.order_id, "Accepted")
                                    }
                                    disabled={processingOrder !== null}
                                    className="flex-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 text-xs font-medium"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      clinicianDecision(order.order_id, "Rejected")
                                    }
                                    disabled={processingOrder !== null}
                                    className="flex-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}

                          {(order.referral_status === "Accepted" ||
                            order.referral_status === "Rejected") && (
                            <div
                              className={`text-sm font-medium text-center ${
                                order.referral_status === "Accepted"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {order.referral_status === "Accepted"
                                ? "✓ Accepted"
                                : "✗ Rejected"}
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
