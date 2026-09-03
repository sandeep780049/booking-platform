import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    MapPin, Calendar, Clock, Star, Award, Sparkles, ArrowLeft,
    Trophy, Zap, X, ChevronRight, ZoomIn, ChevronLeft,
} from "lucide-react"
import { Badge } from "../components/ui/badge"
import { getEvents } from "../Api/event.api"
import { Loader } from "../components/Loader"
import { useAuth } from "./AuthProvider"

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
}

const modalVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 40 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { type: "spring", stiffness: 300, damping: 28 },
    },
    exit: {
        opacity: 0, scale: 0.92, y: 20,
        transition: { duration: 0.22 },
    },
}



const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
    })

const formatShortDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    })

const formatTime = (t) => {
    if (!t) return ""
    return new Date(`1970-01-01T${t}`).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    })
}

function ImageLightbox({ src, onClose }) {
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"
        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = "auto"
        }
    }, [onClose])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(16px)" }}
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                onClick={onClose}
            >
                <X className="w-5 h-5" />
            </button>
            <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                src={src}
                alt="Event photo"
                style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
                onClick={(e) => e.stopPropagation()}
            />
        </motion.div>
    )
}

function EventDetailModal({ event, onClose, onNext }) {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
        >
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl"
                style={{
                    background: "linear-gradient(145deg, rgba(15,10,30,0.98) 0%, rgba(10,5,25,0.99) 100%)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(138,43,226,0.12)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                <div
                    className="relative h-52 sm:h-64 overflow-hidden rounded-t-3xl cursor-pointer group/hero"
                    onClick={() => setLightboxOpen(true)}
                >
                    <img
                        src={event.image || "/placeholder.svg?height=300&width=500"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity duration-200">
                        <div className="bg-black/50 rounded-full p-3">
                            <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white font-semibold tracking-wide">
                            <Award className="w-3 h-3 text-yellow-400" />
                            NFT EVENT
                        </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-12">
                        <h2
                            className="text-xl sm:text-2xl font-black text-white leading-tight"
                            style={{ letterSpacing: "-0.02em" }}
                        >
                            {event.title}
                        </h2>
                    </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Location</p>
                                <p className="font-medium text-white">{event.city}, {event.country}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Date</p>
                                <p className="font-medium text-white">{formatDate(event.date)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-pink-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Time</p>
                                <p className="font-medium text-white">
                                    {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Star className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-0.5">Required Level</p>
                                <div className="flex items-center gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < event.level ? "text-gray-300 fill-gray-300" : "text-gray-700"}`}
                                        />
                                    ))}
                                    <span className="text-white font-medium ml-1">Level {event.level}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {event.description && (
                        <div className="pt-1">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">About</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                        </div>
                    )}

                    {event.nftReward?.enabled && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-semibold text-white">
                                    {event.nftReward.nftName || "Exclusive NFT Reward"}
                                </span>
                            </div>
                            {event.nftReward.nftDescription && (
                                <p className="text-xs text-gray-400 leading-relaxed pl-6">
                                    {event.nftReward.nftDescription}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 font-medium">Entry Price</span>
                            {event.price > 0 ? (
                                <span className="text-2xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>
                                    £{event.price.toFixed(2)}
                                </span>
                            ) : (
                                <span className="text-lg font-bold text-emerald-400 tracking-wide">FREE</span>
                            )}
                        </div>
                        {event.price > 0 && (
                            <p className="text-[11px] text-gray-500 mt-1">per person</p>
                        )}
                    </div>

                    <motion.button
                        onClick={() => onNext(event._id)}
                        className="relative w-full group overflow-hidden rounded-2xl py-4 font-bold text-black text-base tracking-wide"
                        style={{ background: "linear-gradient(135deg, #f9fafb, #e5e7eb)" }}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)",
                            }}
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                            Book Now
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </motion.button>
                </div>
            </motion.div>

            <AnimatePresence>
                {lightboxOpen && event.image && (
                    <ImageLightbox
                        src={event.image}
                        onClose={() => setLightboxOpen(false)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const SecretNftEvents = () => {
    const [nftEvents, setNftEvents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showEasterEgg, setShowEasterEgg] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [lightboxImage, setLightboxImage] = useState(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    const easterEggStars = useMemo(
        () =>
            Array.from({ length: 120 }, (_, i) => ({
                id: `egg-star-${i}`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                duration: Math.random() * 4 + 2,
                delay: Math.random() * 2,
            })),
        [],
    )
    const pageStars = useMemo(
        () =>
            Array.from({ length: 120 }, (_, i) => ({
                id: `page-star-${i}`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                duration: Math.random() * 4 + 2,
                delay: Math.random() * 2,
            })),
        [],
    )

    useEffect(() => {
        const fetchNftEvents = async () => {
            try {
                setIsLoading(true)
                const response = await getEvents({ limit: 10 })
                if (response && Array.isArray(response.data)) {
                    const eventsWithNfts = response.data.filter(
                        (event) => event.isNftEvent || (event.nftReward && event.nftReward.enabled),
                    )
                    setNftEvents(eventsWithNfts)
                } else {
                    setError("No event data received from server.")
                    setNftEvents([])
                }
            } catch (err) {
                console.error("Error fetching NFT events:", err)
                setError("Failed to load NFT events")
            } finally {
                setIsLoading(false)
            }
        }
        fetchNftEvents()
    }, [])

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && selectedEvent) setSelectedEvent(null)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [selectedEvent])

    useEffect(() => {
        document.body.style.overflow = selectedEvent ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [selectedEvent])

    const handleEventClick = useCallback((event) => {
        setSelectedEvent(event)
    }, [])

    const handleCloseDetail = useCallback(() => {
        setSelectedEvent(null)
    }, [])

    const handleNext = useCallback((eventId) => {
        if (!user?.user) {
            localStorage.setItem("redirectAfterLogin", `/event/${eventId}`)
            navigate("/login")
            return
        }
        navigate(`/event/${eventId}`)
    }, [user, navigate])

    const handleBackToHome = () => navigate("/")

    if (isLoading) return <Loader />

    if (showEasterEgg) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {easterEggStars.map((star) => (
                        <motion.div
                            key={star.id}
                            className="absolute w-0.5 h-0.5 bg-white rounded-full"
                            style={{ left: star.left, top: star.top }}
                            animate={{ opacity: [0.1, 1, 0.1], scale: [0.5, 1.5, 0.5] }}
                            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30"
                />

                <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15, duration: 1.2 }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Trophy className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-yellow-400" strokeWidth={1.5} />
                            </motion.div>
                            <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-9 h-9 sm:w-10 sm:h-10 text-pink-400" />
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-2 -left-2"
                                animate={{ scale: [1, 1.3, 1], rotate: [360, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Zap className="w-9 h-9 sm:w-10 sm:h-10 text-blue-400" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="space-y-6"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.6 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight"
                            style={{
                                textShadow: "0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(138,43,226,0.4)",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            You Found It!
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, duration: 0.6 }}
                            className="relative"
                        >
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                                The Secret Easter Egg
                            </h2>
                            <motion.div
                                className="absolute -inset-4"
                                animate={{
                                    background: [
                                        "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
                                        "radial-gradient(circle, rgba(255,105,180,0.1) 0%, transparent 70%)",
                                        "radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%)",
                                        "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
                                    ],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{ zIndex: -1 }}
                            />
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3, duration: 0.6 }}
                            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
                            style={{ fontWeight: 300, letterSpacing: "0.01em" }}
                        >
                            Unlock exclusive NFT adventures that were hidden from the ordinary.
                            <br />
                            <span className="text-purple-300 font-medium">
                                Your journey into the extraordinary begins now.
                            </span>
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                        className="mt-8 sm:mt-10"
                    >
                        <motion.button
                            onClick={() => setShowEasterEgg(false)}
                            className="relative group px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-black bg-white rounded-full overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                            <span className="relative z-10 tracking-wide">Continue</span>
                            <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(255,255,255,0.5)",
                                        "0 0 40px rgba(255,105,180,0.6)",
                                        "0 0 20px rgba(255,255,255,0.5)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="mt-8"
                    >
                        <p className="text-xs sm:text-sm text-gray-500 tracking-[0.16em] uppercase">
                            Limited Access · Elite Adventures Only
                        </p>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                {pageStars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full"
                        style={{ left: star.left, top: star.top }}
                        animate={{ opacity: [0.1, 1, 0.1], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-pink-900/30 z-0"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
                    className="flex justify-start mb-6 sm:mb-8"
                >
                    <motion.button
                        onClick={handleBackToHome}
                        className="group relative px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full overflow-hidden"
                        whileHover={{ scale: 1.05, x: -4 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
                            transition={{ duration: 0.3 }}
                        />
                        <div className="relative flex items-center gap-2 text-white">
                            <motion.div
                                animate={{ x: [0, -4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                            <span className="text-sm sm:text-base font-medium tracking-wide">Back to Home</span>
                        </div>
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                                boxShadow: [
                                    "0 0 0 0 rgba(255,255,255,0)",
                                    "0 0 0 4px rgba(138,43,226,0.1)",
                                    "0 0 0 0 rgba(255,255,255,0)",
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-10 sm:mb-12 lg:mb-14 space-y-4 sm:space-y-5"
                >
                    <div className="relative inline-block">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 150 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
                            style={{
                                textShadow: "0 0 60px rgba(255,255,255,0.2), 0 0 100px rgba(138,43,226,0.3)",
                                fontFamily: "system-ui, -apple-system, sans-serif",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Secret NFT Events
                        </motion.h1>
                        <motion.div
                            className="absolute -inset-8 opacity-30"
                            animate={{
                                background: [
                                    "radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 70%)",
                                    "radial-gradient(circle, rgba(255,105,180,0.2) 0%, transparent 70%)",
                                    "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
                                    "radial-gradient(circle, rgba(138,43,226,0.2) 0%, transparent 70%)",
                                ],
                            }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ zIndex: -1 }}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex items-center justify-center gap-3 flex-wrap"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                        </motion.div>
                        <p
                            className="text-base sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-300 max-w-2xl lg:max-w-3xl leading-relaxed"
                            style={{ fontWeight: 300, letterSpacing: "0.02em" }}
                        >
                            Adventures you did already were sidequests.
                            <br />
                            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
                                Let&apos;s start with the real thrill.
                            </span>
                        </p>
                        <motion.div
                            animate={{ rotate: [360, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
                        className="inline-block"
                    >
                        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                            <span className="text-xs sm:text-sm text-gray-400 font-medium tracking-wider uppercase">
                                Elite Collection
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-block px-8 py-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl">
                            <p className="text-red-400 font-medium">{error}</p>
                        </div>
                    </motion.div>
                )}

                {nftEvents.length === 0 && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center py-20 sm:py-24"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="mb-6 flex justify-center"
                        >
                            <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600" />
                        </motion.div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-2">No Events Available</h3>
                        <p className="text-gray-500 text-base sm:text-lg">Check back later for exclusive NFT adventures</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                    <AnimatePresence>
                        {nftEvents.map((event, index) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -60, scale: 0.8 }}
                                transition={{
                                    duration: 0.7,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 15,
                                }}
                                whileHover={{
                                    y: -6,
                                    scale: 1.008,
                                    transition: { duration: 0.25, type: "spring", stiffness: 300 },
                                }}
                                className="group relative max-w-[340px] w-full mx-auto bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-lg cursor-pointer"
                                onClick={() => handleEventClick(event)}
                            >
                                <motion.div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />

                                <div className="relative">
                                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                                        >
                                            <Badge className="bg-white/90 text-black font-semibold text-[10px] sm:text-xs px-2.5 py-1 shadow-sm">
                                                <Award className="w-3 h-3 mr-1" />
                                                NFT
                                            </Badge>
                                        </motion.div>
                                    </div>

                                    <div
                                        className="relative h-32 sm:h-36 md:h-40 overflow-hidden cursor-pointer group/img"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setLightboxImage(event.image || "/placeholder.svg?height=200&width=300")
                                        }}
                                    >
                                        <motion.img
                                            src={event.image || "/placeholder.svg?height=200&width=300"}
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                            whileHover={{ scale: 1.15 }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-black/10">
                                            <div className="bg-black/50 rounded-full p-2.5 shadow-xl">
                                                <ZoomIn className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3.5 sm:p-4 space-y-3">
                                        <h3
                                            className="text-base sm:text-lg font-bold text-white transition-all duration-300 line-clamp-2 leading-snug"
                                            style={{ letterSpacing: "-0.01em" }}
                                        >
                                            {event.title}
                                        </h3>

                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm font-normal truncate">
                                                    {event.city}, {event.country}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm font-normal">
                                                    {formatShortDate(event.date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-xs sm:text-sm font-normal">
                                                    {event.startTime} - {event.endTime}
                                                </span>
                                            </div>
                                        </div>

                                        {event.nftReward?.enabled && (
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-gray-400" />
                                                    <span className="text-white font-semibold text-xs sm:text-sm truncate">
                                                        {event.nftReward.nftName || "Exclusive NFT"}
                                                    </span>
                                                </div>
                                                {event.nftReward.nftDescription && (
                                                    <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                                                        {event.nftReward.nftDescription}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {event.price > 0 && (
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-400 text-xs sm:text-sm font-medium">Price</span>
                                                    <span className="text-white text-base sm:text-lg font-bold">£{event.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {event.price === 0 && (
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <span className="text-gray-300 text-xs sm:text-sm font-semibold tracking-wider">FREE EVENT</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-1.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 + i * 0.05 }}
                                                    >
                                                        <Star
                                                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < event.level
                                                                ? "text-gray-300 fill-gray-300"
                                                                : "text-gray-700"
                                                                }`}
                                                        />
                                                    </motion.div>
                                                ))}
                                                <span className="text-gray-400 text-[11px] sm:text-xs ml-2 font-medium">
                                                    Level {event.level}
                                                </span>
                                            </div>
                                            <motion.div
                                                whileHover={{ rotate: 180, scale: 1.2 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-center mt-14 sm:mt-16 py-8 sm:py-10"
                >
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex items-center gap-3 mb-4"
                        >
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            <Sparkles className="w-5 h-5 text-pink-400" />
                            <Award className="w-6 h-6 text-purple-400" />
                        </motion.div>
                        <p
                            className="text-sm sm:text-base text-gray-400 leading-relaxed"
                            style={{ letterSpacing: "0.02em" }}
                        >
                            Each NFT event completion awards you with a unique digital collectible
                            <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 font-semibold">
                                {" "}that proves your adventure achievements.
                            </span>
                        </p>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {lightboxImage && (
                    <ImageLightbox
                        src={lightboxImage}
                        onClose={() => setLightboxImage(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedEvent && (
                    <EventDetailModal
                        key="detail-modal"
                        event={selectedEvent}
                        onClose={handleCloseDetail}
                        onNext={handleNext}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default SecretNftEvents
