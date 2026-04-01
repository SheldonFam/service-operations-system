import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

function getFileType(file: File): 'image' | 'video' | 'pdf' {
  if (file.type.startsWith('image')) return 'image'
  if (file.type.startsWith('video')) return 'video'
  return 'pdf'
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFiles = useCallback(
    async (serviceRecordId: string, files: File[]) => {
      if (files.length === 0) return { urls: [], error: null }

      setUploading(true)
      setProgress(0)
      const urls: string[] = []
      const total = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `${serviceRecordId}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('service-photos')
          .upload(path, file)

        if (uploadError) {
          setUploading(false)
          return { urls, error: `Failed to upload ${file.name}: ${uploadError.message}` }
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('service-photos').getPublicUrl(path)

        await supabase.from('service_photos').insert({
          service_record_id: serviceRecordId,
          file_url: publicUrl,
          file_type: getFileType(file),
        })

        urls.push(publicUrl)
        setProgress(Math.round(((i + 1) / total) * 100))
      }

      setUploading(false)
      return { urls, error: null }
    },
    []
  )

  return { uploadFiles, uploading, progress }
}
