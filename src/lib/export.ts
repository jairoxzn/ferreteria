'use client';

import { formatDate } from '@/lib/utils';

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
  width?: number;
}

export async function exportToExcel<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = 'Reporte',
) {
  const XLSX = await import('xlsx');
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {};
    columns.forEach((col) => {
      obj[col.header] = col.accessor(r);
    });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  if (columns.some((c) => c.width)) {
    ws['!cols'] = columns.map((c) => ({ wch: c.width ?? 15 }));
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}-${formatDate(new Date()).replace(/\//g, '-')}.xlsx`);
}

export async function exportToPDF<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title: string,
  subtitle?: string,
) {
  const jsPDFModule = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 40, 50);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(subtitle, 40, 68);
  }

  doc.setFontSize(9);
  doc.setTextColor(140);
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 40, 86);

  // Table
  autoTable(doc, {
    startY: 110,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(c.accessor(r)))),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [10, 10, 10], textColor: [250, 204, 21], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}-${formatDate(new Date()).replace(/\//g, '-')}.pdf`);
}
