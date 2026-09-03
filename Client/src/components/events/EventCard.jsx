import { memo, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Calendar, Compass, Clock, Users, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { useTranslation } from "react-i18next"

function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)

  const go = useCallback((dir) => {
    setIndex((i) => (i + dir + images.length) % images.length)
  }, [images.length])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") go(1)
      if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = "auto"
    }
  }, [onClose, go])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(12px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-white/60 text-sm font-medium">{index + 1} / {images.length}</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.img
            key={index}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={images[index]}
            alt={`Photo ${index + 1}`}
            style={{ maxWidth: "90vw", maxHeight: "calc(100vh - 140px)", objectFit: "contain" }}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex-shrink-0 flex gap-2 justify-center py-3 px-4 overflow-x-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} onClick={(e) => e.stopPropagation()}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-all ${i === index ? "border-white" : "border-transparent opacity-50 hover:opacity-80"}`}
              >
                <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

const EventCard = memo(({ event, onBooking, onViewMore }) => {
  const { t } = useTranslation()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
    <motion.div
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group h-full flex flex-col"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Event Image with Title Overlay */}
      <div className="relative h-56 overflow-hidden">
        <div
          className="absolute inset-0 cursor-pointer group/img"
          onClick={() => {
            if (event.image || (event.medias && event.medias.length > 0)) {
              setLightboxOpen(true)
            }
          }}
        >
          <motion.img
            src={event.image || "/placeholder.svg?height=200&width=300"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-black/10 z-10">
            <div className="bg-black/50 rounded-full p-2">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h4 className="text-2xl font-bold text-white mb-2 leading-tight">{event.title}</h4>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{event.city}, {event.country}</span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {/* Date & Time - Two Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{t("date")}</p>
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-gray-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{t("time")}</p>
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {event.startTime}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Location */}
          {event.location && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-600 line-clamp-2">{event.location}</p>
            </div>
          )}

          {/* Adventures */}
          {event.adventures && event.adventures.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-900">{t("adventures")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.adventures.slice(0, 2).map((adventure, index) => (
                  <span
                    key={adventure._id || index}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
                  >
                    {adventure.name}
                  </span>
                ))}
                {event.adventures.length > 2 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-900 text-xs font-medium text-white">
                    +{event.adventures.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Book Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-auto"
        >
          <Button
            onClick={() => onViewMore?.(event)}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Users className="h-5 w-5 mr-2" />
            {t("bookYourSpot").toUpperCase()}
          </Button>
        </motion.div>
      </div>
    </motion.div>

    {lightboxOpen && (event.image || (event.medias && event.medias.length > 0)) && (
      <ImageLightbox
        images={event.medias && event.medias.length > 0 ? event.medias : [event.image]}
        initialIndex={0}
        onClose={() => setLightboxOpen(false)}
      />
    )}
    </>
  )
})

EventCard.displayName = 'EventCard'

export default EventCard