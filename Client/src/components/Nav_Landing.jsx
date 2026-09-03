"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Loader } from "../components/Loader"
import { Settings, LogOut, User, TicketIcon, Menu, X, Compass, ShoppingBag, Hotel, Target } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion"
import { MdLanguage } from "react-icons/md"
import { useTranslation } from "react-i18next"
import { useAuth } from "../Pages/AuthProvider"
import { useWebsiteSettings } from "../contexts/WebsiteSettingsContext"
import { useNavigate, Link } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuGroup,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import LanguageSelector from "./LanguageSelector"
import { updateLanguageHeaders } from "../Api/language.api.js"
import { toast } from "sonner"
import logo from "../assets/logo.svg"

export const Nav_Landing = ({ theme = "light" }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { t, i18n } = useTranslation()
    const { user, logout } = useAuth()
    const { isShopEnabled, isHotelsEnabled } = useWebsiteSettings()
    const navigate = useNavigate()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Handle scroll effect for navbar background
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/login")
        } catch (error) {
            console.error("Logout error:", error)
            toast.error(t("logoutError"))
        }
    }

    const navigateprofile = () => {
        if (user.user.role === "instructor") {
            navigate("/instructor/dashboard")
        } else if (user.user.role === "hotel") {
            navigate("/hotel")
        } else if (user.user.role === "admin") {
            navigate("/admin")
        } else {
            navigate("/dashboard")
        }
    }

    const getDashboardLabel = () => {
        if (user?.user?.role === "admin") {
            return t("adminPanel") || "Admin Panel"
        }
        return t("dashboardTitle") || "Dashboard"
    }

    const languages = [
        { code: "en", name: "English" },
        { code: "fr", name: "Français" },
        { code: "de", name: "Deutsch" },
        { code: "es", name: "Español" },
        { code: "it", name: "Italiano" },
    ]

    const changeLanguage = (code) => {
        i18n.changeLanguage(code)
        updateLanguageHeaders(code)
        try {
            localStorage.setItem('selectedLanguage', code)
        } catch (error) {
            console.error('Error saving language to localStorage:', error)
        }
        setTimeout(() => {
            window.location.reload()
        }, 100)
    }

    const isDark = theme === "dark"
    const bgClass = isScrolled || isHovered ? "bg-black/90 backdrop-blur-md py-3" : "bg-transparent py-5"
    const textClass = isDark && !isScrolled && !isHovered ? "text-black" : "text-white"
    const borderClass = isDark && !isScrolled && !isHovered ? "border-black/20" : "border-white/20"
    const logoClass = isDark && !isScrolled && !isHovered ? "text-black hover:text-gray-700" : "text-white hover:text-gray-300"

    return (
        <nav
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ease-in-out ${bgClass} ${textClass}`}
        >
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className={`text-2xl font-bold tracking-tighter transition-colors ${logoClass}`}>
                        <img src={logo} alt="Logo" className="h-18 w-auto brightness-0 invert" />
                    </Link>
                </motion.div>

                <div className="hidden lg:flex items-center space-x-8">
                    <ul className="flex items-center space-x-6">
                        <NavLink to={`/browse?date=${new Date().toISOString().split('T')[0]}&q=adventure`} text={t("explore")} icon={Compass} textClass={textClass} />
                        {isShopEnabled && <NavLink to="/shop" text={t("shop")} icon={ShoppingBag} textClass={textClass} />}
                        {isHotelsEnabled && <NavLink to="/book-hotel" text={t("Accommodations")} icon={Hotel} textClass={textClass} />}
                        <NavLink to="/mission" text={t("mission")} icon={Target} textClass={textClass} />
                    </ul>

                    <div className={`flex items-center space-x-4 border-l pl-6 transition-colors ${borderClass}`}>
                        <div className={`transition-colors ${textClass} hover:opacity-80`}>
                            <LanguageSelector />
                        </div>

                        {user.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={`relative h-10 w-10 rounded-full hover:bg-black/5 p-0 border transition-colors ${borderClass}`}>
                                        <Avatar className="h-full w-full">
                                            <AvatarFallback className="bg-black text-white border border-white/20">
                                                {user?.user?.email?.charAt(0)?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-black/95 text-white border-white/10" align="end">
                                    <DropdownMenuLabel className="font-normal text-gray-400">
                                        {user?.user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => navigateprofile()}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>{getDashboardLabel()}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => navigate("/dashboard/tickets")}>
                                            <TicketIcon className="mr-2 h-4 w-4" />
                                            <span>{t("tickets")}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer" onClick={() => navigate("/dashboard/settings")}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>{t("settings")}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="focus:bg-red-50 cursor-pointer text-red-400 focus:text-red-600" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{t("logout")}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={() => navigate("/login-options")}
                                className={`font-medium rounded-full px-6 transition-transform hover:scale-105 ${isDark && !isScrolled && !isHovered
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-white text-black hover:bg-gray-200"
                                    }`}
                            >
                                {t("login")}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="lg:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`p-2 focus:outline-none backdrop-blur-sm rounded-lg border transition-all ${isDark && !isScrolled && !isHovered
                            ? "text-black bg-white/30 border-black/20 hover:bg-white/50"
                            : "text-white bg-black/30 border-white/20 hover:bg-black/50"
                            }`}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay - Rendered via Portal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-0 bg-black z-[9999] lg:hidden flex flex-col px-6 overflow-y-auto"
                        >
                            <div className="flex justify-end pt-6 pb-2">
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex flex-col space-y-6 mt-4">
                                <MobileNavLink onClick={() => { setMobileMenuOpen(false); navigate(`/browse?date=${new Date().toISOString().split('T')[0]}&q=adventure`) }} icon={Compass}>
                                    {t("explore")}
                                </MobileNavLink>
                                {isShopEnabled && (
                                    <MobileNavLink onClick={() => { setMobileMenuOpen(false); navigate("/shop") }} icon={ShoppingBag}>
                                        {t("shop")}
                                    </MobileNavLink>
                                )}
                                {isHotelsEnabled && (
                                    <MobileNavLink onClick={() => { setMobileMenuOpen(false); navigate("/book-hotel") }} icon={Hotel}>
                                        {t("Accommodations")}
                                    </MobileNavLink>
                                )}
                                <MobileNavLink onClick={() => { setMobileMenuOpen(false); navigate("/mission") }} icon={Target}>
                                    {t("mission")}
                                </MobileNavLink>

                                <div className="border-t border-white/10 pt-6 mt-6">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <MdLanguage className="text-white text-xl" />
                                        <select
                                            className="bg-transparent text-white text-base border-none focus:ring-0 p-0"
                                            value={i18n.language}
                                            onChange={(e) => changeLanguage(e.target.value)}
                                        >
                                            {languages.map((language) => (
                                                <option key={language.code} value={language.code} className="bg-black">
                                                    {language.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {user.user ? (
                                        <div className="space-y-4">
                                            <div
                                                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-white/5"
                                                onClick={() => { setMobileMenuOpen(false); navigateprofile() }}
                                            >
                                                <Avatar className="h-10 w-10 border border-white/20">
                                                    <AvatarFallback className="bg-black text-white">
                                                        {user?.user?.email?.charAt(0)?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-white font-medium">{getDashboardLabel()}</p>
                                                    <p className="text-gray-400 text-sm">{user?.user?.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                onClick={handleLogout}
                                                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-white/5"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {t("logout")}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => navigate("/login-options")}
                                            className="w-full bg-white text-black hover:bg-gray-200 py-6 text-lg rounded-xl"
                                        >
                                            {t("login")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </nav>
    )
}

// Helper Components
const NavLink = ({ to, text, icon: Icon, textClass = "text-white" }) => (
    <li>
        <Link
            to={to}
            className={`${textClass} opacity-80 hover:opacity-100 text-sm font-medium tracking-wide transition-colors relative group flex items-center gap-2`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {text}
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${textClass === "text-black" ? "bg-black" : "bg-white"}`}></span>
        </Link>
    </li>
)

const MobileNavLink = ({ children, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className="text-left text-2xl font-light text-white hover:text-gray-300 transition-colors flex items-center gap-3"
    >
        {Icon && <Icon className="h-6 w-6" />}
        {children}
    </button>
)

