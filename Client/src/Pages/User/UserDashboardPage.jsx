import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../AuthProvider"
import { motion } from "framer-motion"
import { Award, Calendar, Target, Loader2, X, RefreshCw, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import UserLayout from "./UserLayout"
import AdventureExperienceCard from "../../components/AdventureExperienceCard"
import { getCurrentUserSessionBookings } from "../../Api/booking.api"
import { getUserAdventureExperiences, getUserAdventures, getUserAchievements, evaluateMyAchievements } from "../../Api/user.api"
import { staggerContainer, fadeIn } from "../../assets/Animations"
import { ChatLayout } from "../Chat/ChatLayout"
import HintTooltip from "../../components/HintTooltip"

const ALL_ACHIEVEMENTS = [
    { id: 1, name: "First Adventure", description: "Complete your first adventure", category: "Beginner", requiredLevel: 1 },
    { id: 2, name: "Adventure Explorer", description: "Complete 5 adventures", category: "Explorer", requiredLevel: 1 },
    { id: 3, name: "Adventure Veteran", description: "Complete 10 adventures", category: "Explorer", requiredLevel: 2 },
    { id: 4, name: "Thrill Seeker", description: "Try 3 different adventure types", category: "Explorer", requiredLevel: 1 },
    { id: 5, name: "Adventure Master", description: "Complete 25 adventures", category: "Master", requiredLevel: 3 },
    { id: 6, name: "Elite Adventurer", description: "Complete 50 adventures", category: "Elite", requiredLevel: 5 },
    { id: 7, name: "Legendary Explorer", description: "Complete 100 adventures", category: "Legend", requiredLevel: 10 },
    { id: 8, name: "Social Butterfly", description: "Complete 5 group adventures", category: "Social", requiredLevel: 2 },
    { id: 9, name: "Team Leader", description: "Lead 10 group adventures", category: "Social", requiredLevel: 3 },
    { id: 10, name: "Early Bird", description: "Book 5 morning adventures", category: "Special", requiredLevel: 1 },
    { id: 11, name: "Night Owl", description: "Complete 5 evening adventures", category: "Special", requiredLevel: 1 },
    { id: 12, name: "Loyal Customer", description: "Book with same instructor 5 times", category: "Loyalty", requiredLevel: 2 },
]

const AchievementBadge = ({ achievement, isEarned }) => {
    const gradientId = `gradient-${achievement.id || 'earned'}`

    return (
        <div className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${isEarned ? 'opacity-100' : 'opacity-40'}`}>
            <div className="relative">
                <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M40 0L75 15V45C75 62 65 75 40 85C15 75 5 62 5 45V15L40 0Z"
                        fill={isEarned ? `url(#${gradientId})` : "#e5e7eb"}
                        stroke={isEarned ? "#1f2937" : "#9ca3af"}
                        strokeWidth="2"
                    />
                    <defs>
                        <linearGradient id={gradientId} x1="40" y1="0" x2="40" y2="85" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#fbbf24" />
                            <stop offset="1" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pt-2">
                    <Shield className={`h-8 w-8 ${isEarned ? 'text-neutral-900' : 'text-neutral-400'}`} />
                </div>
                {isEarned && achievement.level && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Lv {achievement.level}
                    </div>
                )}
            </div>
            <div className="text-center max-w-[120px]">
                <p className={`text-sm font-semibold ${isEarned ? 'text-neutral-900' : 'text-neutral-400'} line-clamp-1`}>
                    {achievement.name}
                </p>
                <p className={`text-xs mt-1 ${isEarned ? 'text-neutral-600' : 'text-neutral-400'} line-clamp-2`}>
                    {achievement.description}
                </p>
                {isEarned && achievement.earnedAt && (
                    <p className="text-xs text-neutral-500 mt-1">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    )
}

export default function UserDashboardPage() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [adventureExperiences, setAdventureExperiences] = useState([])
    const [levelData, setLevelData] = useState({
        overallLevel: 0,
        totalExperience: 0,
        averageLevel: 0,
        adventureCount: 0
    })
    const [loading, setLoading] = useState(true)
    const [experienceLoading, setExperienceLoading] = useState(true)
    const [achievementsLoading, setAchievementsLoading] = useState(true)
    const [userAchievements, setUserAchievements] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [currentAchievementPage, setCurrentAchievementPage] = useState(0)

    useEffect(() => {
        const fetchUserAdventures = async () => {
            try {
                const response = await getUserAdventures()
                if (response.success) {
                    const adventures = response.data.adventures || []
                }
            } catch (error) {
                console.error("Error fetching user adventures:", error)
            }
        }
        fetchUserAdventures()

        const fetchData = async () => {
            try {
                setLoading(true)
                setExperienceLoading(true)
                setAchievementsLoading(true)

                const bookingResponse = await getCurrentUserSessionBookings({
                    page: 1,
                    limit: 100,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                })
                const bookingData = bookingResponse.data.data || bookingResponse.data
                setBookings(bookingData.bookings || [])

                const experienceResponse = await getUserAdventureExperiences()
                if (experienceResponse.success) {
                    setAdventureExperiences(experienceResponse.data.adventureExperiences || [])
                    setLevelData(experienceResponse.data.levelData || {
                        overallLevel: 0,
                        totalExperience: 0,
                        averageLevel: 0,
                        adventureCount: 0
                    })
                }

                try {
                    await evaluateMyAchievements()
                } catch (err) {
                    console.warn('Achievement evaluation skipped:', err?.response?.data?.message || err.message)
                }

                try {
                    const achievementsResponse = await getUserAchievements()
                    if (achievementsResponse?.success) {
                        setUserAchievements(achievementsResponse.data)
                    }
                } catch (err) {
                    console.warn('Could not load achievements:', err?.response?.data?.message || err.message)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                setBookings([])
                setAdventureExperiences([])
            } finally {
                setLoading(false)
                setExperienceLoading(false)
                setAchievementsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleRefreshAchievements = async () => {
        try {
            setRefreshing(true)
            await evaluateMyAchievements()
            const achievementsResponse = await getUserAchievements()
            if (achievementsResponse?.success) {
                setUserAchievements(achievementsResponse.data)
            }
        } catch (err) {
            console.warn('Refresh achievements failed:', err?.response?.data?.message || err.message)
        } finally {
            setRefreshing(false)
        }
    }

    const processBookingStats = () => {
        const currentDate = new Date()
        let completedAdventures = 0
        let upcomingAdventures = 0

        bookings.forEach(booking => {
            if (booking.status !== 'cancelled' && booking.session?.startTime) {
                const sessionStartTime = new Date(booking.session.startTime)
                if (sessionStartTime < currentDate) {
                    completedAdventures++
                } else {
                    upcomingAdventures++
                }
            }
        })

        return { completedAdventures, upcomingAdventures }
    }

    const { completedAdventures, upcomingAdventures } = processBookingStats()

    const getGridClasses = (count) => {
        if (count === 1) return "grid grid-cols-1 gap-6"
        if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-6"
        if (count === 3) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }

    const xpFromAchievements = Number.isFinite(userAchievements?.totalExperiencePoints) ? userAchievements.totalExperiencePoints : 0
    const xpFromLevelData = Number.isFinite(levelData?.totalExperience) ? levelData.totalExperience : 0
    const totalXP = Math.max(xpFromAchievements, xpFromLevelData)
    const levelFromXP = Math.floor(totalXP / 100)
    const apiLevel = Number.isFinite(userAchievements?.level) ? userAchievements.level : null
    const normalizedLevel = apiLevel !== null ? Math.max(apiLevel, levelFromXP) : levelFromXP
    const nextLevelXP = (normalizedLevel + 1) * 100
    const adventureCountNormalized = Math.max(
        Number.isFinite(levelData?.adventureCount) ? levelData.adventureCount : 0,
        Array.isArray(adventureExperiences) ? adventureExperiences.length : 0
    )
    const progressPercentage = totalXP > 0 ? ((totalXP % 100) / 100) * 100 : 0

    return (
        <UserLayout onOpenChat={() => setChatOpen(true)}>
            <div className="min-h-screen">
                <div className="bg-neutral-900 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Welcome back, {user?.user?.name || "Adventurer"}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-neutral-400 font-medium">Level</p>
                                    <p className="text-xl font-semibold text-white">{normalizedLevel}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-neutral-400 font-medium">XP</p>
                                    <p className="text-xl font-semibold text-white">{totalXP}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <motion.div
                        className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={fadeIn}>
                            <Card className="h-full border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Award className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            Overall Level
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Your overall level based on total experience points earned across all adventures." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {loading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        ) : (
                                            normalizedLevel
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-neutral-500">{totalXP} / {nextLevelXP} XP</span>
                                    </div>
                                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeIn}>
                            <Card className="h-full border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Award className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            Completed Adventures
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Total number of adventure sessions you have completed." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {loading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                        ) : (
                                            completedAdventures
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 rounded-md font-medium text-purple-700 bg-purple-50">
                                            Completed
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeIn}>
                            <Card className="h-full border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            Upcoming Adventures
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Number of adventure sessions you have scheduled for the future." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {loading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                                        ) : (
                                            upcomingAdventures
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 rounded-md font-medium text-amber-700 bg-amber-50">
                                            Scheduled
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <Card className="border-neutral-200">
                            <CardHeader className="border-b border-neutral-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-neutral-700" />
                                        <h3 className="text-lg font-semibold text-neutral-900">Adventure Experience</h3>
                                        <HintTooltip content="Your progress in each adventure category. Level up by completing sessions!" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3 py-2 rounded-lg">
                                        <Target className="h-4 w-4 text-neutral-700" />
                                        <span className="text-xs text-neutral-700 font-semibold">
                                            {adventureCountNormalized} Adventure{adventureCountNormalized !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {experienceLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-64 bg-neutral-200 rounded animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : adventureExperiences.length > 0 ? (
                                    <div className={getGridClasses(adventureExperiences.length)}>
                                        {adventureExperiences.map((adventureExp, index) => (
                                            <AdventureExperienceCard
                                                key={adventureExp._id}
                                                adventureExp={adventureExp}
                                                isFullWidth={adventureExperiences.length === 1}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-neutral-50 rounded-xl">
                                        <Award className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-neutral-900 mb-2">No Adventure Experience Yet</h3>
                                        <p className="text-sm text-neutral-600 mb-8 max-w-md mx-auto">
                                            Start your adventure journey by booking your first session and gain experience points to level up!
                                        </p>
                                        <Link
                                            to="/browse"
                                            className="inline-block px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium text-sm"
                                        >
                                            Browse Adventures
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <Card className="border-neutral-200">
                            <CardHeader className="border-b border-neutral-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-neutral-700" />
                                        <h3 className="text-lg font-semibold text-neutral-900">Achievements</h3>
                                        <HintTooltip content="Your achievement badges. Complete adventures and reach milestones to unlock more badges!" />
                                    </div>
                                    <button
                                        onClick={handleRefreshAchievements}
                                        disabled={refreshing}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {achievementsLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-neutral-600" />
                                        <p className="text-neutral-600">Loading achievements...</p>
                                    </div>
                                ) : (() => {
                                    const earnedIds = new Set(userAchievements?.achievements?.map(a => a.name) || [])
                                    const earnedMap = new Map(userAchievements?.achievements?.map(a => [a.name, a]) || [])

                                    const allBadges = ALL_ACHIEVEMENTS.map(template => {
                                        const earned = earnedMap.get(template.name)
                                        return earned ? { ...template, ...earned, isEarned: true } : { ...template, isEarned: false }
                                    })

                                    const itemsPerPage = 4
                                    const totalPages = Math.ceil(allBadges.length / itemsPerPage)
                                    const startIdx = currentAchievementPage * itemsPerPage
                                    const visibleBadges = allBadges.slice(startIdx, startIdx + itemsPerPage)
                                    const earnedCount = allBadges.filter(b => b.isEarned).length

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-neutral-600">
                                                    Unlocked: <span className="font-semibold text-neutral-900">{earnedCount}</span> / {allBadges.length}
                                                </p>
                                                {totalPages > 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentAchievementPage(Math.max(0, currentAchievementPage - 1))}
                                                            disabled={currentAchievementPage === 0}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                        </Button>
                                                        <span className="text-sm text-neutral-600">
                                                            {currentAchievementPage + 1} / {totalPages}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentAchievementPage(Math.min(totalPages - 1, currentAchievementPage + 1))}
                                                            disabled={currentAchievementPage === totalPages - 1}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {visibleBadges.map((badge) => (
                                                    <AchievementBadge key={badge.id} achievement={badge} isEarned={badge.isEarned} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {chatOpen && (
                <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setChatOpen(false)}
                            className="absolute top-4 right-4 z-50 w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="h-5 w-5 text-neutral-600" />
                        </button>
                        <ChatLayout />
                    </div>
                </div>
            )}
        </UserLayout>
    )
}
