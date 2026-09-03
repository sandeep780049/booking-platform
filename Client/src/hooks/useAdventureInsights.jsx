import { useCallback, useEffect, useState } from 'react'
import { getAdventureInsights } from '../Api/adventure.insights.api'

export function useAdventureInsights(adventureId, range = 'month') {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchInsights = useCallback(async () => {
        if (!adventureId) return
        setIsLoading(true)
        setError(null)
        try {
            const response = await getAdventureInsights(adventureId, range)
            setData(response?.data ?? null)
        } catch (err) {
            setError(err)
        } finally {
            setIsLoading(false)
        }
    }, [adventureId, range])

    useEffect(() => {
        fetchInsights()
    }, [fetchInsights])

    return { data, isLoading, error, refresh: fetchInsights }
}
