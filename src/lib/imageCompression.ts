/**
 * Client-Side Image Compression Utility
 * Supports PNG, JPEG, HEIC/HEIF, SVG, WebP.
 * Downscales images to max 1200px dimension and compresses to lightweight WebP/JPEG data URIs (~30KB-80KB)
 * for safe, fast persistence in database documents.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  width: number;
  height: number;
  format: string;
  reductionPercentage: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
];

const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.heic', '.heif'];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const hasValidExt = ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = ACCEPTED_MIME_TYPES.includes(fileType) || fileType.startsWith('image/');

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported file format (${file.name}). Please upload PNG, JPEG, HEIC, or SVG.`,
    };
  }

  // 15 MB hard limit on raw upload before client-side compression
  if (file.size > 15 * 1024 * 1024) {
    return {
      valid: false,
      error: `File is too large (${formatBytes(file.size)}). Maximum upload size is 15MB.`,
    };
  }

  return { valid: true };
}

/**
 * Loads a File into an HTMLImageElement using Object URL
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (isHeic) {
        reject(
          new Error(
            'Your browser could not decode this HEIC file directly. Please export or take a screenshot as JPEG/PNG.'
          )
        );
      } else {
        reject(new Error('Failed to read image file. Please check if the file is corrupted.'));
      }
    };

    img.src = objectUrl;
  });
}

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Targets maximum dimension of 1,200px and returns a compact Data URI.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  initialQuality = 0.75
): Promise<CompressionResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const img = await loadImageFromFile(file);

  let { width, height } = img;

  // Calculate scaled dimensions
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D rendering context not supported.');
  }

  // High quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // For transparency (PNG/SVG), draw white background so JPEG/WebP doesn't turn black
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage(img, 0, 0, width, height);

  // Attempt WebP compression first; fallback to JPEG
  let format = 'image/webp';
  let dataUrl = canvas.toDataURL('image/webp', initialQuality);

  // Some older browsers return image/png when webp is requested
  if (!dataUrl.startsWith('data:image/webp')) {
    format = 'image/jpeg';
    dataUrl = canvas.toDataURL('image/jpeg', initialQuality);
  }

  // Approximate byte size of base64 data URI
  let compressedSize = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);

  // If still above 200KB, do a second tighter pass
  if (compressedSize > 200 * 1024) {
    const secondCanvas = document.createElement('canvas');
    const scale = 0.8;
    secondCanvas.width = Math.round(width * scale);
    secondCanvas.height = Math.round(height * scale);
    const secondCtx = secondCanvas.getContext('2d');
    if (secondCtx) {
      secondCtx.imageSmoothingEnabled = true;
      secondCtx.imageSmoothingQuality = 'high';
      secondCtx.fillStyle = '#FFFFFF';
      secondCtx.fillRect(0, 0, secondCanvas.width, secondCanvas.height);
      secondCtx.drawImage(canvas, 0, 0, secondCanvas.width, secondCanvas.height);
      dataUrl = secondCanvas.toDataURL(format, 0.65);
      compressedSize = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75);
      width = secondCanvas.width;
      height = secondCanvas.height;
    }
  }

  const reduction = Math.max(0, Math.round(((file.size - compressedSize) / file.size) * 100));

  return {
    dataUrl,
    originalSize: file.size,
    compressedSize,
    width,
    height,
    format,
    reductionPercentage: reduction,
  };
}
