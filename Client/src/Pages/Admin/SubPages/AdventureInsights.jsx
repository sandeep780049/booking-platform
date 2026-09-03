import { useState, useEffect } from 'react'
import { fetchAllAdventures } from '../../../Api/adventure.api'
import { useAdventureInsights } from '../../../hooks/useAdventureInsights'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Table } from 'antd'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
    TrendingUp, Users, Euro, CreditCard, RefreshCw, BarChart2, Compass,
} from 'lucide-react'

import { formatCurrency, formatCurrencyCompact } from '../../../utils/currency'

const sessionColumns = [
    {
        title: 'Session Date',
        dataIndex: 'date',
        key: 'date',
        render: (v) => v ? new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—',
    },
    { title: 'Bookings', dataIndex: 'bookings', key: 'bookings' },
    { title: 'Participants', dataIndex: 'participants', key: 'participants' },
    {
        title: 'Revenue',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (v) => formatCurrency(v),
    },
]

const recentColumns = [
    { title: 'Booking ID', dataIndex: 'id', key: 'id', render: (v) => <span className="font-mono text-xs">{v.slice(-8).toUpperCase()}</span> },
    { title: 'User', dataIndex: 'user', key: 'user' },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (v) => formatCurrency(v),
    },
]

function KPICard({ icon: Icon, title, value, sub, color }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`rounded-full p-1.5 ${color}`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    )
}

export default function AdventureInsights() {
    const [adventures, setAdventures] = useState([])
    const [adventuresLoading, setAdventuresLoading] = useState(true)
    const [selectedId, setSelectedId] = useState('')
    const [range, setRange] = useState('month')

    const { data, isLoading, error, refresh } = useAdventureInsights(selectedId, range)

    useEffect(() => {
        fetchAllAdventures()
            .then((res) => {
                const list = res?.data?.adventures ?? []
                setAdventures(list)
                if (list.length > 0) setSelectedId(list[0]._id)
            })
            .catch(() => setAdventures([]))
            .finally(() => setAdventuresLoading(false))
    }, [])

    const kpi = data?.kpi ?? { totalBookings: 0, totalRevenue: 0, uniqueParticipants: 0, avgBookingValue: 0 }
    const trend = data?.trend ?? []
    const sessions = (data?.sessions ?? []).map((s, i) => ({ ...s, key: s.id ?? i }))
    const recentBookings = (data?.recentBookings ?? []).map((b, i) => ({ ...b, key: b.id ?? i }))
    const selectedAdventure = data?.adventure

    const isEmpty = !isLoading && !error && !selectedId

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart2 className="h-6 w-6" />
                        Adventure Insights
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Per-adventure booking and revenue analytics
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={selectedId} onValueChange={setSelectedId} disabled={adventuresLoading}>
                        <SelectTrigger className="w-[200px]">
                            <Compass className="h-4 w-4 mr-1.5 text-muted-foreground" />
                            <SelectValue placeholder={adventuresLoading ? 'Loading…' : 'Select adventure'} />
                        </SelectTrigger>
                        <SelectContent>
                            {adventures.map((a) => (
                                <SelectItem key={a._id} value={a._id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Last 24 hours</SelectItem>
                            <SelectItem value="week">Last week</SelectItem>
                            <SelectItem value="month">Last month</SelectItem>
                            <SelectItem value="year">Last year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={refresh} disabled={isLoading || !selectedId} title="Refresh">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-center justify-between py-3 text-sm text-destructive">
                        <span>Failed to load insights. Please try again.</span>
                        <Button size="sm" variant="destructive" onClick={refresh} disabled={isLoading}>Retry</Button>
                    </CardContent>
                </Card>
            )}

            {isEmpty ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Compass className="h-10 w-10 opacity-30" />
                        <p>Select an adventure to view its insights</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {selectedAdventure && (
                        <div className="flex items-center gap-3">
                            {selectedAdventure.thumbnail && (
                                <img
                                    src={selectedAdventure.thumbnail}
                                    alt={selectedAdventure.name}
                                    className="h-10 w-10 rounded-lg object-cover border"
                                />
                            )}
                            <div>
                                <p className="font-semibold text-lg leading-tight">{selectedAdventure.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">Showing {range === 'day' ? 'last 24 hours' : `last ${range}`}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <KPICard
                            icon={CreditCard}
                            title="Total Bookings"
                            value={kpi.totalBookings.toLocaleString()}
                            color="bg-blue-500"
                        />
                        <KPICard
                            icon={Euro}
                            title="Total Revenue"
                            value={formatCurrency(kpi.totalRevenue)}
                            color="bg-green-500"
                        />
                        <KPICard
                            icon={Users}
                            title="Unique Participants"
                            value={kpi.uniqueParticipants.toLocaleString()}
                            color="bg-purple-500"
                        />
                        <KPICard
                            icon={TrendingUp}
                            title="Avg Booking Value"
                            value={formatCurrency(kpi.avgBookingValue)}
                            color="bg-orange-500"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Trend</CardTitle>
                            <CardDescription>Bookings and revenue over the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && !trend.length ? (
                                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading chart…</div>
                            ) : trend.length === 0 ? (
                                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No booking data for this period.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
                                        <Tooltip
                                            formatter={(value, name) => name === 'revenue' ? [formatCurrency(value), 'Revenue'] : [value, 'Bookings']}
                                            labelFormatter={(l) => l}
                                        />
                                        <Area yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fill="url(#bookingGrad)" dot={false} name="bookings" />
                                        <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" dot={false} name="revenue" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Session Breakdown</CardTitle>
                                <CardDescription>Individual session performance</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table
                                    columns={sessionColumns}
                                    dataSource={sessions}
                                    loading={isLoading}
                                    pagination={{ pageSize: 8, size: 'small' }}
                                    size="small"
                                    className="rounded-b-lg overflow-hidden"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Bookings</CardTitle>
                                <CardDescription>Latest 10 bookings for this adventure</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table
                                    columns={recentColumns}
                                    dataSource={recentBookings}
                                    loading={isLoading}
                                    pagination={{ pageSize: 8, size: 'small' }}
                                    size="small"
                                    className="rounded-b-lg overflow-hidden"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
