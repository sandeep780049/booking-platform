import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LayoutDashboard, Calendar, Settings, LogOut, Menu, User, LifeBuoy, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import LanguageSelector from "../../components/LanguageSelector"
import { useAuth } from "../AuthProvider"
import { MdMoney } from "react-icons/md"

const InstructorLayout = ({ children, onOpenChat }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const getUserInitials = () => {
        const email = user?.user?.email
        const name = user?.user?.name || user?.user?.firstName
        if (name) {
            return name.charAt(0).toUpperCase()
        }
        if (email) {
            return email.charAt(0).toUpperCase()
        }
        return "I"
    }

    const getUserDisplayName = () => {
        return user?.user?.name || user?.user?.firstName || user?.user?.email || "Instructor"
    }

    const navItems = [
        {
            icon: <LayoutDashboard className="h-5 w-5" />,
            label: t("instructor.dashboard"),
            path: "/instructor/dashboard",
        },
        {
            icon: <Calendar className="h-5 w-5" />,
            label: t("instructor.sessions"),
            path: "/instructor/sessions",
        },
        {
            icon: <User className="h-5 w-5" />,
            label: t("instructor.profile"),
            path: "/instructor/profile",
        },
        {
            icon: <LifeBuoy className="h-5 w-5" />,
            label: t("instructor.support"),
            path: "/instructor/support",
        },
        {
            icon: <MdMoney className="h-5 w-5" />,
            label: t("instructor.payout"),
            path: "/instructor/payout",
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: t("instructor.settings"),
            path: "/instructor/settings",
        },
    ]

    const isActivePath = (path) => {
        return location.pathname === path
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
                <div className="w-full h-16 px-4 lg:px-6">
                    <div className="flex h-full items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 hover:bg-neutral-100">
                                        <Menu className="h-5 w-5 text-neutral-900" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] p-0 bg-white">
                                    <div className="flex flex-col h-full">
                                        <div className="h-16 px-6 flex items-center border-b border-neutral-200 bg-neutral-900">
                                            <Link to="/" className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-neutral-900" />
                                                </div>
                                                <span className="text-base font-semibold text-white tracking-tight">{t("instructor.instructorPortal")}</span>
                                            </Link>
                                        </div>
                                        <nav className="flex-1 p-3 overflow-y-auto">
                                            <ul className="space-y-1">
                                                {navItems.map((item) => (
                                                    <li key={item.path}>
                                                        <Link
                                                            to={item.path}
                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePath(item.path)
                                                                ? "bg-neutral-900 text-white"
                                                                : "text-neutral-700 hover:bg-neutral-100"
                                                                }`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {item.icon}
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                        <div className="p-3 border-t border-neutral-200">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-300 rounded-lg text-sm font-medium"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>{t("instructor.logout")}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Link to="/" className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-lg bg-neutral-900 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-base font-semibold hidden sm:inline-block text-neutral-900 tracking-tight">{t("instructor.instructorPortal")}</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="hidden sm:block">
                                <LanguageSelector variant="minimal" />
                            </div>

                            {onOpenChat && (
                                <Button
                                    onClick={onOpenChat}
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-neutral-100"
                                >
                                    <MessageCircle className="h-5 w-5 text-neutral-700" />
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full hover:bg-neutral-100">
                                        <Avatar className="h-9 w-9 border border-neutral-200">
                                            <AvatarImage src={user?.user?.profileImage || user?.user?.avatar} alt={getUserDisplayName()} />
                                            <AvatarFallback className="bg-neutral-900 text-white text-sm font-semibold">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[240px] rounded-lg border-neutral-200">
                                    <DropdownMenuLabel className="px-3 py-2">
                                        <div className="flex flex-col space-y-0.5">
                                            <p className="text-sm font-semibold text-neutral-900 truncate">{getUserDisplayName()}</p>
                                            <p className="text-xs text-neutral-500">Instructor Portal</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="sm:hidden px-1 py-1">
                                        <DropdownMenuItem>
                                            <LanguageSelector variant="minimal" />
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </div>
                                    {navItems.map((item) => (
                                        <DropdownMenuItem
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`cursor-pointer px-3 py-2 rounded-md mx-1 text-sm ${isActivePath(item.path) ? "bg-neutral-100" : ""
                                                }`}
                                        >
                                            <span className="mr-2">{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-3 py-2 rounded-md mx-1 text-sm font-medium">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        {t("instructor.logout")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex min-h-screen pt-16">
                <aside className="hidden lg:block w-64 fixed inset-y-0 top-16 bg-white border-r border-neutral-200">
                    <div className="flex flex-col h-full">
                        <nav className="flex-1 p-3 overflow-y-auto">
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActivePath(item.path)
                                                ? "bg-neutral-900 text-white"
                                                : "text-neutral-700 hover:bg-neutral-100"
                                                }`}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="p-3 border-t border-neutral-200">
                            <Button
                                variant="outline"
                                className="w-full h-10 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-300 rounded-lg text-sm font-medium"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>{t("instructor.logout")}</span>
                            </Button>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 lg:ml-64">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default InstructorLayout
