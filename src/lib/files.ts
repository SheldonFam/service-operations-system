// Shared file/upload helpers used by both the client (FileUpload) and the
// data layer (uploadServicePhotos in supabase-queries.ts). Centralized so
// the client preflight and the server-side validation can't drift.

import { MAX_FILE_SIZE_BYTES } from './constants'
import type { ServicePhoto } from './types'

const MB = 1024 * 1024

export const PHOTO_SIGN_TTL_SECONDS = 60 * 60 // 1 hour

export const ALLOWED_PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'pdf'])

export function safeExtension(name: string): string | null {
  const dot = name.lastIndexOf('.')
  if (dot < 0 || dot === name.length - 1) return null
  const raw = name.slice(dot + 1).toLowerCase()
  // Allow only ASCII letters/digits to avoid storage path injection.
  if (!/^[a-z0-9]{1,5}$/.test(raw)) return null
  return ALLOWED_PHOTO_EXTENSIONS.has(raw) ? raw : null
}

export function getFileType(file: File): ServicePhoto['file_type'] {
  if (file.type.startsWith('image')) return 'image'
  if (file.type.startsWith('video')) return 'video'
  return 'pdf'
}

export type FileValidationResult = { ok: true } | { ok: false; file: File; reason: string }

/**
 * Validate a single file's size and extension. Used by the client to surface
 * inline errors before upload, and by uploadServicePhotos to reject before
 * any network call so we don't upload some-then-bail.
 */
export function validateUploadFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      file,
      reason: `${file.name} exceeds the ${Math.round(MAX_FILE_SIZE_BYTES / MB)} MB limit`,
    }
  }
  if (!safeExtension(file.name)) {
    return { ok: false, file, reason: `${file.name} has an unsupported file type` }
  }
  return { ok: true }
}

/** Validate a batch — returns the first failure, or `null` if all pass. */
export function validateUploadFiles(files: File[]): { reason: string } | null {
  for (const file of files) {
    const result = validateUploadFile(file)
    if (!result.ok) return { reason: result.reason }
  }
  return null
}
