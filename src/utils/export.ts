/**
 * Analytics Export Utilities
 * Export functionality for analytics data in various formats
 */

import { Trade } from '../types';
import { AnalyticsFilters, AnalyticsMetrics, generateExportData } from './analytics';

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: string;
  filename?: string;
}

/**
 * Export analytics data to various formats
 */
export async function exportAnalyticsData(
  trades: Trade[],
  filters: AnalyticsFilters,
  options: ExportOptions
): Promise<void> {
  const data = generateExportData(trades, filters, options.format);

  switch (options.format) {
    case 'csv':
      exportToCSV(data as string, options.filename);
      break;
    case 'pdf':
      await exportToPDF(data as ExportData, options);
      break;
    case 'excel':
      await exportToExcel(data as ExportData, options);
      break;
  }
}

/**
 * Export data to CSV format
 */
function exportToCSV(csvContent: string, filename?: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export data to PDF format
 */
async function exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
  try {
    // Import PDF generation library dynamically
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Trading Analytics Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Export info
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, currentY);
    pdf.text(`Period: ${options.dateRange}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 10;

    // Summary metrics
    pdf.setFontSize(14);
    pdf.text('Summary Metrics', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    const metrics = data.summary as AnalyticsMetrics;
    const metricLines = [
      `Total P&L: $${metrics.totalPnL.toFixed(2)}`,
      `Total Trades: ${metrics.totalTrades}`,
      `Win Rate: ${metrics.winRate.toFixed(1)}%`,
      `Avg Risk-Reward: 1:${metrics.avgRiskReward.toFixed(2)}`,
      `Compliance Rate: ${metrics.complianceRate.toFixed(1)}%`,
      `Profit Factor: ${metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}`
    ];

    metricLines.forEach(line => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }
      pdf.text(line, 20, currentY);
      currentY += 6;
    });

    currentY += 10;

    // Trade data table
    if (data.trades && data.trades.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Trade Details', 20, currentY);
      currentY += 10;

      pdf.setFontSize(8);
      const headers = ['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'P&L', 'Compliant'];
      const colWidth = (pageWidth - 40) / headers.length;

      // Headers
      headers.forEach((header, index) => {
        pdf.text(header, 20 + (index * colWidth), currentY);
      });
      currentY += 6;

      // Data rows (limit to first 50 trades for PDF)
      const displayTrades = (data.trades as Trade[]).slice(0, 50);
      displayTrades.forEach(trade => {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }

        const row = [
          new Date(trade.entryDate).toLocaleDateString(),
          trade.symbol,
          trade.type,
          trade.entryPrice.toString(),
          trade.exitPrice?.toString() || '-',
          (trade.profitLoss || 0).toFixed(2),
          trade.ruleCompliant ? 'Yes' : 'No'
        ];

        row.forEach((cell, index) => {
          pdf.text(cell, 20 + (index * colWidth), currentY);
        });
        currentY += 6;
      });

      if ((data.trades as Trade[]).length > 50) {
        pdf.text(`... and ${(data.trades as Trade[]).length - 50} more trades`, 20, currentY);
      }
    }

    // Save PDF
    pdf.save(options.filename || `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('PDF export is not available. Please try CSV export instead.');
  }
}

/**
 * Export data to Excel format
 */
async function exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
  try {
    const { utils, writeFile } = await import('xlsx');

    const workbook = utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total P&L', (data.summary as AnalyticsMetrics).totalPnL],
      ['Total Trades', (data.summary as AnalyticsMetrics).totalTrades],
      ['Win Rate', `${(data.summary as AnalyticsMetrics).winRate.toFixed(1)}%`],
      ['Avg Risk-Reward', `1:${(data.summary as AnalyticsMetrics).avgRiskReward.toFixed(2)}`],
      ['Compliance Rate', `${(data.summary as AnalyticsMetrics).complianceRate.toFixed(1)}%`],
      ['Profit Factor', (data.summary as AnalyticsMetrics).profitFactor === Infinity ? '∞' : (data.summary as AnalyticsMetrics).profitFactor.toFixed(2)],
      ['Trading Days', (data.summary as AnalyticsMetrics).tradingDays],
      ['Best Day', (data.summary as AnalyticsMetrics).bestDay],
      ['Worst Day', (data.summary as AnalyticsMetrics).worstDay]
    ];

    const summarySheet = utils.aoa_to_sheet(summaryData);
    utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Trades sheet
    if (data.trades && (data.trades as Trade[]).length > 0) {
      const tradesData = [
        [
          'Date',
          'Symbol',
          'Type',
          'Entry Price',
          'Exit Price',
          'Quantity',
          'P&L',
          'P&L %',
          'Target',
          'Stop',
          'Rule Compliant',
          'Emotions',
          'Notes'
        ],
        ...(data.trades as Trade[]).map(trade => [
          trade.entryDate,
          trade.symbol,
          trade.type,
          trade.entryPrice,
          trade.exitPrice || '',
          trade.quantity,
          trade.profitLoss || 0,
          trade.profitLossPercent || 0,
          trade.target || '',
          trade.stop || '',
          trade.ruleCompliant ? 'Yes' : 'No',
          (trade.emotions || []).join(', '),
          trade.notes || ''
        ])
      ];

      const tradesSheet = utils.aoa_to_sheet(tradesData);
      utils.book_append_sheet(workbook, tradesSheet, 'Trades');
    }

    // Save Excel file
    writeFile(workbook, options.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new Error('Excel export is not available. Please try CSV export instead.');
  }
}

/**
 * Generate chart image for export
 */
export async function generateChartImage(element: HTMLElement): Promise<string> {
  try {
    const { default: html2canvas } = await import('html2canvas');

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Chart image generation failed:', error);
    return '';
  }
}

/**
 * Format number for display
 */
export function formatNumber(value: number, type: 'currency' | 'percentage' | 'number' = 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  format: 'csv' | 'pdf' | 'excel',
  dateRange: string,
  customSuffix?: string
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffix = customSuffix ? `-${customSuffix}` : '';
  return `trading-analytics-${dateRange}-${timestamp}${suffix}.${format}`;
}

/**
 * Validate export data
 */
export function validateExportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('No data provided for export');
    return { isValid: false, errors };
  }

  if (!data.summary) {
    errors.push('Summary data is missing');
  }

  if (!data.trades || !Array.isArray(data.trades)) {
    errors.push('Trade data is missing or invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Export data structure for PDF/Excel
 */
interface ExportData {
  summary: AnalyticsMetrics;
  trades: Trade[];
  filters: AnalyticsFilters;
  generatedAt: string;
}
