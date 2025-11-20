import * as XLSX from 'xlsx';
import { TableData } from '../types';

const API_PAYLOAD_LIMIT_BYTES = 18 * 1024 * 1024; // ~18MB safety limit (API is 20MB)

export const processFileForAI = async (file: File): Promise<{ base64: string; mimeType: string }> => {
  const base64 = await fileToBase64(file);
  
  // Check if the base64 string exceeds the API payload limit
  if (base64.length > API_PAYLOAD_LIMIT_BYTES) {
    console.log(`File too large (${(base64.length / 1024 / 1024).toFixed(2)}MB base64), compressing...`);
    return compressImage(file);
  }

  return { base64, mimeType: file.type };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/png;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const compressImage = async (file: File): Promise<{ base64: string; mimeType: string }> => {
  // Use createImageBitmap for efficient image loading
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw image to canvas (maintains full resolution)
  ctx.drawImage(bitmap, 0, 0);
  
  // Start with high quality
  let quality = 0.9;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let base64 = dataUrl.split(',')[1];
  
  // Iteratively reduce quality until it fits, but don't go below 0.5 to preserve readability
  while (base64.length > API_PAYLOAD_LIMIT_BYTES && quality > 0.5) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    base64 = dataUrl.split(',')[1];
  }
  
  return { base64, mimeType: 'image/jpeg' };
};

export const downloadCSV = (data: TableData, filename: string = 'extracted_data.csv') => {
  const csvContent = data
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadExcel = (data: TableData, filename: string = 'extracted_data.xlsx') => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
};