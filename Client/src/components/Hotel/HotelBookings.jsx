import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader } from '../Loader';
import { Calendar, CreditCard, Euro, TrendingUp, Users, Phone, Mail } from 'lucide-react';

export const HotelBookings = ({ 
    bookings, 
    bookingStats, 
    bookingLoading, 
    bookingFilter, 
    onFilterChange 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Bookings Overview</CardTitle>
                    <CardDescription>Manage your hotel bookings and track revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Statistics Cards */}
                    {bookingStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Euro className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                                            <p className="text-lg font-bold">€{bookingStats.totalRevenue?.toFixed(2) || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Confirmed</p>
                                            <p className="text-lg font-bold">{bookingStats.confirmedBookings || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-yellow-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Pending</p>
                                            <p className="text-lg font-bold">{bookingStats.pendingBookings || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-red-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Cancelled</p>
                                            <p className="text-lg font-bold">{bookingStats.cancelledBookings || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Filter Buttons */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <Button
                            variant={bookingFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFilterChange('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={bookingFilter === 'confirmed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFilterChange('confirmed')}
                        >
                            Confirmed
                        </Button>
                        <Button
                            variant={bookingFilter === 'pending' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFilterChange('pending')}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={bookingFilter === 'cancelled' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onFilterChange('cancelled')}
                        >
                            Cancelled
                        </Button>
                    </div>

                    {/* Bookings List */}
                    {bookingLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader />
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <BookingCard 
                                    key={booking._id} 
                                    booking={booking}
                                    formatDate={formatDate}
                                    getStatusColor={getStatusColor}
                                    getPaymentStatusColor={getPaymentStatusColor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No bookings found</p>
                            <p className="text-sm text-muted-foreground">
                                {bookingFilter !== 'all'
                                    ? `No ${bookingFilter} bookings at the moment`
                                    : 'Bookings will appear here once customers make reservations'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const BookingCard = ({ booking, formatDate, getStatusColor, getPaymentStatusColor }) => {
    return (
        <Card className="border">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-lg">
                                {booking.user?.name || 'Guest'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{booking.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{booking.user?.phoneNumber || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Check-in</p>
                                <p className="font-medium">{formatDate(booking.checkInDate)}</p>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Check-out</p>
                                <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Rooms</p>
                                <p className="font-medium">{booking.numberOfRooms || 1}</p>
                            </div>
                            <div className="bg-muted/50 p-2 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Guests</p>
                                <p className="font-medium">{booking.guests || 1}</p>
                            </div>
                        </div>
                        {booking.specialRequests && (
                            <div className="mt-3 text-sm bg-blue-50 p-3 rounded">
                                <span className="font-medium text-blue-900">Special Requests:</span>
                                <p className="text-blue-700 mt-1">{booking.specialRequests}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2 md:min-w-[180px]">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                                €{booking.amount?.toFixed(2) || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                            {booking.status || 'pending'}
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                            Payment: {booking.paymentStatus || 'pending'}
                        </Badge>
                        {booking.modeOfPayment && (
                            <Badge variant="outline">
                                {booking.modeOfPayment}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
