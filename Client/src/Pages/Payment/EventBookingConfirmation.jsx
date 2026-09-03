import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    CheckCircle,
    Calendar,
    Clock,
    MapPin,
    Users,
    Mail,
    Phone,
    Download,
    Share2,
    ArrowRight,
    Ticket
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { Badge } from '../../components/ui/badge'
import { Nav_Landing } from '../../components/Nav_Landing'
import { Footer } from '../../components/Footer'
import { toast } from 'sonner'
import { getEventBookingById } from '../../Api/eventBooking.api'

const EventBookingConfirmation = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { t } = useTranslation()

    // Get confirmation data from navigation state or URL params
    const stateConfirmationData = location.state?.confirmationData
    const [confirmationData, setConfirmationData] = useState(stateConfirmationData)
    const [showConfetti, setShowConfetti] = useState(false)
    const [loading, setLoading] = useState(false)

    // Check if this is a redirect from payment gateway
    const orderId = searchParams.get('orderId')
    const bookingId = searchParams.get('bookingId')

    useEffect(() => {
        // If no confirmation data but we have booking ID from URL, fetch the booking
        if (!confirmationData && bookingId) {
            fetchBookingData(bookingId)
        } else if (!confirmationData && !bookingId) {
            navigate('/')
            return
        }

        // Show confetti animation
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
    }, [confirmationData, bookingId, navigate])

    const fetchBookingData = async (id) => {
        setLoading(true)
        try {
            const response = await getEventBookingById(id)

            // Transform API response to match expected confirmation data format
            const booking = response.booking
            const transformedData = {
                bookingId: booking._id,
                event: booking.event,
                bookingDetails: {
                    participants: booking.participants,
                    email: booking.contactInfo.email,
                    phone: booking.contactInfo.phone,
                    specialRequests: booking.specialRequests
                },
                paymentDetails: {
                    amount: booking.amount,
                    currency: 'EUR',
                    paymentMethod: booking.paymentMethod,
                    transactionId: booking.paymentOrderId || booking.transactionId || `TXN-${Date.now()}`,
                    status: booking.paymentStatus
                },
                confirmedAt: booking.paymentCompletedAt || booking.createdAt
            }

            setConfirmationData(transformedData)
        } catch (error) {
            console.error('Error fetching booking:', error)
            toast.error('Failed to load booking details')
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadReceipt = () => {
        // Create a simple text receipt
        const receiptContent = `
BOOKING CONFIRMATION
====================

Booking ID: ${confirmationData.bookingId}
Event: ${confirmationData.event.title}
Date: ${new Date(confirmationData.event.date).toLocaleDateString()}
Time: ${confirmationData.event.startTime} - ${confirmationData.event.endTime}
Location: ${confirmationData.event.city}, ${confirmationData.event.country}
Participants: ${confirmationData.bookingDetails.participants}

Contact Information:
Email: ${confirmationData.bookingDetails.email}
Phone: ${confirmationData.bookingDetails.phone}

Payment Details:
Amount: €${confirmationData.paymentDetails.amount.toFixed(2)}
Transaction ID: ${confirmationData.paymentDetails.transactionId}
Status: ${confirmationData.paymentDetails.status}

Confirmed at: ${new Date(confirmationData.confirmedAt).toLocaleString()}

Thank you for your booking!
    `

        const blob = new Blob([receiptContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `booking-receipt-${confirmationData.bookingId}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Receipt downloaded successfully!')
    }

    const handleShare = async () => {
        const shareData = {
            title: 'Adventure Booking Confirmed!',
            text: `I just booked ${confirmationData.event.title} for ${new Date(confirmationData.event.date).toLocaleDateString()}!`,
            url: window.location.origin
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                // Fallback to copying to clipboard
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
                toast.success('Booking details copied to clipboard!')
            }
        } catch (error) {
            toast.error('Failed to share. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading booking details...</p>
                </div>
            </div>
        )
    }

    if (!confirmationData) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: -10,
                                rotation: 0,
                                opacity: 1
                            }}
                            animate={{
                                y: window.innerHeight + 10,
                                rotation: 360,
                                opacity: 0
                            }}
                            transition={{
                                duration: 3,
                                delay: Math.random() * 2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            )}

            <Nav_Landing />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Success Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-xl text-gray-600">
                        Your adventure is booked and ready to go
                    </p>

                    <div className="mt-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                            Booking ID: {confirmationData.bookingId}
                        </Badge>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Confirmation Details */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Event Details Card */}
                        <Card className="shadow-lg border-l-4 border-l-green-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-green-600" />
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={confirmationData.event.image || "/placeholder.svg"}
                                        alt={confirmationData.event.title}
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {confirmationData.event.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">{confirmationData.event.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span>{new Date(confirmationData.event.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span>{confirmationData.event.startTime} - {confirmationData.event.endTime}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span>{confirmationData.event.city}, {confirmationData.event.country}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Users className="h-4 w-4 text-gray-500" />
                                                <span>{confirmationData.bookingDetails.participants} participant(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{confirmationData.bookingDetails.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-700">{confirmationData.bookingDetails.phone}</span>
                                    </div>
                                    {confirmationData.bookingDetails.specialRequests && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-2">Special Requests:</h4>
                                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                {confirmationData.bookingDetails.specialRequests}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <span className="font-semibold text-lg">€{confirmationData.paymentDetails.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span>{confirmationData.paymentDetails.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-sm">{confirmationData.paymentDetails.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Status:</span>
                                        <Badge className="bg-green-100 text-green-800">
                                            {confirmationData.paymentDetails.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar Actions */}
                    <motion.div
                        className="lg:col-span-1 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {/* Quick Actions */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handleDownloadReceipt}
                                    className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Receipt
                                </Button>

                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share Booking
                                </Button>

                                <Button
                                    onClick={() => navigate('/dashboard/bookings')}
                                    variant="outline"
                                    className="w-full flex items-center gap-2"
                                >
                                    View All Bookings
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Important Information */}
                        <Card className="shadow-lg bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Important Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-blue-800">
                                <div className="space-y-2">
                                    <p className="flex items-start gap-2">
                                        <span className="font-medium">•</span>
                                        <span>Please arrive 15 minutes before the start time</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="font-medium">•</span>
                                        <span>Bring a valid ID and comfortable clothing</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="font-medium">•</span>
                                        <span>Check weather conditions before your adventure</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="font-medium">•</span>
                                        <span>Contact us if you need to make changes to your booking</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Support */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Need Help?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Have questions about your booking? Our support team is here to help.
                                </p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span>support@adventure.com</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Continue Exploring */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Card className="shadow-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white">
                        <CardContent className="p-8">
                            <h3 className="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h3>
                            <p className="text-gray-300 mb-6">
                                Explore more amazing experiences and create unforgettable memories
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate('/')}
                                    className="bg-white text-gray-900 hover:bg-gray-100"
                                >
                                    Explore More Events
                                </Button>
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-gray-900"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <Footer />
        </div>
    )
}

export default EventBookingConfirmation
