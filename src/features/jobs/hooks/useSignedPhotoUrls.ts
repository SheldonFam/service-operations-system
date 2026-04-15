import { useQuery } from '@tanstack/react-query'
import { signServicePhotoUrls } from '@/lib/supabase-queries'
import { PHOTO_SIGN_TTL_SECONDS } from '@/lib/files'

export function useSignedPhotoUrls(paths: string[]) {
  return useQuery({
    queryKey: ['signed-photos', paths],
    queryFn: async () => {
      const result = await signServicePhotoUrls(paths)
      if (!result.ok) throw new Error(result.error)
      return result.urls
    },
    enabled: paths.length > 0,
    staleTime: (PHOTO_SIGN_TTL_SECONDS - 5 * 60) * 1000,
  })
}
