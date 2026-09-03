import { useState, useEffect, useRef } from "react"
import { Search, Filter, Download, ChevronDown, Eye, Star, MapPin, Users, Check, XCircle, Plus, Building, Mail, Phone, User, Upload, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
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
import { toast } from "sonner"
import { useHotels } from '../../../hooks/useHotel'
import { approve, reject, registerHotel } from "../../../Api/hotel.api"
import { fetchLocations } from "../../../Api/location.api"

const STATUS_BADGE_VARIANTS = {
  approved: "success",
  pending: "warning",
  declined: "destructive",
}

const CATEGORIES = [
  { id: 'hotel', name: 'Hostel' },
  { id: 'camping', name: 'Camping' },
  { id: 'glamping', name: 'Glamping' }
]

const MAX_IMAGES = 6

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minRating, setMinRating] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [page, setPage] = useState(1)
  const [locations, setLocations] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [showHotelDetails, setShowHotelDetails] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const limit = 10

  const { hotels, isLoading, totalPages, refetch } = useHotels({
    search: searchTerm,
    page,
    limit,
    status: statusFilter,
    location: locationFilter || null,
    minPrice: minPrice || null,
    maxPrice: maxPrice || null,
    minRating: minRating || null,
    sortBy,
    sortOrder,
  })

  useEffect(() => {
    const getLocations = async () => {
      try {
        const res = await fetchLocations()
        setLocations(res.data || [])
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }
    getLocations()
  }, [])

  const viewHotelDetails = (hotel) => {
    setSelectedHotel(hotel)
    setShowHotelDetails(true)
  }

  const approveHotel = async (hotel) => {
    try {
      const res = await approve(hotel._id)
      if (res.status === 200) {
        toast.success(`${hotel.name} has been approved`)
        setShowHotelDetails(false)
        refetch()
      }
    } catch (error) {
      toast.error("Failed to approve accommodation")
    }
  }

  const declineHotel = async (hotel) => {
    try {
      const res = await reject(hotel._id)
      if (res.status === 200) {
        toast.success(`${hotel.name} has been declined`)
        setShowHotelDetails(false)
        refetch()
      }
    } catch (error) {
      toast.error("Failed to decline accommodation")
    }
  }

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <Building className="h-10 w-10" />
              Accommodations
            </h1>
            <p className="text-gray-600 mt-2">Manage accommodation registrations and approvals</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Add Accommodation
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search accommodations..."
                  className="w-[200px] sm:w-[300px] pl-8 bg-white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Accommodations</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending Approval</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="bg-white">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {locationFilter ? locations.find(loc => loc._id === locationFilter)?.name || "Select location" : "All Locations"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setLocationFilter("")}>All Locations</DropdownMenuItem>
                  {locations.map((location) => (
                    <DropdownMenuItem key={location._id} onClick={() => setLocationFilter(location._id)}>
                      {location.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price</label>
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price</label>
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Min rating"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {sortBy === 'createdAt' && 'Date Created'}
                    {sortBy === 'pricePerNight' && 'Price per Night'}
                    {sortBy === 'rating' && 'Rating'}
                    {sortBy === 'name' && 'Name'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => setSortBy("createdAt")}>Date Created</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("pricePerNight")}>Price per Night</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("rating")}>Rating</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="relative w-8 h-8">
                              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : hotels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No accommodations found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      hotels.map((hotel) => (
                        <TableRow key={hotel._id}>
                          <TableCell className="font-medium">{hotel.name}</TableCell>
                          <TableCell>{hotel.location?.name || '-'}</TableCell>
                          <TableCell>{hotel.managerName || '-'}</TableCell>
                          <TableCell>£{hotel.pricePerNight || hotel.price || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{hotel.rating || 0}/5</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={STATUS_BADGE_VARIANTS[hotel.verified] || "secondary"}
                              className="capitalize"
                            >
                              {hotel.verified}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => viewHotelDetails(hotel)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

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
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-16">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                  </div>
                </div>
              ) : hotels.length === 0 ? (
                <div className="col-span-full text-center py-16 text-gray-500">
                  No accommodations found.
                </div>
              ) : (
                hotels.map((hotel) => (
                  <Card key={hotel._id} className="overflow-hidden shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
                    <div className="aspect-video relative">
                      <img
                        src={hotel.logo || "/placeholder.svg"}
                        alt={hotel.name}
                        className="object-cover w-full h-full"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={STATUS_BADGE_VARIANTS[hotel.verified] || "secondary"}
                      >
                        {hotel.verified?.charAt(0).toUpperCase() + hotel.verified?.slice(1)}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{hotel.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {hotel.location?.name || '-'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{hotel.rating || '-'} Rating</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{hotel.noRoom || '-'} Rooms</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => viewHotelDetails(hotel)} className="w-full">
                        <Eye className="h-4 w-4 mr-1" /> View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

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
          </TabsContent>
        </Tabs>

        <HotelDetailsModal
          hotel={selectedHotel}
          open={showHotelDetails}
          onClose={() => setShowHotelDetails(false)}
          onApprove={approveHotel}
          onDecline={declineHotel}
          formatDate={formatDate}
        />

        <AddAccommodationModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          locations={locations}
          onSuccess={refetch}
        />
      </div>
    </div>
  )
}

function HotelDetailsModal({ hotel, open, onClose, onApprove, onDecline, formatDate }) {
  if (!hotel) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="py-4">
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{hotel.name}</span>
            <Badge
              variant={STATUS_BADGE_VARIANTS[hotel.verified] || "secondary"}
              className="capitalize ml-2"
            >
              {hotel.verified}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted on {formatDate(hotel.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid gap-6 py-4">
              <div className="flex justify-center mb-4">
                <img
                  src={hotel.logo || "/placeholder.svg"}
                  alt={hotel.name}
                  className="object-cover w-40 h-40 rounded-md border"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{hotel.location?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manager</p>
                    <p>{hotel.managerName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Email</p>
                    <p>{hotel.owner?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                    <p>{hotel.contactNo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Number of Rooms</p>
                    <p>{hotel.noRoom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Address</p>
                    <p>{hotel.fullAddress || '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{hotel.description || '-'}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {(hotel.amenities || []).map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Submitted Documents</h3>
                <div className="space-y-2">
                  {hotel.license && (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <span>Business License</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={hotel.license} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </Button>
                    </div>
                  )}
                  {hotel.insurance && (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <span>Insurance Policy</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={hotel.insurance} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </Button>
                    </div>
                  )}
                  {hotel.certificate && (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <span>Certificate</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={hotel.certificate} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4" style={{ minHeight: 400, maxHeight: 400, overflowY: 'auto' }}>
              {(hotel.medias || []).map((image, index) => (
                <div key={index} className="aspect-video rounded-md overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${hotel.name} - ${index + 1}`}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="destructive" onClick={() => onDecline(hotel)}>
            <XCircle className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button type="button" className="bg-black hover:bg-gray-800" onClick={() => onApprove(hotel)}>
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddAccommodationModal({ open, onClose, locations, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    location: "",
    address: "",
    phone: "",
    managerName: "",
    rooms: "",
    amenities: [],
    profileImage: null,
    hotelImages: [],
    businessLicense: null,
    taxCertificate: null,
    insuranceDocument: null,
    pricePerNight: "",
    rating: "",
    socialMedias: [],
    website: "",
    category: "hotel",
  })

  const [customAmenity, setCustomAmenity] = useState("")
  const [customSocial, setCustomSocial] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profileImageRef = useRef(null)
  const hotelImagesRef = useRef(null)

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      description: "",
      location: "",
      address: "",
      phone: "",
      managerName: "",
      rooms: "",
      amenities: [],
      profileImage: null,
      hotelImages: [],
      businessLicense: null,
      taxCertificate: null,
      insuranceDocument: null,
      pricePerNight: "",
      rating: "",
      socialMedias: [],
      website: "",
      category: "hotel",
    })
    setCustomAmenity("")
    setCustomSocial("")
    if (profileImageRef.current) profileImageRef.current.value = ""
    if (hotelImagesRef.current) hotelImagesRef.current.value = ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }))
    }
  }

  const handleHotelImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length + formData.hotelImages.length > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images only`)
      return
    }

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }))

    setFormData((prev) => ({
      ...prev,
      hotelImages: [...prev.hotelImages, ...newImages],
    }))
  }

  const handleDocumentChange = (type, e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }))
    }
  }

  const removeHotelImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      hotelImages: prev.hotelImages.filter((_, i) => i !== index),
    }))
  }

  const addAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !formData.amenities.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, trimmed],
      }))
      setCustomAmenity("")
    }
  }

  const removeAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const addSocial = () => {
    const trimmed = customSocial.trim()
    if (trimmed && !formData.socialMedias.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        socialMedias: [...prev.socialMedias, trimmed],
      }))
      setCustomSocial("")
    }
  }

  const removeSocial = (social) => {
    setFormData((prev) => ({
      ...prev,
      socialMedias: prev.socialMedias.filter((s) => s !== social),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.phone || !formData.managerName) {
      toast.error("Phone number and manager name are required")
      return
    }

    if (!formData.businessLicense) {
      toast.error("Business license is required")
      return
    }

    if (formData.hotelImages.length === 0) {
      toast.error("At least one accommodation image is required")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Creating accommodation...")

    try {
      const data = new FormData()
      data.append("name", formData.name.trim())
      data.append("email", formData.email.trim())
      data.append("description", formData.description.trim())
      data.append("location", formData.location)
      data.append("address", formData.address.trim())
      data.append("phone", formData.phone.trim())
      data.append("managerName", formData.managerName.trim())
      data.append("rooms", formData.rooms || 0)
      data.append("role", "hotel")
      data.append("pricePerNight", formData.pricePerNight || 0)
      data.append("price", formData.pricePerNight || 0)
      data.append("rating", formData.rating || 0)
      data.append("website", formData.website.trim())
      data.append("category", formData.category)
      data.append("adminCreated", "true")

      formData.amenities.forEach((amenity) => {
        data.append("amenities[]", amenity)
      })

      if (formData.profileImage) data.append("profileImage", formData.profileImage)
      if (formData.businessLicense) data.append("businessLicense", formData.businessLicense)
      if (formData.taxCertificate) data.append("taxCertificate", formData.taxCertificate)
      if (formData.insuranceDocument) data.append("insuranceDocument", formData.insuranceDocument)

      formData.hotelImages.forEach((image) => {
        data.append("hotelImages", image.file)
      })

      formData.socialMedias.forEach((link) => {
        data.append("socials[]", link)
      })

      const res = await registerHotel(data)

      if (res.data && (res.status === 201 || res.data.statusCode === 201)) {
        toast.success("Accommodation created successfully!", { id: toastId })
        resetForm()
        onClose()
        onSuccess?.()
      } else {
        throw new Error(res.data?.message || "Creation failed")
      }
    } catch (err) {
      console.error("Creation error:", err)
      const message = err?.response?.data?.message || err.message || "Failed to create accommodation"
      toast.error(message, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryLabel = () => {
    return CATEGORIES.find(cat => cat.id === formData.category)?.name || "Hostel"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add New Accommodation</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Complete the form below to register a new accommodation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-6 space-y-6">
          <div className="bg-gray-50 px-4 py-3 rounded-lg border">
            <Label htmlFor="category" className="text-sm font-medium text-gray-900 mb-2 block">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full max-w-xs h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" />
                    {getCategoryLabel()} Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={`Enter ${getCategoryLabel().toLowerCase()} name`}
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Contact Phone
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerName" className="text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Manager Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="managerName"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    placeholder="Manager full name"
                    required
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                    <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full h-10 border rounded-md px-3 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc._id} value={loc._id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category !== "camping" && (
                  <div className="space-y-2">
                    <Label htmlFor="rooms" className="text-sm font-medium">
                      Number of Rooms
                    </Label>
                    <Input
                      id="rooms"
                      name="rooms"
                      type="number"
                      value={formData.rooms}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="h-10 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pricePerNight" className="text-sm font-medium">
                    Price Per Night
                  </Label>
                  <Input
                    id="pricePerNight"
                    name="pricePerNight"
                    type="number"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-sm font-medium">
                    Initial Rating
                  </Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Full Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete street address"
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={`Provide a detailed description of your ${getCategoryLabel().toLowerCase()}`}
                rows={4}
                required
                className="text-sm resize-none"
              />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Media & Assets</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotelImages" className="text-sm font-medium">
                    Property Images (Max {MAX_IMAGES})
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="hotelImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleHotelImagesChange}
                    disabled={formData.hotelImages.length >= MAX_IMAGES}
                    ref={hotelImagesRef}
                    className="text-sm cursor-pointer"
                  />
                  {formData.hotelImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
                      {formData.hotelImages.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={img.url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded border"
                          />
                          <button
                            type="button"
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            onClick={() => removeHotelImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage" className="text-sm font-medium">
                    Logo/Profile Image
                  </Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    ref={profileImageRef}
                    className="text-sm cursor-pointer"
                  />
                  {formData.profileImage && (
                    <div className="mt-2 w-24 h-24">
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Logo"
                        className="w-full h-full object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="Enter amenity name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    className="h-9 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addAmenity}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 h-9 px-4"
                  >
                    Add
                  </Button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="inline-flex items-center gap-1.5 bg-gray-100 border rounded-md px-2.5 py-1 text-sm"
                      >
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Social Media Links</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={customSocial}
                    onChange={(e) => setCustomSocial(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSocial())}
                    className="h-9 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addSocial}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 h-9 px-4"
                  >
                    Add
                  </Button>
                </div>
                {formData.socialMedias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.socialMedias.map((social) => (
                      <div
                        key={social}
                        className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-1 text-sm"
                      >
                        <a
                          href={social}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline max-w-[200px] truncate"
                        >
                          {social}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeSocial(social)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessLicense" className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Business License
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessLicense"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentChange("businessLicense", e)}
                    required
                    className="text-sm cursor-pointer"
                  />
                  {formData.businessLicense && (
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {formData.businessLicense.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCertificate" className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Tax Certificate
                  </Label>
                  <Input
                    id="taxCertificate"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentChange("taxCertificate", e)}
                    className="text-sm cursor-pointer"
                  />
                  {formData.taxCertificate && (
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {formData.taxCertificate.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceDocument" className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Insurance Document
                  </Label>
                  <Input
                    id="insuranceDocument"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentChange("insuranceDocument", e)}
                    className="text-sm cursor-pointer"
                  />
                  {formData.insuranceDocument && (
                    <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {formData.insuranceDocument.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4 border-t mt-6 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={isSubmitting}
              className="h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-gray-800 h-10 px-6"
            >
              {isSubmitting ? "Creating..." : "Create Accommodation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
