import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/** Navigate back if history exists, otherwise go to `fallback`. */
export function useGoBack(fallback = '/orders') {
  const navigate = useNavigate()
  return useCallback(
    () => (window.history.length > 1 ? navigate(-1) : navigate(fallback)),
    [navigate, fallback],
  )
}
