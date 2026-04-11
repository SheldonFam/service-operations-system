// Client-side image compression using the browser's native canvas API.
// Downscales images to a max dimension and re-encodes as JPEG/WebP to
// cut upload size on cellular connections. Non-image files pass through.

const MAX_DIMENSION = 1600
const OUTPUT_QUALITY = 0.82
const OUTPUT_TYPE = 'image/jpeg'

/**
 * Compress an image file if it exceeds MAX_DIMENSION on either axis.
 * Returns the original file unchanged for non-image files or on error.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    // Don't touch non-images or animated GIFs.
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap

    // Already small enough — skip the re-encode.
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
      bitmap.close()
      return file
    }

    const scale = MAX_DIMENSION / Math.max(width, height)
    const newW = Math.round(width * scale)
    const newH = Math.round(height * scale)

    const canvas = new OffscreenCanvas(newW, newH)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, newW, newH)
    bitmap.close()

    const blob = await canvas.convertToBlob({
      type: OUTPUT_TYPE,
      quality: OUTPUT_QUALITY,
    })

    // Preserve the original filename but swap extension.
    const dot = file.name.lastIndexOf('.')
    const baseName = dot > 0 ? file.name.slice(0, dot) : file.name
    return new File([blob], `${baseName}.jpg`, { type: OUTPUT_TYPE })
  } catch (e) {
    // If anything fails (e.g. corrupt file, unsupported format), return the
    // original so the upload can still proceed.
    if (import.meta.env.DEV) {
      console.warn(`Image compression failed for ${file.name}, using original:`, e)
    }
    return file
  }
}

/** Compress a batch of files — non-images pass through untouched. */
export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage))
}
