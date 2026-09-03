import { Star } from "lucide-react"

const StarRating = ({ rating = 5, max = 5 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max }, (_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ))}
    <span className="text-sm ml-1 text-gray-500">{rating.toFixed(1)}</span>
  </div>
)

export default StarRating
