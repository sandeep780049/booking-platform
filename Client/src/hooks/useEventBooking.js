import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useEventBooking = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [bookingDialog, setBookingDialog] = useState(false)
  const [viewMoreDialog, setViewMoreDialog] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    participants: 1,
    email: "",
    phone: "",
    specialRequests: "",
  })
  
  const navigate = useNavigate()

  const handleBooking = useCallback((event) => {
    setSelectedEvent(event)
    setBookingDialog(true)
  }, [])

  const handleViewMore = useCallback((event) => {
    setSelectedEvent(event)
    setViewMoreDialog(true)
  }, [])

  const updateBookingForm = useCallback((updates) => {
    setBookingForm(prev => ({ ...prev, ...updates }))
  }, [])

  const submitBooking = useCallback(() => {
    // Validate booking form
    if (!bookingForm.email || !bookingForm.phone) {
      return { success: false, message: 'Please fill in all required fields' }
    }

    // Navigate to event payment route with booking data
    // Use the event id in the URL (e.g. /event/68f7df866f87079162372f8f)
    if (selectedEvent && selectedEvent._id) {
      navigate(`/event/${selectedEvent._id}`, {
        state: {
          bookingData: bookingForm,
          selectedEvent: selectedEvent
        }
      })
    } else {
      // Fallback: navigate to root if we don't have an event id
      navigate('/', { replace: true })
    }

    // Close the booking dialog and reset form
    setBookingDialog(false)
    setBookingForm({ participants: 1, email: "", phone: "", specialRequests: "" })
    
    return { success: true }
  }, [selectedEvent, bookingForm, navigate])

  const closeDialogs = useCallback(() => {
    setBookingDialog(false)
    setViewMoreDialog(false)
    setSelectedEvent(null)
  }, [])

  return {
    selectedEvent,
    bookingDialog,
    viewMoreDialog,
    bookingForm,
    handleBooking,
    handleViewMore,
    updateBookingForm,
    submitBooking,
    closeDialogs,
    setBookingDialog,
    setViewMoreDialog
  }
}