import type { Criterion, ScreeningResponse } from "./types";

// Builds the readiness screening checklist PDF in the browser and downloads it.
// Nothing leaves the PSA's computer.
export async function downloadChecklistPdf({ order, assessment, history_id, readiness_id }: ScreeningResponse) {
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
    author: "ICH PSO",
  });

  let y = 20;
  const newPageIfNeeded = () => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  };

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT READINESS SCREENING CHECKLIST", 105, y, { align: "center" });
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Referral ID: ${order.referral_id ?? "N/A"}`, 20, y);
  pdf.text(`Order ID: ${order.order_id}`, 90, y);
  pdf.text(`Patient ID: ${order.patient_id}`, 150, y);
  y += 6;
  pdf.text(`Patient Name: ${order.patient_name ?? "N/A"}`, 20, y);
  pdf.text(`Provider: ${order.provider ?? "N/A"}`, 90, y);
  y += 6;
  pdf.text(`Generated: ${new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" })}`, 20, y);
  pdf.text(`Screened by: ${order.psa_name ?? "N/A"}`, 90, y);
  y += 12;

  pdf.setFont("helvetica", "bold");
  pdf.text(
    `OUTCOME: ${assessment.decision === "Escalated" ? "ESCALATED TO CLINICIAN" : assessment.decision.toUpperCase()}`,
    20,
    y
  );
  y += 6;
  pdf.setFont("helvetica", "normal");
  for (const reason of assessment.reasons) {
    newPageIfNeeded();
    const lines = pdf.splitTextToSize(`- ${reason}`, 165);
    pdf.text(lines, 25, y);
    y += lines.length * 5;
  }
  y += 5;

  const criteriaSection = (title: string, rows: Criterion[]) => {
    newPageIfNeeded();
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...black);
    pdf.text(title, 20, y);
    y += 4;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, y, 170, 8, "F");
    pdf.text("Criterion", 22, y + 6);
    pdf.text("Expected", 85, y + 6);
    pdf.text("Actual", 130, y + 6);
    pdf.text("Status", 172, y + 6);
    y += 13;

    pdf.setFont("helvetica", "normal");
    for (const criterion of rows) {
      newPageIfNeeded();
      const label = pdf.splitTextToSize(criterion.label, 60);
      const expected = pdf.splitTextToSize(criterion.expected, 42);
      const actual = pdf.splitTextToSize(criterion.actual, 40);
      pdf.setTextColor(...black);
      pdf.text(label, 22, y);
      pdf.text(expected, 85, y);
      pdf.text(actual, 130, y);
      pdf.setTextColor(...(statusColors[criterion.status] ?? black));
      pdf.text(criterion.status, 172, y);
      y += Math.max(label.length, expected.length, actual.length) * 5 + 2;
    }
    pdf.setTextColor(...black);
    y += 4;
  };

  criteriaSection("EXCLUSION CRITERIA", assessment.exclusions);
  criteriaSection("VITALS", assessment.vitals);

  newPageIfNeeded();
  pdf.setFont("helvetica", "bold");
  pdf.text("IMAGING WITHIN 3 DAYS", 20, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  const imaging: [string, boolean][] = [
    ["X-rays & AIMS modalities", assessment.imaging.xrays_and_aims_modalities],
    ["Ultrasound Doppler", assessment.imaging.ultrasound_doppler],
    ["Ultrasound scans", assessment.imaging.ultrasound_scans],
  ];
  for (const [label, scheduled] of imaging) {
    newPageIfNeeded();
    pdf.text(`${label}: ${scheduled ? "Scheduled" : "None"}`, 25, y);
    y += 5;
  }
  y += 5;

  newPageIfNeeded();
  pdf.setFont("helvetica", "bold");
  pdf.text("SWAB SCREENING", 20, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  if (assessment.swabs.all_negative_within_24h) {
    pdf.text("All required swabs negative within 24 hours: transfer directly to ICH", 25, y);
    y += 5;
  }
  for (const check of assessment.swabs.checks) {
    newPageIfNeeded();
    pdf.text(`${check.type}: ${check.status.replace("_", " ")} - ${check.recommendation}`, 25, y);
    y += 5;
  }
  y += 8;

  newPageIfNeeded();
  pdf.setFontSize(8);
  pdf.text(`Readiness ID: ${readiness_id ?? "N/A"}    History ID: ${history_id}`, 20, y);

  pdf.save(`Referral_${order.referral_id}_Order_${order.order_id}_Checklist.pdf`);
}
