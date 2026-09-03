import { useState, useRef, useEffect } from "react"
import { Search, Plus, Calendar, MapPin, Clock, Eye, Edit, Trash2, Star, Compass, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Badge } from "../../../components/ui/badge"
import { Checkbox } from "../../../components/ui/checkbox"
import { toast } from "sonner"
import { useEvents } from "../../../hooks/useEvent"
import { createEvent, updateEvent, deleteEvent } from "../../../Api/event.api"
import { useAdventures } from "../../../hooks/useAdventure"
import MediaPreview from "../../../components/MediaPreview"
import MapLocationPicker from "../../../components/MapLocationPicker"

const INITIAL_FORM_STATE = {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    city: "",
    country: "",
    coordinates: { latitude: null, longitude: null },
    mapEmbedUrl: "",
    level: 1,
    price: "",
    images: [],
    adventures: [],
    isNftEvent: false,
    nftReward: { nftName: "", nftDescription: "", nftImage: "" },
}

const MAX_IMAGES = 6
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

export default function EventsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [selectedAdventures, setSelectedAdventures] = useState([])
    const [showAdventureSelection, setShowAdventureSelection] = useState(false)
    const [mediaPreviews, setMediaPreviews] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef(null)
    const limit = 12

    const { events, isLoading, totalPages, error } = useEvents({ search: searchTerm, page, limit })
    const { adventures, isLoading: adventuresLoading } = useAdventures()

    useEffect(() => {
        return () => {
            mediaPreviews.forEach((preview) => {
                if (preview.url?.startsWith("blob:")) {
                    URL.revokeObjectURL(preview.url)
                }
            })
        }
    }, [mediaPreviews])

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE)
        setSelectedAdventures([])
        setMediaPreviews([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)

        if (formData.images.length + files.length > MAX_IMAGES) {
            toast.error(`You can upload up to ${MAX_IMAGES} images only`)
            return
        }

        const validFiles = files.filter((file) => {
            if (!VALID_IMAGE_TYPES.includes(file.type)) {
                toast.error(`${file.name} is not a valid image type`)
                return false
            }
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error(`${file.name} is too large (max 10MB)`)
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map((file) => ({
                name: file.name,
                type: "image",
                url: URL.createObjectURL(file),
            }))

            setMediaPreviews((prev) => [...prev, ...newPreviews])
            setFormData((prev) => ({ ...prev, images: [...prev.images, ...validFiles] }))
        }
    }

    const removeImage = (index) => {
        setMediaPreviews((prev) => {
            const newPreviews = [...prev]
            const removedItem = newPreviews[index]

            if (removedItem?.url?.startsWith("blob:")) {
                URL.revokeObjectURL(removedItem.url)
            }

            newPreviews.splice(index, 1)
            return newPreviews
        })

        setFormData((prev) => {
            const imageToRemove = mediaPreviews[index]
            if (imageToRemove && !imageToRemove.isExisting) {
                return {
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index - mediaPreviews.filter((p) => p.isExisting).length),
                }
            }
            return prev
        })
    }

    const handleAdventureToggle = (adventure) => {
        const isSelected = selectedAdventures.some((a) => a._id === adventure._id)
        const updated = isSelected
            ? selectedAdventures.filter((a) => a._id !== adventure._id)
            : [...selectedAdventures, adventure]

        setSelectedAdventures(updated)
        setFormData((prev) => ({ ...prev, adventures: updated.map((a) => a._id) }))
    }

    const removeSelectedAdventure = (adventureId) => {
        const updated = selectedAdventures.filter((a) => a._id !== adventureId)
        setSelectedAdventures(updated)
        setFormData((prev) => ({ ...prev, adventures: updated.map((a) => a._id) }))
    }

    const handleCreateEvent = async (e) => {
        e.preventDefault()
        if (!formData.adventures || formData.adventures.length === 0) {
            toast.error("Please select at least one adventure for this event.")
            return
        }
        setIsSubmitting(true)
        try {
            await createEvent(formData)
            toast.success("Event created successfully")
            setShowCreateModal(false)
            resetForm()
            window.location.reload()
        } catch (error) {
            toast.error("Failed to create event")
            console.error("Create event error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateEvent = async (e) => {
        e.preventDefault()
        if (!formData.adventures || formData.adventures.length === 0) {
            toast.error("Please select at least one adventure for this event.")
            return
        }
        setIsSubmitting(true)
        try {
            await updateEvent(selectedEvent._id, formData)
            toast.success("Event updated successfully")
            setShowEditModal(false)
            resetForm()
            setSelectedEvent(null)
            window.location.reload()
        } catch (error) {
            toast.error("Failed to update event")
            console.error("Update event error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(eventId)
                toast.success("Event deleted successfully")
                window.location.reload()
            } catch (error) {
                toast.error("Failed to delete event")
            }
        }
    }

    const openEditModal = (event) => {
        setSelectedEvent(event)
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date.split("T")[0],
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            location: event.location,
            city: event.city || "",
            country: event.country || "",
            coordinates: {
                latitude: event.coordinates?.latitude || null,
                longitude: event.coordinates?.longitude || null,
            },
            mapEmbedUrl: event.mapEmbedUrl || "",
            level: event.level || 1,
            price: event.price || 0,
            images: [],
            adventures: event.adventures?.map((a) => a._id || a) || [],
            isNftEvent: event.isNftEvent || false,
            nftReward: {
                nftName: event.nftReward?.nftName || "",
                nftDescription: event.nftReward?.nftDescription || "",
                nftImage: event.nftReward?.nftImage || "",
            },
        })

        if (event.adventures && event.adventures.length > 0) {
            setSelectedAdventures(event.adventures)
        } else {
            setSelectedAdventures([])
        }

        if (event.medias && event.medias.length > 0) {
            const existingPreviews = event.medias.map((imageUrl, index) => ({
                name: `existing-image-${index}`,
                type: "image",
                url: imageUrl,
                isExisting: true,
            }))
            setMediaPreviews(existingPreviews)
        } else {
            setMediaPreviews([])
        }

        setShowEditModal(true)
    }

    const openDetailsModal = (event) => {
        setSelectedEvent(event)
        setShowDetailsModal(true)
    }

    const formatDisplayDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatDisplayTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h2>
                    <p className="text-gray-600 mb-4">{error.message || "Failed to load events"}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            <Calendar className="h-10 w-10" />
                            Events
                        </h1>
                        <p className="text-gray-600 mt-2">Create and manage adventure events</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                        <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                        Create Event
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search events..."
                        className="pl-11 h-12 bg-white border-gray-300 focus:border-black focus:ring-black"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>

                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <Card key={event._id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
                                <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-100">
                                    {event.medias && event.medias.length > 0 ? (
                                        <>
                                            <img
                                                src={event.medias[0]}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                onError={(e) => {
                                                    e.target.style.display = "none"
                                                    e.target.nextSibling.style.display = "flex"
                                                }}
                                            />
                                            <div className="hidden w-full h-full items-center justify-center bg-gray-100 text-gray-400">
                                                <Calendar className="h-12 w-12" />
                                            </div>
                                            {event.medias.length > 1 && (
                                                <div className="absolute top-3 right-3 bg-black/75 text-white px-3 py-1.5 rounded-md text-sm font-medium">
                                                    +{event.medias.length - 1} more
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <Calendar className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="line-clamp-2 text-lg font-semibold text-gray-900">
                                        {event.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">
                                        {event.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-3 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{formatDisplayDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{formatDisplayTime(event.startTime)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Star className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">Level {event.level || 1}</span>
                                    </div>

                                    {event.adventures && event.adventures.length > 0 && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Compass className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {event.adventures.length} adventure{event.adventures.length > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    )}

                                    {event.isNftEvent && (
                                        <Badge variant="secondary" className="bg-gray-900 text-white hover:bg-gray-800">
                                            <Star className="mr-1 h-3 w-3" />
                                            NFT Event
                                        </Badge>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-2 pt-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openDetailsModal(event)}
                                        className="w-full border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditModal(event)}
                                            className="flex-1 border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteEvent(event._id)}
                                            className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <Calendar className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-900 font-semibold text-lg">No events found</p>
                            <p className="text-gray-500 text-sm mt-1">
                                {searchTerm ? `No events match "${searchTerm}"` : "Get started by creating your first event"}
                            </p>
                        </div>
                        {!searchTerm && (
                            <Button onClick={() => setShowCreateModal(true)} className="mt-2 bg-black hover:bg-gray-800 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>
                        )}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <span className="text-sm text-gray-600 font-medium">
                            Page {page} of {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            <EventFormModal
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    resetForm()
                }}
                onSubmit={handleCreateEvent}
                formData={formData}
                setFormData={setFormData}
                selectedAdventures={selectedAdventures}
                setSelectedAdventures={setSelectedAdventures}
                showAdventureSelection={showAdventureSelection}
                setShowAdventureSelection={setShowAdventureSelection}
                mediaPreviews={mediaPreviews}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                handleAdventureToggle={handleAdventureToggle}
                removeSelectedAdventure={removeSelectedAdventure}
                isSubmitting={isSubmitting}
                fileInputRef={fileInputRef}
                adventures={adventures}
                adventuresLoading={adventuresLoading}
                isEdit={false}
            />

            <EventFormModal
                open={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    resetForm()
                    setSelectedEvent(null)
                }}
                onSubmit={handleUpdateEvent}
                formData={formData}
                setFormData={setFormData}
                selectedAdventures={selectedAdventures}
                setSelectedAdventures={setSelectedAdventures}
                showAdventureSelection={showAdventureSelection}
                setShowAdventureSelection={setShowAdventureSelection}
                mediaPreviews={mediaPreviews}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                handleAdventureToggle={handleAdventureToggle}
                removeSelectedAdventure={removeSelectedAdventure}
                isSubmitting={isSubmitting}
                fileInputRef={fileInputRef}
                adventures={adventures}
                adventuresLoading={adventuresLoading}
                isEdit={true}
            />

            <EventDetailsModal
                open={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false)
                    setSelectedEvent(null)
                }}
                event={selectedEvent}
                formatDisplayDate={formatDisplayDate}
                formatDisplayTime={formatDisplayTime}
            />
        </div>
    )
}

function EventFormModal({
    open,
    onClose,
    onSubmit,
    formData,
    setFormData,
    selectedAdventures,
    showAdventureSelection,
    setShowAdventureSelection,
    mediaPreviews,
    handleImageUpload,
    removeImage,
    handleAdventureToggle,
    removeSelectedAdventure,
    isSubmitting,
    fileInputRef,
    adventures,
    adventuresLoading,
    isEdit,
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isEdit ? "Edit Event" : "Create New Event"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update the event details" : "Fill in the details to create a new event"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-900">
                            Event Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Enter event title"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            placeholder="Enter event description"
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-sm font-semibold text-gray-900">
                                Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startTime" className="text-sm font-semibold text-gray-900">
                                Start Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime" className="text-sm font-semibold text-gray-900">
                                End Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900">
                            Event Location <span className="text-red-500">*</span>
                        </Label>
                        <MapLocationPicker
                            coordinates={formData.coordinates}
                            address={formData.location}
                            onCoordinatesChange={(coords) => setFormData({ ...formData, coordinates: coords })}
                            onAddressChange={(address) => setFormData({ ...formData, location: address })}
                            onLocationDetailsChange={(details) =>
                                setFormData({ ...formData, city: details.city || "", country: details.country || "" })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-900">
                            Adventures <span className="text-red-500">*</span>
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAdventureSelection(!showAdventureSelection)}
                            className="w-full justify-between h-11"
                        >
                            <span>
                                {selectedAdventures.length > 0
                                    ? `${selectedAdventures.length} adventure${selectedAdventures.length > 1 ? "s" : ""} selected`
                                    : "Select adventures"}
                            </span>
                            <Compass className="h-4 w-4" />
                        </Button>

                        {selectedAdventures.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedAdventures.map((adventure) => (
                                    <Badge key={adventure._id} variant="secondary" className="flex items-center gap-1">
                                        {adventure.name}
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                                            onClick={() => removeSelectedAdventure(adventure._id)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {showAdventureSelection && (
                            <div className="border rounded-md max-h-40 overflow-y-auto p-2">
                                {adventuresLoading ? (
                                    <div className="text-sm text-gray-500 p-2">Loading adventures...</div>
                                ) : adventures.length === 0 ? (
                                    <div className="text-sm text-gray-500 p-2">No adventures available</div>
                                ) : (
                                    <div className="space-y-2">
                                        {adventures.map((adventure) => (
                                            <div key={adventure._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`adventure-${adventure._id}`}
                                                    checked={selectedAdventures.some((a) => a._id === adventure._id)}
                                                    onCheckedChange={() => handleAdventureToggle(adventure)}
                                                />
                                                <Label htmlFor={`adventure-${adventure._id}`} className="flex-1 text-sm cursor-pointer">
                                                    {adventure.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="level" className="text-sm font-semibold text-gray-900">
                                Required Level (1-10) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="level"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-semibold text-gray-900">
                                Price (£)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0"
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isNftEvent"
                                checked={formData.isNftEvent}
                                onCheckedChange={(checked) => setFormData({ ...formData, isNftEvent: checked })}
                            />
                            <Label htmlFor="isNftEvent" className="text-sm font-semibold text-gray-900 flex items-center">
                                <Star className="h-4 w-4 mr-1" />
                                NFT Event
                            </Label>
                        </div>
                        <p className="text-xs text-gray-500">Enable to award NFT rewards for completing all adventures</p>
                    </div>

                    {formData.isNftEvent && (
                        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="text-sm font-semibold text-gray-900">NFT Reward Details</h4>
                            <div className="space-y-2">
                                <Label htmlFor="nftName" className="text-sm font-semibold text-gray-900">
                                    NFT Name
                                </Label>
                                <Input
                                    id="nftName"
                                    value={formData.nftReward.nftName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nftReward: { ...formData.nftReward, nftName: e.target.value } })
                                    }
                                    placeholder="Enter NFT name"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nftDescription" className="text-sm font-semibold text-gray-900">
                                    NFT Description
                                </Label>
                                <Textarea
                                    id="nftDescription"
                                    value={formData.nftReward.nftDescription}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nftReward: { ...formData.nftReward, nftDescription: e.target.value } })
                                    }
                                    placeholder="Describe the NFT reward"
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="images" className="text-sm font-semibold text-gray-900">
                            Event Images
                        </Label>
                        <Input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            className="cursor-pointer h-11"
                        />
                        <p className="text-xs text-gray-500">Upload up to 6 images (JPEG, PNG, GIF, WebP - Max 10MB each)</p>

                        {mediaPreviews.length > 0 && (
                            <div className="mt-2">
                                <MediaPreview mediaPreviews={mediaPreviews} onRemove={removeImage} isSubmitting={isSubmitting} />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="px-6">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="px-8 bg-black hover:bg-gray-800 text-white">
                            {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Event" : "Create Event"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EventDetailsModal({ open, onClose, event, formatDisplayDate, formatDisplayTime }) {
    if (!event) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold line-clamp-2">{event.title}</DialogTitle>
                    <DialogDescription>Event Details</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {event.medias && event.medias.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">Event Images</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {event.medias.map((imageUrl, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={imageUrl}
                                            alt={`Event image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = "none"
                                                e.target.nextSibling.style.display = "flex"
                                            }}
                                        />
                                        <div className="hidden w-full h-full items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                            Image not available
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">Date</h4>
                            <p className="text-sm text-gray-600">{formatDisplayDate(event.date)}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">Time</h4>
                            <p className="text-sm text-gray-600">{formatDisplayTime(event.startTime)}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">Location</h4>
                        <p className="text-sm text-gray-600">{event.location}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">Required Level</h4>
                        <p className="text-sm text-gray-600">Level {event.level || 1}</p>
                    </div>

                    {event.adventures && event.adventures.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">Adventures</h4>
                            <div className="space-y-2">
                                {event.adventures.map((adventure, index) => (
                                    <div key={adventure._id || index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                                        <Compass className="h-4 w-4 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-900">{adventure.name}</span>
                                        {adventure.exp && (
                                            <Badge variant="outline" className="text-xs">
                                                {adventure.exp} XP
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.isNftEvent && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">NFT Reward</h4>
                            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Star className="h-4 w-4 text-gray-900" />
                                    <span className="text-sm font-semibold text-gray-900">NFT Event</span>
                                </div>
                                {event.nftReward?.nftName && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">{event.nftReward.nftName}</p>
                                        {event.nftReward.nftDescription && (
                                            <p className="text-xs text-gray-600">{event.nftReward.nftDescription}</p>
                                        )}
                                    </div>
                                )}
                                <p className="text-xs text-gray-600 mt-2">Complete all adventures to earn this NFT!</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
