import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult } from './carbonCalculator';

interface ReportUser {
  name: string;
  email: string;
}

/**
 * Generates a complete Carbon Footprint PDF report.
 * Returns true on success, throws on failure.
 */
export function generateCarbonReport(results: CalculationResult, user: ReportUser): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const fileDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // ── Colour palette ─────────────────────────────────────────────────────────
  const GREEN_DARK   = [15, 118, 77]  as [number, number, number];
  const GREEN_LIGHT  = [209, 250, 229] as [number, number, number];
  const DARK_BG      = [17, 24, 39]   as [number, number, number];
  const MUTED        = [107, 114, 128] as [number, number, number];
  const WHITE        = [255, 255, 255] as [number, number, number];
  const BLACK        = [17, 24, 39]   as [number, number, number];

  let y = 0;

  // ── Header banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, PAGE_W, 50, 'F');

  // Logo circle
  doc.setFillColor(...GREEN_DARK);
  doc.circle(MARGIN + 8, 25, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('🌿', MARGIN + 4, 28.5);

  // Title block
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('EcoTrack AI', MARGIN + 22, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREEN_LIGHT);
  doc.text('Carbon Footprint Assessment Report', MARGIN + 22, 32);

  // Date badge (right-aligned)
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(dateStr, PAGE_W - MARGIN, 22, { align: 'right' });
  doc.text('Software Engineering Mini Project 2026', PAGE_W - MARGIN, 30, { align: 'right' });

  y = 60;

  // ── User info block ────────────────────────────────────────────────────────
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 4, 4, 'F');

  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT FOR', MARGIN + 6, y + 8);
  doc.text('EMAIL', MARGIN + 90, y + 8);
  doc.text('GENERATED', MARGIN + 150, y + 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLACK);
  doc.text(user.name || 'Eco User', MARGIN + 6, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(user.email || '—', MARGIN + 90, y + 18);
  doc.text(dateStr, MARGIN + 150, y + 18);

  y += 38;

  // ── Overall Carbon Score ───────────────────────────────────────────────────
  doc.setFillColor(...GREEN_DARK);
  doc.roundedRect(MARGIN, y, CONTENT_W, 30, 4, 4, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL CARBON SCORE', MARGIN + 6, y + 10);

  doc.setFontSize(20);
  doc.text(`${results.ecoScore} / 100`, MARGIN + 6, y + 24);

  // Eco label (right)
  doc.setFontSize(11);
  doc.text(results.ecoLabel, PAGE_W - MARGIN - 6, y + 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GREEN_LIGHT);
  doc.text(`Annual Estimate: ${results.annualEstimate} tons CO₂`, PAGE_W - MARGIN - 6, y + 24, { align: 'right' });

  y += 42;

  // ── Emission Breakdown table ───────────────────────────────────────────────
  doc.setTextColor(...BLACK);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Emission Breakdown', MARGIN, y);
  y += 6;

  const transportTons = (results.transportEmissions / 1000).toFixed(3);
  const energyTons    = (results.energyEmissions    / 1000).toFixed(3);
  const foodTons      = (results.foodEmissions       / 1000).toFixed(3);
  const wasteTons     = (results.wasteEmissions      / 1000).toFixed(3);
  const totalTons     = results.annualEstimate;
  const total_kg      = results.totalEmissions;

  const getShare = (kg: number) =>
    total_kg > 0 ? ((kg / total_kg) * 100).toFixed(1) + '%' : '—';

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Category', 'Annual (kg CO₂)', 'Annual (tons CO₂)', '% Share']],
    body: [
      ['Transportation',    results.transportEmissions.toLocaleString(), transportTons, getShare(results.transportEmissions)],
      ['Household Energy',  results.energyEmissions.toLocaleString(),    energyTons,    getShare(results.energyEmissions)],
      ['Food & Diet',       results.foodEmissions.toLocaleString(),      foodTons,      getShare(results.foodEmissions)],
      ['Waste & Shopping',  results.wasteEmissions.toLocaleString(),     wasteTons,     getShare(results.wasteEmissions)],
    ],
    foot: [['Total', total_kg.toLocaleString(), `${totalTons} tons`, '100%']],
    headStyles:  { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    footStyles:  { fillColor: [31, 41, 55], textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { textColor: BLACK, fontSize: 9 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // @ts-ignore – autoTable adds lastAutoTable to the doc instance
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── AI Recommendations ─────────────────────────────────────────────────────
  doc.setTextColor(...BLACK);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Recommendations', MARGIN, y);
  y += 6;

  // Build dynamic recommendations based on the biggest emitter
  const categories = [
    { name: 'Transportation', val: results.transportEmissions },
    { name: 'Household Energy', val: results.energyEmissions },
    { name: 'Food & Diet', val: results.foodEmissions },
    { name: 'Waste & Shopping', val: results.wasteEmissions },
  ].sort((a, b) => b.val - a.val);

  const recommendations: [string, string][] = [
    ['🚗 Transportation', 'Switch to public transport, cycle, or carpool to reduce your highest-impact emission source.'],
    ['⚡ Energy', 'Use energy-efficient appliances, switch to LED lighting, and consider renewable energy sources.'],
    ['🥗 Food & Diet', 'Reduce meat consumption, choose locally sourced produce, and minimise food waste.'],
    ['♻️ Waste', 'Practise recycling, composting, and reduce single-use plastic consumption.'],
    ['💡 General', 'Set a monthly carbon budget and track your progress with EcoTrack AI.'],
  ];

  // Reorder — put highest emitter first
  const highestCat = categories[0].name.split(' ')[0]; // 'Transportation', 'Household', 'Food', 'Waste'
  const recs = [...recommendations];
  const matchIdx = recs.findIndex(r => r[0].includes(highestCat.substring(0, 5)));
  if (matchIdx > 0) {
    const [matched] = recs.splice(matchIdx, 1);
    recs.unshift(matched);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Priority', 'Recommendation']],
    body: recs.map(([cat, rec]) => [cat, rec]),
    headStyles:  { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
    bodyStyles:  { textColor: BLACK, fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: CONTENT_W - 42 },
    },
  });

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Summary block ──────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN_LIGHT);
  doc.roundedRect(MARGIN, y, CONTENT_W, 26, 4, 4, 'F');

  doc.setTextColor(...GREEN_DARK);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', MARGIN + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(31, 80, 55);
  const summaryText = `Your total annual carbon footprint is ${results.annualEstimate} tons CO₂ (${results.totalEmissions.toLocaleString()} kg CO₂/year). `
    + `Your Eco Score is ${results.ecoScore}/100 — "${results.ecoLabel}". Focus on your top emission category (${categories[0].name}) first for maximum impact.`;

  const lines = doc.splitTextToSize(summaryText, CONTENT_W - 12);
  doc.text(lines, MARGIN + 6, y + 17);

  y += 34;

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK_BG);
  doc.rect(0, PAGE_H - 16, PAGE_W, 16, 'F');

  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by EcoTrack AI  |  Software Engineering Mini Project 2026', PAGE_W / 2, PAGE_H - 6, { align: 'center' });

  // ── Save ───────────────────────────────────────────────────────────────────
  doc.save(`Carbon_Report_${fileDate}.pdf`);
}
