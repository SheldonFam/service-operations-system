import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadServicePhotos } from '@/lib/supabase-queries'
import { compressImages } from '@/lib/compress-image'

export function useUpload() {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async ({ serviceRecordId, files }: { serviceRecordId: string; files: File[] }) => {
      setProgress(0)
      if (files.length === 0) return { urls: [] as string[], error: null }
      const compressed = await compressImages(files)
      return uploadServicePhotos(serviceRecordId, compressed, { onProgress: setProgress })
    },
  })

  return {
    uploadFiles: mutation.mutateAsync,
    uploading: mutation.isPending,
    progress,
  }
}
