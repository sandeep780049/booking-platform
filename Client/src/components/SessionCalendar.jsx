"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { useTranslation } from "react-i18next"
import { useAuth } from "../Pages/AuthProvider"
import { createPreset, getInstructorSessions, deleteSession, createSession } from "../Api/session.api"
import { toast } from "sonner"
import HintTooltip from "./HintTooltip"

// Constants
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const PRICING_UNITS = [
    { value: "perHour", label: "Per Hour" },
    { value: "perPerson", label: "Per Person" },
    { value: "perGroup", label: "Per Group" },
    { value: "perDay", label: "Per Day" },
]

const DEFAULT_FORM_STATE = {
    location: "",
    time: "09:00",
    capacity: "8",
    notes: "",
    price: "",
    unit: "perPerson"
}

// Custom hooks
const useFormState = (initialState) => {
    const [formState, setFormState] = useState(initialState)

    const updateField = useCallback((name, value) => {
        setFormState(prev => ({ ...prev, [name]: value }))
    }, [])

    const resetForm = useCallback(() => {
        setFormState(initialState)
    }, [initialState])

    return [formState, updateField, resetForm, setFormState]
}

const useSessions = (instructorId) => {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchSessions = useCallback(async () => {
        if (!instructorId) return

        setLoading(true)
        try {
            const res = await getInstructorSessions(instructorId)
            if (res.status === 200) {
                setSessions(res.data)
            } else {
                toast.error("Failed to fetch sessions")
            }
        } catch (error) {
            console.error("Error fetching sessions:", error)
            toast.error("Error loading sessions")
        } finally {
            setLoading(false)
        }
    }, [instructorId])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return { sessions, loading, refetch: fetchSessions }
}

const useCalendar = (currentDate) => {
    return useMemo(() => {
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

        return { currentMonth, currentYear, daysInMonth, firstDayOfMonth }
    }, [currentDate])
}

// Utility functions
const formatTime = (timeStr) => {
    if (!timeStr) return "09:00"
    return timeStr.length === 5 ? timeStr : timeStr.slice(0, 5)
}

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString)
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        })
    } catch {
        return dateString
    }
}

const createSessionDateTime = (selectedDate, time) => {
    const [hour, minute] = time.split(":")
    const startTime = new Date(selectedDate)
    startTime.setHours(+hour, +minute, 0, 0)

    const expiresAt = new Date(startTime)
    expiresAt.setHours(expiresAt.getHours() + 2) // Default 2 hour session

    return { startTime, expiresAt }
}

// Reusable components
const FormField = ({ label, children, required = false }) => (
    <div className="grid gap-2">
        <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
        {children}
    </div>
)

const PricingFields = ({ price, unit, onPriceChange, onUnitChange }) => (
    <div className="grid grid-cols-2 gap-4">
        <FormField label="Price" required>
            <Input
                type="number"
                value={price}
                onChange={e => onPriceChange(e.target.value)}
                placeholder="Enter price"
            />
        </FormField>
        <FormField label="Unit" required>
            <Select value={unit} onValueChange={onUnitChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    {PRICING_UNITS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FormField>
    </div>
)

const CalendarDay = ({ day, isToday, isPastDay, hasSession, sessionCount, onClick, trafficLevel, trafficCount }) => {
    let trafficGradient = ""
    let trafficText = ""

    if (!isPastDay) {
        if (trafficCount <= 2) {
            trafficGradient = "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-slate-800 dark:text-slate-200"
            trafficText = trafficCount === 0 ? "No Traffic" : "Low Traffic"
        } else if (trafficCount <= 5) {
            trafficGradient = "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 text-slate-800 dark:text-slate-200"
            trafficText = "Medium Traffic"
        } else {
            trafficGradient = "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 text-slate-800 dark:text-slate-200"
            trafficText = "High Traffic"
        }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`h-12 sm:h-16 lg:h-20 border rounded-lg relative cursor-pointer transition-all duration-200 overflow-hidden group
            ${isToday ? "border-gray-900 shadow-md ring-1 ring-gray-900" : "border-gray-100 hover:border-gray-300 hover:shadow-md"}
            ${trafficGradient ? trafficGradient : (hasSession ? "bg-gray-50 dark:bg-gray-900" : "")}
        `}
            onClick={onClick}
        >
            <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                {!isPastDay ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                {isToday ? (
                                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-semibold text-xs shadow-sm cursor-help">
                                        {day}
                                    </div>
                                ) : (
                                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm cursor-help hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                        {day}
                                    </div>
                                )}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm">{trafficText}: {trafficCount} session{trafficCount !== 1 ? 's' : ''}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    isToday ? (
                        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-semibold text-xs shadow-sm">
                            {day}
                        </div>
                    ) : (
                        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center font-medium text-slate-400 dark:text-slate-500 text-xs sm:text-sm">{day}</div>
                    )
                )}
            </div>

            {hasSession ? (
                <div className="absolute bottom-1 left-1 right-1">
                    <Badge className="bg-gray-900 hover:bg-gray-800 text-xs px-1 py-0.5 shadow-sm w-full justify-center">
                        <span className="hidden sm:inline">{sessionCount} {sessionCount === 1 ? "Session" : "Sessions"}</span>
                        <span className="sm:hidden">{sessionCount}</span>
                    </Badge>
                </div>
            ) : (
                <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="outline" className="border-dashed border-gray-400 text-black text-xs px-1 py-0.5">
                        <Plus className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden sm:inline">Add</span>
                    </Badge>
                </div>
            )}
        </motion.div>
    )
}

const SessionCalendar = ({ adventureTypes, otherInstructorsSessions = [], otherSessionsCount = 0 }) => {
    const { t } = useTranslation()
    const { user } = useAuth()

    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [presetDialog, setPresetDialog] = useState(false)
    const [sessionDetailDialog, setSessionDetailDialog] = useState(false)
    const [selectedSession, setSelectedSession] = useState(null)

    const instructorId = user?.user?._id
    const instructorAdventure = user?.user?.instructor?.adventure
    const instructorAdventureId = typeof instructorAdventure === 'object' ? instructorAdventure?._id : instructorAdventure
    const instructorAdventureName = typeof instructorAdventure === 'object' ? instructorAdventure?.name : null

    const instructorLocation = user?.user?.instructor?.location
    const instructorLocationId = typeof instructorLocation === 'object' ? instructorLocation?._id : instructorLocation
    const instructorLocationName = typeof instructorLocation === 'object' ? instructorLocation?.name : null

    const { sessions, refetch: refetchSessions } = useSessions(instructorId)
    const { currentMonth, currentYear, daysInMonth, firstDayOfMonth } = useCalendar(currentDate)

    const [sessionForm, updateSessionForm, resetSessionForm, setSessionForm] = useFormState({
        ...DEFAULT_FORM_STATE,
        adventureId: instructorAdventureId || "",
        location: instructorLocationId || "",
    })

    const [presetForm, updatePresetForm, resetPresetForm, setPresetForm] = useFormState({
        ...DEFAULT_FORM_STATE,
        adventureId: instructorAdventureId || "",
        location: instructorLocationId || "",
        days: []
    })

    const parsedAdventure = adventureTypes?.data || adventureTypes?.adventure || adventureTypes || {}
    const parsedAdventureId = parsedAdventure?._id || instructorAdventureId || ""
    const parsedAdventureName = parsedAdventure?.title || parsedAdventure?.name || instructorAdventureName || "Selected Adventure"

    const filteredLocations = useMemo(() => {
        const locations = parsedAdventure?.location || parsedAdventure?.locations
        if (!locations) return []
        return Array.isArray(locations) ? locations : [locations]
    }, [parsedAdventure])

    // Form validation
    const isSessionFormValid = useMemo(() => {
        const { adventureId, location, time, capacity, price, unit } = sessionForm
        return (
            adventureId && adventureId !== "default" &&
            location && location !== "default" &&
            time &&
            capacity && parseInt(capacity) > 0 &&
            price && parseFloat(price) > 0 &&
            unit
        )
    }, [sessionForm])

    const isPresetFormValid = useMemo(() => {
        const { adventureId, location, days, time, capacity, price, unit } = presetForm
        return (
            adventureId && adventureId !== "default" &&
            location && location !== "default" &&
            Array.isArray(days) && days.length > 0 &&
            time &&
            capacity && parseInt(capacity) > 0 &&
            price && parseFloat(price) > 0 &&
            unit
        )
    }, [presetForm])

    // Session date helpers
    const getSessionsForDate = useCallback((day) => {
        return sessions.filter((session) => {
            const sessionDate = new Date(session.startTime)
            return (
                sessionDate.getDate() === day &&
                sessionDate.getMonth() === currentMonth &&
                sessionDate.getFullYear() === currentYear
            )
        })
    }, [sessions, currentMonth, currentYear])

    const hasSessionsOnDate = useCallback((day) => {
        return getSessionsForDate(day).length > 0
    }, [getSessionsForDate])

    const getSessionCount = useCallback((day) => {
        return getSessionsForDate(day).length
    }, [getSessionsForDate])

    // Traffic helpers
    const getTrafficForDate = useCallback((day) => {
        if (!otherInstructorsSessions) return 0

        const dateToCheck = new Date(currentYear, currentMonth, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateToCheck < today) {
            return 0
        }

        return otherInstructorsSessions.filter(session => {
            const sessionDate = new Date(session.startTime)
            return (
                sessionDate.getDate() === day &&
                sessionDate.getMonth() === currentMonth &&
                sessionDate.getFullYear() === currentYear
            )
        }).length
    }, [otherInstructorsSessions, currentMonth, currentYear])

    // Navigation handlers
    const handlePrevMonth = useCallback(() => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }, [currentYear, currentMonth])

    const handleNextMonth = useCallback(() => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }, [currentYear, currentMonth])

    // Session handlers
    const handleDateClick = useCallback((day) => {
        const clickedDate = new Date(currentYear, currentMonth, day)
        setSelectedDate(clickedDate)

        const sessionsForDate = getSessionsForDate(day)
        if (sessionsForDate.length > 0) {
            setSelectedSession(sessionsForDate[0])
            setSessionDetailDialog(true)
        } else {
            // Ensure form values match available options
            const formAdventureId = parsedAdventureId || "default"
            const formLocationId = filteredLocations.length > 0
                ? (filteredLocations[0]?._id || filteredLocations[0])
                : (instructorLocationId || "default")

            setSessionForm({
                ...DEFAULT_FORM_STATE,
                adventureId: formAdventureId,
                location: formLocationId,
            })
            setIsDialogOpen(true)
        }
    }, [currentYear, currentMonth, getSessionsForDate, parsedAdventureId, instructorLocationId, filteredLocations, setSessionForm])

    const handleCreateSession = useCallback(async () => {
        const { adventureId, location, time, capacity, notes, price, unit } = sessionForm

        if (!instructorId) {
            toast.error("Instructor ID not found")
            return
        }

        if (!adventureId || adventureId === "default") {
            toast.error("Adventure type is required")
            return
        }

        if (!location || location === "default") {
            toast.error("Location is required")
            return
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            toast.error("Valid price is required")
            return
        }

        if (!unit) {
            toast.error("Pricing unit is required")
            return
        }

        if (!capacity || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
            toast.error("Valid capacity is required")
            return
        }

        if (!time) {
            toast.error("Start time is required")
            return
        }

        if (!selectedDate) {
            toast.error("No date selected")
            return
        }

        const { startTime, expiresAt } = createSessionDateTime(selectedDate, time)

        const payload = {
            adventureId,
            location,
            instructorId,
            days: [DAY_NAMES[startTime.getDay()]],
            startTime: startTime.toISOString(),
            expiresAt: expiresAt.toISOString(),
            capacity: parseInt(capacity),
            price: parseFloat(price),
            unit,
            notes: notes || "",
            status: "active",
        }

        try {
            const res = await createSession(payload)
            if (res?.data?.success || res?.status === 200 || res?.status === 201) {
                toast.success("Session created successfully")
                setIsDialogOpen(false)
                refetchSessions()
            } else {
                toast.error(res?.data?.message || "Error creating session")
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create session"
            toast.error(errorMessage)
        }
    }, [sessionForm, selectedDate, instructorId, refetchSessions])

    const handleCreatePreset = useCallback(async () => {
        const { adventureId, location, days, capacity, time, notes, price, unit } = presetForm

        if (!instructorId) {
            toast.error("Instructor ID not found")
            return
        }

        if (!adventureId || adventureId === "default") {
            toast.error("Adventure type is required")
            return
        }

        if (!location || location === "default") {
            toast.error("Location is required")
            return
        }

        if (!Array.isArray(days) || days.length === 0) {
            toast.error("Please select at least one day")
            return
        }

        if (!capacity || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
            toast.error("Valid capacity is required")
            return
        }

        if (!time) {
            toast.error("Start time is required")
            return
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            toast.error("Valid price is required")
            return
        }

        if (!unit) {
            toast.error("Pricing unit is required")
            return
        }

        const toastId = toast.loading("Creating preset...")

        const payload = {
            location,
            days,
            capacity: parseInt(capacity),
            startTime: formatTime(time),
            notes: notes || "",
            instructorId,
            adventureId,
            price: parseFloat(price),
            unit,
        }

        try {
            const res = await createPreset(payload)
            if (res?.data?.success || res?.status === 200 || res?.status === 201) {
                toast.success("Preset created successfully", { id: toastId })
                refetchSessions()
                setPresetDialog(false)
                setPresetForm({
                    ...DEFAULT_FORM_STATE,
                    adventureId: instructorAdventureId || "",
                    location: instructorLocationId || "",
                    days: []
                })
            } else {
                toast.error(res?.data?.message || "Error creating preset", { id: toastId })
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to create preset"
            toast.error(errorMessage, { id: toastId })
        }
    }, [presetForm, instructorId, instructorAdventureId, instructorLocationId, refetchSessions, setPresetForm])

    const handleDeleteSession = useCallback(async () => {
        if (!selectedSession?._id) {
            toast.error("No session selected")
            return
        }

        const toastId = toast.loading("Deleting session...")

        try {
            const res = await deleteSession(selectedSession._id)
            if (res?.data?.success || res?.status === 200) {
                toast.success("Session deleted successfully", { id: toastId })
                refetchSessions()
                setSessionDetailDialog(false)
                setSelectedSession(null)
            } else {
                toast.error(res?.data?.message || "Error deleting session", { id: toastId })
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete session"
            toast.error(errorMessage, { id: toastId })
        }
    }, [selectedSession, refetchSessions])

    const handleOpenPresetDialog = useCallback(() => {
        const formAdventureId = parsedAdventureId || "default"
        const formLocationId = filteredLocations.length > 0
            ? (filteredLocations[0]?._id || filteredLocations[0])
            : (instructorLocationId || "default")

        setPresetForm({
            ...DEFAULT_FORM_STATE,
            adventureId: formAdventureId,
            location: formLocationId,
            days: []
        })
        setPresetDialog(true)
    }, [parsedAdventureId, instructorLocationId, filteredLocations, setPresetForm])

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days = []

        // Empty cells for days before month starts
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 lg:h-24 border border-transparent" />)
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateToCheck = new Date(currentYear, currentMonth, day)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const isPastDay = dateToCheck < today

            const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear()

            const hasSession = hasSessionsOnDate(day)
            const sessionCount = getSessionCount(day)
            const trafficCount = getTrafficForDate(day)

            days.push(
                <CalendarDay
                    key={day}
                    day={day}
                    isToday={isToday}
                    isPastDay={isPastDay}
                    hasSession={hasSession}
                    sessionCount={sessionCount}
                    trafficCount={trafficCount}
                    onClick={() => handleDateClick(day)}
                />
            )
        }

        return days
    }, [daysInMonth, firstDayOfMonth, currentMonth, currentYear, hasSessionsOnDate, getSessionCount, handleDateClick])

    return (
        <Card className="col-span-full lg:col-span-7">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg sm:text-xl">{t("instructor.sessionCalendar")}</CardTitle>
                        <HintTooltip content="Manage your availability, view scheduled sessions, and create new ones." />
                    </div>
                    <CardDescription className="text-sm">{t("instructor.manageYourSessions")}</CardDescription>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-gray-50">
                            <Users className="h-3 w-3 mr-1" />
                            {otherSessionsCount} {otherSessionsCount === 1 ? 'session' : 'sessions'} by other instructors this month
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                            <span className="flex items-center"><div className="w-3 h-3 rounded bg-gradient-to-br from-green-100 to-green-200 border border-green-300 mr-1"></div>Low</span>
                            <span className="flex items-center"><div className="w-3 h-3 rounded bg-gradient-to-br from-yellow-100 to-yellow-200 border border-yellow-300 mr-1"></div>Med</span>
                            <span className="flex items-center"><div className="w-3 h-3 rounded bg-gradient-to-br from-red-100 to-red-200 border border-red-300 mr-1"></div>High</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Button variant="outline" size="sm" onClick={handleOpenPresetDialog} className="flex-shrink-0">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline ml-1">Preset</span>
                    </Button>
                    <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <div className="font-medium text-sm sm:text-base px-2 whitespace-nowrap">
                            <span className="hidden sm:inline">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                            <span className="sm:hidden">{MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleNextMonth}>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-4 lg:p-6">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
                    {DAY_NAMES.map((day) => (
                        <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.slice(0, 1)}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">{calendarDays}</div>

                {/* Create Session Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl">
                                {selectedDate ? `Schedule Session for ${selectedDate.toLocaleDateString()}` : "Schedule Session"}
                            </DialogTitle>
                            <DialogDescription className="text-sm">Create a new session for this date. Fill in the details below.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:gap-4 py-4 px-1">
                            <FormField label="Adventure Type" required>
                                <Select value={sessionForm.adventureId} onValueChange={(value) => updateSessionForm("adventureId", value)}>
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select adventure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parsedAdventureId ? (
                                            <SelectItem value={parsedAdventureId}>
                                                {parsedAdventureName}
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="default" disabled>No Adventure Assigned</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Location" required>
                                <Select
                                    value={sessionForm.location}
                                    onValueChange={(value) => updateSessionForm("location", value)}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredLocations.length > 0 ? (
                                            filteredLocations.map((loc) => (
                                                <SelectItem key={loc?._id || loc} value={loc?._id || loc}>
                                                    {loc?.name || loc?.title || instructorLocationName || "Location"}
                                                </SelectItem>
                                            ))
                                        ) : instructorLocationId ? (
                                            <SelectItem value={instructorLocationId}>
                                                {instructorLocationName || "Location"}
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="default" disabled>No Location Assigned</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <FormField label="Start Time" required>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            value={sessionForm.time}
                                            onChange={(e) => updateSessionForm("time", e.target.value)}
                                            className="pl-9 text-sm"
                                        />
                                    </div>
                                </FormField>

                                <FormField label="Capacity" required>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={sessionForm.capacity}
                                            onChange={(e) => updateSessionForm("capacity", e.target.value)}
                                            className="pl-9 text-sm"
                                        />
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <FormField label="Price" required>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={sessionForm.price}
                                        onChange={e => updateSessionForm("price", e.target.value)}
                                        placeholder="Enter price"
                                        className="text-sm"
                                    />
                                </FormField>
                                <FormField label="Unit" required>
                                    <Select value={sessionForm.unit} onValueChange={(value) => updateSessionForm("unit", value)}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRICING_UNITS.map(({ value, label }) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            <FormField label="Notes (Optional)">
                                <Textarea
                                    value={sessionForm.notes}
                                    onChange={(e) => updateSessionForm("notes", e.target.value)}
                                    placeholder="Add any additional information"
                                    rows={3}
                                    className="text-sm resize-none"
                                />
                            </FormField>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateSession}
                                disabled={!isSessionFormValid}
                                className="w-full sm:w-auto"
                            >
                                Create Session
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Session Details Dialog */}
                <Dialog open={sessionDetailDialog} onOpenChange={setSessionDetailDialog}>
                    <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl">Session Details</DialogTitle>
                            <DialogDescription className="text-sm">
                                Session on {selectedSession ? formatDate(selectedSession.startTime) : ""}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSession && (
                            <div className="grid gap-3 sm:gap-4 py-4 px-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Status</h3>
                                        <Badge variant={selectedSession.status === "active" ? "default" : "secondary"} className="text-xs">
                                            {selectedSession.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Capacity</h3>
                                        <p className="flex items-center text-sm">
                                            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="text-xs sm:text-sm">{selectedSession.capacity || 0} participants</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Start Time</h3>
                                        <p className="flex items-center text-sm">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="text-xs sm:text-sm">{formatDate(selectedSession.startTime)}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Location</h3>
                                        <p className="flex items-center text-sm">
                                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="text-xs sm:text-sm truncate">
                                                {selectedSession.location?.name ||
                                                    filteredLocations?.find(loc => loc._id === selectedSession.location)?.name ||
                                                    selectedSession.location ||
                                                    "N/A"}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {(selectedSession.price || selectedSession.unit) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Price</h3>
                                            <p className="text-xs sm:text-sm">€{selectedSession.price || 0}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Unit</h3>
                                            <p className="text-xs sm:text-sm">
                                                {PRICING_UNITS.find(u => u.value === selectedSession.unit)?.label || selectedSession.unit || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedSession.notes && (
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Notes</h3>
                                        <p className="text-xs sm:text-sm mt-1 break-words">{selectedSession.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="outline" onClick={() => setSessionDetailDialog(false)} className="w-full sm:w-auto">
                                Close
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSession} className="w-full sm:w-auto">
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Preset Dialog */}
                <Dialog open={presetDialog} onOpenChange={setPresetDialog}>
                    <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg sm:text-xl">Session Preset</DialogTitle>
                            <DialogDescription className="text-sm">
                                Create a preset for your sessions. Sessions will be created automatically with the same settings.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:gap-4 py-4 px-1">
                            <FormField label="Adventure Type" required>
                                <Select
                                    value={presetForm.adventureId}
                                    onValueChange={(value) => updatePresetForm("adventureId", value)}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select adventure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parsedAdventureId ? (
                                            <SelectItem value={parsedAdventureId}>
                                                {parsedAdventureName}
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="default" disabled>No Adventure Assigned</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Location" required>
                                <Select
                                    value={presetForm.location}
                                    onValueChange={(value) => updatePresetForm("location", value)}
                                >
                                    <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredLocations.length > 0 ? (
                                            filteredLocations.map((loc) => (
                                                <SelectItem key={loc?._id || loc} value={loc?._id || loc}>
                                                    {loc?.name || loc?.title || instructorLocationName || "Location"}
                                                </SelectItem>
                                            ))
                                        ) : instructorLocationId ? (
                                            <SelectItem value={instructorLocationId}>
                                                {instructorLocationName || "Location"}
                                            </SelectItem>
                                        ) : (
                                            <SelectItem value="default" disabled>No Location Assigned</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Days" required>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {DAY_NAMES.map((day, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`day-${index}`}
                                                checked={presetForm.days.includes(day)}
                                                onChange={(e) => {
                                                    const newDays = e.target.checked
                                                        ? [...presetForm.days, day]
                                                        : presetForm.days.filter(d => d !== day)
                                                    updatePresetForm("days", newDays)
                                                }}
                                                className="checkbox"
                                            />
                                            <label htmlFor={`day-${index}`} className="text-xs sm:text-sm cursor-pointer">
                                                <span className="hidden sm:inline">{day}</span>
                                                <span className="sm:hidden">{day.slice(0, 1)}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </FormField>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <FormField label="Start Time" required>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            value={presetForm.time}
                                            onChange={(e) => updatePresetForm("time", e.target.value)}
                                            className="pl-9 text-sm"
                                        />
                                    </div>
                                </FormField>

                                <FormField label="Capacity" required>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={presetForm.capacity}
                                            onChange={(e) => updatePresetForm("capacity", e.target.value)}
                                            className="pl-9 text-sm"
                                        />
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <FormField label="Price" required>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={presetForm.price}
                                        onChange={e => updatePresetForm("price", e.target.value)}
                                        placeholder="Enter price"
                                        className="text-sm"
                                    />
                                </FormField>
                                <FormField label="Unit" required>
                                    <Select value={presetForm.unit} onValueChange={(value) => updatePresetForm("unit", value)}>
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRICING_UNITS.map(({ value, label }) => (
                                                <SelectItem key={value} value={value}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            <FormField label="Notes (Optional)">
                                <Textarea
                                    value={presetForm.notes}
                                    onChange={(e) => updatePresetForm("notes", e.target.value)}
                                    placeholder="Add any additional information"
                                    rows={3}
                                    className="text-sm resize-none"
                                />
                            </FormField>
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button variant="outline" onClick={() => setPresetDialog(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreatePreset}
                                disabled={!isPresetFormValid}
                                className="w-full sm:w-auto"
                            >
                                Create Preset
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default SessionCalendar
