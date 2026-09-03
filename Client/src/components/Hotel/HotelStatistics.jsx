import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Euro, Calendar, Users } from 'lucide-react';

export const HotelStatistics = ({ bookings, bookingStats }) => {
    // Process data for charts
    const revenueData = processRevenueData(bookings);
    const statusData = processStatusData(bookingStats);
    const monthlyData = processMonthlyData(bookings);

    const COLORS = ['#10b981', '#fbbf24', '#ef4444', '#6b7280'];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    €{bookingStats?.totalRevenue?.toFixed(2) || 0}
                                </p>
                            </div>
                            <Euro className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Bookings</p>
                                <p className="text-2xl font-bold">
                                    {bookings?.length || 0}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Confirmed Rate</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {calculateConfirmationRate(bookingStats)}%
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Avg. Booking Value</p>
                                <p className="text-2xl font-bold">
                                    €{calculateAvgBookingValue(bookings)}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    name="Revenue (€)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Booking Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Status</CardTitle>
                        <CardDescription>Distribution by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Monthly Bookings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Bookings</CardTitle>
                        <CardDescription>Number of bookings per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest booking activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map((booking, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <div>
                                        <p className="font-medium">{booking.user?.name || 'Guest'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">€{booking.amount?.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{booking.status}</p>
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Helper functions
const processRevenueData = (bookings) => {
    // Group by month and calculate revenue
    const monthlyRevenue = {};
    bookings.forEach(booking => {
        const month = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (booking.amount || 0);
    });
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));
};

const processStatusData = (stats) => {
    if (!stats) return [];
    return [
        { name: 'Confirmed', value: stats.confirmedBookings || 0 },
        { name: 'Pending', value: stats.pendingBookings || 0 },
        { name: 'Cancelled', value: stats.cancelledBookings || 0 },
    ].filter(item => item.value > 0);
};

const processMonthlyData = (bookings) => {
    const monthlyData = {};
    bookings.forEach(booking => {
        const month = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) {
            monthlyData[month] = { month, bookings: 0, revenue: 0 };
        }
        monthlyData[month].bookings += 1;
        monthlyData[month].revenue += booking.amount || 0;
    });
    return Object.values(monthlyData);
};

const calculateConfirmationRate = (stats) => {
    if (!stats || !stats.totalBookings) return 0;
    return ((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1);
};

const calculateAvgBookingValue = (bookings) => {
    if (!bookings || bookings.length === 0) return 0;
    const total = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    return (total / bookings.length).toFixed(2);
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
