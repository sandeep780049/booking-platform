"use client"

import { useEffect, useState } from "react"
import { Star, Upload, Check, Edit, Save, ImageIcon, X, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import InstructorLayout from "./InstructorLayout"
import { useAuth } from "../AuthProvider"
import { getAdventure } from "../../Api/adventure.api"
import { updateUserProfile } from "../../Api/user.api"
import { uploadInstructorMedia, deleteInstructorMedia } from "../../Api/instructor.api"
import { setUser } from "../../Store/UserSlice"

export const InstructorProfile = () => {
    const { t } = useTranslation()
    const [editMode, setEditMode] = useState(false)
    const [certificateUploadMode, setCertificateUploadMode] = useState(false)
    const [activeTab, setActiveTab] = useState("profile")
    const [galleryUploadMode, setGalleryUploadMode] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState(null)
    const [fetchedAdventure, setFetchedAdventure] = useState(null)
    const { user } = useAuth();
    const dispatch = useDispatch();
    const [isSaving, setIsSaving] = useState(false)
    const [mediaActionLoading, setMediaActionLoading] = useState(false)

    // Helper function to construct proper image URLs
    const getImageUrl = (imagePath, fallback = "/placeholder.svg") => {
        if (!imagePath) return fallback;
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
            return imagePath;
        }
        // If it's a relative path, construct the full URL
        // Adjust this base URL according to your backend configuration
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
        return `${baseUrl}/uploads/${imagePath}`;
    };

    // Helper function to safely parse a date string/value into an ISO date string
    const safeDateString = (value, fallback = "N/A") => {
        if (!value) return fallback;
        try {
            const d = new Date(value);
            if (isNaN(d.getTime())) return fallback;
            return d.toISOString().split("T")[0];
        } catch {
            return fallback;
        }
    };

    // Helper function to detect video files
    const isVideoFile = (filename) => {
        if (!filename) return false;
        const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.m4v'];
        return videoExtensions.some(ext => filename.toLowerCase().includes(ext));
    };
    const formatGalleryItems = (medias = []) => {
        if (!Array.isArray(medias)) return [];
        return medias
            .filter(Boolean)
            .map((mediaUrl, index) => {
                const resolvedUrl = getImageUrl(mediaUrl);
                const type = isVideoFile(mediaUrl) ? 'video' : 'image';

                return {
                    id: index + 1,
                    rawUrl: mediaUrl,
                    type,
                    url: resolvedUrl,
                    caption: `Media ${index + 1}`,
                    thumbnail: type === 'video' ? null : resolvedUrl,
                };
            });
    };

    const fetchAdventure = async (adventureId) => {
        try {
            const res = await getAdventure(adventureId)
            if (res.data) {
                setFetchedAdventure(res.data)
            }
        } catch (error) {
            console.error("Error fetching adventure:", error);
        }
    }

    useEffect(() => {
        if (user?.user?.instructor?.adventure) {
            fetchAdventure(user?.user?.instructor?.adventure)
        }
    }, [user])

    // Update profile data when user or adventure data changes
    useEffect(() => {
        if (user?.user) {
            setProfileData(prev => ({
                ...prev,
                id: user.user._id || prev.id,
                name: user.user.name || "",
                email: user.user.email || "",
                profilePicture: getImageUrl(user.user.profilePicture),
                specialty: fetchedAdventure?.name || prev.specialty || "",
                experience: fetchedAdventure?.exp != null
                    ? `${fetchedAdventure.exp} years`
                    : prev.experience || "0 years",
                rating: user.user.instructor?.avgReview || 0,
                img: getImageUrl(fetchedAdventure?.thumbnail),
                bio: user.user.instructor?.description?.join(", ") || "Certified instructor with expertise in adventure activities.",
                languages: user.user.instructor?.languages || [],
                certificates: [
                    {
                        name: "Adventure Certification",
                        verified: user.user.verified || false,
                        link: getImageUrl(user.user.instructor?.certificate)
                    },
                ],
                selectedAdventures: [fetchedAdventure?.name || ""].filter(Boolean),
                verificationDocuments: [
                    {
                        type: "ID",
                        name: "Government ID",
                        status: user.user.instructor?.documentVerified || "pending",
                        date: safeDateString(user.user.createdAt, "N/A"),
                        link: getImageUrl(user.user.instructor?.governmentId)
                    },
                ],
                gallery: formatGalleryItems(user.user.instructor?.portfolioMedias || [])
            }))
        }
    }, [user, fetchedAdventure])

    const [profileData, setProfileData] = useState({
        id: user?.user?._id || 1,
        name: user?.user?.name || "",
        email: user?.user?.email || "",
        profilePicture: getImageUrl(user?.user?.profilePicture),
        specialty: fetchedAdventure?.name || "",
        experience: `${fetchedAdventure?.exp ?? 0} years`,
        rating: user?.user?.instructor?.avgReview || 0,
        img: getImageUrl(fetchedAdventure?.thumbnail),
        bio: user?.user?.instructor?.description?.join(", ") || "Certified instructor with expertise in adventure activities.",
        languages: user?.user?.instructor?.languages || [],
        certificates: [
            { name: "Adventure Certification", verified: user?.user?.verified || false, link: getImageUrl(user?.user?.instructor?.certificate) },
        ],
        selectedAdventures: [fetchedAdventure?.name || ""],
        verificationDocuments: [
            {
                type: "ID",
                name: "Government ID",
                status: user?.user?.instructor?.documentVerified || "pending",
                date: safeDateString(user?.user?.createdAt, "N/A"),
                link: getImageUrl(user?.user?.instructor?.governmentId)
            },
        ],
        gallery: formatGalleryItems(user?.user?.instructor?.portfolioMedias || [])
    })

    const [newCertificate, setNewCertificate] = useState({
        name: "",
        file: null,
    })

    const [newDocument, setNewDocument] = useState({
        type: "ID",
        name: "",
        file: null,
    })

    const [newMedia, setNewMedia] = useState({
        type: "image",
        file: null,
        caption: "",
    })

    const handleProfileChange = (field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleLanguageToggle = (language) => {
        setProfileData((prev) => {
            if (prev.languages.includes(language)) {
                return {
                    ...prev,
                    languages: prev.languages.filter((l) => l !== language),
                }
            } else {
                return {
                    ...prev,
                    languages: [...prev.languages, language],
                }
            }
        })
    }

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true)

            const payload = {
                name: profileData.name ? profileData.name.trim() : "",
                bio: profileData.bio ?? "",
                languages: profileData.languages ?? [],
            }

            // If a new profile picture file is selected, add it to the payload
            if (profileData.profilePictureFile) {
                payload.profilePicture = profileData.profilePictureFile;
            }

            const updatedUser = await updateUserProfile(payload)
            dispatch(setUser(updatedUser))

            if (updatedUser) {
                setProfileData((prev) => {
                    if (prev.profilePicture && prev.profilePicture.startsWith("blob:")) {
                        URL.revokeObjectURL(prev.profilePicture)
                    }

                    return {
                        ...prev,
                        name: updatedUser.name || prev.name,
                        bio: updatedUser.instructor?.description?.join(", ") || "",
                        languages: updatedUser.instructor?.languages || [],
                        profilePicture: updatedUser.profilePicture || prev.profilePicture,
                        gallery: updatedUser.instructor?.portfolioMedias
                            ? formatGalleryItems(updatedUser.instructor.portfolioMedias)
                            : prev.gallery,
                        profilePictureFile: undefined, // clear after upload
                    }
                })
            }

            toast.success(t("instructor.profileUpdatedSuccessfully"))
            setEditMode(false)
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                t("instructor.failedToUpdateProfile", { defaultValue: "Failed to update profile" })

            toast.error(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileChange = (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        if (type === "certificate") {
            setNewCertificate((prev) => ({
                ...prev,
                file: file,
            }))
        } else if (type === "document") {
            setNewDocument((prev) => ({
                ...prev,
                file: file,
            }))
        } else if (type === "profile") {
            // Store the file in profileData for later use
            setProfileData((prev) => ({
                ...prev,
                profilePictureFile: file,
                profilePicture: URL.createObjectURL(file), // for preview
            }))
            toast.success(t("instructor.profilePhotoUpdated"))
        } else if (type === "gallery") {
            setNewMedia((prev) => ({
                ...prev,
                file: file,
                type: file.type.startsWith("video/") ? "video" : "image",
            }))
        }
    }

    const handleAddCertificate = () => {
        if (!newCertificate.name || !newCertificate.file) {
            toast.error(t("instructor.pleaseProvideNameAndFile"))
            return
        }

        setProfileData((prev) => ({
            ...prev,
            certificates: [...prev.certificates, { name: newCertificate.name, verified: false }],
        }))

        setNewCertificate({ name: "", file: null })
        toast.success(t("instructor.certificateSubmittedForVerification"))
    }

    const handleAddDocument = () => {
        if (!newDocument.name || !newDocument.file) {
            toast.error(t("instructor.pleaseProvideNameAndFile"))
            return
        }

        setProfileData((prev) => ({
            ...prev,
            verificationDocuments: [
                ...prev.verificationDocuments,
                {
                    type: newDocument.type,
                    name: newDocument.name,
                    status: "pending",
                    date: new Date().toISOString().split("T")[0],
                },
            ],
        }))

        setNewDocument({ type: "ID", name: "", file: null })
        toast.success(t("instructor.documentSubmittedForVerification"))
    }

    const handleAddMedia = async () => {
        if (!newMedia.file) {
            toast.error("Please choose a media file to upload")
            return
        }

        if (!newMedia.caption) {
            toast.error("Please provide a caption for this media")
            return
        }

        const formData = new FormData()
        formData.append("media", newMedia.file)
        formData.append("type", newMedia.type)
        formData.append("caption", newMedia.caption)

        try {
            setMediaActionLoading(true)

            const response = await uploadInstructorMedia(formData)
            const updatedMedias =
                response?.data?.data?.portfolioMedias ||
                response?.data?.portfolioMedias ||
                []

            setProfileData((prev) => ({
                ...prev,
                gallery: formatGalleryItems(updatedMedias),
            }))

            setNewMedia({
                type: "image",
                file: null,
                caption: "",
            })
            setGalleryUploadMode(false)
            toast.success("Media added to gallery")
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to upload media"
            toast.error(errorMessage)
        } finally {
            setMediaActionLoading(false)
        }
    }

    const handleRemoveMedia = async (mediaItem) => {
        if (!mediaItem?.rawUrl) {
            toast.error("Unable to determine which media to delete")
            return
        }

        try {
            setMediaActionLoading(true)

            const response = await deleteInstructorMedia(mediaItem.rawUrl)
            const updatedMedias =
                response?.data?.data?.portfolioMedias ||
                response?.data?.portfolioMedias ||
                []

            setProfileData((prev) => ({
                ...prev,
                gallery: formatGalleryItems(updatedMedias),
            }))

            if (selectedMedia?.rawUrl === mediaItem.rawUrl) {
                setSelectedMedia(null)
            }

            toast.success("Media removed from gallery")
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to remove media"
            toast.error(errorMessage)
        } finally {
            setMediaActionLoading(false)
        }
    }

    const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese"]

    return (
        <InstructorLayout>
            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{t("instructor.profileInformation")}</h1>
                        {!editMode ? (
                            <Button onClick={() => setEditMode(true)} className="flex items-center gap-2 h-10">
                                <Edit className="h-4 w-4" />
                                {t("instructor.editProfile")}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex items-center gap-2 h-10"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving
                                    ? t("instructor.saving", { defaultValue: "Saving..." })
                                    : t("instructor.saveChanges")}
                            </Button>
                        )}
                    </div>
                    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
                            <TabsTrigger value="profile" className="text-sm sm:text-base">Profile</TabsTrigger>
                            <TabsTrigger value="gallery" className="text-sm sm:text-base">Gallery</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("instructor.personalInformation")}</CardTitle>
                                    <CardDescription>{t("instructor.manageProfileDescription")}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="lg:w-1/3 flex flex-col items-center">
                                            <div className="relative mb-4">
                                                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                                                    <AvatarImage
                                                        src={profileData.profilePicture || "/placeholder.svg"}
                                                        alt={profileData.name}
                                                        onError={(e) => {
                                                            e.target.src = "/placeholder.svg";
                                                        }}
                                                    />
                                                    <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {editMode && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <label
                                                            htmlFor="profile-photo"
                                                            className="cursor-pointer bg-black bg-opacity-50 rounded-full w-full h-full flex items-center justify-center"
                                                        >
                                                            <Upload className="h-6 w-6 text-white" />
                                                            <input
                                                                id="profile-photo"
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, "profile")}
                                                            />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                {editMode ? (
                                                    <Input
                                                        value={profileData.name}
                                                        onChange={(e) => handleProfileChange("name", e.target.value)}
                                                        className="text-center font-semibold text-lg mb-2"
                                                    />
                                                ) : (
                                                    <h3 className="font-semibold text-lg sm:text-xl">{profileData.name}</h3>
                                                )}

                                                <p className="text-muted-foreground text-sm sm:text-base">{profileData.specialty}</p>

                                                <div className="flex items-center justify-center mt-2">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    <span className="ml-1 font-medium">{profileData.rating}</span>
                                                </div>

                                                {editMode ? (
                                                    <Input
                                                        value={profileData.experience}
                                                        onChange={(e) => handleProfileChange("experience", e.target.value)}
                                                        className="text-center text-sm text-muted-foreground mt-1"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-1">{profileData.experience}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="lg:w-2/3">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">{t("instructor.bio")}</h4>
                                                    {editMode ? (
                                                        <Textarea
                                                            value={profileData.bio}
                                                            onChange={(e) => handleProfileChange("bio", e.target.value)}
                                                            className="min-h-[100px]"
                                                        />
                                                    ) : (
                                                        <p className="text-muted-foreground text-sm sm:text-base">{profileData.bio}</p>
                                                    )}
                                                </div>

                                                <Separator />

                                                <div>
                                                    <h4 className="font-medium mb-2">{t("instructor.languages")}</h4>
                                                    {editMode ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {languages.map((language) => (
                                                                <Badge
                                                                    key={language}
                                                                    variant={profileData.languages.includes(language) ? "default" : "outline"}
                                                                    className="cursor-pointer text-xs sm:text-sm"
                                                                    onClick={() => handleLanguageToggle(language)}
                                                                >
                                                                    {language}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {profileData.languages.map((language, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                                                    {language}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                        <div>
                                            <CardTitle>{t("instructor.certificationsAndLicenses")}</CardTitle>
                                            <CardDescription>{t("instructor.yourVerifiedCredentials")}</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCertificateUploadMode(!certificateUploadMode)}
                                            className="w-full sm:w-auto"
                                        >
                                            {certificateUploadMode ? t("instructor.cancel") : t("instructor.addCertificate")}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {certificateUploadMode && (
                                        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-3">{t("instructor.addNewCertificate")}</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">{t("instructor.certificateName")}</label>
                                                    <Input
                                                        value={newCertificate.name}
                                                        onChange={(e) => setNewCertificate((prev) => ({ ...prev, name: e.target.value }))}
                                                        placeholder={t("instructor.certificateNamePlaceholder")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">{t("instructor.certificateFile")}</label>
                                                    <div className="mt-1 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                {t("instructor.uploadFile")}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(e, "certificate")}
                                                            />
                                                        </label>
                                                        <span className="ml-0 sm:ml-3 text-sm text-gray-500">
                                                            {newCertificate.file ? newCertificate.file.name : t("instructor.noFileSelected")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button onClick={handleAddCertificate} className="w-full sm:w-auto">
                                                    {t("instructor.submitForVerification")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {profileData.certificates.map((certificate, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {certificate.verified ? (
                                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                                        </div>
                                                    )}
                                                    <span className="text-sm sm:text-base">{certificate.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {certificate.link && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(certificate.link, '_blank')}
                                                            className="text-xs"
                                                        >
                                                            {t("instructor.viewDocument") || "View Document"}
                                                        </Button>
                                                    )}
                                                    <Badge variant={certificate.verified ? "success" : "outline"}>
                                                        {certificate.verified ? t("instructor.verified") : t("instructor.pending")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("instructor.identityVerification")}</CardTitle>
                                    <CardDescription>{t("instructor.governmentIDsAndDocuments")}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="p-4 border rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-3">{t("instructor.submitDocument")}</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">{t("instructor.documentType")}</label>
                                                    <Select
                                                        value={newDocument.type}
                                                        onValueChange={(value) => setNewDocument((prev) => ({ ...prev, type: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t("instructor.selectDocumentType")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ID">{t("instructor.governmentID")}</SelectItem>
                                                            <SelectItem value="Passport">{t("instructor.passport")}</SelectItem>
                                                            <SelectItem value="License">{t("instructor.drivingLicense")}</SelectItem>
                                                            <SelectItem value="Certificate">{t("instructor.professionalCertificate")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">{t("instructor.documentName")}</label>
                                                    <Input
                                                        value={newDocument.name}
                                                        onChange={(e) => setNewDocument((prev) => ({ ...prev, name: e.target.value }))}
                                                        placeholder={t("instructor.documentNamePlaceholder")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">{t("instructor.documentFile")}</label>
                                                    <div className="mt-1 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                {t("instructor.uploadFile")}
                                                            </div>
                                                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "document")} />
                                                        </label>
                                                        <span className="ml-0 sm:ml-3 text-sm text-gray-500">
                                                            {newDocument.file ? newDocument.file.name : t("instructor.noFileSelected")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button onClick={handleAddDocument} className="w-full sm:w-auto">
                                                    {t("instructor.submitForVerification")}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-medium">{t("instructor.submittedDocuments")}</h4>
                                            {profileData.verificationDocuments.map((doc, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg"
                                                >
                                                    <div>
                                                        <div className="font-medium text-sm sm:text-base">{doc.name}</div>
                                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                                            {doc.type} • {doc.date}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {doc.link && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(doc.link, '_blank')}
                                                                className="text-xs"
                                                            >
                                                                {t("instructor.viewDocument") || "View Document"}
                                                            </Button>
                                                        )}
                                                        <Badge
                                                            variant={
                                                                doc.status === "verified"
                                                                    ? "success"
                                                                    : doc.status === "rejected"
                                                                        ? "destructive"
                                                                        : "outline"
                                                            }
                                                        >
                                                            {doc.status === "verified"
                                                                ? t("instructor.verified")
                                                                : doc.status === "rejected"
                                                                    ? t("instructor.rejected")
                                                                    : t("instructor.pending")}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="gallery">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                                        <div>
                                            <CardTitle>Gallery</CardTitle>
                                            <CardDescription>Showcase your adventures and experiences</CardDescription>
                                        </div>
                                        <Button
                                            onClick={() => setGalleryUploadMode(!galleryUploadMode)}
                                            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 w-full sm:w-auto"
                                        >
                                            {galleryUploadMode ? "Cancel" : "Add Media"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {galleryUploadMode && (
                                        <motion.div
                                            className="mb-6 p-4 border rounded-lg bg-muted/50"
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h4 className="font-medium mb-3">Add New Media</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Media Type</label>
                                                    <Select
                                                        value={newMedia.type}
                                                        onValueChange={(value) => setNewMedia((prev) => ({ ...prev, type: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select media type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="image">Image</SelectItem>
                                                            <SelectItem value="video">Video</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Caption</label>
                                                    <Input
                                                        value={newMedia.caption}
                                                        onChange={(e) => setNewMedia((prev) => ({ ...prev, caption: e.target.value }))}
                                                        placeholder="Add a caption for this media"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Upload File</label>
                                                    <div className="mt-1 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Upload {newMedia.type}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={(e) => handleFileChange(e, "gallery")}
                                                                accept={newMedia.type === "image" ? "image/*" : "video/*"}
                                                            />
                                                        </label>
                                                        <span className="ml-0 sm:ml-3 text-sm text-gray-500">
                                                            {newMedia.file ? newMedia.file.name : "No file selected"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleAddMedia}
                                                    disabled={mediaActionLoading}
                                                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 w-full sm:w-auto"
                                                >
                                                    {mediaActionLoading ? "Processing..." : "Add to Gallery"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {profileData.gallery.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className="relative group overflow-hidden rounded-lg shadow-md"
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedMedia(item)}>
                                                    {item.type === "image" ? (
                                                        <img
                                                            src={item.url || "/placeholder.svg"}
                                                            alt={item.caption}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = "/placeholder.svg";
                                                            }}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full relative">
                                                            <img
                                                                src={item.thumbnail || "/placeholder.svg?height=300&width=300"}
                                                                alt={item.caption}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = "/placeholder.svg?height=300&width=300";
                                                                }}
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                <Play className="h-12 w-12 text-white" fill="white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                                        <p className="text-white text-sm font-medium">{item.caption}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        handleRemoveMedia(item)
                                                    }}
                                                    disabled={mediaActionLoading}
                                                    aria-disabled={mediaActionLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {profileData.gallery.length === 0 && (
                                        <div className="text-center py-12">
                                            <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No media</h3>
                                            <p className="mt-1 text-sm text-gray-500">Get started by adding some images or videos.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMedia(null)}
                    >
                        <motion.div
                            className="max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                {selectedMedia?.type === "image" ? (
                                    <img
                                        src={selectedMedia.url || "/placeholder.svg"}
                                        alt={selectedMedia.caption}
                                        className="w-full max-h-[70vh] object-contain"
                                        onError={(e) => {
                                            e.target.src = "/placeholder.svg";
                                        }}
                                    />
                                ) : (
                                    <video
                                        src={selectedMedia.url}
                                        controls
                                        className="w-full max-h-[70vh]"
                                        onError={(e) => {
                                            console.error("Video failed to load:", selectedMedia.url);
                                        }}
                                    />
                                )}
                                <button
                                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
                                    onClick={() => setSelectedMedia(null)}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <p className="text-lg font-medium">{selectedMedia?.caption}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </InstructorLayout>
    )
}
