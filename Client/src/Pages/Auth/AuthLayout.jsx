import { motion } from "framer-motion"
import { Outlet } from "react-router-dom"
import { useCallback, useMemo, useState } from "react"
import ReactPlayer from "react-player"

const AUTH_VIDEO_URL = "https://dazzling-chaja-b80bdd.netlify.app/video.mp4"

export default function AuthLayout() {
  const [isVideoReady, setIsVideoReady] = useState(false)

  const handlePlayerReady = useCallback((playerInstance) => {
    const internalPlayer = playerInstance?.getInternalPlayer?.()
    if (internalPlayer?.setPlaybackQuality) {
      try {
        internalPlayer.setPlaybackQuality("hd1080")
      } catch (error) {
        console.warn("Unable to set playback quality", error)
      }
    }
    setIsVideoReady(true)
  }, [])

  const backgroundVideo = useMemo(() => (
    <ReactPlayer
      url={AUTH_VIDEO_URL}
      onReady={handlePlayerReady}
      onStart={() => setIsVideoReady(true)}
      controls={false}
      loop
      playing
      muted
      width="100%"
      height="100%"
      className="react-player absolute top-0 left-0"
      style={{ objectFit: "cover" }}
      wrapperClassName={`h-full w-full transition-opacity duration-700 ${isVideoReady ? "opacity-100" : "opacity-0"}`}
      config={{
        file: {
          attributes: {
            preload: "auto",
            playsInline: true,
            autoPlay: true,
            muted: true
          }
        }
      }}
    />
  ), [handlePlayerReady, isVideoReady])

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="bg absolute inset-0 -z-50">
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 overflow-hidden">
          {backgroundVideo}
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
