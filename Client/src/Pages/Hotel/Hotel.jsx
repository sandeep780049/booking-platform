import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    MapPin,
    Star,
    Hotel as HotelIcon,
    Tent,
    TreePine,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Search,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { useHotels } from "../../hooks/useHotel"
import { useCountrySlider } from "../../hooks/useCountrySlider"
import { Nav_Landing } from "../../components/Nav_Landing"

const PROPERTY_TYPES = [
    { id: "", label: "All", icon: HotelIcon },
    { id: "hotel", label: "Hotels", icon: HotelIcon },
    { id: "camping", label: "Camping", icon: Tent },
    { id: "glamping", label: "Glamping", icon: TreePine },
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

function HeroSearchBar() {
    const [location, setLocation] = useState("")
    const [category, setCategory] = useState("")
    const [guests, setGuests] = useState(1)
    const [showGuestPicker, setShowGuestPicker] = useState(false)

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (location.trim()) params.set("location", location.trim())
        if (category) params.set("category", category)
        if (guests > 1) params.set("guests", guests.toString())
        params.set("page", "1")
        window.open(`/hotels/all?${params.toString()}`, "_blank", "noopener,noreferrer")
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-5xl mt-10"
        >
            {/* Search Card — two rows */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-2xl flex flex-col gap-3">

                {/* Row 1 — Location */}
                <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-5">
                    <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Where are you going? City, region or property name…"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-base font-medium outline-none"
                    />
                    {location && (
                        <button
                            onClick={() => setLocation("")}
                            className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Row 2 — Type + Guests + Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                    {/* Property Type */}
                    <div className="flex flex-1 items-center gap-1.5 bg-white rounded-2xl px-4 py-3">
                        {PROPERTY_TYPES.map((type) => {
                            const Icon = type.icon
                            const isActive = category === type.id
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setCategory(type.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                                        isActive
                                            ? "bg-gray-900 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {type.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Guest Picker */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowGuestPicker((v) => !v)}
                            className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                        >
                            <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                                {guests} {guests === 1 ? "Guest" : "Guests"}
                            </span>
                            {showGuestPicker ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showGuestPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 min-w-[200px]"
                                >
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                        Number of Guests
                                    </p>
                                    <div className="flex items-center justify-between gap-5">
                                        <button
                                            onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-30"
                                            disabled={guests <= 1}
                                        >
                                            −
                                        </button>
                                        <span className="text-3xl font-bold text-gray-900 w-10 text-center">
                                            {guests}
                                        </span>
                                        <button
                                            onClick={() => setGuests((g) => Math.min(30, g + 1))}
                                            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Search Button */}
                    <motion.button
                        onClick={handleSearch}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2.5 px-8 py-4 bg-gray-900 hover:bg-black text-white text-base font-bold rounded-2xl transition-colors duration-200 shadow-lg flex-shrink-0"
                    >
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}

export default function HotelBrowsingPage() {
    const navigate = useNavigate()

    const { hotels, isLoading } = useHotels({
        page: 1,
        limit: 30,
        location: null,
        category: null,
    })

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

    const featuredCountrySlider = useCountrySlider(
        hotelsWithLocationMeta.map((hotel) => ({
            ...hotel,
            country: hotel.countryLabel,
        }))
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Nav_Landing />

            <header
                className="relative bg-cover bg-center min-h-[600px] rounded-b-3xl overflow-hidden shadow-inner z-10"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1719466419345-fdb12719ec29?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1470')`,
                }}
            >
                <div className="absolute inset-0 bg-black/55 z-10" />

                <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-8 flex flex-col justify-center z-20 pt-28 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                            Find your perfect stay
                        </h1>
                        <p className="mt-3 text-base sm:text-lg text-white/80 max-w-xl">
                            Handpicked hotels, camping spots, and glampings for every traveler.
                        </p>

                        <HeroSearchBar />
                    </motion.div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {isLoading && (
                    <section className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm">
                        <div className="text-center mb-8">
                            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-3" />
                            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mx-auto" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                                    <div className="aspect-[4/3] bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {!isLoading && featuredCountrySlider.countriesFromEvents.length > 0 && (
                    <section className="mb-10 rounded-3xl bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                                Featured Accommodations
                            </h2>
                            <p className="mt-2 text-base text-gray-500">
                                Curated picks by destination, crafted for comfort and style.
                            </p>
                        </div>

                        <div className="relative mb-8">
                            <div className="flex items-center justify-center gap-3 md:gap-5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={featuredCountrySlider.prevCountry}
                                    className="rounded-full h-10 w-10 hover:bg-gray-100 transition-all text-gray-700"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <div className="flex-1 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center justify-center space-x-6 md:space-x-10 px-2 min-w-max mx-auto">
                                        {featuredCountrySlider.countriesFromEvents.map((country, index) => {
                                            const isActive = index === featuredCountrySlider.currentCountryIndex
                                            return (
                                                <motion.button
                                                    key={country.name}
                                                    onClick={() => featuredCountrySlider.goToCountry(index, true)}
                                                    className={`cursor-pointer transition-all duration-300 whitespace-nowrap py-1 ${
                                                        isActive
                                                            ? "text-xl md:text-2xl font-bold text-gray-900"
                                                            : "text-base md:text-lg font-medium text-gray-400 hover:text-gray-700"
                                                    }`}
                                                    whileHover={{ scale: 1.03 }}
                                                >
                                                    <span
                                                        className={
                                                            isActive
                                                                ? "border-b-[3px] border-gray-900 pb-0.5"
                                                                : ""
                                                        }
                                                    >
                                                        {country.name}
                                                    </span>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={featuredCountrySlider.nextCountry}
                                    className="rounded-full h-10 w-10 hover:bg-gray-100 transition-all text-gray-700"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex justify-center space-x-2 mt-5">
                                {featuredCountrySlider.countriesFromEvents.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            index === featuredCountrySlider.currentCountryIndex
                                                ? "w-8 bg-gray-900"
                                                : "w-1.5 bg-gray-300 hover:bg-gray-400"
                                        }`}
                                        onClick={() => featuredCountrySlider.goToCountry(index, true)}
                                        aria-label={`Show featured stays for country ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={featuredCountrySlider.currentCountryIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.22 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                            >
                                {(featuredCountrySlider.currentCountry?.events || [])
                                    .slice()
                                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                    .slice(0, 3)
                                    .map((hotel) => (
                                        <div
                                            key={hotel._id}
                                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
                                            onClick={() => navigate(`/hotel/${hotel._id}`)}
                                        >
                                            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={hotel.logo || hotel.medias?.[0] || "/placeholder.svg"}
                                                    alt={hotel.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-md capitalize">
                                                        {hotel.category}
                                                    </span>
                                                </div>
                                                {hotel.rating > 0 && (
                                                    <div className="absolute top-3 right-3 bg-white/95 rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
                                                        <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {hotel.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-base text-gray-900 line-clamp-1 mb-1.5">
                                                    {hotel.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-gray-500 mb-3">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs line-clamp-1">{hotel.locationName}</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-extrabold text-gray-900">
                                                        ${hotel.pricePerNight || hotel.price || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-500">/night</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-8 flex justify-center">
                            <motion.button
                                onClick={() => window.open("/hotels/all", "_blank", "noopener,noreferrer")}
                                className="group flex items-center gap-3 px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>Show More Accommodations</span>
                                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
