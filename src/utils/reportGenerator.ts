import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import { CalculationResult as V1Result } from './carbonCalculator';
import { AssessmentAnswers, calculateEmissions } from './calculationEngine';

export interface ReportUser {
  name: string;
  email: string;
}

type RGB = [number, number, number];

// ────────────────────────────────────────────────────────────────────────────
// Design tokens
// ────────────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: [16, 107, 74] as RGB,
  primaryLight: [219, 245, 232] as RGB,
  ink: [23, 27, 33] as RGB,
  muted: [110, 118, 129] as RGB,
  border: [228, 231, 235] as RGB,
  surface: [248, 249, 250] as RGB,
  navy: [17, 24, 39] as RGB,
  white: [255, 255, 255] as RGB,
  amber: [180, 95, 6] as RGB,
  chartColors: [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'
  ]
};

const LAYOUT = {
  margin: 18,
  footerHeight: 16,
  sectionGap: 10,
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  energy: 'Energy',
  food: 'Food & Diet',
  waste: 'Waste',
  shopping: 'Shopping',
};

const RECOMMENDATION_TEXT: Record<string, string> = {
  transport: 'Switch to public transport, cycle, or carpool where possible. Combine errands into fewer trips to cut your highest-impact emission source.',
  energy: 'Use energy-efficient appliances, switch to LED lighting, and consider renewable energy sources such as solar where available.',
  food: 'Reduce meat consumption, choose locally sourced produce, and minimise food waste to lower dietary emissions.',
  waste: 'Practise recycling and composting, and reduce single-use plastic consumption to shrink your waste footprint.',
  shopping: 'Opt for durable, second-hand, or sustainably produced goods. Reduce impulse purchases to lower lifecycle emissions.',
};

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

  ensureSpace(y: number, requiredHeight: number): number {
    const bottomLimit = this.pageH - LAYOUT.footerHeight - 8;
    if (y + requiredHeight > bottomLimit) {
      this.doc.addPage();
      return LAYOUT.margin;
    }
    return y;
  }

  setFill(c: RGB) { this.doc.setFillColor(c[0], c[1], c[2]); }
  setText(c: RGB) { this.doc.setTextColor(c[0], c[1], c[2]); }
  setDraw(c: RGB) { this.doc.setDrawColor(c[0], c[1], c[2]); }

  centeredText(text: string, cx: number, cy: number) {
    // @ts-ignore
    this.doc.text(text, cx, cy, { align: 'center', baseline: 'middle' });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Chart Renderer
// ────────────────────────────────────────────────────────────────────────────
async function renderChartToBase64(config: any, width: number, height: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const chart = new Chart(canvas, {
      ...config,
      options: {
        ...config.options,
        responsive: false,
        animation: false,
        devicePixelRatio: 2,
      }
    });

    setTimeout(() => {
      resolve(canvas.toDataURL('image/png'));
      chart.destroy();
    }, 150);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Section: Header
// ────────────────────────────────────────────────────────────────────────────
function drawHeader(ctx: ReportContext, dateStr: string, subtitle: string): number {
  const { doc, pageW } = ctx;
  const bannerH = 36; // Slightly shorter for non-page-1

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
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  ctx.setText(COLORS.white);
  doc.text('EcoTrack AI', LAYOUT.margin + 20, bannerH / 2 - 1);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  ctx.setText(COLORS.primaryLight);
  doc.text(subtitle, LAYOUT.margin + 20, bannerH / 2 + 6);

  // Meta block
  doc.setFontSize(8.5);
  ctx.setText(COLORS.muted);
  doc.text(dateStr, pageW - LAYOUT.margin, bannerH / 2 - 1, { align: 'right' });
  doc.text('Professional Analytics Edition', pageW - LAYOUT.margin, bannerH / 2 + 6, { align: 'right' });

  return bannerH + 12;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 1: Executive Summary
// ────────────────────────────────────────────────────────────────────────────
function drawUserInfo(ctx: ReportContext, user: ReportUser, dateStr: string, startY: number): number {
  const { doc, contentW } = ctx;
  const padX = 6;
  const emailLines: string[] = doc.splitTextToSize(user.email || '\u2014', contentW - padX * 2);
  const cardH = 16 + 8 + emailLines.length * 4.4 + 6;
  
  let y = ctx.ensureSpace(startY, cardH);
  ctx.setFill(COLORS.surface); ctx.setDraw(COLORS.border); doc.setLineWidth(0.2);
  doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 3, 3, 'FD');

  let cursorY = y + 9;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.muted);
  doc.text('REPORT FOR', LAYOUT.margin + padX, cursorY);
  doc.text('GENERATED', LAYOUT.margin + contentW / 2, cursorY);

  cursorY += 6;
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text(user.name || 'Eco User', LAYOUT.margin + padX, cursorY);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(dateStr, LAYOUT.margin + contentW / 2, cursorY);

  cursorY += 8;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.muted);
  doc.text('EMAIL', LAYOUT.margin + padX, cursorY);

  cursorY += 5;
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.ink);
  doc.text(emailLines, LAYOUT.margin + padX, cursorY);
  
  return y + cardH + LAYOUT.sectionGap;
}

function drawEcoScore(ctx: ReportContext, results: any, startY: number): number {
  const { doc, contentW } = ctx;
  const cardH = 38;
  const y = ctx.ensureSpace(startY, cardH);

  ctx.setFill(COLORS.primary);
  doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 4, 4, 'F');

  ctx.setText(COLORS.primaryLight); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('ECO SCORE', LAYOUT.margin + 8, y + 13);
  ctx.setText(COLORS.white); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  const scoreLabel = `${results.ecoScore ?? 0}`;
  doc.text(scoreLabel, LAYOUT.margin + 8, y + 28);
  const scoreW = doc.getTextWidth(scoreLabel);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text('/ 100', LAYOUT.margin + 8 + scoreW + 2.5, y + 28);

  ctx.setDraw(COLORS.primaryLight); doc.setLineWidth(0.2);
  doc.line(LAYOUT.margin + contentW * 0.48, y + 8, LAYOUT.margin + contentW * 0.48, y + cardH - 8);

  const rightX = LAYOUT.margin + contentW * 0.55;
  ctx.setText(COLORS.primaryLight); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('ECO LABEL', rightX, y + 12);
  ctx.setText(COLORS.white); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(results.ecoLabel || 'Standard', rightX, y + 18);

  ctx.setText(COLORS.primaryLight); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('ANNUAL EMISSIONS', rightX, y + 27);
  ctx.setText(COLORS.white); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text(`${results.annualEstimate ?? (results.totalKgCO2PerYear ? (results.totalKgCO2PerYear / 1000).toFixed(2) : 0)} t CO2`, rightX, y + 33);

  return y + cardH + LAYOUT.sectionGap;
}

function drawSummary(ctx: ReportContext, results: any, categories: any[], startY: number): number {
  const { doc, contentW } = ctx;
  const padX = 6; const padY = 9;
  const totalKg = results.totalKgCO2PerYear ?? results.totalEmissions ?? 0;
  const annualEstimate = results.annualEstimate ?? (totalKg / 1000).toFixed(2);
  
  const INDIA_AVG_KG = 2200;
  const vsIndiaPct = Math.round(((totalKg - INDIA_AVG_KG) / INDIA_AVG_KG) * 100);
  const comparisonText = vsIndiaPct <= 0 
    ? `${Math.abs(vsIndiaPct)}% lower than the Indian national average (2.2t)`
    : `${vsIndiaPct}% higher than the Indian national average (2.2t)`;
  
  const summaryText =
    `Your total annual carbon footprint is ${annualEstimate} tons CO2 ` +
    `(${totalKg.toLocaleString()} kg CO2/year), which is ${comparisonText}. Your Eco Score is ` +
    `${results.ecoScore ?? 0}/100 - "${results.ecoLabel || 'Standard'}". Focus on your top emission category, ` +
    `${categories[0]?.name || 'emissions'}, first for maximum impact.`;

  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(summaryText, contentW - padX * 2);
  const boxH = padY + 6 + lines.length * 4.4 + 6;
  const y = ctx.ensureSpace(startY, boxH);

  ctx.setFill(COLORS.primaryLight);
  doc.roundedRect(LAYOUT.margin, y, contentW, boxH, 3, 3, 'F');
  ctx.setText(COLORS.primary); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('Summary', LAYOUT.margin + padX, y + 9);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); ctx.setText([31, 80, 55] as RGB);
  doc.text(lines, LAYOUT.margin + padX, y + 17);

  return y + boxH + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 2: Detailed Category Analysis
// ────────────────────────────────────────────────────────────────────────────
function drawEmissionTable(ctx: ReportContext, results: any, categories: any[], startY: number): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 20);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('Emission Breakdown', LAYOUT.margin, y);
  y += 6;

  const totalKg = results.totalKgCO2PerYear ?? results.totalEmissions ?? 0;
  const body = categories.map((c) => [
    c.name,
    c.val.toLocaleString(),
    (c.val / 1000).toFixed(3),
    totalKg > 0 ? `${((c.val / totalKg) * 100).toFixed(1)}%` : '\u2014',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: LAYOUT.margin, right: LAYOUT.margin, bottom: LAYOUT.footerHeight + 8 },
    head: [['Category', 'Annual (kg CO2)', 'Annual (t CO2)', 'Share']],
    body,
    foot: [['Total', totalKg.toLocaleString(), `${results.annualEstimate ?? (totalKg / 1000).toFixed(2)} t`, '100%']],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, textColor: COLORS.ink, lineColor: COLORS.border, lineWidth: 0.15, cellPadding: { top: 4.5, bottom: 4.5, left: 4, right: 4 } },
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: COLORS.surface },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: contentW * 0.32 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + LAYOUT.sectionGap;

  // Progress Bars
  y = ctx.ensureSpace(y, categories.length * 8 + 10);
  doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.muted);
  doc.text('SHARE OF TOTAL', LAYOUT.margin, y);
  y += 5;

  const barMaxW = contentW - 55;
  const maxVal = Math.max(...categories.map((c: any) => c.val), 1);
  categories.forEach((c) => {
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.ink);
    doc.text(c.name, LAYOUT.margin, y + 3);
    const trackX = LAYOUT.margin + 40;
    ctx.setFill(COLORS.border); doc.roundedRect(trackX, y, barMaxW, 3.2, 1, 1, 'F');
    const w = Math.max((c.val / maxVal) * barMaxW, 1.5);
    ctx.setFill(c === categories[0] ? COLORS.amber : COLORS.primary);
    doc.roundedRect(trackX, y, w, 3.2, 1, 1, 'F');
    doc.setFontSize(8); ctx.setText(COLORS.muted);
    doc.text(totalKg > 0 ? `${((c.val / totalKg) * 100).toFixed(1)}%` : '\u2014', trackX + barMaxW + 3, y + 3);
    y += 8;
  });

  return y + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 3: Charts
// ────────────────────────────────────────────────────────────────────────────
async function drawCharts(ctx: ReportContext, results: any, categories: any[], historyDocs: any[] | undefined, startY: number): Promise<number> {
  const { doc, contentW } = ctx;
  let y = startY;
  
  const chartW = contentW * 3; // Render larger, scale down
  const chartH = 500;

  // 1. Doughnut Chart
  y = ctx.ensureSpace(y, 80);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('Emission Distribution', LAYOUT.margin, y);
  y += 5;

  const doughnutConfig = {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.val),
        backgroundColor: COLORS.chartColors,
      }]
    },
    options: { plugins: { legend: { position: 'right' } } }
  };
  
  const doughnutB64 = await renderChartToBase64(doughnutConfig, chartW, chartH);
  doc.addImage(doughnutB64, 'PNG', LAYOUT.margin, y, contentW, 60);
  y += 70;

  // 2. History Trend Chart
  if (historyDocs && historyDocs.length > 1) {
    y = ctx.ensureSpace(y, 80);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
    doc.text('Historical Trend', LAYOUT.margin, y);
    y += 5;

    // Must map strictly as numbers
    const labels = historyDocs.map((doc: any) => new Date(doc.createdAt?.toDate?.() || new Date()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })).reverse();
    const data = historyDocs.map((doc: any) => Math.round(doc.emissions?.totalKgCO2PerYear ?? 0)).reverse();

    const lineConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total CO2 (kg)',
          data: data,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }]
      }
    };
    const lineB64 = await renderChartToBase64(lineConfig, chartW, chartH);
    doc.addImage(lineB64, 'PNG', LAYOUT.margin, y, contentW, 60);
    y += 70;
  } else {
    y = ctx.ensureSpace(y, 30);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
    doc.text('Historical Trend', LAYOUT.margin, y);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.muted);
    doc.text('Only one assessment recorded — revisit after completing another assessment to see your progress trend.', LAYOUT.margin, y + 6);
    y += 20;
  }

  return y;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 4: AI Recommendations
// ────────────────────────────────────────────────────────────────────────────
function drawRecommendations(ctx: ReportContext, categories: any[], startY: number): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 20);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('AI Sustainability Coach', LAYOUT.margin, y);
  y += 6;

  const items = categories.map((c) => ({
    title: c.name,
    body: RECOMMENDATION_TEXT[c.key],
  }));
  items.push({ title: 'General', body: 'Set a monthly carbon budget and track your progress with EcoTrack AI to build lasting habits.' });

  const padX = 6; const padY = 5; const textW = contentW - padX * 2 - 12;

  items.forEach((item, idx) => {
    const lines = doc.splitTextToSize(item.body, textW);
    const cardH = Math.max(18, padY * 2 + 6 + lines.length * 4.2);
    y = ctx.ensureSpace(y, cardH);

    ctx.setFill(idx === 0 ? COLORS.primaryLight : COLORS.surface);
    ctx.setDraw(COLORS.border); doc.setLineWidth(0.2);
    doc.roundedRect(LAYOUT.margin, y, contentW, cardH, 3, 3, 'FD');

    ctx.setFill(idx === 0 ? COLORS.amber : COLORS.primary);
    doc.circle(LAYOUT.margin + padX + 4, y + padY + 4, 4, 'F');
    ctx.setText(COLORS.white); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    ctx.centeredText(`${idx + 1}`, LAYOUT.margin + padX + 4, y + padY + 4);

    ctx.setText(COLORS.ink); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(item.title, LAYOUT.margin + padX + 12, y + padY + 5);

    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.muted);
    doc.text(lines, LAYOUT.margin + padX + 12, y + padY + 11);
    y += cardH + 5;
  });

  return y + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 5: Scenario Simulator
// ────────────────────────────────────────────────────────────────────────────
function drawSimulator(ctx: ReportContext, results: any, answers: AssessmentAnswers, startY: number): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 30);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('Scenario Simulator (What-If Analysis)', LAYOUT.margin, y);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.muted);
  doc.text('Projected emissions if you make the following changes:', LAYOUT.margin, y + 5);
  y += 12;

  // Run hypothetical scenarios
  const scenarios = [];
  const currentTotal = results.totalKgCO2PerYear;

  // Scenario 1: Plant-based diet
  const vDiet = { ...answers, dietType: 'vegan' as any };
  const vRes = calculateEmissions(vDiet);
  if (vRes.totalKgCO2PerYear < currentTotal) {
    scenarios.push(['Switch to Plant-Based Diet', currentTotal.toFixed(0), vRes.totalKgCO2PerYear.toFixed(0), (currentTotal - vRes.totalKgCO2PerYear).toFixed(0)]);
  }

  // Scenario 2: 25% less driving
  if (answers.dailyVehicleKm && answers.dailyVehicleKm > 0) {
    const vDrive = { ...answers, dailyVehicleKm: answers.dailyVehicleKm * 0.75 };
    const dRes = calculateEmissions(vDrive);
    scenarios.push(['Drive 25% Less', currentTotal.toFixed(0), dRes.totalKgCO2PerYear.toFixed(0), (currentTotal - dRes.totalKgCO2PerYear).toFixed(0)]);
  }
  
  // Scenario 3: Add 2kW Solar
  if (!answers.solarInstalledKw) {
    const vSolar = { ...answers, solarInstalledKw: 2 };
    const sRes = calculateEmissions(vSolar);
    scenarios.push(['Install 2kW Solar Panels', currentTotal.toFixed(0), sRes.totalKgCO2PerYear.toFixed(0), (currentTotal - sRes.totalKgCO2PerYear).toFixed(0)]);
  }

  if (scenarios.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: LAYOUT.margin, right: LAYOUT.margin, bottom: LAYOUT.footerHeight + 8 },
      head: [['Scenario', 'Current (kg)', 'Projected (kg)', 'Reduction (kg)']],
      body: scenarios,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9, textColor: COLORS.ink, lineColor: COLORS.border, lineWidth: 0.15, cellPadding: 4 },
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: COLORS.surface },
    });
    // @ts-ignore
    y = doc.lastAutoTable.finalY + LAYOUT.sectionGap;
  } else {
    doc.text('Your current footprint is fully optimised in our simulator.', LAYOUT.margin, y);
    y += 10;
  }

  return y;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 6: Scientific Methodology
// ────────────────────────────────────────────────────────────────────────────
function drawScientificMetadata(ctx: ReportContext, results: any, startY: number): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 40);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('Scientific Methodology', LAYOUT.margin, y);
  y += 6;

  const metadataRows = [
    ['Dataset Registry Version', results.metadata?.datasetVersion || '2026.1 (Latest)'],
    ['Calculation Engine Version', results.metadata?.calculatorVersion || '2.0.0'],
    ['Confidence Engine Methodology', 'Weighted heuristics per sector based on precise data vs estimates'],
    ['Overall Scientific Confidence', `${results.confidence?.overallScore || 85}% - ${results.confidence?.overallRating || 'HIGH'}`],
    ['AI Prompt Version', 'v1.4 - Context-aware semantic reasoning'],
    ['Data Source (State)', results.metadata?.state || 'India Average (CEA)'],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: LAYOUT.margin, right: LAYOUT.margin, bottom: LAYOUT.footerHeight + 8 },
    body: metadataRows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, textColor: COLORS.ink, lineColor: COLORS.border, lineWidth: 0.15, cellPadding: 4 },
    alternateRowStyles: { fillColor: COLORS.surface },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: contentW * 0.4 }, 1: { halign: 'left' } },
  });
  // @ts-ignore
  return doc.lastAutoTable.finalY + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Page 7: Appendix (Raw Inputs)
// ────────────────────────────────────────────────────────────────────────────
function drawAppendix(ctx: ReportContext, answers: AssessmentAnswers, startY: number): number {
  const { doc, contentW } = ctx;
  let y = ctx.ensureSpace(startY, 20);

  doc.setFontSize(13); doc.setFont('helvetica', 'bold'); ctx.setText(COLORS.ink);
  doc.text('Appendix - Assessment Inputs', LAYOUT.margin, y);
  y += 6;

  const rows = Object.entries(answers).map(([k, v]) => {
    let displayV = v;
    if (typeof v === 'boolean') displayV = v ? 'Yes' : 'No';
    if (typeof v === 'object') displayV = JSON.stringify(v);
    return [k, String(displayV)];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: LAYOUT.margin, right: LAYOUT.margin, bottom: LAYOUT.footerHeight + 8 },
    head: [['Input Field', 'Value Provided']],
    body: rows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 8, textColor: COLORS.ink, lineColor: COLORS.border, lineWidth: 0.15, cellPadding: 3 },
    headStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLORS.surface },
  });
  // @ts-ignore
  return doc.lastAutoTable.finalY + LAYOUT.sectionGap;
}

// ────────────────────────────────────────────────────────────────────────────
// Footer (drawn on every page)
// ────────────────────────────────────────────────────────────────────────────
function drawFooters(ctx: ReportContext): void {
  const { doc, pageW, pageH } = ctx;
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    ctx.setFill(COLORS.navy);
    doc.rect(0, pageH - LAYOUT.footerHeight, pageW, LAYOUT.footerHeight, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); ctx.setText(COLORS.muted);
    doc.text('Generated by EcoTrack AI  |  Software Engineering Mini Project 2026', LAYOUT.margin, pageH - LAYOUT.footerHeight / 2 + 1.5);
    doc.text(`Page ${i} of ${totalPages}`, pageW - LAYOUT.margin, pageH - LAYOUT.footerHeight / 2 + 1.5, { align: 'right' });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────────────────────
export async function generateCarbonReport(
  results: any,
  user: ReportUser,
  options?: {
    answers?: AssessmentAnswers;
    historyDocs?: any[];
    assessmentDate?: string;
  }
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ctx = new ReportContext(doc);
  const dateStr = options?.assessmentDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const fileDate = new Date().toISOString().slice(0, 10);

  const breakdown = results.breakdown || { transport: 0, energy: 0, food: 0, waste: 0, shopping: 0 };
  const categories = (['transport', 'energy', 'food', 'waste', 'shopping'] as const)
    .map(key => ({ key, name: CATEGORY_LABELS[key], val: breakdown[key] || 0 }))
    .filter(c => c.val > 0)
    .sort((a, b) => b.val - a.val);

  // Page 1
  let y = drawHeader(ctx, dateStr, 'Carbon Footprint Executive Summary');
  y = drawUserInfo(ctx, user, dateStr, y);
  y = drawEcoScore(ctx, results, y);
  y = drawSummary(ctx, results, categories, y);

  // Page 2
  doc.addPage();
  y = drawHeader(ctx, dateStr, 'Detailed Category Analysis');
  y = drawEmissionTable(ctx, results, categories, y);

  // Page 3
  doc.addPage();
  y = drawHeader(ctx, dateStr, 'Emission Charts & Trends');
  y = await drawCharts(ctx, results, categories, options?.historyDocs, y);

  // Page 4
  doc.addPage();
  y = drawHeader(ctx, dateStr, 'AI Sustainability Coach');
  y = drawRecommendations(ctx, categories, y);

  // Page 5
  if (options?.answers) {
    doc.addPage();
    y = drawHeader(ctx, dateStr, 'Scenario Simulator');
    y = drawSimulator(ctx, results, options.answers, y);
  }

  // Page 6
  doc.addPage();
  y = drawHeader(ctx, dateStr, 'Scientific Methodology');
  y = drawScientificMetadata(ctx, results, y);

  // Page 7
  if (options?.answers) {
    doc.addPage();
    y = drawHeader(ctx, dateStr, 'Appendix - Raw Inputs');
    y = drawAppendix(ctx, options.answers, y);
  }

  drawFooters(ctx);
  doc.save(`EcoTrackAI_Carbon_Assessment_${fileDate}.pdf`);
}
