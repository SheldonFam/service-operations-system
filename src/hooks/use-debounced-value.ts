import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds have passed without further changes. Use for search inputs and
 * other rapidly-changing values that drive expensive work (API calls, filters).
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
