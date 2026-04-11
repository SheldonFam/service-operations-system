import { useQuery } from '@tanstack/react-query'
import { signServicePhotoUrls } from '@/lib/supabase-queries'
import { PHOTO_SIGN_TTL_SECONDS } from '@/lib/files'

const SIGN_TTL_MS = PHOTO_SIGN_TTL_SECONDS * 1000
const SIGN_REFRESH_BUFFER_MS = 5 * 60 * 1000

export function useSignedPhotoUrls(paths: string[]) {
  const sortedKey = [...paths].sort().join('|')

  return useQuery({
    queryKey: ['signed-photos', sortedKey],
    queryFn: async () => {
      const result = await signServicePhotoUrls(paths)
      if (!result.ok) throw new Error(result.error)
      return result.urls
    },
    enabled: paths.length > 0,
    staleTime: SIGN_TTL_MS - SIGN_REFRESH_BUFFER_MS,
  })
}
