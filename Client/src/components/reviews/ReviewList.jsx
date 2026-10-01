import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import PaginationComponent from "../ui/PaginationComponent"
import StarRating from "../StarRating"
import ReviewBreakdown from "./ReviewBreakdown"
import { fetchReviews, fetchReviewSummary } from "../../Api/reviews.api"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
]

const PER_PAGE = 5

const formatDate = (value) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}

/**
 * Public review section for a single target.
 *
 * Pass exactly one of itemId, instructorId or hotelId. The rating breakdown
 * always reflects every review, while the list respects the active star
 * filter, so the bars stay usable as a way to switch between filters.
 */
const ReviewList = ({ itemId, instructorId, hotelId, title = "Customer Reviews" }) => {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [rating, setRating] = useState(0)
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchReviewSummary({ itemId, instructorId, hotelId })
        if (!cancelled) setSummary(data)
      } catch (error) {
        console.error("Failed to load review summary", error)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [itemId, instructorId, hotelId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const load = async () => {
      try {
        const data = await fetchReviews({
          itemId,
          instructorId,
          hotelId,
          rating: rating || undefined,
          sort,
          page,
          limit: PER_PAGE,
        })
        if (!cancelled) setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to load reviews", error)
        if (!cancelled) setReviews([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [itemId, instructorId, hotelId, rating, sort, page])

  // The breakdown is always unfiltered, so it also tells us how many reviews
  // the active filter matches. That keeps the page count honest instead of
  // using the unfiltered total.
  const filteredCount = useMemo(() => {
    const total = summary?.totalReviews ?? 0
    if (!rating) return total
    const row = summary?.breakdown?.find((b) => b.rating === rating)
    return row?.count ?? 0
  }, [summary, rating])

  const totalPages = Math.ceil(filteredCount / PER_PAGE)

  // Guard against landing on a page that the active filter has emptied out.
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages)
  }, [page, totalPages])

  const changeRating = useCallback((value) => {
    setRating(value)
    setPage(1)
  }, [])

  const changeSort = useCallback((value) => {
    setSort(value)
    setPage(1)
  }, [])

  return (
    <Card className="rounded-xl mt-8">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {rating}-star reviews
              </p>
            )}
          </div>

          <Select value={sort} onValueChange={changeSort}>
            <SelectTrigger className="w-[180px]" aria-label="Sort reviews">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ReviewBreakdown
          summary={summary}
          activeRating={rating}
          onRatingChange={changeRating}
        />

        <div className="border-t pt-6">
          {loading ? (
            <p className="text-sm text-gray-600">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                {rating > 0
                  ? `No ${rating}-star reviews yet.`
                  : "No reviews yet."}
              </p>
              <p>
                Reviews are written from a booking, so once you have booked this
                you can leave a rating from{" "}
                <Link
                  to="/dashboard/bookings"
                  className="underline font-medium"
                >
                  My Bookings
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {reviews.map((review) => (
                <li
                  key={review._id}
                  className="flex flex-col gap-1 border-b last:border-b-0 pb-5 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating
                      rating={review.rating}
                      showValue={false}
                      size="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {review.user?.name || "Customer"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!loading && totalPages > 1 && (
            <>
              <p className="text-xs text-gray-500 mt-4">
                Showing {(page - 1) * PER_PAGE + 1}-
                {Math.min(page * PER_PAGE, filteredCount)} of {filteredCount}
              </p>
              <PaginationComponent
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ReviewList
