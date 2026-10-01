import { Button } from "../ui/button"
import StarRating from "../StarRating"

/**
 * Overall average next to a 5->1 star distribution.
 *
 * Each bar doubles as the star filter, so the widget both reports the
 * distribution and controls it.
 */
const ReviewBreakdown = ({ summary, activeRating = 0, onRatingChange }) => {
  if (!summary) return null

  const { avgRating = 0, totalReviews = 0, breakdown = [] } = summary
  const hasReviews = totalReviews > 0

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
      <div className="sm:w-36 shrink-0 flex sm:flex-col items-center">
        <p className="text-4xl font-bold text-gray-900 leading-none">
          {Number(avgRating).toFixed(1)}
        </p>
        <div className="mt-2">
          <StarRating rating={avgRating} showValue={false} size="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
        {activeRating > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRatingChange(0)}
            className="mt-2 h-8 text-xs"
          >
            Clear filter
          </Button>
        )}
      </div>

      <div className="flex-1 w-full space-y-1">
        {breakdown.map((row) => {
          const isActive = activeRating === row.rating
          return (
            <button
              key={row.rating}
              type="button"
              disabled={!hasReviews}
              aria-pressed={isActive}
              onClick={() => onRatingChange(isActive ? 0 : row.rating)}
              className={`w-full flex items-center gap-3 rounded-md px-2 py-1 text-left transition-colors ${
                isActive ? "bg-yellow-50" : ""
              } ${hasReviews ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
            >
              <span className="text-sm text-gray-600 w-9 shrink-0">{row.rating} star</span>
              <span className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-yellow-400"
                  style={{ width: `${row.percentage}%` }}
                />
              </span>
              <span className="text-xs text-gray-600 w-20 text-right shrink-0">
                {row.count} ({row.percentage}%)
              </span>
            </button>
          )
        })}

        {!hasReviews && (
          <p className="text-sm text-gray-600 pt-1">
            No ratings yet. Reviews appear here once customers rate this product.
          </p>
        )}
      </div>
    </div>
  )
}

export default ReviewBreakdown
