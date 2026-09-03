"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../AuthProvider"
import { motion } from "framer-motion"
import { Separator } from "../../components/ui/separator"
import { Award, Calendar, Users, Star, TrendingUp, Loader2, Euro, MessageCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import InstructorLayout from "./InstructorLayout"
import SessionCalendar from "../../components/SessionCalendar"
import UpcomingBookingsCard from "../../components/UpcomingBookingsCard"
import { getAdventure } from "../../Api/adventure.api"
import { getInstructorSessions, getAllOtherInstructorsSessions } from "../../Api/session.api"
import { staggerContainer, fadeIn } from "../../assets/Animations"
import { getInstructorAchievements, evaluateMyInstructorAchievements } from '../../Api/user.api'
import { axiosClient } from '../../AxiosClient/axios'
import { ChatLayout } from '../Chat/ChatLayout'
import HintTooltip from "../../components/HintTooltip"

const InstructorDashboard = () => {
    const [instructorAchievements, setInstructorAchievements] = useState(null);
    const [achievementsLoading, setAchievementsLoading] = useState(false);
    const navigate = useNavigate()
    const { user } = useAuth()
    const { t } = useTranslation()
    const [timeRange, setTimeRange] = useState("month")
    const [adventureTypes, setAdventureTypes] = useState([])
    const [chatOpen, setChatOpen] = useState(false)

    // Dashboard data state
    const [dashboardData, setDashboardData] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        rating: 0,
        completedBookings: 0,
        bookingIncrease: 0,
        revenueIncrease: 0
    })
    const [upcomingBookings, setUpcomingBookings] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(false)

    const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0)
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)
    const [otherInstructorsSessions, setOtherInstructorsSessions] = useState([])
    const [otherSessionsCount, setOtherSessionsCount] = useState(0)

    const fetchDashboardData = async () => {
        if (!user?.user?._id) return

        setIsLoadingData(true)
        try {
            // Fetch instructor's bookings for statistics
            const [eventBookingsRes, sessionBookingsRes, payoutHistoryRes] = await Promise.allSettled([
                axiosClient.get(`/api/event-bookings?instructor=${user.user._id}`),
                axiosClient.get(`/api/sessionBooking?instructor=${user.user._id}`),
                axiosClient.get('/api/transactions/payout/history?limit=50')
            ])

            let allBookings = []
            let totalRevenue = 0

            // Process event bookings
            if (eventBookingsRes.status === 'fulfilled' && eventBookingsRes.value?.data?.success) {
                const eventBookings = Array.isArray(eventBookingsRes.value.data.data)
                    ? eventBookingsRes.value.data.data
                    : []
                allBookings.push(...eventBookings)
                totalRevenue += eventBookings.reduce((sum, booking) => {
                    const amount = Number(booking?.amount) || 0
                    return sum + (booking?.status === 'completed' && booking?.paymentStatus === 'completed' ? amount * 0.8 : 0)
                }, 0)
            }

            // Process session bookings
            if (sessionBookingsRes.status === 'fulfilled' && sessionBookingsRes.value?.data?.success) {
                const sessionBookings = Array.isArray(sessionBookingsRes.value.data.data)
                    ? sessionBookingsRes.value.data.data
                    : []
                allBookings.push(...sessionBookings)
                totalRevenue += sessionBookings.reduce((sum, booking) => {
                    const amount = Number(booking?.amount) || 0
                    return sum + (booking?.status === 'completed' ? amount * 0.8 : 0)
                }, 0)
            }

            // Add completed payout amounts
            if (payoutHistoryRes.status === 'fulfilled' && payoutHistoryRes.value?.data?.success) {
                const payouts = payoutHistoryRes.value.data.data.docs || []
                const completedPayouts = payouts.filter(p => p?.status === 'SUCCESS')
                totalRevenue = completedPayouts.reduce((sum, payout) => {
                    const amount = Number(payout?.amount) || 0
                    return sum + amount
                }, 0)
            }

            // Calculate statistics
            const completedBookings = allBookings.filter(b => b.status === 'completed')
            const confirmedBookings = allBookings.filter(b => b.status === 'confirmed')

            // Calculate upcoming bookings
            const now = new Date()
            const upcoming = allBookings.filter(booking => {
                const bookingDate = new Date(booking.event?.date || booking.session?.date || booking.bookingDate)
                return bookingDate >= now && ['confirmed', 'pending'].includes(booking.status)
            }).slice(0, 3)

            // Format upcoming bookings for display
            const formattedUpcoming = upcoming.map(booking => ({
                id: booking._id,
                adventure: booking.event?.title || booking.session?.title || 'Adventure',
                location: booking.event?.location || booking.session?.location || 'Location TBD',
                date: booking.event?.date || booking.session?.date || booking.bookingDate,
                time: booking.event?.startTime || booking.session?.startTime || 'TBD',
                duration: calculateDuration(
                    booking.event?.startTime || booking.session?.startTime,
                    booking.event?.endTime || booking.session?.endTime
                ),
                participants: booking.participants || 1,
                amount: booking.amount || 0,
                status: booking.status,
                customerName: booking.user?.name || 'Guest'
            }))

            // Calculate average rating
            const ratingsSum = completedBookings.reduce((sum, booking) => {
                return sum + (booking.rating || 0)
            }, 0)
            const averageRating = completedBookings.length > 0 ?
                (ratingsSum / completedBookings.length).toFixed(1) : 0

            // Calculate growth metrics (simplified - comparing with half of total)
            const recentBookings = allBookings.filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt)
                const oneMonthAgo = new Date()
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                return bookingDate >= oneMonthAgo
            })

            const oldBookings = allBookings.filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt)
                const twoMonthsAgo = new Date()
                twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
                const oneMonthAgo = new Date()
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                return bookingDate >= twoMonthsAgo && bookingDate < oneMonthAgo
            })

            const bookingIncrease = oldBookings.length > 0 ?
                ((recentBookings.length - oldBookings.length) / oldBookings.length * 100).toFixed(1) : 0

            setDashboardData({
                totalBookings: allBookings.length,
                totalRevenue: totalRevenue,
                rating: parseFloat(averageRating),
                completedBookings: completedBookings.length,
                bookingIncrease: parseFloat(bookingIncrease),
                revenueIncrease: 12.5 // This could be calculated similarly if historical revenue data is available
            })
            setUpcomingBookings(formattedUpcoming)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Only show error if it's a critical error, not just empty data
            if (error?.response?.status && error.response.status >= 500) {
                toast.error('Failed to load dashboard data. Please try again.')
            }
            // Set empty data instead of showing error for empty results
            setDashboardData({
                totalBookings: 0,
                totalRevenue: 0,
                rating: 0,
                completedBookings: 0,
                bookingIncrease: 0,
                revenueIncrease: 0
            })
            setUpcomingBookings([])
        } finally {
            setIsLoadingData(false)
        }
    }

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'Duration TBD'

        try {
            const [startHour, startMin] = startTime.split(':').map(Number)
            const [endHour, endMin] = endTime.split(':').map(Number)

            const startMinutes = startHour * 60 + startMin
            const endMinutes = endHour * 60 + endMin
            const durationMinutes = endMinutes - startMinutes

            if (durationMinutes <= 0) return 'Duration TBD'

            const hours = Math.floor(durationMinutes / 60)
            const minutes = durationMinutes % 60

            if (hours === 0) return `${minutes} minutes`
            if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
            return `${hours}h ${minutes}m`
        } catch {
            return 'Duration TBD'
        }
    }

    const fetchUpcomingSessions = async () => {
        if (!user?.user?._id) return

        setIsLoadingSessions(true)
        try {
            const res = await getInstructorSessions(user.user._id)
            if (res.status === 200 && res.data) {
                const sessions = res.data
                const now = new Date()

                const upcomingCount = sessions.filter(session => {
                    const sessionStart = new Date(session.startTime)
                    return sessionStart > now
                }).length

                setUpcomingSessionsCount(upcomingCount)
            }
        } catch (error) {
            console.error("Error fetching sessions:", error)
            setUpcomingSessionsCount(0)
        } finally {
            setIsLoadingSessions(false)
        }
    }

    const fetchInstructorAchievements = async () => {
        if (!user?.user?._id) return;

        setAchievementsLoading(true);
        try {
            // First try to evaluate achievements to ensure they're up to date
            await evaluateMyInstructorAchievements();

            // Then fetch the current achievements
            const res = await getInstructorAchievements();
            setInstructorAchievements(res?.data);
        } catch (error) {
            console.error('Failed to fetch instructor achievements:', error);
            // Don't show error toast as this is not critical for dashboard function
        } finally {
            setAchievementsLoading(false);
        }
    };

    const fetchOtherInstructorsSessions = async () => {
        if (!user?.user?._id) return

        try {
            const now = new Date()
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const endOfNextTwoMonths = new Date(now.getFullYear(), now.getMonth() + 3, 0)

            const res = await getAllOtherInstructorsSessions(
                user.user._id,
                startOfToday.toISOString(),
                endOfNextTwoMonths.toISOString()
            )

            if (res.status === 200 && res.data?.success) {
                const sessions = res.data.data || []
                setOtherInstructorsSessions(sessions)
                setOtherSessionsCount(sessions.length)
            }
        } catch (error) {
            console.error("Error fetching other instructors sessions:", error)
            setOtherInstructorsSessions([])
            setOtherSessionsCount(0)
        }
    }


    useEffect(() => {
        if (!user.user) {
            toast.error("Please login to access the instructor dashboard")
            navigate("/login")
            return
        }

        const adventureId = user?.user?.instructor?.adventure?._id || user?.user?.instructor?.adventure

        if (adventureId) {
            getAdventure(adventureId).then((res) => {
                if (res?.data) {
                    setAdventureTypes(res.data)
                }
            }).catch((err) => {
                console.error("Failed to load adventure data:", err)
            })
        }

        fetchDashboardData()
        fetchUpcomingSessions()
        fetchInstructorAchievements()
        fetchOtherInstructorsSessions()
    }, [user, navigate])

    return (
        <InstructorLayout onOpenChat={() => setChatOpen(true)}>
            <div className="min-h-screen">
                <div className="bg-neutral-900 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                                    {t("instructor.dashboard")}
                                </h1>
                                <p className="text-sm text-neutral-400 mt-1">
                                    {t("instructor.welcomeMessage")}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-neutral-400 font-medium">Level</p>
                                    <p className="text-xl font-semibold text-white">{instructorAchievements?.level || 0}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                                    <p className="text-xs text-neutral-400 font-medium">XP</p>
                                    <p className="text-xl font-semibold text-white">{instructorAchievements?.totalExperiencePoints || 0}</p>
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
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            {t("instructor.totalBookings")}
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Total number of bookings received across all your adventures and sessions." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {isLoadingData ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                        ) : (
                                            dashboardData.totalBookings
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ${dashboardData.bookingIncrease > 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
                                            {dashboardData.bookingIncrease > 0 ? (
                                                <TrendingUp className="h-4 w-4" />
                                            ) : (
                                                <TrendingUp className="h-4 w-4 transform rotate-180" />
                                            )}
                                            {Math.abs(dashboardData.bookingIncrease)}%
                                        </span>
                                        <span className="text-slate-500">vs last {timeRange}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeIn}>
                            <Card className="h-full border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            {t("instructor.upcomingSessions")}
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Number of sessions scheduled for the upcoming week." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6 relative">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {isLoadingSessions ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                        ) : (
                                            upcomingSessionsCount
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 rounded-md font-medium text-purple-700 bg-purple-50">
                                            {t("instructor.scheduled")}
                                        </span>
                                        <span className="text-slate-500">{t("instructor.nextWeek")}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeIn}>
                            <Card className="h-full border-neutral-200">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-lg">
                                            <Star className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <CardTitle className="text-sm font-medium text-neutral-600">
                                            {t("instructor.rating")}
                                        </CardTitle>
                                    </div>
                                    <HintTooltip content="Your average rating from completed bookings." />
                                </CardHeader>
                                <CardContent className="px-6 pb-6">
                                    <div className="text-3xl font-semibold text-neutral-900 mb-2">
                                        {isLoadingData ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                                        ) : (
                                            (dashboardData?.rating || 0).toFixed(1)
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.floor(dashboardData.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Calendar Section */}
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <Card className="border-neutral-200">
                            <CardHeader className="border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-neutral-700" />
                                    <h3 className="text-lg font-semibold text-neutral-900">Session Calendar</h3>
                                    <HintTooltip content="View and manage your sessions. Click on a date to create a new session. You can set the time, duration, max participants, and pricing. Sessions appear on your calendar and are available for users to book." />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <SessionCalendar
                                    adventureTypes={adventureTypes}
                                    otherInstructorsSessions={otherInstructorsSessions}
                                    otherSessionsCount={otherSessionsCount}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Upcoming Bookings Section */}
                    <motion.div
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <Card className="border-neutral-200">
                            <CardHeader className="border-b border-neutral-200">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-neutral-700" />
                                    <h3 className="text-lg font-semibold text-neutral-900">Upcoming Bookings</h3>
                                    <HintTooltip content="List of confirmed bookings from users for your upcoming sessions. You can view participant details and manage bookings." />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <UpcomingBookingsCard
                                    bookings={upcomingBookings}
                                    onViewAll={() => navigate("/instructor/bookings")}
                                    isLoading={isLoadingData}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    <Card className="border-neutral-200">
                        <CardHeader className="border-b border-neutral-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-neutral-700" />
                                    <h3 className="text-lg font-semibold text-neutral-900">{t("Achievements")}</h3>
                                    <HintTooltip content="Your instructor achievements, badges, and performance metrics. Earn achievements by maintaining high ratings, receiving bookings, and growing your experience on the platform." />
                                </div>
                                {achievementsLoading && <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />}
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {instructorAchievements ? (
                                <div className="space-y-6">
                                    {/* Achievement Summary Cards */}
                                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-900">
                                                    {instructorAchievements.level || 0}
                                                </div>
                                                <div className="text-sm text-blue-700 font-medium mt-1 flex items-center justify-center gap-1">
                                                    Level
                                                    <HintTooltip content="Your instructor level based on achievements and experience." />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-900">
                                                    {instructorAchievements.achievements?.length || 0}
                                                </div>
                                                <div className="text-sm text-purple-700 font-medium mt-1 flex items-center justify-center gap-1">
                                                    Achievements
                                                    <HintTooltip content="Total number of achievement badges you have earned." />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-amber-900">
                                                    {instructorAchievements.currentRating?.toFixed(1) || "0.0"}
                                                </div>
                                                <div className="text-sm text-amber-700 font-medium mt-1 flex items-center justify-center gap-1">
                                                    Rating
                                                    <HintTooltip content="Your average rating from completed bookings (0-5 scale)." />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-900">
                                                    {instructorAchievements.totalExperiencePoints || 0}
                                                </div>
                                                <div className="text-sm text-green-700 font-medium mt-1 flex items-center justify-center gap-1">
                                                    XP
                                                    <HintTooltip content="Total experience points earned from achievements and milestones." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Earned Achievements */}
                                    {instructorAchievements.achievements && instructorAchievements.achievements.length > 0 ? (
                                        <div>
                                            <h4 className="text-md font-semibold text-slate-900 mb-4">Earned Achievements</h4>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {instructorAchievements.achievements.map((achievement, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:shadow-md transition-all duration-200"
                                                    >

                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900">
                                                                {achievement.name}
                                                            </div>
                                                            <div className="text-sm text-slate-600 mt-1">
                                                                {achievement.description}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-2">
                                                                Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-sm font-medium">
                                                                Lv {achievement.level}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl">
                                            <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600 font-medium">No achievements earned yet</p>
                                            <p className="text-sm text-slate-500 mt-2">Keep instructing to unlock achievements!</p>
                                        </div>
                                    )}

                                    {/* Performance Badges */}
                                    {instructorAchievements.badges && instructorAchievements.badges.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-semibold text-slate-900 mb-4">Performance Badges</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {instructorAchievements.badges.map((badge, index) => (
                                                    <div
                                                        key={index}
                                                        className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${badge.level === 'platinum' ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white' :
                                                            badge.level === 'gold' ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900' :
                                                                badge.level === 'silver' ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900' :
                                                                    'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'
                                                            }`}
                                                    >
                                                        {badge.type} - {badge.level}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Statistics */}
                                    <div className="pt-6 border-t border-slate-200">
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                                        Total Bookings
                                                        <HintTooltip content="Total number of bookings you have received from users." />
                                                    </p>
                                                    <p className="text-xl font-bold text-slate-900">{instructorAchievements.totalBookingsReceived || 0}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-purple-100 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                                        Experience
                                                        <HintTooltip content="Number of months since you joined the platform as an instructor." />
                                                    </p>
                                                    <p className="text-xl font-bold text-slate-900">{instructorAchievements.monthsSinceJoining || 0} months</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-green-100 rounded-lg">
                                                    <Star className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                                        Last Evaluated
                                                        <HintTooltip content="The last time your achievements were evaluated and updated." />
                                                    </p>
                                                    <p className="text-xl font-bold text-slate-900">
                                                        {instructorAchievements.stats?.lastEvaluated
                                                            ? new Date(instructorAchievements.stats.lastEvaluated).toLocaleDateString()
                                                            : 'Never'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-indigo-100 rounded-lg">
                                                    <Euro className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 flex items-center gap-1">
                                                        Platform Fee
                                                        <HintTooltip content="The percentage of booking revenue taken as platform commission. You receive the remaining amount." />
                                                    </p>
                                                    <p className="text-xl font-bold text-slate-900">
                                                        {user?.user?.instructor?.commissionPercentage ?? 20}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : achievementsLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-slate-600" />
                                    <p className="text-slate-600">Loading achievements...</p>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl">
                                    <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium">No achievement data available</p>
                                    <p className="text-sm text-slate-500 mt-2">Complete some bookings to start earning achievements!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
        </InstructorLayout>
    )
}

export default InstructorDashboard
