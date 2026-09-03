import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2, Hotel, Package, Activity } from "lucide-react"
import UserLayout from "./UserLayout"
import { getCurrentUserSessionBookings, getCurrentUserHotelBookings, getCurrentUserItemBookings } from "../../Api/booking.api"
import BookingDetailsDialog from "./BookingDetailsDialog"

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState("sessions")
  const [bookings, setBookings] = useState({ sessions: [], hotels: [], items: [] })
  const [loading, setLoading] = useState({ sessions: true, hotels: false, items: false })
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => { fetchBookings("sessions") }, [])

  async function fetchBookings(type = "sessions", page = 1) {
    try {
      setLoading(prev => ({ ...prev, [type]: true }))
      let response
      const queryParams = { page, limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }
      if (type === 'sessions') response = await getCurrentUserSessionBookings(queryParams)
      else if (type === 'hotels') response = await getCurrentUserHotelBookings(queryParams)
      else response = await getCurrentUserItemBookings(queryParams)

      const responseData = response.data?.data || response.data
      setBookings(prev => ({ ...prev, [type]: responseData.bookings || [] }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleTabChange = (value) => { setActiveTab(value); if (!bookings[value]?.length && !loading[value]) fetchBookings(value) }
  const handleViewDetails = (booking) => { setSelectedBooking(booking); setIsDialogOpen(true) }

  const renderBookingsList = (type) => {
    const list = bookings[type] || []
    if (loading[type]) return <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
    if (!list.length) return <div className="py-8 text-center text-gray-500">No {type} bookings found</div>
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(b => {
          // Safely get price depending on booking type
          let priceValue = 0
          if (b.session && typeof b.session.price !== 'undefined') priceValue = b.session.price
          else if (b.hotel && typeof b.hotel.price !== 'undefined') priceValue = b.hotel.price
          else if (typeof b.amount !== 'undefined') priceValue = b.amount
          const priceDisplay = typeof priceValue === 'number' ? priceValue.toFixed(2) : String(priceValue)
          const statusLabel = b.status?.toUpperCase() || 'UNKNOWN'

          let imageSrc = b.session?.adventureId?.medias?.[0]
            || b.hotel?.medias?.[0]
            || (b.items && b.items.length > 0 && (b.items[0].item?.images?.[0] || b.items[0].itemImage))
            || "/placeholder.svg?height=200&width=300"
          let title = b.session?.adventureId?.name
            || b.hotel?.name
            || (b.items && b.items.length > 0 && (b.items[0].item?.name || b.items[0].itemName))
            || 'Booking'
          let description = b.session?.location?.name
            || b.hotel?.location
            || (b.items && b.items.length > 0 && (b.items[0].item?.description || b.items[0].itemDescription))
            || ''
          return (
            <Card key={b._id} className="rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105">
              <div className="h-40 w-full relative overflow-hidden">
                <img src={imageSrc} alt="media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">{statusLabel}</Badge>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">€{priceDisplay}</div>
                  <Button variant="outline" onClick={() => handleViewDetails(b)} className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">View Details</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Bookings</h1>
          <p className="text-gray-600 mb-8 text-lg">Manage your adventure bookings</p>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 mb-8 bg-white shadow-md rounded-xl p-1">
              <TabsTrigger value="sessions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="hotels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span className="hidden sm:inline">Hotels</span>
              </TabsTrigger>
              <TabsTrigger value="items" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Items</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions">{renderBookingsList('sessions')}</TabsContent>
            <TabsContent value="hotels">{renderBookingsList('hotels')}</TabsContent>
            <TabsContent value="items">{renderBookingsList('items')}</TabsContent>
          </Tabs>

          <BookingDetailsDialog isOpen={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)} selectedBooking={selectedBooking} onReviewSuccess={() => { setIsDialogOpen(false); fetchBookings(activeTab) }} />
        </div>
      </div>
    </UserLayout>
  )
}
