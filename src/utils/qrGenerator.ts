import QRCode from 'qrcode';

export interface QRGenerationOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRSvg(text: string, options?: QRGenerationOptions): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#002B49', // Official FDA Navy
        light: options?.color?.light || '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate SVG QR Code:', err);
    return '';
  }
}

export async function generateQRPngDataUrl(text: string, options?: QRGenerationOptions): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 300,
      margin: options?.margin ?? 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#002B49',
        light: options?.color?.light || '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate PNG QR Code:', err);
    return '';
  }
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
