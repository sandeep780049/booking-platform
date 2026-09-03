import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { createAdventure, updateAdventure, getAdventure } from "../../../Api/adventure.api"
import { fetchLocations, createLocation } from "../../../Api/location.api"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import MediaPreview from "../../../components/MediaPreview"
import { ArrowLeft, ImageIcon, Video, AlertCircle, Info, Upload, MapPin, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_MEDIA_SIZE = 50 * 1024 * 1024
const MAX_MEDIA_COUNT = 10

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
})

function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng])
        },
    })
    return position ? <Marker position={position} icon={markerIcon} /> : null
}

function FocusMapOnPosition({ position }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.setView(position, 14, { animate: true })
        }
    }, [position, map])
    return null
}

function fetchAddressFromCoords(lat, lng, setAddress) {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then((res) => res.json())
        .then((data) => setAddress(data.display_name || "Unknown address"))
        .catch(() => setAddress("Unknown address"))
}

function fetchCoordsFromAddress(address, setPosition, setAddress, setError) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then((res) => res.json())
        .then((data) => {
            if (data && data[0]) {
                setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
                setAddress(data[0].display_name)
                setError("")
            } else {
                setError("Address not found")
            }
        })
        .catch(() => setError("Error fetching coordinates"))
}

const validateFileType = (file, allowedTypes) => {
    if (!file) return true
    const fileType = file.type.split('/')[0]
    return allowedTypes.includes(fileType)
}

const validateFileSize = (file, maxSize = MAX_FILE_SIZE) => {
    if (!file) return true
    return file.size <= maxSize
}

const validateMediaFiles = (files) => {
    if (!files || !files.length) return { valid: true }

    if (files.length > MAX_MEDIA_COUNT) {
        return { valid: false, message: `Maximum ${MAX_MEDIA_COUNT} files allowed` }
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_MEDIA_SIZE) {
        return { valid: false, message: `Total file size exceeds ${MAX_TOTAL_MEDIA_SIZE / (1024 * 1024)}MB` }
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileType = file.type.split('/')[0]

        if (!['image', 'video'].includes(fileType)) {
            return { valid: false, message: `File '${file.name}' is not an image or video` }
        }

        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, message: `File '${file.name}' exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
        }
    }

    return { valid: true }
}

const AdventureFormPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditMode = !!id

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            location: [],
            description: "",
            exp: "",
            medias: [],
            thumbnail: null,
            previewVideo: null,
        },
        mode: "onBlur"
    })

    const [mediaFiles, setMediaFiles] = useState([])
    const [mediaPreviews, setMediaPreviews] = useState([])
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [previewVideoFile, setPreviewVideoFile] = useState(null)
    const [previewVideoPreview, setPreviewVideoPreview] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [locations, setLocations] = useState([])
    const [showLocationDropdown, setShowLocationDropdown] = useState(false)
    const locationDropdownRef = useRef(null)
    const [selectedLocations, setSelectedLocations] = useState([])
    const [adventure, setAdventure] = useState(null)
    const [isLoading, setIsLoading] = useState(isEditMode)
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [newLocationName, setNewLocationName] = useState("")
    const [newLocationDesc, setNewLocationDesc] = useState("")
    const [newLocationPosition, setNewLocationPosition] = useState(null)
    const [newLocationAddress, setNewLocationAddress] = useState("")
    const [locationAddressInput, setLocationAddressInput] = useState("")
    const [locationGeoError, setLocationGeoError] = useState("")

    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true)
            getAdventure(id)
                .then((res) => {
                    if (res && res.data) {
                        setAdventure(res.data)
                        reset(res.data)
                        const ids = (res.data.location || []).map((l) =>
                            typeof l === "object" && l !== null ? l._id : l
                        )
                        setSelectedLocations(ids)
                    }
                })
                .catch((error) => {
                    toast.error("Failed to load adventure data")
                    console.error(error)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [id, isEditMode, reset])

    useEffect(() => {
        let previews = []
        if (adventure && adventure.medias && Array.isArray(adventure.medias)) {
            previews = adventure.medias.map((media, idx) => {
                if (typeof media === "string") {
                    const ext = media.split(".").pop().toLowerCase()
                    let type = ""
                    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) type = "image"
                    else if (["mp4", "webm", "ogg", "mov", "avi"].includes(ext)) type = "video"
                    else type = "file"
                    return {
                        url: media,
                        type: type,
                        name: media.split("/").pop() || `media-${idx}`,
                        isServer: true,
                    }
                } else {
                    return { ...media, isServer: true }
                }
            })
        }
        if (mediaFiles.length) {
            const filePreviews = mediaFiles.map((file) => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
                name: file.name,
                isServer: false,
            }))
            previews = [...previews, ...filePreviews]
        }
        setMediaPreviews(previews)
        return () => {
            if (mediaFiles.length) {
                previews.filter((p) => !p.isServer).forEach((p) => URL.revokeObjectURL(p.url))
            }
        }
    }, [mediaFiles, adventure])

    useEffect(() => {
        if (thumbnailPreview && !thumbnailPreview.isServer) {
            URL.revokeObjectURL(thumbnailPreview.url)
        }

        if (thumbnailFile) {
            setThumbnailPreview({
                url: URL.createObjectURL(thumbnailFile),
                type: "image",
                name: thumbnailFile.name,
                isServer: false,
            })
        } else if (adventure?.thumbnail) {
            setThumbnailPreview({
                url: adventure.thumbnail,
                type: "image",
                name: "thumbnail",
                isServer: true,
            })
        } else {
            setThumbnailPreview(null)
        }

        return () => {
            if (thumbnailPreview && !thumbnailPreview.isServer) {
                URL.revokeObjectURL(thumbnailPreview.url)
            }
        }
    }, [thumbnailFile, adventure])

    useEffect(() => {
        if (previewVideoPreview && !previewVideoPreview.isServer) {
            URL.revokeObjectURL(previewVideoPreview.url)
        }

        if (previewVideoFile) {
            setPreviewVideoPreview({
                url: URL.createObjectURL(previewVideoFile),
                type: "video",
                name: previewVideoFile.name,
                isServer: false,
            })
        } else if (adventure?.previewVideo) {
            setPreviewVideoPreview({
                url: adventure.previewVideo,
                type: "video",
                name: "preview-video",
                isServer: true,
            })
        } else {
            setPreviewVideoPreview(null)
        }

        return () => {
            if (previewVideoPreview && !previewVideoPreview.isServer) {
                URL.revokeObjectURL(previewVideoPreview.url)
            }
        }
    }, [previewVideoFile, adventure])

    useEffect(() => {
        fetchLocations()
            .then((res) => {
                if (res && res.data) setLocations(res.data)
            })
            .catch(() => {
                toast.error("Failed to load locations")
                setLocations([])
            })

        register("location", {
            validate: value => (value && value.length > 0) || "At least one location must be selected"
        })

        register("thumbnail", {
            validate: value => {
                if (!isEditMode && !value && !adventure?.thumbnail) {
                    return "Thumbnail image is required"
                }
                return true
            }
        })

        register("previewVideo", {
            validate: value => {
                if (value && !validateFileType(value, ['video'])) {
                    return "Please provide a valid video file"
                }
                return true
            }
        })

        register("medias", {
            validate: value => {
                if (isEditMode && adventure && adventure.medias && adventure.medias.length > 0) {
                    return true
                }

                if (!isEditMode && (!value || !value.length)) {
                    return "At least one media file is required"
                }

                if (value && value.length > 0) {
                    const validation = validateMediaFiles(value)
                    return validation.valid || validation.message
                }

                return true
            }
        })
    }, [])

    useEffect(() => {
        const handler = (e) => {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
                setShowLocationDropdown(false)
            }
        }
        if (showLocationDropdown) document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [showLocationDropdown])

    useEffect(() => {
        setValue("location", selectedLocations, {
            shouldValidate: true,
            shouldDirty: true
        })
    }, [selectedLocations, setValue])

    const handleRemoveMedia = (idx) => {
        const serverCount =
            adventure && adventure.medias && Array.isArray(adventure.medias) ? adventure.medias.length : 0
        if (idx >= serverCount) {
            setMediaFiles((files) => {
                const updatedFiles = files.filter((_, i) => i !== idx - serverCount)
                setValue('medias', updatedFiles, { shouldValidate: true })
                return updatedFiles
            })
        }
    }

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview(null)
    }

    const handleRemovePreviewVideo = () => {
        setPreviewVideoFile(null)
        setPreviewVideoPreview(null)
    }

    const toggleLocation = (locId) => {
        setSelectedLocations((prev) => (prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]))
    }

    useEffect(() => {
        if (newLocationPosition) {
            fetchAddressFromCoords(newLocationPosition[0], newLocationPosition[1], setNewLocationAddress)
        } else {
            setNewLocationAddress("")
        }
    }, [newLocationPosition])

    const handleLocationAddressSearch = (e) => {
        e.preventDefault()
        if (!locationAddressInput.trim()) return
        fetchCoordsFromAddress(locationAddressInput, setNewLocationPosition, setNewLocationAddress, setLocationGeoError)
    }

    const handleAddLocationClick = () => {
        setShowLocationDropdown(false)
        setShowLocationModal(true)
        setNewLocationName("")
        setNewLocationDesc("")
        setNewLocationPosition(null)
        setNewLocationAddress("")
        setLocationAddressInput("")
        setLocationGeoError("")
    }

    const handleLocationModalClose = () => {
        setShowLocationModal(false)
    }

    const handleLocationModalSubmit = async (e) => {
        e.preventDefault()
        if (!newLocationName.trim() || !newLocationPosition) return

        try {
            const res = await createLocation({
                name: newLocationName,
                description: newLocationDesc,
                position: newLocationPosition,
                address: newLocationAddress,
            })
            const newLoc = res.data
            const updatedLocations = [
                ...locations,
                {
                    _id: newLoc._id,
                    name: newLoc.name,
                    description: newLoc.description,
                },
            ]
            setLocations(updatedLocations)
            setSelectedLocations((prev) => [...prev, newLoc._id])
            toast.success("Location created successfully")
            setShowLocationModal(false)
        } catch (error) {
            toast.error("Failed to create location")
            console.error(error)
        }
    }

    const onSubmit = async (data) => {
        try {
            if (!isEditMode && !thumbnailFile && !adventure?.thumbnail) {
                toast.error("Thumbnail image is required")
                return
            }

            if (!isEditMode && (!mediaFiles.length) && (!adventure?.medias || adventure.medias.length === 0)) {
                toast.error("At least one media file is required")
                return
            }

            if (thumbnailFile && (!validateFileType(thumbnailFile, ['image']) || !validateFileSize(thumbnailFile))) {
                toast.error("Invalid thumbnail file. Please check size and format.")
                return
            }

            if (previewVideoFile && !validateFileType(previewVideoFile, ['video'])) {
                toast.error("Invalid preview video. Please check format.")
                return
            }

            if (mediaFiles.length > 0) {
                const validation = validateMediaFiles(mediaFiles)
                if (!validation.valid) {
                    toast.error(validation.message)
                    return
                }
            }

            setIsSubmitting(true)
            const toastId = toast.loading(isEditMode ? "Updating adventure..." : "Creating adventure...")

            const formData = new FormData()
            formData.append("name", data.name)
            data.location.forEach((locId) => formData.append("location", locId))
            formData.append("description", data.description)
            formData.append("exp", data.exp)

            if (isEditMode && id) {
                formData.append("_id", id)
            }

            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile)
            }

            if (previewVideoFile) {
                formData.append("previewVideo", previewVideoFile)
            }

            mediaFiles.forEach((file) => {
                formData.append("medias", file)
            })

            if (isEditMode) {
                await updateAdventure(formData)
                toast.success("Adventure updated successfully", { id: toastId })
            } else {
                await createAdventure(formData)
                toast.success("Adventure created successfully", { id: toastId })
            }
            navigate("/admin/adventures")
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving adventure")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading adventure...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/adventures")}
                        className="p-2 hover:bg-white/80 transition-all duration-200"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? "Edit Adventure" : "Create New Adventure"}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditMode ? "Update adventure details and media" : "Add a new adventure experience"}
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-lg h-auto">
                                    <TabsTrigger
                                        value="basic"
                                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-3 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Info className="h-4 w-4" />
                                        Basic Info
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="media"
                                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-3 px-6 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Media
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-6 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
                                                Adventure Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Enter adventure name"
                                                disabled={isSubmitting}
                                                {...register("name", {
                                                    required: "Adventure name is required",
                                                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                                                    maxLength: { value: 100, message: "Name must be less than 100 characters" }
                                                })}
                                                className={`h-11 transition-all duration-200 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "focus:border-black focus:ring-black"}`}
                                            />
                                            {errors.name && (
                                                <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                    <span>{errors.name.message}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="exp" className="text-sm font-semibold text-gray-900">
                                                Experience Points <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="exp"
                                                placeholder="Enter experience points"
                                                type="number"
                                                disabled={isSubmitting}
                                                {...register("exp", {
                                                    required: "Experience points are required",
                                                    min: { value: 0, message: "Experience points must be positive" },
                                                    max: { value: 10000, message: "Experience points cannot exceed 10,000" },
                                                    valueAsNumber: true
                                                })}
                                                className={`h-11 transition-all duration-200 ${errors.exp ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "focus:border-black focus:ring-black"}`}
                                            />
                                            {errors.exp && (
                                                <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                    <span>{errors.exp.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Location <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative" ref={locationDropdownRef}>
                                            <div
                                                className={`block w-full border rounded-lg p-3 bg-white cursor-pointer select-none transition-all duration-200 hover:border-gray-400 ${errors.location ? "border-red-500" : "border-gray-300"}`}
                                                onClick={() => setShowLocationDropdown((v) => !v)}
                                            >
                                                {selectedLocations.length === 0
                                                    ? <span className="text-gray-500">Select location(s)</span>
                                                    : <span className="text-gray-900">{locations
                                                        .filter((loc) => selectedLocations.includes(loc._id))
                                                        .map((loc) => loc.name)
                                                        .join(", ")}</span>}
                                            </div>
                                            {showLocationDropdown && (
                                                <div className="absolute left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg mt-1 shadow-xl overflow-hidden">
                                                    <div className="max-h-52 overflow-y-auto">
                                                        {locations.length === 0 ? (
                                                            <div className="px-4 py-3 text-gray-500">No locations available</div>
                                                        ) : (
                                                            locations.map((loc) => (
                                                                <div
                                                                    key={loc._id}
                                                                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        toggleLocation(loc._id)
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLocations.includes(loc._id)}
                                                                        readOnly
                                                                        className="mr-3 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                                    />
                                                                    <span className="text-gray-900">{loc.name}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <div className="border-t border-gray-200 flex">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAddLocationClick()
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-black font-medium hover:bg-gray-50 transition-colors duration-150 border-r border-gray-200"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add New
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setShowLocationDropdown(false)
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-black font-semibold hover:bg-gray-50 transition-colors duration-150"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.location && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>{errors.location.message}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                                            Description <span className="text-red-500">*</span>
                                        </Label>
                                        <textarea
                                            id="description"
                                            placeholder="Enter adventure description"
                                            disabled={isSubmitting}
                                            {...register("description", {
                                                required: "Description is required",
                                                minLength: { value: 20, message: "Description must be at least 20 characters" },
                                                maxLength: { value: 500, message: "Description must be less than 500 characters" }
                                            })}
                                            className={`w-full min-h-[120px] p-3 border rounded-lg transition-all duration-200 resize-none ${errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}`}
                                        />
                                        {errors.description && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>{errors.description.message}</span>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="media" className="space-y-8 mt-6">
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                            <ImageIcon className="h-4 w-4" />
                                            Thumbnail Image
                                            {!isEditMode && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="thumbnail-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0]
                                                    if (file) {
                                                        if (!validateFileType(file, ['image'])) {
                                                            toast.error('Please select an image file')
                                                            e.target.value = ''
                                                            return
                                                        }

                                                        if (!validateFileSize(file)) {
                                                            toast.error(`Thumbnail image must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
                                                            e.target.value = ''
                                                            return
                                                        }

                                                        setThumbnailFile(file)
                                                        setValue('thumbnail', file, { shouldValidate: true })
                                                    }
                                                }}
                                                className={`h-11 transition-all duration-200 ${errors.thumbnail ? "border-red-500" : ""}`}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        {errors.thumbnail && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>{errors.thumbnail.message}</span>
                                            </div>
                                        )}
                                        {thumbnailPreview && (
                                            <div className="relative inline-block mt-4">
                                                <img
                                                    src={thumbnailPreview.url || "/placeholder.svg"}
                                                    alt="Thumbnail preview"
                                                    className="h-48 w-auto object-cover rounded-lg border-2 border-gray-200 shadow-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                                                    onClick={() => {
                                                        handleRemoveThumbnail()
                                                        setValue('thumbnail', null, { shouldValidate: true })
                                                        document.getElementById('thumbnail-input').value = ''
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                            <Video className="h-4 w-4" />
                                            Preview Video
                                        </Label>
                                        <Input
                                            id="preview-video-input"
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0]
                                                if (file) {
                                                    if (!validateFileType(file, ['video'])) {
                                                        toast.error('Please select a video file')
                                                        e.target.value = ''
                                                        return
                                                    }

                                                    const MAX_VIDEO_SIZE = 50 * 1024 * 1024
                                                    if (file.size > MAX_VIDEO_SIZE) {
                                                        toast.error(`Preview video must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`)
                                                        e.target.value = ''
                                                        return
                                                    }

                                                    setPreviewVideoFile(file)
                                                    setValue('previewVideo', file, { shouldValidate: true })
                                                }
                                            }}
                                            className={`h-11 transition-all duration-200 ${errors.previewVideo ? "border-red-500" : ""}`}
                                            disabled={isSubmitting}
                                        />
                                        {errors.previewVideo && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>{errors.previewVideo.message}</span>
                                            </div>
                                        )}
                                        {previewVideoPreview && (
                                            <div className="relative inline-block mt-4">
                                                <video
                                                    src={previewVideoPreview.url}
                                                    controls
                                                    className="h-48 w-auto object-cover rounded-lg border-2 border-gray-200 shadow-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-lg"
                                                    onClick={() => {
                                                        handleRemovePreviewVideo()
                                                        setValue('previewVideo', null)
                                                        document.getElementById('preview-video-input').value = ''
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-900">
                                            Additional Media (images/videos)
                                            {!isEditMode && <span className="text-red-500">*</span>}
                                        </Label>
                                        <Input
                                            id="media-files-input"
                                            type="file"
                                            accept="image/*,video/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files)
                                                if (files && files.length > 0) {
                                                    const validation = validateMediaFiles(files)
                                                    if (!validation.valid) {
                                                        toast.error(validation.message)
                                                        e.target.value = ''
                                                        return
                                                    }

                                                    setMediaFiles(files)
                                                    setValue('medias', files, { shouldValidate: true })
                                                }
                                            }}
                                            className={`h-11 transition-all duration-200 ${errors.medias ? "border-red-500" : ""}`}
                                            disabled={isSubmitting}
                                        />
                                        {errors.medias && (
                                            <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1.5">
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                                <span>{errors.medias.message}</span>
                                            </div>
                                        )}

                                        {mediaFiles.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                                <span className="font-semibold">{mediaFiles.length}</span> file(s) selected •
                                                Total size: <span className="font-semibold">{(mediaFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)}MB</span>
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <MediaPreview mediaPreviews={mediaPreviews} onRemove={handleRemoveMedia} isSubmitting={isSubmitting} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/adventures")}
                                    disabled={isSubmitting}
                                    className="px-6 border-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || Object.keys(errors).length > 0}
                                    className="px-8 bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                            {isEditMode ? "Updating..." : "Creating..."}
                                        </span>
                                    ) : isEditMode ? (
                                        "Update Adventure"
                                    ) : (
                                        "Create Adventure"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Dialog open={showLocationModal} onOpenChange={handleLocationModalClose}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="h-6 w-6" />
                            Add New Location
                        </DialogTitle>
                        <form onSubmit={handleLocationModalSubmit} className="flex flex-col gap-6 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">
                                    Location Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Enter location name"
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Description</label>
                                <Input
                                    placeholder="Enter description (optional)"
                                    value={newLocationDesc}
                                    onChange={(e) => setNewLocationDesc(e.target.value)}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900">
                                    Map Location <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-gray-600">Click on the map or search by address</p>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search address..."
                                            value={locationAddressInput}
                                            onChange={(e) => setLocationAddressInput(e.target.value)}
                                            className="pl-10 h-11"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleLocationAddressSearch}
                                        variant="outline"
                                        className="px-6"
                                    >
                                        Find
                                    </Button>
                                </div>

                                {locationGeoError && (
                                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                                        {locationGeoError}
                                    </div>
                                )}

                                <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                                    <MapContainer
                                        center={newLocationPosition || [27.7, 85.3]}
                                        zoom={newLocationPosition ? 14 : 6}
                                        style={{ height: "350px", width: "100%" }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap contributors"
                                        />
                                        <FocusMapOnPosition position={newLocationPosition} />
                                        <LocationPicker position={newLocationPosition} setPosition={setNewLocationPosition} />
                                    </MapContainer>
                                </div>

                                {newLocationPosition && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            Coordinates: {newLocationPosition[0].toFixed(5)}, {newLocationPosition[1].toFixed(5)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {newLocationAddress || "Loading address..."}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <Button type="button" variant="outline" onClick={handleLocationModalClose} className="px-6">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newLocationPosition || !newLocationName.trim()}
                                    className="px-8 bg-black hover:bg-gray-800 text-white"
                                >
                                    Add Location
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div >
    )
}

export default AdventureFormPage
