import { useState, useEffect, useCallback } from 'react'

/**
 * Carga datos de una función de ElectoralApi ({ success, data } | { success: false, error }).
 *
 *   const { data, loading, error, reload } = useApiData(ElectoralApi.getColoniasView)
 *
 * `fetcher` debe tener identidad estable (método de ElectoralApi o useCallback):
 * cuando cambia, se vuelve a cargar.
 */
export default function useApiData(fetcher) {
    const [state, setState] = useState({ data: null, error: null, loading: true })
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        fetcher().then((result) => {
            if (cancelled) return
            setState({
                data: result.success ? result.data : null,
                error: result.success ? null : result.error,
                loading: false,
            })
        })

        return () => {
            cancelled = true
        }
    }, [fetcher, version])

    const reload = useCallback(() => setVersion((v) => v + 1), [])

    return { ...state, reload }
}
