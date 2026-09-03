import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Download, ChevronDown, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  getAllSessionBookings,
  getAllHotelBookings,
  getAllItemBookings,
  deleteSessionBooking,
  deleteHotelBooking,
  deleteItemBooking
} from "../../../Api/booking.api"
import { getAllEventBookings, deleteEventBooking } from "../../../Api/eventBooking.api"
import { formatCurrency } from "../../../utils/currency"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

export default function Dash_Bookings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("items")

  // Pagination state
  const [currentPage, setCurrentPage] = useState({
    items: 1,
    sessions: 1,
    hotels: 1,
    events: 1
  })
  const [itemsPerPage] = useState(10)
  // State for different booking types
  const [itemBookings, setItemBookings] = useState([])
  const [sessionBookings, setSessionBookings] = useState([])
  const [hotelBookings, setHotelBookings] = useState([])
  const [eventBookings, setEventBookings] = useState([])

  // Pagination metadata from backend
  const [paginationMeta, setPaginationMeta] = useState({
    items: { total: 0, totalPages: 0, currentPage: 1 },
    sessions: { total: 0, totalPages: 0, currentPage: 1 },
    hotels: { total: 0, totalPages: 0, currentPage: 1 }
    , events: { total: 0, totalPages: 0, currentPage: 1 }
  })

  const [loading, setLoading] = useState({
    items: false,
    sessions: false,
    hotels: false,
    events: false
  })  // Fetch bookings data with pagination
  const fetchEventBookings = async (page = 1) => {
    setLoading(prev => ({ ...prev, events: true }))
    try {
      const params = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await getAllEventBookings(params)

      // Backend returns { data: bookings, total, page, totalPages } inside response.data.data
      const bookingsData = response?.data?.data?.data || response?.data?.data?.bookings || []
      const meta = {
        total: response?.data?.data?.total || 0,
        totalPages: response?.data?.data?.totalPages || 0,
        currentPage: response?.data?.data?.page || 1
      }

      setEventBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setPaginationMeta(prev => ({ ...prev, events: meta }))
    } catch (error) {
      setEventBookings([])
      setPaginationMeta(prev => ({ ...prev, events: { total: 0, totalPages: 0, currentPage: 1 } }))
    } finally {
      setLoading(prev => ({ ...prev, events: false }))
    }
  }
  const fetchItemBookings = async (page = 1) => {
    setLoading(prev => ({ ...prev, items: true }))
    try {
      const params = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await getAllItemBookings(params)

      const bookingsData = response?.data?.data?.data || []
      const meta = {
        total: response?.data?.data?.total || 0,
        totalPages: response?.data?.data?.totalPages || 0,
        currentPage: response?.data?.data?.page || 1
      }

      setItemBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setPaginationMeta(prev => ({ ...prev, items: meta }))
    } catch (error) {
      setItemBookings([])
      setPaginationMeta(prev => ({ ...prev, items: { total: 0, totalPages: 0, currentPage: 1 } }))
    } finally {
      setLoading(prev => ({ ...prev, items: false }))
    }
  }

  const fetchSessionBookings = async (page = 1) => {
    setLoading(prev => ({ ...prev, sessions: true }))
    try {
      const params = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await getAllSessionBookings(params)
      // Backend returns { bookings, total, page, totalPages } inside response.data.data
      const bookingsData = response?.data?.data?.bookings || []
      const meta = {
        total: response?.data?.data?.total || 0,
        totalPages: response?.data?.data?.totalPages || 0,
        currentPage: response?.data?.data?.page || 1
      }
      setSessionBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setPaginationMeta(prev => ({ ...prev, sessions: meta }))
    } catch (error) {
      setSessionBookings([])
      setPaginationMeta(prev => ({ ...prev, sessions: { total: 0, totalPages: 0, currentPage: 1 } }))
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }))
    }
  }

  const fetchHotelBookings = async (page = 1) => {
    setLoading(prev => ({ ...prev, hotels: true }))
    try {
      const params = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const response = await getAllHotelBookings(params)


      const bookingsData = response?.data?.data?.bookings || []
      const meta = {
        total: response?.data?.data?.total || 0,
        totalPages: response?.data?.data?.totalPages || 0,
        currentPage: response?.data?.data?.page || 1
      }

      setHotelBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setPaginationMeta(prev => ({ ...prev, hotels: meta }))
    } catch (error) {
      setHotelBookings([])
      setPaginationMeta(prev => ({ ...prev, hotels: { total: 0, totalPages: 0, currentPage: 1 } }))
    } finally {
      setLoading(prev => ({ ...prev, hotels: false }))
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchItemBookings(currentPage.items)
    fetchSessionBookings(currentPage.sessions)
    fetchHotelBookings(currentPage.hotels)
    fetchEventBookings(currentPage.events)
  }, [])  // Refetch data when filters change


  useEffect(() => {
    fetchItemBookings(1)
    fetchSessionBookings(1)
    fetchHotelBookings(1)
    fetchEventBookings(1)
    setCurrentPage({ items: 1, sessions: 1, hotels: 1, events: 1 })
  }, [statusFilter])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItemBookings(1)
      fetchSessionBookings(1)
      fetchHotelBookings(1)
      fetchEventBookings(1)
      setCurrentPage({ items: 1, sessions: 1, hotels: 1, events: 1 })
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Handle page changes
  const handlePageChange = (type, page) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: page
    }))

    // Fetch new data for the specific type
    if (type === 'items') {
      fetchItemBookings(page)
    } else if (type === 'sessions') {
      fetchSessionBookings(page)
    } else if (type === 'hotels') {
      fetchHotelBookings(page)
    } else if (type === 'events') {
      fetchEventBookings(page)
    }
  }


  // Delete handling
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const initiateDelete = (booking, type) => {
    setBookingToDelete({ ...booking, type })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return

    setIsDeleting(true)
    try {
      const id = bookingToDelete._id || bookingToDelete.id

      if (bookingToDelete.type === 'item') {
        await deleteItemBooking(id)
        toast.success("Item booking deleted successfully")
        fetchItemBookings(currentPage.items)
      } else if (bookingToDelete.type === 'session') {
        await deleteSessionBooking(id)
        toast.success("Session booking deleted successfully")
        fetchSessionBookings(currentPage.sessions)
      } else if (bookingToDelete.type === 'hotel') {
        await deleteHotelBooking(id)
        toast.success("Hotel booking deleted successfully")
        fetchHotelBookings(currentPage.hotels)
      } else if (bookingToDelete.type === 'event') {
        await deleteEventBooking(id)
        toast.success("Event booking deleted successfully")
        fetchEventBookings(currentPage.events)
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.message || "Failed to delete booking")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setBookingToDelete(null)
    }
  }

  // Filter bookings based on search term (now done on backend, but keeping for client-side if needed)
  const getFilteredBookings = (bookings) => {
    if (!searchTerm) return bookings

    if (!Array.isArray(bookings)) {
      return []
    }

    return bookings.filter((booking) => {
      if (!booking) return false

      const bookingData = booking.user?.name || booking.customerName || ''
      const activityName = booking.item?.name || booking.session?.title || booking.hotel?.name || booking.adventure || ''

      const matchesSearch =
        bookingData.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activityName.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }

  // Get filtered bookings (search is now handled on backend, but keeping for additional client filtering if needed)
  const filteredItemBookings = getFilteredBookings(itemBookings)
  const filteredSessionBookings = getFilteredBookings(sessionBookings)
  const filteredHotelBookings = getFilteredBookings(hotelBookings)
  const filteredEventBookings = getFilteredBookings(eventBookings)

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
        <div className="flex items-center space-x-2">
          <Button>Export Bookings</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="w-full sm:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed Bookings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled Bookings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto mb-4">
          <TabsTrigger value="items" className="flex-1 min-w-0 text-xs sm:text-sm">Items</TabsTrigger>
          <TabsTrigger value="sessions" className="flex-1 min-w-0 text-xs sm:text-sm">Sessions</TabsTrigger>
          <TabsTrigger value="hotels" className="flex-1 min-w-0 text-xs sm:text-sm">Hotels</TabsTrigger>
          <TabsTrigger value="events" className="flex-1 min-w-0 text-xs sm:text-sm">Events</TabsTrigger>
        </TabsList>        <TabsContent value="items">
          <BookingsTable
            bookings={filteredItemBookings}
            loading={loading.items}
            type="item"
            onDelete={(booking) => initiateDelete(booking, 'item')}
          />
          <PaginationControls
            currentPage={paginationMeta.items.currentPage}
            totalPages={paginationMeta.items.totalPages}
            onPageChange={(page) => handlePageChange('items', page)}
            totalItems={paginationMeta.items.total}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="sessions">
          <BookingsTable
            bookings={filteredSessionBookings}
            loading={loading.sessions}
            type="session"
            onDelete={(booking) => initiateDelete(booking, 'session')}
          />
          <PaginationControls
            currentPage={paginationMeta.sessions.currentPage}
            totalPages={paginationMeta.sessions.totalPages}
            onPageChange={(page) => handlePageChange('sessions', page)}
            totalItems={paginationMeta.sessions.total}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="hotels">
          <BookingsTable
            bookings={filteredHotelBookings}
            loading={loading.hotels}
            type="hotel"
            onDelete={(booking) => initiateDelete(booking, 'hotel')}
          />
          <PaginationControls
            currentPage={paginationMeta.hotels.currentPage}
            totalPages={paginationMeta.hotels.totalPages}
            onPageChange={(page) => handlePageChange('hotels', page)}
            totalItems={paginationMeta.hotels.total}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>

        <TabsContent value="events">
          <BookingsTable
            bookings={filteredEventBookings}
            loading={loading.events}
            type="event"
            onDelete={(booking) => initiateDelete(booking, 'event')}
          />
          <PaginationControls
            currentPage={paginationMeta.events.currentPage}
            totalPages={paginationMeta.events.totalPages}
            onPageChange={(page) => handlePageChange('events', page)}
            totalItems={paginationMeta.events.total}
            itemsPerPage={itemsPerPage}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the booking
              {bookingToDelete && (
                <span className="font-medium block mt-2">
                  ID: {bookingToDelete._id || bookingToDelete.id}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div >
  )

  // Reusable component for bookings tables
  function BookingsTable({ bookings, loading, type, onDelete }) {
    // Ensure bookings is always an array
    const safeBookings = Array.isArray(bookings) ? bookings : []

    if (loading) {
      return (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <p>Loading {type} bookings...</p>
          </CardContent>
        </Card>
      )
    }

    if (safeBookings.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <p>No {type} bookings found.</p>
          </CardContent>
        </Card>
      )
    }

    const getTableHeaders = () => {
      const commonHeaders = [
        <TableHead key="customer">Customer</TableHead>,
        <TableHead key="date">Date</TableHead>,
        <TableHead key="amount">Amount</TableHead>,
        <TableHead key="status">Status</TableHead>,
        <TableHead key="actions" className="text-right">Actions</TableHead>
      ]

      if (type === "item") {
        return [
          <TableHead key="item">Booking Id</TableHead>,
          ...commonHeaders
        ]
      } else if (type === "session") {
        return [
          <TableHead key="session">Session</TableHead>,
          <TableHead key="sessionId">Session ID</TableHead>,
          ...commonHeaders,
          <TableHead key="participants">Participants</TableHead>
        ]
      } else if (type === "hotel") {
        return [
          <TableHead key="hotel">Hotel</TableHead>,
          ...commonHeaders,
          <TableHead key="checkin">Check-in</TableHead>,
          <TableHead key="checkout">Check-out</TableHead>
        ]
      } else if (type === "event") {
        return [
          <TableHead key="event">Event</TableHead>,
          <TableHead key="eventId">Event ID</TableHead>,
          ...commonHeaders,
          <TableHead key="participants">Participants</TableHead>
        ]
      }

      return commonHeaders
    }

    const renderTableRow = (booking) => {
      if (!booking) return null

      const userName = booking.user?.name || booking.customerName || 'N/A'
      const bookingDate = booking.createdAt || booking.bookingDate || booking.date
      const formattedDate = bookingDate ? new Date(bookingDate).toLocaleDateString() : 'N/A'
      const bookingStatus = booking.status || 'pending'
      const amount = booking.totalAmount || booking.amount || 0

      const getStatusVariant = (status) => {
        switch (status.toLowerCase()) {
          case 'confirmed': return 'default'
          case 'pending': return 'outline'
          case 'completed': return 'secondary'
          case 'cancelled': return 'destructive'
          default: return 'outline'
        }
      }

      const commonCells = [
        <TableCell key="customer" className="font-medium">{userName}</TableCell>,
        <TableCell key="date">{formattedDate}</TableCell>,
        <TableCell key="amount">{formatCurrency(amount)}</TableCell>,
        <TableCell key="status">
          <Badge variant={getStatusVariant(bookingStatus)}>
            {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
          </Badge>
        </TableCell>,
        <TableCell key="actions" className="text-right">
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete && onDelete(booking)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      ]

      if (type === "item") {
        const itemName = booking._id;
        return (
          <TableRow key={booking._id || booking.id}>
            <TableCell>{itemName}</TableCell>
            {commonCells}
          </TableRow>
        )
      } else if (type === "session") {
        const sessionTitle = booking.session?.title || 'N/A'
        // Fallback: if session._id is missing, show booking.session (ObjectId)
        let sessionId = 'N/A';
        if (booking.session && typeof booking.session === 'object' && booking.session._id) {
          sessionId = booking.session._id;
        } else if (booking.session && typeof booking.session === 'string') {
          sessionId = booking.session;
        }
        const participants = booking.participants || booking.bookedSeats || 1
        return (
          <TableRow key={booking._id || booking.id}>
            <TableCell>{sessionTitle}</TableCell>
            <TableCell>{sessionId}</TableCell>
            {commonCells}
            <TableCell>{participants}</TableCell>
          </TableRow>
        )
      } else if (type === "hotel") {
        const hotelName = booking.hotel?.name || 'N/A'
        const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'
        const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'
        return (
          <TableRow key={booking._id || booking.id}>
            <TableCell>{hotelName}</TableCell>
            {commonCells}
            <TableCell>{checkIn}</TableCell>
            <TableCell>{checkOut}</TableCell>
          </TableRow>
        )
      } else if (type === "event") {
        const eventTitle = booking.event?.title || 'N/A'
        let eventId = 'N/A'
        if (booking.event && typeof booking.event === 'object' && booking.event._id) {
          eventId = booking.event._id
        } else if (booking.event && typeof booking.event === 'string') {
          eventId = booking.event
        }
        const participants = booking.participants || 1
        return (
          <TableRow key={booking._id || booking.id}>
            <TableCell>{eventTitle}</TableCell>
            <TableCell>{eventId}</TableCell>
            {commonCells}
            <TableCell>{participants}</TableCell>
          </TableRow>
        )
      }

      return null
    }

    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  {getTableHeaders()}
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeBookings.map(renderTableRow)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pagination Controls Component
  function PaginationControls({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
    if (totalPages <= 1) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div className="flex flex-col gap-3 px-4 py-4 border-t bg-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
          </Button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              page === '...'
                ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                    ...
                  </span>
                )
                : (
                  <Button
                    key={`page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
          >
            <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

}