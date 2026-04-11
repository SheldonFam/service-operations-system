import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, FileText, Film } from 'lucide-react'
import { ACCEPTED_UPLOAD_MIME, MAX_FILES } from '@/lib/constants'
import { validateUploadFile } from '@/lib/files'
import { useObjectUrl } from '@/hooks/use-object-url'
import { toast } from 'sonner'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

function FilePreview({ file }: { file: File }) {
  const url = useObjectUrl(file)

  if (file.type.startsWith('image')) {
    return <img src={url} alt={file.name} className="h-full w-full object-cover" />
  }
  if (file.type.startsWith('video')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Film aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <FileText aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
    </div>
  )
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES - files.length

    const accepted: File[] = []
    let skipped = 0
    for (const file of selected) {
      if (accepted.length >= remaining) {
        skipped += 1
        continue
      }
      const result = validateUploadFile(file)
      if (!result.ok) {
        toast.error(result.reason)
        continue
      }
      accepted.push(file)
    }

    if (skipped > 0) {
      toast.info(`${skipped} file${skipped > 1 ? 's' : ''} skipped — max ${MAX_FILES} files allowed.`)
    }

    if (accepted.length > 0) {
      onFilesChange([...files, ...accepted])
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-md border">
            <FilePreview file={file} />
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 text-[10px] text-white">
              {file.name}
            </p>
          </div>
        ))}
      </div>

      {files.length < MAX_FILES && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_UPLOAD_MIME}
            multiple
            onChange={handleAdd}
            className="hidden"
          />
          <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
            <ImagePlus aria-hidden="true" className="mr-2 h-4 w-4" />
            Add Photos ({files.length}/{MAX_FILES})
          </Button>
        </div>
      )}
    </div>
  )
}
