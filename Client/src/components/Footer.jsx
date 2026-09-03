import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, ArrowRight, X, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { axiosClient } from '../AxiosClient/axios'
import logo from "../assets/logo.png"

export const Footer = ({ className = "" }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/secret-nft-events')
  }

  // Dynamic sponsors fetched from backend
  const [sponsors, setSponsors] = useState([])
  const [loadingSponsors, setLoadingSponsors] = useState(true)
  const [sponsorError, setSponsorError] = useState(null)

  useEffect(() => {
    let ignore = false
    const fetchSponsors = async () => {
      try {
        setLoadingSponsors(true)
        setSponsorError(null)
        const res = await axiosClient.get(`/api/sponsors`)
        if (!ignore) {
          const data = Array.isArray(res.data?.data) ? res.data.data : []
          setSponsors(data.filter(s => s.isActive !== false))
        }
      } catch (e) {
        if (!ignore) setSponsorError('FAILED_TO_LOAD_SPONSORS')
      } finally {
        if (!ignore) setLoadingSponsors(false)
      }
    }
    fetchSponsors()
    return () => { ignore = true }
  }, [])

  // Modal state
  const [selectedPartner, setSelectedPartner] = useState(null)
  const closeButtonRef = useRef(null)

  // Close modal helper
  const closeModal = () => setSelectedPartner(null)

  // Escape key handling & focus management
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeModal()
    }
    if (selectedPartner) {
      window.addEventListener('keydown', onKey)
      // Slight delay to ensure element rendered
      setTimeout(() => closeButtonRef.current?.focus(), 30)
      // Prevent background scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selectedPartner])

  return (
    <footer className={`bg-black text-white border-t border-white/10 ${className}`}>
      <div className="container mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">

          {/* Brand Section - Spans 5 columns */}
          <div className="md:col-span-5 space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-white">{t("aboutAdventureBooking")}</h3>
            <p className="text-neutral-400 leading-relaxed max-w-md text-sm md:text-base">
              {t("footerDescription")}
            </p>
          </div>

          {/* Navigation Links - Spans 3 columns */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-lg mb-6 text-white">{t("quickLinks")}</h4>
            <ul className="space-y-4">
              {[
                { to: "/terms", label: t("termsConditions") },
                { to: "/privacy", label: t("privacyPolicy") },
                { to: "/support", label: t("customerSupport") },
                { to: "/faq", label: t("faq") }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 group-hover:bg-white transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsors Section - Spans 4 columns */}
          <div className="md:col-span-4 flex flex-col justify-between h-full">
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">{t("ourPartners")}</h4>
              <div className="w-full relative overflow-hidden logo-marquee rounded-xl border border-white/5 bg-neutral-900/30 p-1">
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

                <ul className="flex items-center gap-12 logo-marquee-track py-6">
                  {loadingSponsors && (
                    <li className="flex items-center gap-2 text-xs text-neutral-500 pl-4">
                      <Loader2 className="h-3 w-3 animate-spin" /> {t("loadingSponsors")}
                    </li>
                  )}
                  {!loadingSponsors && sponsorError && (
                    <li className="text-xs text-red-900 pl-4">{sponsorError === 'FAILED_TO_LOAD_SPONSORS' ? t("failedToLoadSponsors") : sponsorError}</li>
                  )}
                  {!loadingSponsors && !sponsorError && sponsors.length === 0 && (
                    <li className="text-xs text-neutral-600 pl-4">{t("noSponsorsYet")}</li>
                  )}
                  {!loadingSponsors && !sponsorError && sponsors.length > 0 && (
                    // Duplicate list for infinite scroll effect
                    sponsors.concat(sponsors).map((p, i) => (
                      <li
                        key={i}
                        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => setSelectedPartner(p)}
                        title={p.name}
                      >
                        <img
                          src={p.logoUrl}
                          alt={p.name}
                          className="h-12 max-w-[140px] object-contain filter grayscale hover:grayscale-0 transition-all duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleLogoClick}
          className="flex items-center justify-center bg-transparent border-none outline-none"
          style={{ cursor: 'default' }}
        >
          {/* <MapPin className="w-5 h-5" />
          <span>{t("adventureBooking")}</span>
          <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" /> */}
          <img
            className="-mt-24 p-8 h-auto  md:w-96 lg:-mt-12 lg:h-auto object-contain cursor-pointer"
            src={logo}
            alt="Logo"
          />
        </button>
      </div>

      {/* Marquee Styles */}
      <style>{`
        .logo-marquee { --marquee-duration: 15s; }
        .logo-marquee-track {
          animation: marquee var(--marquee-duration) linear infinite;
          width: max-content;
        }
        .logo-marquee:hover .logo-marquee-track { animation-play-state: paused; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track { animation: none; }
        }
      `}</style>

      {/* Sponsor Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-black border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-6 mb-2">
                  <img
                    src={selectedPartner.logoUrl}
                    alt={selectedPartner.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{selectedPartner.name}</h2>
                  {selectedPartner.tier && (
                    <span className="inline-block px-3 py-1 bg-neutral-900 text-neutral-300 text-xs font-medium rounded-full uppercase tracking-wider border border-white/10">
                      {selectedPartner.tier}
                    </span>
                  )}
                </div>

                <p className="text-neutral-400 text-sm leading-relaxed">
                  {selectedPartner.description || t("noDescriptionProvided")}
                </p>

                {selectedPartner.website && (
                  <a
                    href={selectedPartner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                  >
                    {t("visitWebsite")}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
