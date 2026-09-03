import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    MapPin,
    Hotel as HotelIcon,
    Wifi,
    UtensilsCrossed,
    Waves,
    Wind,
    Zap,
    Tent,
    TreePine,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    X,
    Check,
    ArrowLeft,
} from "lucide-react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useHotels } from "../../hooks/useHotel"
import { Nav_Landing } from "../../components/Nav_Landing"
import { Slider } from "../../components/ui/slider"

const PROPERTY_TYPES = [
    { id: "", label: "All", icon: HotelIcon },
    { id: "hotel", label: "Hotels", icon: HotelIcon },
    { id: "camping", label: "Camping", icon: Tent },
    { id: "glamping", label: "Glamping", icon: TreePine },
]

const POPULAR_FILTERS = [
    { id: "free_cancellation", label: "Free cancellation" },
    { id: "breakfast_included", label: "Breakfast included" },
    { id: "wifi", label: "Free WiFi" },
    { id: "parking", label: "Parking" },
    { id: "pool", label: "Swimming pool" },
    { id: "very_good", label: "Very good: 8+" },
]

const SORT_OPTIONS = [
    { id: "top_picks", label: "Our top picks" },
    { id: "price_asc", label: "Price (lowest first)" },
    { id: "price_desc", label: "Price (highest first)" },
    { id: "rating_desc", label: "Best reviewed" },
]

const extractCountryFromAddress = (address) => {
    if (!address || typeof address !== "string") return ""
    const segments = address.split(",").map((p) => p.trim()).filter(Boolean)
    return segments[segments.length - 1] || ""
}

const extractCityFromAddress = (address) => {
    if (!address || typeof address !== "string") return ""
    const segments = address.split(",").map((p) => p.trim()).filter(Boolean)
    return segments.length >= 2 ? segments[segments.length - 2] : segments[0] || ""
}

const getRatingLabel = (rating) => {
    if (!rating) return null
    if (rating >= 9) return "Superb"
    if (rating >= 8) return "Very good"
    if (rating >= 7) return "Good"
    if (rating >= 6) return "Pleasant"
    return null
}

function HotelCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-52 animate-pulse">
            <div className="w-52 flex-shrink-0 bg-gray-200" />
            <div className="flex-1 p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="mt-auto h-8 bg-gray-200 rounded w-1/3 ml-auto" />
            </div>
        </div>
    )
}

function HotelListCard({ hotel, onClick }) {
    const ratingLabel = getRatingLabel(hotel.rating)
    const locationDisplay =
        typeof hotel.location === "object"
            ? hotel.location?.name
            : hotel.location

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative sm:w-52 sm:flex-shrink-0 h-48 sm:h-auto overflow-hidden bg-gray-100">
                <img
                    src={hotel.logo || hotel.medias?.[0] || "/placeholder.svg"}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-md capitalize">
                        {hotel.category}
                    </span>
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 leading-snug line-clamp-1 group-hover:text-black transition-colors mb-1">
                            {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm line-clamp-1">{locationDisplay}</span>
                        </div>

                        {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                    <span className="text-xs text-gray-400 py-1">
                                        +{hotel.amenities.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {hotel.rating > 0 && (
                        <div className="flex-shrink-0 text-right">
                            {ratingLabel && (
                                <p className="text-xs font-semibold text-gray-900 mb-1">{ratingLabel}</p>
                            )}
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 text-white text-sm font-bold rounded-lg rounded-tr-sm">
                                {hotel.rating.toFixed(1)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between mt-4 pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400 mb-0.5">Starting from</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-gray-900">
                                ${hotel.pricePerNight || hotel.price || 0}
                            </span>
                            <span className="text-sm text-gray-500">/night</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Includes taxes & fees</p>
                    </div>
                    <button
                        className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex-shrink-0"
                        onClick={(e) => {
                            e.stopPropagation()
                            onClick()
                        }}
                    >
                        See availability
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function FilterSidebar({ sideFilters, setSideFilters }) {
    const togglePopularFilter = useCallback((filterId) => {
        setSideFilters((prev) => ({
            ...prev,
            popularFilters: prev.popularFilters.includes(filterId)
                ? prev.popularFilters.filter((f) => f !== filterId)
                : [...prev.popularFilters, filterId],
        }))
    }, [setSideFilters])

    const hasActiveFilters = sideFilters.popularFilters.length > 0

    return (
        <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter by:
                </h2>
                {hasActiveFilters && (
                    <button
                        onClick={() => setSideFilters({ popularFilters: [] })}
                        className="text-xs text-gray-500 hover:text-gray-900 underline transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Your budget (per night)
                </p>
                <div className="flex items-center justify-between text-sm text-gray-700 font-medium mb-3">
                    <span>$0</span>
                    <span>${sideFilters.maxPrice === 500 ? "500+" : sideFilters.maxPrice}</span>
                </div>
                <Slider
                    value={[sideFilters.maxPrice]}
                    onValueChange={(val) => setSideFilters((prev) => ({ ...prev, maxPrice: val[0] }))}
                    max={500}
                    min={0}
                    step={10}
                />
                <p className="text-xs text-gray-400 mt-2">
                    {sideFilters.maxPrice === 500 ? "Showing all price ranges" : `Showing properties up to $${sideFilters.maxPrice}`}
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Popular filters
                </p>
                <ul className="space-y-2">
                    {POPULAR_FILTERS.map((filter) => {
                        const isChecked = sideFilters.popularFilters.includes(filter.id)
                        return (
                            <li key={filter.id}>
                                <button
                                    onClick={() => togglePopularFilter(filter.id)}
                                    className="flex items-center justify-between w-full text-left group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                                                isChecked
                                                    ? "bg-gray-900 border-gray-900"
                                                    : "border-gray-300 group-hover:border-gray-500"
                                            }`}
                                        >
                                            {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                                        </span>
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                            {filter.label}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </aside>
    )
}

export default function HotelsAllPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const [filters, setFilters] = useState({
        location: searchParams.get("location") || "",
        page: parseInt(searchParams.get("page") || "1"),
    })

    const [activePropertyType, setActivePropertyType] = useState(
        searchParams.get("category") || ""
    )

    const [sideFilters, setSideFilters] = useState({ popularFilters: [], maxPrice: 500 })
    const [sortBy, setSortBy] = useState("top_picks")
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [limit] = useState(10)

    const { hotels, isLoading, total, totalPages } = useHotels({
        page: filters.page,
        limit,
        location: filters.location || null,
        category: activePropertyType || null,
    })

    useEffect(() => {
        const params = new URLSearchParams()
        if (filters.location) params.set("location", filters.location)
        if (activePropertyType) params.set("category", activePropertyType)
        params.set("page", filters.page.toString())
        setSearchParams(params)
    }, [filters, activePropertyType, setSearchParams])

    const updateFilter = useCallback(
        (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 })),
        []
    )

    const hotelsWithLocationMeta = useMemo(() => {
        return hotels.map((hotel) => {
            const locationName =
                typeof hotel.location === "object" ? hotel.location?.name : hotel.location
            const locationAddress = hotel?.location?.address || ""
            const city =
                hotel?.city ||
                hotel?.location?.city ||
                extractCityFromAddress(locationAddress)
            const country =
                hotel?.country ||
                hotel?.location?.country ||
                extractCountryFromAddress(locationAddress) ||
                "Other"
            const countryLabel = city ? `${city}, ${country}` : country
            return { ...hotel, city, country, countryLabel, locationName }
        })
    }, [hotels])

    const filteredHotels = useMemo(() => {
        let result = [...hotelsWithLocationMeta]
        
        if (sideFilters.maxPrice < 500) {
            result = result.filter(h => {
                const price = h.pricePerNight || h.price || 0
                return price <= sideFilters.maxPrice
            })
        }

        if (sortBy === "price_asc") result.sort((a, b) => (a.pricePerNight || a.price || 0) - (b.pricePerNight || b.price || 0))
        else if (sortBy === "price_desc") result.sort((a, b) => (b.pricePerNight || b.price || 0) - (a.pricePerNight || a.price || 0))
        else if (sortBy === "rating_desc") result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        return result
    }, [hotelsWithLocationMeta, sortBy, sideFilters.maxPrice])

    const handlePageChange = useCallback(
        (newPage) => {
            if (newPage >= 1 && newPage <= totalPages) {
                setFilters((prev) => ({ ...prev, page: newPage }))
                window.scrollTo({ top: 0, behavior: "smooth" })
            }
        },
        [totalPages]
    )

    const handlePropertyTypeChange = (typeId) => {
        setActivePropertyType(typeId)
        setFilters((prev) => ({ ...prev, page: 1 }))
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Nav_Landing theme="dark" />

            <div className="bg-white border-b border-gray-200 sticky top-[72px] z-40 shadow-sm mt-[72px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => navigate("/book-hotel")}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Featured</span>
                        </button>

                        <div className="h-5 w-px bg-gray-200 hidden sm:block" />

                        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                            {PROPERTY_TYPES.map((type) => {
                                const IconComp = type.icon
                                const isActive = activePropertyType === type.id
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => handlePropertyTypeChange(type.id)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                            isActive
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-800"
                                        }`}
                                    >
                                        <IconComp className="w-3.5 h-3.5" />
                                        {type.label}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex-1 min-w-[160px]">
                            <div className="relative max-w-sm">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by location..."
                                    value={filters.location}
                                    onChange={(e) => updateFilter("location", e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex items-center justify-between lg:hidden mb-2">
                        <h2 className="text-xl font-bold text-gray-900">
                            {total > 0 ? `${total} properties found` : "All Accommodations"}
                        </h2>
                        <button
                            onClick={() => setMobileFiltersOpen((v) => !v)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    <AnimatePresence>
                        {mobileFiltersOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="lg:hidden overflow-hidden"
                            >
                                <FilterSidebar sideFilters={sideFilters} setSideFilters={setSideFilters} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="hidden lg:block">
                        <FilterSidebar sideFilters={sideFilters} setSideFilters={setSideFilters} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="hidden lg:block mb-5">
                            <h2 className="text-xl font-bold text-gray-900">
                                {filters.location
                                    ? `Stays in ${filters.location}`
                                    : activePropertyType
                                        ? `${PROPERTY_TYPES.find(t => t.id === activePropertyType)?.label || "All"} Accommodations`
                                        : "All Accommodations"}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {total > 0 ? `${total} properties found` : "No properties found"}
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <HotelCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : filteredHotels.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200">
                                <HotelIcon className="w-14 h-14 text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    No accommodations found
                                </h3>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    Try adjusting your search filters or browse all locations.
                                </p>
                                <button
                                    onClick={() => {
                                        setSideFilters({ popularFilters: [] })
                                        updateFilter("location", "")
                                        setActivePropertyType("")
                                    }}
                                    className="mt-5 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {filteredHotels.map((hotel) => (
                                        <HotelListCard
                                            key={hotel._id}
                                            hotel={hotel}
                                            onClick={() => navigate(`/hotel/${hotel._id}`)}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        <button
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={filters.page === 1}
                                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1
                                                const isCurrent = page === filters.page
                                                const showPage =
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= filters.page - 1 && page <= filters.page + 1)

                                                if (!showPage && page === 2) return <span key={page} className="px-2 text-gray-400 text-sm">...</span>
                                                if (!showPage && page === totalPages - 1) return <span key={page} className="px-2 text-gray-400 text-sm">...</span>
                                                if (!showPage) return null

                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`h-10 w-10 text-sm font-semibold rounded-lg transition-colors ${
                                                            isCurrent
                                                                ? "bg-gray-900 text-white"
                                                                : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={filters.page === totalPages}
                                            className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
