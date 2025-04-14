import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TranslateService } from '@ngx-translate/core';

interface FileSystemError extends Error {
  name: string;
}

declare global {
  interface Window {
    showSaveFilePicker: (options?: any) => Promise<any>;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private translate: TranslateService) { }

  async exportToPDF(elementId: string, fileName: string, showDialog: boolean = false): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      if (showDialog && 'showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${fileName}.pdf`,
            types: [{
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          const blob = pdf.output('blob');
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          const error = err as FileSystemError;
          // Check if the error is due to user cancellation
          if (error.name === 'AbortError') {
            return; // User cancelled, do nothing
          }
          // For other errors, fallback to default saveAs
          pdf.save(`${fileName}.pdf`);
        }
      } else {
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  async exportToExcel(data: any[], fileName: string, showDialog: boolean = false): Promise<void> {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Auto-fit columns
      const wscols = Object.keys(data[0]).map(() => ({ wch: 20 }));
      worksheet['!cols'] = wscols;

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      if (showDialog && 'showSaveFilePicker' in window) {
        try {
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${fileName}.xlsx`,
            types: [{
              description: 'Excel Files',
              accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
            }]
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          const error = err as FileSystemError;
          // Check if the error is due to user cancellation
          if (error.name === 'AbortError') {
            return; // User cancelled, do nothing
          }
          // For other errors, fallback to default saveAs
          saveAs(blob, `${fileName}.xlsx`);
        }
      } else {
        saveAs(blob, `${fileName}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  formatDataForExport(data: any[], type: 'task' | 'meeting' | 'note'): any[] {
    return data.map(item => {
      const formattedItem: any = {};

      switch (type) {
        case 'task':
          formattedItem[this.translate.instant('title')] = item.title;
          formattedItem[this.translate.instant('description')] = item.description;
          formattedItem[this.translate.instant('start')] = this.formatDate(item.startDateTask);
          formattedItem[this.translate.instant('end')] = this.formatDate(item.endDateTask);
          formattedItem[this.translate.instant('status')] = this.translate.instant(item.status);
          formattedItem[this.translate.instant('reminder')] = `${item.reminderTime} ${this.translate.instant('minutesbefore')}`;
          break;

        case 'meeting':
          formattedItem[this.translate.instant('title')] = item.title;
          formattedItem[this.translate.instant('description')] = item.description;
          formattedItem[this.translate.instant('start')] = this.formatDate(item.startDateApoint);
          formattedItem[this.translate.instant('end')] = this.formatDate(item.endDateApoint);
          formattedItem[this.translate.instant('location')] = item.location;
          formattedItem[this.translate.instant('reminder')] = `${item.reminderTime} ${this.translate.instant('minutesbefore')}`;
          break;

        case 'note':
          formattedItem[this.translate.instant('title')] = item.title;
          formattedItem[this.translate.instant('content')] = item.content;
          formattedItem[this.translate.instant('createdAt')] = this.formatDate(item.createdAt);
          break;
      }

      return formattedItem;
    });
  }

  private formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    d.setHours(d.getHours() + 7); // Convert to Vietnam timezone
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
