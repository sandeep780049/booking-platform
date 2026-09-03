import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import { getHotelByOwnerId, getHotelBookings } from '../../Api/hotel.api.js';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader } from '../../components/Loader';
import { HotelUpdateModal } from '../../components/HotelUpdateModal';
import { HotelSidebar } from '../../components/Hotel/HotelSidebar';
import { HotelOverview } from '../../components/Hotel/HotelOverview';
import { HotelBookings } from '../../components/Hotel/HotelBookings';
import { HotelDocuments } from '../../components/Hotel/HotelDocuments';
import { HotelStatistics } from '../../components/Hotel/HotelStatistics';
import { HotelSettings } from '../../components/Hotel/HotelSettings';
import { useNavigate } from 'react-router-dom';
import { ChatLayout } from '../Chat/ChatLayout';
import { MessageCircle, X } from 'lucide-react';

export const HotelProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [hotel, setHotel] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [bookingStats, setBookingStats] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [updateType, setUpdateType] = useState('price');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const Navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);

    const fetchHotel = async () => {
        setLoading(true);
        try {
            const res = await getHotelByOwnerId(user.user._id);
            if (res.data && res.data.data && res.data.data.hotel && res.data.data.hotel.length > 0) {
                const hotelData = res.data.data.hotel[0];

                if (hotelData.verified === "pending") {
                    Navigate("/hotel/pending");
                    return;
                }

                setHotel(hotelData);

                // Fetch bookings for this hotel
                await fetchBookings(hotelData._id);
            }
        } catch (error) {
            console.error("Error fetching hotel:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (hotelId, page = 1, status = 'all') => {
        setBookingLoading(true);
        try {
            const queryParams = {
                page: page,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };

            if (status !== 'all') {
                queryParams.status = status;
            }

            const res = await getHotelBookings(hotelId, queryParams);

            if (res.data && res.data.data) {
                setBookings(res.data.data.bookings || []);
                setBookingStats(res.data.data.stats || null);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setBookings([]);
            setBookingStats(null);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleUpdateSuccess = (updatedHotel) => {
        setHotel(updatedHotel);
    };

    const openUpdateModal = (type) => {
        setUpdateType(type);
        setUpdateModalOpen(true);
    };

    const handleFilterChange = (filter) => {
        setBookingFilter(filter);
        if (hotel && hotel._id) {
            fetchBookings(hotel._id, 1, filter);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (user && user.user && user.user._id) {
            fetchHotel();
        }
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <Loader />
        </div>;
    }

    if (!hotel) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">No Hotel Found</h2>
                            <p className="text-muted-foreground mb-6">You don't have any hotel registered yet.</p>
                            <Button>Register Hotel</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64">
                        <HotelSidebar
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            hotel={hotel}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'overview' && (
                            <HotelOverview
                                hotel={hotel}
                                onUpdatePrice={() => openUpdateModal('price')}
                            />
                        )}

                        {activeTab === 'bookings' && (
                            <HotelBookings
                                bookings={bookings}
                                bookingStats={bookingStats}
                                bookingLoading={bookingLoading}
                                bookingFilter={bookingFilter}
                                onFilterChange={handleFilterChange}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <HotelDocuments hotel={hotel} />
                        )}

                        {activeTab === 'statistics' && (
                            <HotelStatistics
                                bookings={bookings}
                                bookingStats={bookingStats}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <HotelSettings
                                hotel={hotel}
                                onUpdateSuccess={handleUpdateSuccess}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Update Modal */}
            <HotelUpdateModal
                isOpen={updateModalOpen}
                onClose={() => setUpdateModalOpen(false)}
                hotel={hotel}
                onSuccess={handleUpdateSuccess}
                updateType={updateType}
            />

            {/* Floating Chat Button */}
            <button
                onClick={() => setChatOpen(!chatOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
                aria-label="Toggle chat"
            >
                {chatOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>

            {/* Chat Modal */}
            {chatOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setChatOpen(false)}
                            className="absolute top-4 right-4 z-50 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                        <ChatLayout />
                    </div>
                </div>
            )}
        </div>
    );
};
