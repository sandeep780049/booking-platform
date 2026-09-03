import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

export const useCountrySlider = (events) => {
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0)
  // Track whether user has manually selected a country — pauses auto-slide
  const isPausedRef = useRef(false)

  // Group events by country
  const countriesFromEvents = useMemo(() => {
    if (!events || events.length === 0) return []

    const countryMap = {}
    events.forEach(event => {
      if (!countryMap[event.country]) {
        countryMap[event.country] = {
          name: event.country,
          events: []
        }
      }
      countryMap[event.country].events.push(event)
    })

    return Object.values(countryMap)
  }, [events])

  const currentCountry = useMemo(() =>
    countriesFromEvents[currentCountryIndex] || null,
    [countriesFromEvents, currentCountryIndex]
  )

  // Auto-slide effect — stops permanently when user manually selects
  useEffect(() => {
    if (countriesFromEvents.length <= 1) return

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentCountryIndex((prev) => (prev + 1) % countriesFromEvents.length)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [countriesFromEvents.length])

  // Reset currentCountryIndex when countries change
  useEffect(() => {
    if (currentCountryIndex >= countriesFromEvents.length) {
      setCurrentCountryIndex(0)
      isPausedRef.current = false
    }
  }, [countriesFromEvents.length, currentCountryIndex])

  const nextCountry = useCallback(() => {
    isPausedRef.current = true
    setCurrentCountryIndex((prev) => (prev + 1) % countriesFromEvents.length)
  }, [countriesFromEvents.length])

  const prevCountry = useCallback(() => {
    isPausedRef.current = true
    setCurrentCountryIndex((prev) => (prev - 1 + countriesFromEvents.length) % countriesFromEvents.length)
  }, [countriesFromEvents.length])

  // goToCountry pauses auto-scroll when called by user
  const goToCountry = useCallback((index, userInitiated = false) => {
    if (userInitiated) {
      isPausedRef.current = true
    }
    setCurrentCountryIndex(index)
  }, [])

  return {
    currentCountryIndex,
    countriesFromEvents,
    currentCountry,
    nextCountry,
    prevCountry,
    goToCountry
  }
}