"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Compass, GraduationCap, Building2 } from 'lucide-react'
import { useTranslation } from "react-i18next"
import { Nav_Landing } from "../components/Nav_Landing"

export default function LoginOptionsPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [hoveredCard, setHoveredCard] = useState(null)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const cards = [
        {
            id: "explorer",
            title: "Explorer",
            description: t("Joiin As Explorer"),
            image: "/src/assets/scubadiving-min.jpg",
            path1: "/login",
            path2: "/login",
            color: "from-emerald-500 to-teal-600",
            icon: Compass
        },
        {
            id: "instructor",
            title: "Instructor",
            description: t("Join As Instructor"),
            image: "/src/assets/face.jpeg",
            path1: "/instructor/register",
            path2: "/login",
            color: "from-blue-500 to-indigo-600",
            icon: GraduationCap
        },
        {
            id: "hotel",
            title: "Accommodation",
            description: t("Join As Accommodation Provider"),
            image: "/src/assets/login.jpg",
            color: "from-amber-500 to-orange-600",
            path1: "/hotel/register",
            path2: "/login",
            icon: Building2
        }
    ]

    return (
        <div className="flex-1 flex flex-col min-h-screen relative">
            {/* Background Video */}
            <div className="fixed inset-0 w-full h-screen overflow-hidden -z-50 bg-black">
                <motion.div
                    className="absolute inset-0 bg-black/40 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-0 animate-fade-in transition-opacity duration-1000"
                    onLoadedData={(e) => e.currentTarget.classList.remove("opacity-0")}
                >
                    <source src="https://dazzling-chaja-b80bdd.netlify.app/video.mp4" type="video/mp4" />
                </video>
            </div>

            <Nav_Landing />

            <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-8 md:pt-32 md:pb-16">
                <div className="max-w-7xl w-full">
                    {/* Header - Compact on mobile */}
                    <div className="text-center mb-8 md:mb-12">
                        <motion.h1
                            className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {t("Choose Your Account Type")}
                        </motion.h1>
                        <motion.p
                            className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {t("selectAccountType")}
                        </motion.p>
                    </div>

                    {/* Cards Container */}
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-4 perspective-[1000px]">
                        {cards.map((card, index) => {
                            const IconComponent = card.icon
                            return (
                                <motion.div
                                    key={card.id}
                                    className="relative w-full md:w-1/3 max-w-sm h-[280px] md:h-[450px] cursor-pointer group"
                                    initial={{
                                        opacity: 0,
                                        y: isMobile ? 20 : 0,
                                        rotateY: isMobile ? 0 : 15,
                                        rotateX: isMobile ? 0 : 15,
                                        translateZ: isMobile ? 0 : -50
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        rotateY: isMobile ? 0 : (index === 0 ? -15 : index === 2 ? 15 : 0),
                                        rotateX: 0,
                                        translateZ: 0
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                    whileHover={isMobile ? {} : {
                                        scale: 1.05,
                                        rotateY: 0,
                                        translateZ: 50,
                                        transition: { duration: 0.3 }
                                    }}
                                    onHoverStart={() => setHoveredCard(card.id)}
                                    onHoverEnd={() => setHoveredCard(null)}
                                >
                                    {/* Mobile: Vertical card matching desktop design */}
                                    <div className="md:hidden absolute inset-0 overflow-hidden rounded-2xl shadow-xl">
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                                            style={{ backgroundImage: `url(${card.image})` }}
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                                            {/* Icon at top */}
                                            <div className="flex justify-start">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                                    <IconComponent className="h-6 w-6 text-white" />
                                                </div>
                                            </div>

                                            {/* Title and description at bottom */}
                                            <div>
                                                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{card.title}</h3>
                                                <p className="text-white/90 text-sm mb-4 drop-shadow-sm">{card.description}</p>

                                                {/* Action buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`${card.path2}?action=signin&role=${card.id}`)}
                                                        className="flex-1 px-4 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-1.5"
                                                    >
                                                        Sign In
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`${card.path1}?action=signup&role=${card.id}`)}
                                                        className="flex-1 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/40 flex items-center justify-center gap-1.5"
                                                    >
                                                        Sign Up
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop: Original tilted card design */}
                                    <div className="hidden md:block absolute inset-0 overflow-hidden rounded-2xl transform-style-3d rotate-y-[-15deg] shadow-2xl">
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${card.image})` }}
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />
                                        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                                            <h3 className="text-3xl font-bold mb-2">{card.title}</h3>
                                            <p className="text-white/90 mb-6">{card.description}</p>
                                            <div className="flex items-center justify-between">
                                                <motion.div
                                                    onClick={() => { navigate(`${card.path2}?action=signin&role=${card.id}`) }}
                                                    className="flex items-center text-sm font-semibold"
                                                    animate={{
                                                        x: hoveredCard === card.id ? 10 : 0
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    Sign In
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </motion.div>
                                                <motion.div
                                                    onClick={() => { navigate(`${card.path1}?action=signup&role=${card.id}`) }}
                                                    className="flex items-center text-sm font-semibold"
                                                    animate={{
                                                        x: hoveredCard === card.id ? 10 : 0
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    Sign Up
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </motion.div>
                                            </div>

                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
