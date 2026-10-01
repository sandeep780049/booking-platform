import { Star } from "lucide-react"

/**
 * Read-only star display that reflects the actual rating.
 *
 * Previously every star was rendered with `fill-yellow-400` regardless of the
 * `rating` prop, so a 1-star item still showed five solid gold stars next to
 * the "1.0" label. Each star is now drawn as an outline with a filled overlay
 * clipped to the proportion the rating covers, which also renders correctly
 * for fractional values such as 4.3.
 */
const StarRating = ({ rating = 0, max = 5, size = "w-4 h-4", showValue = true }) => {
  const value = Math.max(0, Math.min(Number(rating) || 0, max))

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        // How much of this individual star is covered, 0 -> 1.
        const fill = Math.max(0, Math.min(value - i, 1))

        return (
          <span key={i} className="relative inline-flex">
            <Star className={`${size} text-yellow-300`} aria-hidden="true" />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
                aria-hidden="true"
              >
                <Star className={`${size} fill-yellow-400 text-yellow-400`} />
              </span>
            )}
          </span>
        )
      })}
      {showValue && (
        <span className="text-sm ml-1 text-gray-500">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

export default StarRating
