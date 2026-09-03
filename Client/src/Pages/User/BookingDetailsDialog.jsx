import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Star } from 'lucide-react'
import ReviewForm from './ReviewForm'
import { fetchReviews } from '../../Api/reviews.api'
import { toast } from 'sonner'

export default function BookingDetailsDialog({ isOpen, onOpenChange, selectedBooking, onReviewSuccess }) {
  // Instead of returning null directly, render an empty fragment
  if (!selectedBooking) return <div style={{ display: 'none' }} />

  const [existingReview, setExistingReview] = useState(null)
  const [loadingReview, setLoadingReview] = useState(false)

  const getStatusBadgeClass = (date) => {
    if (date && new Date(date) > new Date()) return 'bg-red-500 text-white'
    return 'bg-green-500 text-white'
  }

  const loadReview = async () => {
    try {
      setLoadingReview(true)
      const params = {}
      if (selectedBooking.session?.instructorId) params.instructorId = selectedBooking.session.instructorId._id || selectedBooking.session.instructorId
      if (selectedBooking.hotel) params.hotelId = selectedBooking.hotel._id || selectedBooking.hotel
      // For item bookings, extract itemId from items array
      if (selectedBooking.items && Array.isArray(selectedBooking.items) && selectedBooking.items.length > 0) {
        params.itemId = selectedBooking.items[0].item._id || selectedBooking.items[0].item
      }
      const res = await fetchReviews(params)
      const reviews = res?.data || res?.reviews || res || []
      const first = Array.isArray(reviews) ? reviews[0] : (reviews?.data?.[0])
      setExistingReview(first || null)
    } catch (err) {
      console.error('Failed to load existing review', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to load review'
      toast.error(msg)
      setExistingReview(null)
    } finally {
      setLoadingReview(false)
    }
  }

  useEffect(() => {
  if (isOpen && (selectedBooking.session?.instructorId || selectedBooking.hotel || (selectedBooking.items && selectedBooking.items.length > 0))) {
      loadReview()
    } else {
      setExistingReview(null)
    }
  }, [isOpen, selectedBooking])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {selectedBooking.session?.adventureId?.name
              || selectedBooking.hotel?.name
              || (selectedBooking.items && selectedBooking.items.length > 0 && (selectedBooking.items[0].item?.name || selectedBooking.items[0].itemName))
              || 'Booking Details'}
          </DialogTitle>
          <DialogDescription>Booking ID: {selectedBooking._id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={
                selectedBooking.session?.adventureId?.medias?.[0]
                || selectedBooking.session?.adventureId?.thumbnail
                || selectedBooking.hotel?.medias?.[0]
                || (selectedBooking.items && selectedBooking.items.length > 0 && (selectedBooking.items[0].item?.images?.[0] || selectedBooking.items[0].itemImage))
                || '/placeholder.svg?height=200&width=400'
              }
              alt={selectedBooking.session?.adventureId?.name
                || selectedBooking.hotel?.name
                || (selectedBooking.items && selectedBooking.items.length > 0 && (selectedBooking.items[0].item?.name || selectedBooking.items[0].itemName))
                || 'Booking'}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-4 right-4 ${getStatusBadgeClass(selectedBooking.status)}`}>
              {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1) || 'Pending'}
            </Badge>
          </div>

          {/* full session/hotel details */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Start</p>
                <p className="text-sm text-gray-600">{selectedBooking.session ? new Date(selectedBooking.session.startTime).toLocaleString() : selectedBooking.hotel?.startDate}</p>
              </div>
              <div>
                <p className="font-medium">End</p>
                <p className="text-sm text-gray-600">{selectedBooking.session ? new Date(selectedBooking.session.expiresAt).toLocaleString() : selectedBooking.hotel?.endDate}</p>
              </div>
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-gray-600">{selectedBooking.session?.location?.name || selectedBooking.hotel?.location || 'Location not available'}</p>
              </div>
              <div>
                <p className="font-medium">Instructor</p>
                <p className="text-sm text-gray-600">{selectedBooking.session?.instructorId?.fullName || selectedBooking.session?.instructorId?.name || 'TBD'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Name</p>
                <p className="text-sm text-gray-600">{selectedBooking.user?.name}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">{selectedBooking.user?.email}</p>
              </div>
            </div>
          </div>

          {/* show existing rating or review form */}
          {loadingReview ? (
            <div className="text-sm text-gray-500">Loading review...</div>
          ) : existingReview ? (
            <div>
              <h3 className="font-semibold text-lg mb-2">Your Rating</h3>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <div className="font-medium">{existingReview.rating}/5</div>
                  {existingReview.comment && <div className="text-sm text-gray-600">{existingReview.comment}</div>}
                </div>
              </div>
              {/* render edit form below with existingReview */}
              {selectedBooking.status === 'confirmed' && (
                <div className="mt-4">
                  <ReviewForm selectedBooking={selectedBooking} existingReview={existingReview} onSuccess={() => { onReviewSuccess && onReviewSuccess(); loadReview() }} onCancel={() => onOpenChange(false)} />
                </div>
              )}
            </div>
          ) : (
            selectedBooking.status === 'confirmed' && (
              <ReviewForm selectedBooking={selectedBooking} onSuccess={() => { onReviewSuccess && onReviewSuccess(); loadReview() }} onCancel={() => onOpenChange(false)} />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
