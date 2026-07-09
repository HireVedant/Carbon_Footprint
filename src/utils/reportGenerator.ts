import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult } from './carbonCalculator';

interface ReportUser {
  name: string;
  email: string;
}

type RGB = [number, number, number];

// ────────────────────────────────────────────────────────────────────────────
// Design tokens
// ────────────────────────────────────────────────────────────────────────────

const COLORS = {
  primary: [16, 107, 74] as RGB, // deep green
  primaryLight: [219, 245, 232] as RGB, // pale green
  ink: [23, 27, 33] as RGB, // near-black text
  muted: [110, 118, 129] as RGB, // gray text
  border: [228, 231, 235] as RGB, // light border
  surface: [248, 249, 250] as RGB, // card background
  navy: [17, 24, 39] as RGB, // header / footer background
  white: [255, 255, 255] as RGB,
  amber: [180, 95, 6] as RGB, // highest-emission accent
};

const LAYOUT = {
  margin: 18,
  footerHeight: 16,
  sectionGap: 10,
};

const CATEGORY_LABELS: Record<string, string> = {
  transportEmissions: 'Transport',
  energyEmissions: 'Energy',
  foodEmissions: 'Food & Diet',
  wasteEmissions: 'Waste & Shopping',
};

const RECOMMENDATION_TEXT: Record<string, string> = {
  transportEmissions:
    'Switch to public transport, cycle, or carpool where possible. Combine errands into fewer trips to cut your highest-impact emission source.',
  energyEmissions:
    'Use energy-efficient appliances, switch to LED lighting, and consider renewable energy sources such as solar where available.',
  foodEmissions:
    'Reduce meat consumption, choose locally sourced produce, and minimise food waste to lower dietary emissions.',
  wasteEmissions:
    'Practise recycling and composting, and reduce single-use plastic consumption to shrink your waste footprint.',
};

// ────────────────────────────────────────────────────────────────────────────
// Small drawing utilities
// ────────────────────────────────────────────────────────────────────────────

class ReportContext {
  doc: jsPDF;
  pageW: number;
  pageH: number;
  contentW: number;

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.pageW = doc.internal.pageSize.getWidth();
    this.pageH = doc.internal.pageSize.getHeight();
    this.contentW = this.pageW - LAYOUT.margin * 2;
  }

  /** Ensures `requiredHeight` mm of space remains before the footer; adds a page if not. */
  ensureSpace(y: number, requiredHeight: number): number {
    const bottomLimit = this.pageH - LAYOUT.footerHeight - 8;
    if (y + requiredHeight > bottomLimit) {
      this.doc.addPage();
      return LAYOUT.margin;
    }
    return y;
  }

  setFill(c: RGB) {
    this.doc.setFillColor(c[0], c[1], c[2]);
  }
  setText(c: RGB) {
    this.doc.setTextColor(c[0], c[1], c[2]);
  }
  setDraw(c: RGB) {
    this.doc.setDrawColor(c[0], c[1], c[2]);
  }

  /** Draws text perfectly centered (both axes) at (cx, cy) — e.g. inside a circle badge. */
  centeredText(text: string, cx: number, cy: number) {
    // @ts-ignore - jsPDF supports a 'middle' baseline for true vertical centering
    this.doc.text(text, cx, cy, { align: 'center', baseline: 'middle' });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Header (page 1 only)
// ────────────────────────────────────────────────────────────────────────────

function drawHeader(ctx: ReportContext, dateStr: string): number {
  const { doc, pageW } = ctx;
  const bannerH = 42;

  ctx.setFill(COLORS.navy);
  doc.rect(0, 0, pageW, bannerH, 'F');

  // Logo mark
  ctx.setFill(COLORS.primary);
  doc.circle(LAYOUT.margin + 7, bannerH / 2, 7, 'F');
  ctx.setText(COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  ctx.centeredText('E', LAYOUT.margin + 7, bannerH / 2);

  // Title block
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.white);
  doc.text('EcoTrack AI', LAYOUT.margin + 20, bannerH / 2 - 2);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  ctx.setText(COLORS.primaryLight);
  doc.text('Carbon Footprint Assessment Report', LAYOUT.margin + 20, bannerH / 2 + 7);

  // Meta block (right-aligned)
  doc.setFontSize(8.5);
  ctx.setText(COLORS.muted);
  doc.text(dateStr, pageW - LAYOUT.margin, bannerH / 2 - 1, { align: 'right' });
  doc.text('Software Engineering Mini Project 2026', pageW - LAYOUT.margin, bannerH / 2 + 7, {
    align: 'right',
  });

  return bannerH + 16;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: User info card (handles long emails via wrapping, dynamic height)
// ────────────────────────────────────────────────────────────────────────────

function drawUserInfo(ctx: ReportContext, user: ReportUser, dateStr: string, startY: number): number {
  const { doc, contentW } = ctx;
  const padX = 6;
  const labelSize = 7.5;
  const valueSize = 10;

  const emailLines: string[] = doc.splitTextToSize(user.email || '\u2014', contentW - padX * 2);
  const cardH = 16 + 8 + emailLines.length * 4.4 + 6;

  let y = ctx.ensureSpace(startY, cardH);

  ctx.setFill(COLORS.surface);
  ctx.setDraw(COLORS.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 3, 3, 'FD');

  let cursorY = y + 9;

  // Row 1: Report for / Generated
  doc.setFontSize(labelSize);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.muted);
  doc.text('REPORT FOR', LAYOUT.margin + padX, cursorY);
  doc.text('GENERATED', LAYOUT.margin + contentW / 2, cursorY);

  cursorY += 6;
  doc.setFontSize(valueSize);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.ink);
  doc.text(user.name || 'Eco User', LAYOUT.margin + padX, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(dateStr, LAYOUT.margin + contentW / 2, cursorY);

  cursorY += 8;

  // Row 2: Email (full width, wrapped)
  doc.setFontSize(labelSize);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.muted);
  doc.text('EMAIL', LAYOUT.margin + padX, cursorY);

  cursorY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  ctx.setText(COLORS.ink);
  doc.text(emailLines, LAYOUT.margin + padX, cursorY);

  return y + cardH + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Eco Score dashboard card
// ────────────────────────────────────────────────────────────────────────────

function drawEcoScore(ctx: ReportContext, results: CalculationResult, startY: number): number {
  const { doc, contentW } = ctx;
  const cardH = 38;
  const y = ctx.ensureSpace(startY, cardH);

  ctx.setFill(COLORS.primary);
  doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 4, 4, 'F');

  // Left: score
  ctx.setText(COLORS.primaryLight);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ECO SCORE', LAYOUT.margin + 8, y + 13);

  ctx.setText(COLORS.white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const scoreLabel = `${results.ecoScore}`;
  doc.text(scoreLabel, LAYOUT.margin + 8, y + 28);
  const scoreW = doc.getTextWidth(scoreLabel);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('/ 100', LAYOUT.margin + 8 + scoreW + 2.5, y + 28);

  // Divider
  ctx.setDraw(COLORS.primaryLight);
  doc.setLineWidth(0.2);
  doc.line(LAYOUT.margin + contentW * 0.48, y + 8, LAYOUT.margin + contentW * 0.48, y + cardH - 8);

  // Right: label + annual estimate, evenly stacked with matching top/bottom padding
  // so neither row ever sits on the card's edge (fixes the previous bottom-clip bug).
  const rightX = LAYOUT.margin + contentW * 0.55;
  const row1LabelY = y + 12;
  const row1ValueY = row1LabelY + 6;
  const row2LabelY = row1ValueY + 9;
  const row2ValueY = row2LabelY + 6;

  ctx.setText(COLORS.primaryLight);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ECO LABEL', rightX, row1LabelY);
  ctx.setText(COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(results.ecoLabel, rightX, row1ValueY);

  ctx.setText(COLORS.primaryLight);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ANNUAL EMISSIONS', rightX, row2LabelY);
  ctx.setText(COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.annualEstimate} t CO2`, rightX, row2ValueY);

  return y + cardH + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Emission breakdown (AutoTable) + mini share bars
// ────────────────────────────────────────────────────────────────────────────

interface CategoryStat {
  key: keyof typeof CATEGORY_LABELS;
  name: string;
  val: number;
}

function getShare(kg: number, totalKg: number): string {
  return totalKg > 0 ? `${((kg / totalKg) * 100).toFixed(1)}%` : '\u2014';
}

function drawEmissionTable(
  ctx: ReportContext,
  results: CalculationResult,
  categories: CategoryStat[],
  startY: number
): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 20);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.ink);
  doc.text('Emission Breakdown', LAYOUT.margin, y);
  y += 6;

  const totalKg = results.totalEmissions;
  const body = categories.map((c) => [
    c.name,
    c.val.toLocaleString(),
    (c.val / 1000).toFixed(3),
    getShare(c.val, totalKg),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: LAYOUT.margin, right: LAYOUT.margin, bottom: LAYOUT.footerHeight + 8 },
    head: [['Category', 'Annual (kg CO2)', 'Annual (t CO2)', 'Share']],
    body,
    foot: [['Total', totalKg.toLocaleString(), `${results.annualEstimate} t`, '100%']],
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: COLORS.ink,
      lineColor: COLORS.border,
      lineWidth: 0.15,
      cellPadding: { top: 4.5, bottom: 4.5, left: 4, right: 4 },
    },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: COLORS.surface },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: contentW * 0.32 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // @ts-ignore - autoTable attaches lastAutoTable to the doc instance
  y = (doc as any).lastAutoTable.finalY + LAYOUT.sectionGap;

  // Mini share bars for a quick visual read of proportions
  const barsH = categories.length * 8 + 6;
  y = ctx.ensureSpace(y, barsH);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.muted);
  doc.text('SHARE OF TOTAL', LAYOUT.margin, y);
  y += 5;

  const barMaxW = contentW - 55;
  const maxVal = Math.max(...categories.map((c) => c.val), 1);

  categories.forEach((c) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    ctx.setText(COLORS.ink);
    doc.text(c.name, LAYOUT.margin, y + 3);

    const trackX = LAYOUT.margin + 40;
    ctx.setFill(COLORS.border);
    doc.roundedRect(trackX, y, barMaxW, 3.2, 1, 1, 'F');

    const w = Math.max((c.val / maxVal) * barMaxW, 1.5);
    ctx.setFill(c === categories[0] ? COLORS.amber : COLORS.primary);
    doc.roundedRect(trackX, y, w, 3.2, 1, 1, 'F');

    doc.setFontSize(8);
    ctx.setText(COLORS.muted);
    doc.text(getShare(c.val, totalKg), trackX + barMaxW + 3, y + 3);

    y += 8;
  });

  return y + LAYOUT.sectionGap - 4;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Recommendations (priority cards, dynamically ordered)
// ────────────────────────────────────────────────────────────────────────────

function drawRecommendations(
  ctx: ReportContext,
  categories: CategoryStat[],
  startY: number
): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 20);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.ink);
  doc.text('AI Recommendations', LAYOUT.margin, y);
  y += 6;

  const items: { title: string; body: string }[] = categories.map((c) => ({
    title: c.name,
    body: RECOMMENDATION_TEXT[c.key],
  }));
  items.push({
    title: 'General',
    body: 'Set a monthly carbon budget and track your progress with EcoTrack AI to build lasting habits.',
  });

  const padX = 6;
  const padY = 5;
  const textW = contentW - padX * 2 - 12;

  items.forEach((item, idx) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const lines: string[] = doc.splitTextToSize(item.body, textW);
    const cardH = Math.max(18, padY * 2 + 6 + lines.length * 4.2);

    y = ctx.ensureSpace(y, cardH);

    ctx.setFill(idx === 0 ? COLORS.primaryLight : COLORS.surface);
    ctx.setDraw(COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 3, 3, 'FD');

    // Priority number badge
    ctx.setFill(idx === 0 ? COLORS.amber : COLORS.primary);
    doc.circle(LAYOUT.margin + padX + 4, y + padY + 4, 4, 'F');
    ctx.setText(COLORS.white);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    ctx.centeredText(`${idx + 1}`, LAYOUT.margin + padX + 4, y + padY + 4);

    // Title
    ctx.setText(COLORS.ink);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, LAYOUT.margin + padX + 12, y + padY + 5);

    // Body
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    ctx.setText(COLORS.muted);
    doc.text(lines, LAYOUT.margin + padX + 12, y + padY + 11);

    y += cardH + 5;
  });

  return y + LAYOUT.sectionGap - 5;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Summary (auto-resizing box)
// ────────────────────────────────────────────────────────────────────────────

function drawSummary(
  ctx: ReportContext,
  results: CalculationResult,
  categories: CategoryStat[],
  startY: number
): number {
  const { doc, contentW } = ctx;
  const padX = 6;
  const padY = 9;

  const summaryText =
    `Your total annual carbon footprint is ${results.annualEstimate} tons CO2 ` +
    `(${results.totalEmissions.toLocaleString()} kg CO2/year). Your Eco Score is ` +
    `${results.ecoScore}/100 - "${results.ecoLabel}". Focus on your top emission category, ` +
    `${categories[0].name}, first for maximum impact.`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const lines: string[] = doc.splitTextToSize(summaryText, contentW - padX * 2);
  const boxH = padY + 6 + lines.length * 4.4 + 6;

  const y = ctx.ensureSpace(startY, boxH);

  ctx.setFill(COLORS.primaryLight);
  doc.roundedRect(LAYOUT.margin, y, contentW, boxH, 3, 3, 'F');

  ctx.setText(COLORS.primary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', LAYOUT.margin + padX, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  ctx.setText([31, 80, 55] as RGB);
  doc.text(lines, LAYOUT.margin + padX, y + 17);

  return y + boxH + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Footer (drawn on every page, after all content is known)
// ────────────────────────────────────────────────────────────────────────────

function drawFooters(ctx: ReportContext): void {
  const { doc, pageW, pageH } = ctx;
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    ctx.setFill(COLORS.navy);
    doc.rect(0, pageH - LAYOUT.footerHeight, pageW, LAYOUT.footerHeight, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    ctx.setText(COLORS.muted);
    doc.text(
      'Generated by EcoTrack AI  |  Software Engineering Mini Project 2026',
      LAYOUT.margin,
      pageH - LAYOUT.footerHeight / 2 + 1.5
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - LAYOUT.margin, pageH - LAYOUT.footerHeight / 2 + 1.5, {
      align: 'right',
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────────────────────

/**
 * Generates a complete Carbon Footprint PDF report.
 * Preserves all existing calculations/data; only layout and rendering are improved.
 */
export function generateCarbonReport(results: CalculationResult, user: ReportUser): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ctx = new ReportContext(doc);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const fileDate = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const categories: CategoryStat[] = (
    [
      { key: 'transportEmissions', val: results.transportEmissions },
      { key: 'energyEmissions', val: results.energyEmissions },
      { key: 'foodEmissions', val: results.foodEmissions },
      { key: 'wasteEmissions', val: results.wasteEmissions },
    ] as { key: keyof typeof CATEGORY_LABELS; val: number }[]
  )
    .map((c) => ({ key: c.key, name: CATEGORY_LABELS[c.key], val: c.val }))
    .sort((a, b) => b.val - a.val);

  let y = drawHeader(ctx, dateStr);
  y = drawUserInfo(ctx, user, dateStr, y);
  y = drawEcoScore(ctx, results, y);
  y = drawEmissionTable(ctx, results, categories, y);
  y = drawRecommendations(ctx, categories, y);
  drawSummary(ctx, results, categories, y);

  drawFooters(ctx);

  doc.save(`Carbon_Report_${fileDate}.pdf`);
}
