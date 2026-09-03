"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X, MapPin, Calendar, Sparkles, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"

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

export const AdventureCard = ({ adventure, formatDate, onBook }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleVideoClick = (e) => {
    e.stopPropagation()
    setIsVideoPlaying(true)
  }

  const handleCloseVideo = (e) => {
    e.stopPropagation()
    setIsVideoPlaying(false)
  }

  const handleImageClick = (e) => {
    e.stopPropagation()
    if (adventure.medias && adventure.medias.length > 0) {
      setLightboxOpen(true)
    }
  }

  return (
    <>
    <motion.div
      className="group bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl border border-gray-100 cursor-pointer"
      onClick={() => onBook(adventure._id)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Image/Video Container */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-gray-100">
        {/* Thumbnail Image */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ x: 0 }}
          animate={{ x: isVideoPlaying ? "-100%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {adventure.medias[0] ? (
            <>
              <div
                className="absolute inset-0 cursor-pointer group/img"
                onClick={handleImageClick}
              >
                <img
                  src={adventure.medias[0]}
                  alt={adventure.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    } group-hover:scale-110`}
                  onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-black/10">
                  <div className="bg-black/50 rounded-full p-2">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center p-6">
              <span className="text-gray-700 font-bold text-xl text-center">
                {adventure.name}
              </span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button */}
          {adventure.previewVideo && !isVideoPlaying && (
            <motion.button
              className="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-all group/btn"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVideoClick}
              aria-label="Play preview video"
            >
              <Play size={18} className="text-gray-900 ml-0.5" fill="currentColor" />
            </motion.button>
          )}

          {/* Featured badge */}
          {adventure.featured && (
            <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Sparkles size={12} />
              Featured
            </div>
          )}
        </motion.div>

        {/* Video Player */}
        {adventure.previewVideo && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ x: "100%" }}
            animate={{ x: isVideoPlaying ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full h-full">
              <video
                src={adventure.previewVideo}
                autoPlay
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
                playsInline
                muted={false}
              />
              <motion.button
                className="absolute top-3 right-3 bg-black/80 text-white p-2 rounded-full hover:bg-black transition-colors z-10 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseVideo}
                aria-label="Close video"
              >
                <X size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {adventure.name}
        </h3>

        {/* Location */}
        {adventure.location && adventure.location.length > 0 && (
          <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-3">
            <MapPin size={16} className="text-gray-900 flex-shrink-0" />
            <span className="line-clamp-1">{adventure.location[0].name}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
          {adventure.description}
        </p>

        {/* Footer */}
        <div className="mt-auto space-y-3 border-t border-gray-100 pt-4">
          {/* Date */}
          {adventure.session_date && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full">
                <Calendar size={14} />
                <span className="font-medium">{formatDate(adventure.session_date)}</span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <motion.button
            className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:bg-gray-800 transition-all"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              onBook(adventure._id)
            }}
          >
            Book Adventure
          </motion.button>
        </div>
      </div>
    </motion.div>

    {lightboxOpen && adventure.medias && adventure.medias.length > 0 && (
      <ImageLightbox
        images={adventure.medias}
        initialIndex={0}
        onClose={() => setLightboxOpen(false)}
      />
    )}
  </>
  )
}

export default AdventureCard
