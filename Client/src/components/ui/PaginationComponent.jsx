import { memo } from "react"
import { Button } from "../ui/button"

const PaginationComponent = memo(({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null

  const renderPageButtons = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "outline"}
          onClick={() => onPageChange(pageNum)}
          className="w-10 h-10 p-0"
          size="sm"
        >
          {pageNum}
        </Button>
      ))
    }

    // Complex pagination for more than 7 pages
    const buttons = []
    
    // First page
    buttons.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        onClick={() => onPageChange(1)}
        className="w-10 h-10 p-0"
        size="sm"
      >
        1
      </Button>
    )

    // Left ellipsis
    if (currentPage > 3) {
      buttons.push(
        <span key="left-ellipsis" className="px-2 text-gray-500">...</span>
      )
    }

    // Middle pages around current page
    Array.from({ length: 3 }, (_, i) => {
      const pageNum = currentPage - 1 + i
      if (pageNum > 1 && pageNum < totalPages) {
        buttons.push(
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            className="w-10 h-10 p-0"
            size="sm"
          >
            {pageNum}
          </Button>
        )
      }
    })

    // Right ellipsis
    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="right-ellipsis" className="px-2 text-gray-500">...</span>
      )
    }

    // Last page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          onClick={() => onPageChange(totalPages)}
          className="w-10 h-10 p-0"
          size="sm"
        >
          {totalPages}
        </Button>
      )
    }

    return buttons
  }

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4"
      >
        <span>Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {renderPageButtons()}
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4"
      >
        <span>Next</span>
      </Button>
    </div>
  )
})

PaginationComponent.displayName = 'PaginationComponent'

export default PaginationComponent