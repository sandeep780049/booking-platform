import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Clock, MapPin, Search, Users, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Skeleton } from "../../components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { useTranslation } from 'react-i18next'
import InstructorLayout from './InstructorLayout'
import { fadeIn, staggerContainer } from '../../assets/Animations'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider'
import { getInstructorSessionsWithBookings } from '../../Api/session.api'
import { getSessionBookingsBySessionId } from '../../Api/booking.api'

// Loading skeleton component
const SessionSkeleton = () => (
    <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="flex flex-col space-y-2 lg:items-end">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-3">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

// Sessions list component
const SessionsList = ({ sessions, isLoading, searchTerm, t, formatDate, formatTime, isCompleted = false, onSessionClick }) => {
    return (
        <motion.div className="space-y-4 sm:space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
            {isLoading ? (
                // Show skeleton loading state
                Array.from({ length: 3 }).map((_, index) => (
                    <SessionSkeleton key={index} />
                ))
            ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm
                            ? `No ${isCompleted ? 'completed' : 'upcoming'} sessions match your search`
                            : `No ${isCompleted ? 'completed' : 'upcoming'} sessions found`
                        }
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? "Try adjusting your search terms."
                            : isCompleted
                                ? "Your completed sessions will appear here."
                                : "Create your first session to get started."
                        }
                    </p>
                </div>
            ) : (
                sessions.map((session) => (<motion.div key={session._id || session.id} variants={fadeIn}>
                    <Card
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => onSessionClick && onSessionClick(session)}
                    >
                        <CardHeader className="p-4 sm:p-6">
                            <div className="flex flex-col space-y-3 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
                                        {session.title}
                                    </CardTitle>
                                    <CardDescription className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                        <div className="flex items-center text-sm sm:text-base">
                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                                            <span className="truncate">{session.location}</span>
                                        </div>
                                        <span className="hidden sm:inline text-muted-foreground">•</span>
                                        <div className="flex items-center text-sm sm:text-base">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                                            <span>{session.duration}</span>
                                        </div>
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:flex-col lg:items-end lg:space-x-0 lg:space-y-2">
                                    <Badge
                                        variant="outline"
                                        className={`w-fit text-xs sm:text-sm px-2 py-1 ${isCompleted ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                    >
                                        {session.adventure}
                                    </Badge>
                                    <div className="font-semibold text-lg sm:text-xl lg:text-2xl text-primary">
                                        ${session.price}
                                        {session.priceType === "perPerson" && <span className="text-sm font-normal text-muted-foreground">/person</span>}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                                {session.description}
                            </p>

                            <div className="space-y-3 sm:space-y-4">
                                <h4 className="font-medium text-sm sm:text-base lg:text-lg">
                                    {isCompleted ? "Session Details" : t("instructor.upcomingDates")}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                                    {session.upcoming.map((date, index) => {
                                        const seatsLeft = session.capacity - date.booked;
                                        return (
                                            <div
                                                key={index}
                                                className={`border rounded-lg p-3 sm:p-4 bg-card transition-colors ${isCompleted ? 'opacity-75' : 'hover:bg-accent/50'}`}
                                            >
                                                <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-3">
                                                    <div className="font-medium text-sm sm:text-base">
                                                        {formatDate(date.date)}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                                                        {date.time}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                                    <div className="text-xs sm:text-sm">
                                                        <span className={`font-semibold ${seatsLeft > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {seatsLeft}
                                                        </span>
                                                        <span className="text-muted-foreground"> seats left</span>
                                                    </div>
                                                    <Badge
                                                        variant={seatsLeft > 0 ? "outline" : "secondary"}
                                                        className="w-fit text-xs px-2 py-1"
                                                    >
                                                        {seatsLeft > 0
                                                            ? `${seatsLeft} available`
                                                            : "Full"}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Status: <span className={`font-medium ${isCompleted ? 'text-gray-600' : session.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                                        {isCompleted ? 'completed' : session.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:justify-end lg:space-y-0 lg:space-x-3 p-4 sm:p-6 bg-gray-50/50">
                            {!isCompleted && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-9 sm:h-10 text-sm px-4 hover:bg-accent"
                                        onClick={() => onSessionClick(session)}
                                    >
                                        <span className="hidden sm:inline">{t("instructor.editSession")}</span>
                                        <span className="sm:hidden">Edit</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-9 sm:h-10 text-sm px-4 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                        <span className="hidden sm:inline">{t("instructor.cancelSession")}</span>
                                        <span className="sm:hidden">Cancel</span>
                                    </Button>
                                    <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm px-4">
                                        <span className="hidden sm:inline">{t("instructor.addDates")}</span>
                                        <span className="sm:hidden">Add Dates</span>
                                    </Button>
                                </>
                            )}
                            {isCompleted && (
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto h-9 sm:h-10 text-sm px-4 hover:bg-accent"
                                >
                                    <span className="hidden sm:inline">View Details</span>
                                    <span className="sm:hidden">Details</span>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>
                ))
            )}
        </motion.div>
    );
};

export const InstructorSession = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("upcoming");
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionBookings, setSessionBookings] = useState([]);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // Helper function to format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function to format time for display
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper function to format duration from start time and assumed duration
    const formatDuration = (startTime, endTime = null) => {
        if (endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const diffMs = end - start;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffHours}h ${diffMinutes}m`;
        }
        // Default duration if not provided
        return "Duration not specified";
    };

    const fetchInstructorSessions = async () => {
        setIsLoading(true);
        try {
            const res = await getInstructorSessionsWithBookings({
                page: 1,
                limit: 100, // Get all sessions for now
                sortBy: 'startTime',
                sortOrder: 'asc'
            });

            const sessionsData = res.data?.data?.sessions || [];

            // Transform the sessions to match the expected structure
            const transformedSessions = sessionsData.map(session => {

                return {
                    ...session,
                    _id: session._id,
                    title: session.adventureId?.name || 'Unknown Adventure',
                    adventure: session.adventureId?.name || 'Unknown Adventure',
                    location: session.location?.name || 'Unknown Location',
                    duration: formatDuration(session.startTime, session.expiresAt),
                    description: session.adventureId?.description || 'No description available',
                    price: session.price ?? 0,
                    priceType: session.priceType || "perPerson",
                    startTime: session.startTime,
                    expiresAt: session.expiresAt,
                    capacity: session.capacity,
                    bookedSeats: session.bookedSeats || 0,
                    availableSeats: session.availableSeats || session.capacity,
                    status: session.status,
                    computedStatus: session.computedStatus,
                    upcoming: [{
                        date: session.startTime,
                        time: formatTime(session.startTime),
                        booked: session.bookedSeats || 0,
                        available: session.availableSeats || session.capacity
                    }]
                };
            });

            setSessions(transformedSessions);
        } catch (error) {
            console.error("Error fetching instructor sessions:", error);

            // Show user-friendly error message
            if (error.response?.status === 404) {
                console.warn("No sessions found for instructor");
                setSessions([]);
            } else if (error.response?.status === 401) {
                console.error("Authentication failed - redirecting to login");
                // Could redirect to login here
                setSessions([]);
            } else {
                console.error("Failed to fetch sessions:", error.message);
                setSessions([]);
            }
        } finally {
            setIsLoading(false);
        }
    }    // Filter sessions based on search term and tab
    const filteredSessions = sessions.filter(session => {
        const title = session.title || '';
        const adventure = session.adventure || '';
        const location = session.location || '';

        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            adventure.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Separate sessions into upcoming and completed based on session date
    const currentDate = new Date();
    const upcomingSessions = filteredSessions.filter(session => {
        try {
            const sessionDate = new Date(session.startTime);
            // Check if date is valid
            if (isNaN(sessionDate.getTime())) {
                console.warn('Invalid session date:', session.startTime);
                return false;
            }
            return sessionDate >= currentDate;
        } catch (error) {
            console.error('Error filtering upcoming sessions:', error);
            return false;
        }
    });

    const completedSessions = filteredSessions.filter(session => {
        try {
            const sessionDate = new Date(session.startTime);
            // Check if date is valid
            if (isNaN(sessionDate.getTime())) {
                console.warn('Invalid session date:', session.startTime);
                return false;
            }
            return sessionDate < currentDate;
        } catch (error) {
            console.error('Error filtering completed sessions:', error);
            return false;
        }
    });

    // Fetch bookings for a specific session
    const fetchSessionBookings = async (sessionId) => {
        if (!sessionId) {
            console.error("Session ID is required to fetch bookings");
            setSessionBookings([]);
            return;
        }

        setIsLoadingBookings(true);
        try {
            const res = await getSessionBookingsBySessionId(sessionId);
            setSessionBookings(res.data?.data?.bookings || res.data || []);
        } catch (error) {
            console.error("Error fetching session bookings:", error);

            // Handle different error scenarios
            if (error.response?.status === 404) {
                console.warn("No bookings found for this session");
                setSessionBookings([]);
            } else if (error.response?.status === 401) {
                console.error("Authentication failed when fetching bookings");
                setSessionBookings([]);
            } else {
                console.error("Failed to fetch session bookings:", error.message);
                setSessionBookings([]);
            }
        } finally {
            setIsLoadingBookings(false);
        }
    };

    // Handle session card click
    const handleSessionClick = async (session) => {
        setSelectedSession(session);
        setIsBookingModalOpen(true);
        await fetchSessionBookings(session._id);
    };

    useEffect(() => {
        if (user && user.user && user.user._id) {
            fetchInstructorSessions();
        } else if (user === null) {
            // User is explicitly not logged in
            setSessions([]);
            setIsLoading(false);
        }
        // If user is undefined, we're still loading auth state, so do nothing
    }, [user]);

    // Show loading while auth is being determined
    if (user === undefined) {
        return (
            <InstructorLayout>
                <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
                    <div className="space-y-4 sm:space-y-6">
                        <SessionSkeleton />
                        <SessionSkeleton />
                        <SessionSkeleton />
                    </div>
                </div>
            </InstructorLayout>
        );
    }

    // Show message if user is not logged in
    if (user === null || !user.user || !user.user._id) {
        return (
            <InstructorLayout>
                <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Authentication Required
                        </h3>
                        <p className="text-gray-500">
                            Please log in to view your sessions.
                        </p>
                    </div>
                </div>
            </InstructorLayout>
        );
    }

    return (
        <InstructorLayout>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                            <div className="relative w-full sm:w-64 lg:w-80">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                                <Input
                                    type="search"
                                    placeholder={t("instructor.searchSessions")}
                                    className="w-full pl-8 h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full sm:w-auto h-10 text-sm sm:text-base px-4 sm:px-6"
                            onClick={() => navigate("/instructor/sessions/new")}
                        >
                            <span className="hidden sm:inline">{t("instructor.createNewSession")}</span>
                            <span className="sm:hidden">New Session</span>
                        </Button>
                    </div>                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-md">
                            <TabsTrigger value="upcoming">
                                Upcoming ({upcomingSessions.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed ({completedSessions.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upcoming" className="space-y-4 sm:space-y-6 mt-6">
                            <SessionsList
                                sessions={upcomingSessions}
                                isLoading={isLoading}
                                searchTerm={searchTerm}
                                t={t}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                onSessionClick={handleSessionClick}
                            />
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4 sm:space-y-6 mt-6">
                            <SessionsList
                                sessions={completedSessions}
                                isLoading={isLoading}
                                searchTerm={searchTerm}
                                t={t}
                                formatDate={formatDate}
                                formatTime={formatTime}
                                isCompleted={true}
                                onSessionClick={handleSessionClick}
                            />
                        </TabsContent>
                    </Tabs>

                    {/* Booking Details Modal */}
                    <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Session Bookings - {selectedSession?.title}
                                </DialogTitle>
                                <DialogDescription>
                                    View all users who have booked this session
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Session Info */}
                                {selectedSession && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Date:</span>
                                                <p>{formatDate(selectedSession.startTime)}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Time:</span>
                                                <p>{formatTime(selectedSession.startTime)}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Capacity:</span>
                                                <p>{selectedSession.capacity} seats</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Bookings List */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">
                                        Bookings ({sessionBookings.length})
                                    </h3>

                                    {isLoadingBookings ? (
                                        <div className="space-y-3">
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <Skeleton className="h-4 w-48 mb-2" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : sessionBookings.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-500">No bookings yet for this session</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {sessionBookings.map((booking, index) => (
                                                <div key={booking._id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-lg">
                                                                    {booking.user?.name || 'Unknown User'}
                                                                </span>
                                                                <Badge
                                                                    variant={booking.status === 'confirmed' ? 'default' :
                                                                        booking.status === 'cancelled' ? 'destructive' : 'secondary'}
                                                                    className="text-xs"
                                                                >
                                                                    {booking.status}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-4 w-4" />
                                                                    <span>{booking.user?.email || 'No email'}</span>
                                                                </div>
                                                                {booking.user?.phoneNumber && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="h-4 w-4" />
                                                                        <span>{booking.user.phoneNumber}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Group Members */}
                                                            {booking.groupMember && booking.groupMember.length > 0 && (
                                                                <div className="mt-2">
                                                                    <span className="text-sm font-medium text-gray-700">Group Members:</span>
                                                                    <div className="ml-2 space-y-1">
                                                                        {booking.groupMember.map((member, memberIndex) => (
                                                                            <div key={member._id || memberIndex} className="text-sm text-gray-600">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{member.name}</span>
                                                                                    <span className="text-gray-400">•</span>
                                                                                    <span>{member.email}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-lg font-semibold text-green-600">
                                                                ${booking.amount}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {booking.modeOfPayment || 'card'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Booked: {formatDate(booking.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </InstructorLayout>
    )
}
