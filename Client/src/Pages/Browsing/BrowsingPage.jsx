"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { useLocation, useNavigate } from "react-router-dom"
import { Compass } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { SearchFilterBar } from "./SearchFilterBar"
import { AdventureCard } from "./AdventureCard"
import { AdventureCardSkeleton } from "./AdventureCardSkeleton"
import { NoResults } from "./NoResults"
import { useBrowse } from "../../hooks/useBrowse"
import { useLocations } from "../../hooks/useLocation"
import { useAdventures } from "../../hooks/useAdventure"
import { containerVariants, itemVariants } from "../../assets/Animations"
import { Nav_Landing } from "../../components/Nav_Landing"
import PaginationComponent from "../../components/ui/PaginationComponent"

// Results Header Component
const ResultsHeader = ({ count }) => {
  return (
    <motion.div
      className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Compass size={20} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Available Adventures
        </h2>
      </div>
      <Badge
        variant="secondary"
        className="text-sm font-medium bg-gray-100 text-gray-900 border-gray-200 px-4 py-1.5"
      >
        {count} {count === 1 ? 'adventure' : 'adventures'}
      </Badge>
    </motion.div>
  )
}

export default function BrowsingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = new URLSearchParams(location?.search)
  const [adventure, setAdventure] = useState(query.get("adventure")?.toLowerCase() || "")
  const [loc, setLoc] = useState(query.get("location")?.toLowerCase() || "")
  const [date, setDate] = useState(() => {
    const queryDate = query.get("date")
    return queryDate ? new Date(queryDate) : undefined
  })
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 9

  const { adventures, isLoading, filters, setFilters } = useBrowse()
  const { locations } = useLocations()
  const { adventures: allAdventures } = useAdventures()

  const updateParams = (params, options = {}) => {
    const queryParams = new URLSearchParams(location.search)
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value)
      } else {
        queryParams.delete(key)
      }
    })
    navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true, ...options })
  }

  useEffect(() => {
    // Parse URL params and set filters
    const queryParams = new URLSearchParams(location.search)
    const adventureParam = queryParams.get("adventure") || ""
    const locationParam = queryParams.get("location") || ""
    const dateParam = queryParams.get("date") || ""

    setFilters({
      adventure: adventureParam,
      location: locationParam,
      session_date: dateParam,
    })

    setAdventure(adventureParam.toLowerCase())
    setLoc(locationParam.toLowerCase())
    setDate(dateParam ? new Date(dateParam) : undefined)

    if (location.search !== queryParams.toString()) {
      navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true })
    }
  }, [location.search, setFilters, navigate, location.pathname])

  const onBook = (id) => {
    navigate(`/booking?id=${id}&location=${filters.location}&session_date=${filters.session_date}`, { replace: true })
  }

  const clearFilter = (type) => {
    switch (type) {
      case "adventure":
        setAdventure("")
        updateParams({ adventure: "" })
        break
      case "location":
        setLoc("")
        updateParams({ location: "" })
        break
      case "date":
        setDate(undefined)
        updateParams({ date: "" })
        break
      case "all":
        setAdventure("")
        setLoc("")
        setDate(undefined)
        setFilters({ adventure: "", location: "", session_date: "" })
        updateParams({ adventure: "", location: "", date: "" })
        break
      default:
        break
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid date"
    }
  }

  // Determine what to display
  const hasResults = adventures && adventures.length > 0
  const showNoResults = !hasResults && !isLoading
  const showResults = hasResults && !isLoading
  const totalPages = Math.ceil((adventures?.length || 0) / PAGE_SIZE)
  const paginatedAdventures = adventures.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [adventure, loc, date, adventures.length])

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Nav_Landing />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Hero Section */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find unforgettable experiences and create lasting memories
          </p>
        </motion.div>

        {/* Search Filter Bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <SearchFilterBar
              adventure={adventure}
              setAdventure={setAdventure}
              loc={loc}
              setLoc={setLoc}
              date={date}
              setDate={setDate}
              clearFilter={clearFilter}
              locations={locations}
              allAdventures={allAdventures}
              onSearch={(newFilters) => {
                // Use the new filter values passed directly from SearchFilterBar
                updateParams({
                  adventure: newFilters.adventure,
                  location: newFilters.location,
                  date: newFilters.date ? newFilters.date.toISOString().split("T")[0] : "",
                })
              }}
              setSearchParams={updateParams}
            />
          </div>
        </motion.div>

        {/* Results Section */}
        <ResultsHeader count={adventures?.length || 0} />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <motion.div key={`skeleton-${index}`} variants={itemVariants}>
                    <AdventureCardSkeleton />
                  </motion.div>
                ))}
            </motion.div>
          ) : showNoResults ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <NoResults clearFilter={clearFilter} />
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {paginatedAdventures.map((adventure, index) => (
                <motion.div
                  key={adventure._id}
                  variants={itemVariants}
                  custom={index}
                  layout
                  className="h-full"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <AdventureCard adventure={adventure} formatDate={formatDate} onBook={onBook} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {showResults && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
