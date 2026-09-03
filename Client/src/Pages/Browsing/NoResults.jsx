import { Button } from "../../components/ui/button"
import { SearchX, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

export function NoResults({ clearFilter }) {
  return (
    <motion.div
      className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Icon */}
      <div className="inline-block mb-6">
        <div className="bg-gray-100 p-5 rounded-full">
          <SearchX size={48} className="text-gray-900" strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        No Adventures Found
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        We couldn't find any adventures matching your criteria. Try adjusting your filters or exploring a different location.
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => clearFilter("all")}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all py-6 text-base font-semibold"
        >
          <RotateCcw size={18} className="mr-2" />
          Clear All Filters
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Or try searching in a different area
        </p>
      </div>
    </motion.div>
  )
}
