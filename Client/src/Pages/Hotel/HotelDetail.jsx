import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    MapPin,
    Star,
    Wifi,
    UtensilsCrossed,
    Waves,
    Wind,
    Zap,
    Hotel as HotelIcon,
    ChevronLeft,
    ChevronRight,
    Phone,
    Mail,
    Globe,
    Share2,
    Heart,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent } from "../../components/ui/card"
import { Nav_Landing } from "../../components/Nav_Landing"
import { useAuth } from "../AuthProvider"
import { axiosClient } from "../../AxiosClient/axios"

const amenityIcons = {
    "wifi": Wifi,
    "wifi-free": Wifi,
    "free-wifi": Wifi,
    "restaurant": UtensilsCrossed,
    "pool": Waves,
    "ac": Wind,
    "air-conditioning": Wind,
    "parking": HotelIcon,
    "gym": Zap,
    "fitness": Zap,
}

const getAmenityIcon = (amenityName) => {
    const name = amenityName?.toLowerCase() || ""
    for (const [key, icon] of Object.entries(amenityIcons)) {
        if (name.includes(key)) return icon
    }
    return HotelIcon
}

export default function HotelDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const isLoggedIn = !!user?.user
    const [hotel, setHotel] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const todayISO = new Date().toISOString().split('T')[0]
    const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const [checkIn, setCheckIn] = useState(todayISO)
    const [checkOut, setCheckOut] = useState(tomorrowISO)
    const [guests, setGuests] = useState(1)

    useEffect(() => {
        const fetchHotelDetail = async () => {
            setIsLoading(true)
            try {
                const response = await axiosClient.get(`/api/hotel/details/${id}`, {
                    withCredentials: true
                })
                // Handle different possible response structures from ApiResponse wrapper
                const responseData = response?.data
                const hotelData = responseData?.data?.hotel || responseData?.hotel || responseData
                if (hotelData && hotelData._id) {
                    setHotel(hotelData)
                }
            } catch (error) {
                console.error("Error fetching hotel details:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchHotelDetail()
        }
    }, [id])

    const images = hotel?.medias || []
    const hasImages = images.length > 0

    const nextImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const prevImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    const handleBookNow = () => {
        if (!hotel) return

        if (!isLoggedIn) {
            const pendingBooking = {
                hotel,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests,
                rooms: 1,
            }
            localStorage.setItem('redirectAfterLogin', '/hotel/checkout')
            localStorage.setItem('pendingHotelBooking', JSON.stringify(pendingBooking))
            navigate('/login')
            return
        }

        navigate('/hotel/checkout', {
            state: {
                hotel,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests,
                rooms: 1,
            }
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Nav_Landing theme="dark" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading hotel details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Nav_Landing theme="dark" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <HotelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel Not Found</h2>
                        <p className="text-gray-600 mb-6">The hotel you&apos;re looking for doesn&apos;t exist</p>
                        <Button onClick={() => navigate('/book-hotel')} className="bg-gray-900 hover:bg-black text-white">
                            Browse Hotels
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Nav_Landing theme="dark" />

            <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8 mt-20">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 hover:bg-gray-100"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Hotels
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                            {hasImages ? (
                                <>
                                    <div className="aspect-[16/10] bg-gray-100 relative">
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-black text-white text-xs font-semibold px-2.5 py-1 rounded-md capitalize">
                                                {hotel.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/95 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                                            <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {(hotel.rating || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                            >
                                                <ChevronLeft className="w-5 h-5 text-gray-900" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                                            >
                                                <ChevronRight className="w-5 h-5 text-gray-900" />
                                            </button>

                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                                                            ? 'bg-white w-6'
                                                            : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="aspect-[16/10] bg-gray-200 flex items-center justify-center">
                                    <HotelIcon className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border border-gray-200 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                {hotel.name}
                                            </h1>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-5 h-5 text-gray-500" />
                                                <span className="text-lg">
                                                    {typeof hotel.location === 'object' ? hotel.location?.name : hotel.location}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" className="rounded-full">
                                                <Share2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="rounded-full">
                                                <Heart className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {hotel.description && (
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                                            <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                                        </div>
                                    )}

                                    {hotel.amenities && hotel.amenities.length > 0 && (
                                        <div className="mb-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {hotel.amenities.map((amenity, idx) => {
                                                    const IconComponent = getAmenityIcon(amenity)
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                                                        >
                                                            <IconComponent className="w-5 h-5 text-gray-700" />
                                                            <span className="text-sm font-medium text-gray-900">{amenity}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h2>
                                        <div className="space-y-3">
                                            {hotel.fullAddress && (
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <span className="text-gray-700">{hotel.fullAddress}</span>
                                                </div>
                                            )}
                                            {hotel.contactNo && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-5 h-5 text-gray-400" />
                                                    <a href={`tel:${hotel.contactNo}`} className="text-gray-900 font-medium hover:underline">
                                                        {hotel.contactNo}
                                                    </a>
                                                </div>
                                            )}
                                            {hotel.owner?.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-gray-400" />
                                                    <a href={`mailto:${hotel.owner.email}`} className="text-gray-900 font-medium hover:underline">
                                                        {hotel.owner.email}
                                                    </a>
                                                </div>
                                            )}
                                            {hotel.website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-gray-400" />
                                                    <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 font-medium hover:underline">
                                                        {hotel.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-24"
                        >
                            <Card className="border border-gray-200 shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-4xl font-bold text-gray-900">
                                                ${hotel.pricePerNight || hotel.price || 0}
                                            </span>
                                            <span className="text-gray-600">/night</span>
                                        </div>
                                        <p className="text-sm text-gray-500">Taxes and fees included</p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Check-in
                                            </label>
                                            <input
                                                type="date"
                                                value={checkIn}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                min={todayISO}
                                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Check-out
                                            </label>
                                            <input
                                                type="date"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                min={checkIn || tomorrowISO}
                                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Guests
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={guests}
                                                onChange={(e) => setGuests(parseInt(e.target.value || '1'))}
                                                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleBookNow}
                                        className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-base transition-colors duration-200"
                                    >
                                        {isLoggedIn ? "Book Now" : "Login to Book"}
                                    </Button>

                                    <p className="text-xs text-center text-gray-500 mt-4">
                                        You won't be charged yet
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
