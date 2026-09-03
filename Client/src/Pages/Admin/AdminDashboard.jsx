import { Table } from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  Euro,
  Globe,
  MapPin,
  Mountain,
  RefreshCw,
  TrendingUp,
  Compass,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { getAdminDashboardLocations } from "../../Api/admin.api";

import { formatCurrency } from "../../utils/currency";

const defaultDashboardStats = {
  totalRevenue: 0,
  totalUsers: 0,
  activeAdventures: 0,
  totalBookings: 0,
  revenueIncrease: 0,
  userIncrease: 0,
  adventureIncrease: 0,
  bookingIncrease: 0,
  recentBookings: [],
  topAdventures: [],
  monthlyRevenue: [],
};

const bookingColumns = [
  { title: "Booking ID", dataIndex: "id", key: "id" },
  { title: "User", dataIndex: "user", key: "user" },
  { title: "Adventure / Event", dataIndex: "adventure", key: "adventure" },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (value) => formatCurrency(value ?? 0),
  },
];

function StatCard({ title, icon: Icon, value, increase, timeRange }) {
  const isPositive = increase >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span className={`flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(increase ?? 0).toFixed(1)}%
          </span>
          <span>vs last {timeRange}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("month");
  const [locations, setLocations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const { data, isLoading, error, refresh } = useAdminDashboard(timeRange, selectedLocationId);
  const stats = data ?? defaultDashboardStats;

  // Fetch all locations for the filter dropdowns
  useEffect(() => {
    getAdminDashboardLocations()
      .then((res) => setLocations(res?.data ?? []))
      .catch(() => setLocations([]));
  }, []);

  // Derived country and city lists
  const countries = useMemo(() => {
    const unique = [...new Set(locations.map((l) => l.country))].filter(Boolean).sort();
    return unique;
  }, [locations]);

  const citiesForCountry = useMemo(() => {
    if (selectedCountry === "all") return [];
    const unique = [
      ...new Set(
        locations.filter((l) => l.country === selectedCountry).map((l) => l.city)
      ),
    ]
      .filter(Boolean)
      .sort();
    return unique;
  }, [locations, selectedCountry]);

  const locationsForCity = useMemo(() => {
    if (selectedCountry === "all") return [];
    if (selectedCity === "all") {
      return locations.filter((l) => l.country === selectedCountry);
    }
    return locations.filter(
      (l) => l.country === selectedCountry && l.city === selectedCity
    );
  }, [locations, selectedCountry, selectedCity]);

  const handleCountryChange = (val) => {
    setSelectedCountry(val);
    setSelectedCity("all");
    setSelectedLocationId(val === "all" ? null : null);
  };

  const handleCityChange = (val) => {
    setSelectedCity(val);
    setSelectedLocationId(null);
  };

  const handleLocationChange = (val) => {
    setSelectedLocationId(val === "all" ? null : val);
  };

  const isFiltered = selectedLocationId !== null;

  const activeFilterLabel = useMemo(() => {
    if (!isFiltered) return null;
    const loc = locations.find((l) => String(l.id) === String(selectedLocationId));
    return loc ? `${loc.name} · ${loc.city}, ${loc.country}` : null;
  }, [isFiltered, selectedLocationId, locations]);

  const recentBookingsData = useMemo(
    () => stats.recentBookings.map((booking) => ({ ...booking, key: booking.id })),
    [stats.recentBookings]
  );

  const maxTopAdventureBookings = useMemo(() => {
    if (!stats.topAdventures.length) return 1;
    return stats.topAdventures.reduce(
      (max, adventure) => Math.max(max, adventure.bookings ?? 0),
      1
    );
  }, [stats.topAdventures]);

  const averageBookingValue = useMemo(() => {
    if (!stats.totalBookings) return 0;
    return stats.totalRevenue / stats.totalBookings;
  }, [stats.totalRevenue, stats.totalBookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>

          {/* Country filter */}
          <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={locations.length === 0}>
            <SelectTrigger className="min-w-[130px] w-auto">
              <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City filter — only shown when a country is selected */}
          {selectedCountry !== "all" && citiesForCountry.length > 0 && (
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="min-w-[130px] w-auto">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {citiesForCountry.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Specific location — only shown when country is selected */}
          {selectedCountry !== "all" && locationsForCity.length > 0 && (
            <Select
              value={selectedLocationId ?? "all"}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger className="w-[160px]">
                <Compass className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locationsForCity.map((loc) => (
                  <SelectItem key={String(loc.id)} value={String(loc.id)}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isLoading}
            title="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Active filter badge */}
      {isFiltered && activeFilterLabel && (
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            <MapPin className="h-3.5 w-3.5" />
            {activeFilterLabel}
            <button
              className="ml-1 hover:text-destructive transition-colors"
              onClick={() => {
                setSelectedLocationId(null);
                setSelectedCity("all");
                setSelectedCountry("all");
              }}
            >
              ×
            </button>
          </span>
          <span className="text-muted-foreground">Showing location-specific data</span>
        </div>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-between py-3 text-sm text-destructive">
            <span>Failed to load dashboard data. Please try again.</span>
            <Button size="sm" variant="destructive" onClick={refresh} disabled={isLoading}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          icon={Euro}
          value={formatCurrency(stats.totalRevenue)}
          increase={stats.revenueIncrease}
          timeRange={timeRange}
        />
        <StatCard
          title="Total Users"
          icon={Users}
          value={stats.totalUsers.toLocaleString()}
          increase={stats.userIncrease}
          timeRange={timeRange}
        />
        <StatCard
          title="Active Adventures"
          icon={Mountain}
          value={stats.activeAdventures}
          increase={stats.adventureIncrease}
          timeRange={timeRange}
        />
        <StatCard
          title="Total Bookings"
          icon={CreditCard}
          value={stats.totalBookings.toLocaleString()}
          increase={stats.bookingIncrease}
          timeRange={timeRange}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              {isFiltered && activeFilterLabel
                ? `Revenue for ${activeFilterLabel}`
                : "Monthly revenue for the last 12 months"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <RevenueChart
                data={stats.monthlyRevenue}
                isLoading={isLoading && !stats.monthlyRevenue.length}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Adventures</CardTitle>
            <CardDescription>
              {isFiltered ? "Top adventures at selected location" : "Most popular adventures by bookings"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAdventures.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not enough adventure data yet.</p>
              ) : (
                stats.topAdventures.map((adventure, index) => (
                  <div key={adventure.id ?? index} className="flex items-center space-x-4">
                    <div className="w-[32px] text-center">
                      <span className="text-xl font-bold text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{adventure.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{(adventure.bookings ?? 0).toLocaleString()} bookings</span>
                        <span className="mx-2">•</span>
                        <span>{formatCurrency(adventure.revenue ?? 0)}</span>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.max(
                              (adventure.bookings / maxTopAdventureBookings) * 100,
                              6
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings + quick stats */}
      <div className="flex flex-col">
        <Card className="md:col-span-2 col-span-1">
          <Table
            className="w-full"
            columns={bookingColumns}
            dataSource={recentBookingsData}
            loading={isLoading && !stats.recentBookings.length}
            pagination={false}
          />
        </Card>

        <Card className="col-span-1 md:col-span-1 mt-5">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full p-1 bg-green-100">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Avg. Booking Value</span>
                </div>
                <span className="text-sm font-bold">{formatCurrency(averageBookingValue)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full p-1 bg-purple-100">
                    <Compass className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Top Adventure</span>
                </div>
                <span className="text-sm font-bold">{stats.topAdventures[0]?.name ?? "—"}</span>
              </div>

              {isFiltered && activeFilterLabel && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full p-1 bg-blue-100">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Filtered Location</span>
                  </div>
                  <span className="text-sm font-bold text-right max-w-[140px] truncate">{activeFilterLabel}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading revenue...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No revenue data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <XAxis dataKey="month" stroke="#000000" />
        <YAxis stroke="#000000" />
        <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} labelFormatter={(label) => label} />
        <Line type="monotone" dataKey="revenue" stroke="#00bfa0" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
