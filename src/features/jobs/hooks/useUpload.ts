import { useState } from 'react'
import { supabase } from '@/lib/supabase'

function getFileType(file: File): 'image' | 'video' | 'pdf' {
  if (file.type.startsWith('image')) return 'image'
  if (file.type.startsWith('video')) return 'video'
  return 'pdf'
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFiles = async (serviceRecordId: string, files: File[]) => {
    if (files.length === 0) return { urls: [], error: null }

    setUploading(true)
    setProgress(0)
    const urls: string[] = []
    const total = files.length

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = `${serviceRecordId}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage.from('service-photos').upload(path, file)

        if (uploadError) {
          return { urls, error: `Failed to upload ${file.name}: ${uploadError.message}` }
        }

        await supabase.from('service_photos').insert({
          service_record_id: serviceRecordId,
          file_url: path,
          file_type: getFileType(file),
        })

        urls.push(path)
        setProgress(Math.round(((i + 1) / total) * 100))
      }

      return { urls, error: null }
    } finally {
      setUploading(false)
    }
  }

  return { uploadFiles, uploading, progress }
}
