import { useState, useEffect } from "react"

/**
 * Returns the current network quality tier: "low" | "medium" | "high"
 *
 * Tier mapping
 * ───────────────────────────────────────────────────
 * low    → saveData flag, or effectiveType slow-2g/2g, or downlink < 0.5 Mbps
 * medium → effectiveType 3g, or downlink 0.5–2 Mbps
 * high   → effectiveType 4g, or downlink > 2 Mbps, or API unsupported (safe default)
 */
function getQuality() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (!conn) return "high" // API not supported — assume fast connection

  if (conn.saveData) return "low"

  const { effectiveType, downlink } = conn

  if (effectiveType === "slow-2g" || effectiveType === "2g") return "low"
  if (downlink !== undefined && downlink < 0.5) return "low"

  if (effectiveType === "3g") return "medium"
  if (downlink !== undefined && downlink < 2) return "medium"

  return "high"
}

export function useNetworkQuality() {
  const [quality, setQuality] = useState(() => getQuality())

  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!conn) return

    const handleChange = () => setQuality(getQuality())
    conn.addEventListener("change", handleChange)
    return () => conn.removeEventListener("change", handleChange)
  }, [])

  return quality
}
