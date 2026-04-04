import { useRef, useCallback, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, FileText, Film } from 'lucide-react'

const MAX_FILES = 6
const ACCEPTED_TYPES = 'image/*,video/*,application/pdf'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

function useObjectUrl(file: File) {
  const urlRef = useRef<string | null>(null)

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      urlRef.current = URL.createObjectURL(file)
      onStoreChange()
      return () => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current)
          urlRef.current = null
        }
      }
    },
    [file],
  )
  const getSnapshot = useCallback(() => urlRef.current ?? '', [])

  return useSyncExternalStore(subscribe, getSnapshot)
}

function FilePreview({ file }: { file: File }) {
  const url = useObjectUrl(file)

  if (file.type.startsWith('image')) {
    return <img src={url} alt={file.name} className="h-full w-full object-cover" />
  }
  if (file.type.startsWith('video')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Film className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <FileText className="h-6 w-6 text-muted-foreground" />
    </div>
  )
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const remaining = MAX_FILES - files.length
    const toAdd = selected.slice(0, remaining)
    onFilesChange([...files, ...toAdd])
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
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 text-[10px] text-white">
              {file.name}
            </p>
          </div>
        ))}
      </div>

      {files.length < MAX_FILES && (
        <div>
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} multiple onChange={handleAdd} className="hidden" />
          <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Photos ({files.length}/{MAX_FILES})
          </Button>
        </div>
      )}
    </div>
  )
}
