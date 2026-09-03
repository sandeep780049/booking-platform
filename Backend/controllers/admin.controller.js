import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { Booking } from "../models/booking.model.js";
import { EventBooking } from "../models/eventBooking.model.js";
import { ItemBooking } from "../models/itemBooking.model.js";
import { HotelBooking } from "../models/hotelBooking.model.js";
import { Adventure } from "../models/adventure.model.js";
import { Location } from "../models/location.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getUserPermissions,
  isSuperAdmin,
  PERMISSIONS
} from "../config/permissions.js";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const percentageChange = (current = 0, previous = 0) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const diff = ((current - previous) / previous) * 100;
  return Number(diff.toFixed(1));
};

const resolvePeriods = (range = "month") => {
  const now = new Date();
  let currentStart;
  switch (range) {
    case "day":
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week": {
      currentStart = new Date(now);
      currentStart.setHours(0, 0, 0, 0);
      currentStart.setDate(currentStart.getDate() - 6);
      break;
    }
    case "year":
      currentStart = new Date(now.getFullYear(), 0, 1);
      break;
    case "month":
    default:
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const previousStart = new Date(currentStart);

  if (range === "day") {
    previousStart.setDate(previousStart.getDate() - 1);
  } else if (range === "week") {
    previousStart.setDate(previousStart.getDate() - 7);
  } else if (range === "month") {
    previousStart.setMonth(previousStart.getMonth() - 1);
  } else {
    previousStart.setFullYear(previousStart.getFullYear() - 1);
  }

  const previousEnd = new Date(currentStart.getTime() - 1);

  return {
    now,
    currentStart,
    previousStart,
    previousEnd,
  };
};

const buildMatch = (base, start, end) => {
  const match = { ...base };
  if (start || end) {
    match.createdAt = {};
    if (start) {
      match.createdAt.$gte = start;
    }
    if (end) {
      match.createdAt.$lte = end;
    }
  }
  return match;
};

const summariseAggregate = (result = []) => ({
  totalAmount: result[0]?.totalAmount ?? 0,
  count: result[0]?.count ?? 0,
});

const summaryPipeline = (match) => [
  { $match: match },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
      count: { $sum: 1 },
    },
  },
];

export const getAdventureInsights = asyncHandler(async (req, res) => {
  const { adventureId } = req.params
  const { range = 'month' } = req.query

  if (!adventureId) throw new ApiError(400, 'Adventure ID is required')

  const adventure = await Adventure.findById(adventureId).select('name thumbnail')
  if (!adventure) throw new ApiError(404, 'Adventure not found')

  const { now, currentStart } = resolvePeriods(range)

  let bucketCount, bucketMs, dateFormat, labelFormatter, bucketStart
  if (range === 'day') {
    bucketCount = 24; bucketMs = 60 * 60 * 1000
    bucketStart = new Date(now.getTime() - (bucketCount - 1) * bucketMs)
    dateFormat = '%Y-%m-%dT%H:00:00'
    labelFormatter = (d) => `${d.getHours()}:00`
  } else if (range === 'week') {
    bucketCount = 7; bucketMs = 24 * 60 * 60 * 1000
    bucketStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (bucketCount - 1))
    dateFormat = '%Y-%m-%d'
    labelFormatter = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } else if (range === 'month') {
    bucketCount = 30; bucketMs = 24 * 60 * 60 * 1000
    bucketStart = new Date(now.getTime() - (bucketCount - 1) * bucketMs)
    dateFormat = '%Y-%m-%d'
    labelFormatter = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } else {
    bucketCount = 12; bucketMs = null
    bucketStart = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1), 1)
    dateFormat = '%Y-%m'
    labelFormatter = (d) => monthNames[d.getMonth()]
  }

  const baseBookingMatch = {
    status: { $ne: 'cancelled' },
    createdAt: { $gte: currentStart, $lte: now },
  }

  const adventureObjectId = adventure._id

  const [totals, trend, sessionBreakdown, recentRaw] = await Promise.all([
    Booking.aggregate([
      { $match: baseBookingMatch },
      { $lookup: { from: 'sessions', localField: 'session', foreignField: '_id', as: 'session' } },
      { $unwind: '$session' },
      { $match: { 'session.adventureId': adventureObjectId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$amount', 0] } },
          uniqueParticipants: { $addToSet: '$user' },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { ...baseBookingMatch, createdAt: { $gte: bucketStart, $lte: now } } },
      { $lookup: { from: 'sessions', localField: 'session', foreignField: '_id', as: 'session' } },
      { $unwind: '$session' },
      { $match: { 'session.adventureId': adventureObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          bookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
    ]),
    Booking.aggregate([
      { $match: baseBookingMatch },
      { $lookup: { from: 'sessions', localField: 'session', foreignField: '_id', as: 'sessionDoc' } },
      { $unwind: '$sessionDoc' },
      { $match: { 'sessionDoc.adventureId': adventureObjectId } },
      {
        $group: {
          _id: '$sessionDoc._id',
          sessionDate: { $first: '$sessionDoc.startTime' },
          bookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$amount', 0] } },
          participants: { $addToSet: '$user' },
        },
      },
      { $sort: { sessionDate: -1 } },
      { $limit: 20 },
    ]),
    Booking.find(baseBookingMatch)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: 'user', select: 'name email' })
      .populate({
        path: 'session',
        match: { adventureId: adventureObjectId },
        select: 'startTime',
      })
      .select('amount createdAt user session'),
  ])

  const kpi = totals[0] ?? { totalBookings: 0, totalRevenue: 0, uniqueParticipants: [] }

  const trendMap = new Map(trend.map(({ _id, bookings, revenue }) => [_id, { bookings, revenue }]))
  const pad = (n) => String(n).padStart(2, '0')
  const formatKey = (date) => {
    const Y = date.getFullYear(), M = pad(date.getMonth() + 1), D = pad(date.getDate()), H = pad(date.getHours())
    if (dateFormat === '%Y-%m-%dT%H:00:00') return `${Y}-${M}-${D}T${H}:00:00`
    if (dateFormat === '%Y-%m-%d') return `${Y}-${M}-${D}`
    return `${Y}-${M}`
  }
  const trendData = []
  for (let i = 0; i < bucketCount; i++) {
    const date = range === 'year'
      ? new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1) + i, 1)
      : new Date(bucketStart.getTime() + i * bucketMs)
    const key = formatKey(date)
    const bucket = trendMap.get(key) ?? { bookings: 0, revenue: 0 }
    trendData.push({ label: labelFormatter(date), bookings: bucket.bookings, revenue: bucket.revenue })
  }

  const recentBookings = recentRaw
    .filter((b) => b.session)
    .map((b) => ({
      id: b._id.toString(),
      user: b.user?.name ?? b.user?.email ?? 'Unknown',
      date: b.createdAt,
      amount: b.amount ?? 0,
    }))

  res.status(200).json(new ApiResponse(200, {
    adventure: { id: adventure._id, name: adventure.name, thumbnail: adventure.thumbnail },
    kpi: {
      totalBookings: kpi.totalBookings,
      totalRevenue: kpi.totalRevenue,
      uniqueParticipants: kpi.uniqueParticipants.length,
      avgBookingValue: kpi.totalBookings > 0 ? +(kpi.totalRevenue / kpi.totalBookings).toFixed(2) : 0,
    },
    trend: trendData,
    sessions: sessionBreakdown.map((s) => ({
      id: s._id.toString(),
      date: s.sessionDate,
      bookings: s.bookings,
      revenue: s.revenue,
      participants: s.participants.length,
    })),
    recentBookings,
  }, 'Adventure insights retrieved'))
})

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { range = "month", locationId } = req.query;

  // If locationId given, resolve adventure IDs that belong to that location
  let filteredAdventureIds = null;
  if (locationId) {
    const adventures = await Adventure.find({ location: locationId }).select("_id");
    filteredAdventureIds = adventures.map((a) => a._id);
  }
  const { now, currentStart, previousStart, previousEnd } = resolvePeriods(range);

  const bookingMatch = { status: { $ne: "cancelled" } };
  const eventMatch = {
    status: { $ne: "cancelled" },
    paymentStatus: "completed",
  };
  const itemMatch = { status: { $ne: "cancelled" }, paymentStatus: "completed" };
  const hotelMatch = { status: { $ne: "cancelled" }, paymentStatus: "completed" };

  // Adventure booking pre-filter pipeline stages when locationId is active
  const locationAdventureStages = filteredAdventureIds
    ? [
        { $lookup: { from: "sessions", localField: "session", foreignField: "_id", as: "_sess" } },
        { $unwind: "$_sess" },
        { $match: { "_sess.adventureId": { $in: filteredAdventureIds } } },
      ]
    : [];

  const locationBookingSummaryPipeline = (match) =>
    filteredAdventureIds
      ? [
          { $match: match },
          ...locationAdventureStages,
          { $group: { _id: null, totalAmount: { $sum: { $ifNull: ["$amount", 0] } }, count: { $sum: 1 } } },
        ]
      : summaryPipeline(match);

  const monthsLookbackStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  // Determine bucketization for the revenue chart based on requested range
  let bucketStart;
  let bucketCount;
  let bucketMs;
  let dateFormat; // for $dateToString
  let labelFormatter; // function(date) -> label

  if (range === "day") {
    // last 24 hours, hourly buckets
    bucketCount = 24;
    bucketMs = 60 * 60 * 1000;
    bucketStart = new Date(now.getTime() - (bucketCount - 1) * bucketMs);
    dateFormat = "%Y-%m-%dT%H:00:00";
    labelFormatter = (d) => `${d.getHours()}:00`;
  } else if (range === "week") {
    // last 7 days, daily buckets
    bucketCount = 7;
    bucketMs = 24 * 60 * 60 * 1000;
    bucketStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (bucketCount - 1));
    dateFormat = "%Y-%m-%d";
    labelFormatter = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else if (range === "month") {
    // last 30 days, daily buckets
    bucketCount = 30;
    bucketMs = 24 * 60 * 60 * 1000;
    bucketStart = new Date(now.getTime() - (bucketCount - 1) * bucketMs);
    dateFormat = "%Y-%m-%d";
    labelFormatter = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } else {
    // year (or default) - last 12 months, monthly buckets
    bucketCount = 12;
    bucketMs = null;
    bucketStart = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1), 1);
    dateFormat = "%Y-%m";
    labelFormatter = (d) => monthNames[d.getMonth()];
  }

  const [
    bookingTotals,
    eventTotals,
    itemTotals,
    hotelTotals,
    bookingCurrent,
    bookingPrevious,
    eventCurrent,
    eventPrevious,
    itemCurrent,
    itemPrevious,
    hotelCurrent,
    hotelPrevious,
    totalUsers,
    usersCurrent,
    usersPrevious,
    totalAdventures,
    adventuresCurrent,
    adventuresPrevious,
    topAdventuresRaw,
    bookingMonthly,
    eventMonthly,
    itemMonthly,
    hotelMonthly,
    recentAdventureBookings,
    recentEventBookings,
    recentItemBookings,
    recentHotelBookings,
  ] = await Promise.all([
    Booking.aggregate(locationBookingSummaryPipeline(bookingMatch)),
    EventBooking.aggregate(summaryPipeline(eventMatch)),
    ItemBooking.aggregate(summaryPipeline(itemMatch)),
    HotelBooking.aggregate(summaryPipeline(hotelMatch)),
    // Totals for the selected current period (currentStart -> now)
    Booking.aggregate(locationBookingSummaryPipeline(buildMatch(bookingMatch, currentStart, now))),
    Booking.aggregate(locationBookingSummaryPipeline(buildMatch(bookingMatch, previousStart, previousEnd))),
    EventBooking.aggregate(summaryPipeline(buildMatch(eventMatch, currentStart, now))),
    EventBooking.aggregate(summaryPipeline(buildMatch(eventMatch, previousStart, previousEnd))),
    ItemBooking.aggregate(summaryPipeline(buildMatch(itemMatch, currentStart, now))),
    ItemBooking.aggregate(summaryPipeline(buildMatch(itemMatch, previousStart, previousEnd))),
    HotelBooking.aggregate(summaryPipeline(buildMatch(hotelMatch, currentStart, now))),
    HotelBooking.aggregate(summaryPipeline(buildMatch(hotelMatch, previousStart, previousEnd))),
    User.countDocuments({ role: { $in: ["user", "instructor", "hotel"] } }),
    User.countDocuments({
      role: { $in: ["user", "instructor", "hotel"] },
      createdAt: { $gte: currentStart },
    }),
    User.countDocuments({
      role: { $in: ["user", "instructor", "hotel"] },
      createdAt: { $gte: previousStart, $lte: previousEnd },
    }),
    filteredAdventureIds
      ? Promise.resolve(filteredAdventureIds.length)
      : Adventure.countDocuments(),
    filteredAdventureIds
      ? Promise.resolve(filteredAdventureIds.length)
      : Adventure.countDocuments({ createdAt: { $gte: currentStart } }),
    filteredAdventureIds
      ? Promise.resolve(0)
      : Adventure.countDocuments({ createdAt: { $gte: previousStart, $lte: previousEnd } }),
    Booking.aggregate([
      { $match: buildMatch(bookingMatch, currentStart, now) },
      { $lookup: { from: "sessions", localField: "session", foreignField: "_id", as: "session" } },
      { $unwind: "$session" },
      { $lookup: { from: "adventures", localField: "session.adventureId", foreignField: "_id", as: "adventure" } },
      { $unwind: "$adventure" },
      ...(filteredAdventureIds ? [{ $match: { "adventure._id": { $in: filteredAdventureIds } } }] : []),
      {
        $group: {
          _id: "$adventure._id",
          name: { $first: "$adventure.name" },
          bookings: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
    ]),
    // Revenue buckets for chart
    Booking.aggregate([
      { $match: buildMatch(bookingMatch, bucketStart, now) },
      ...locationAdventureStages,
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]),
    EventBooking.aggregate([
      { $match: buildMatch(eventMatch, bucketStart, now) },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]),
    ItemBooking.aggregate([
      { $match: buildMatch(itemMatch, bucketStart, now) },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]),
    HotelBooking.aggregate([
      { $match: buildMatch(hotelMatch, bucketStart, now) },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]),
    Booking.find(buildMatch(bookingMatch, currentStart, now))
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "user", select: "name" })
      .populate({
        path: "session",
        populate: { path: "adventureId", select: "name" },
      })
      .select("amount createdAt"),
    EventBooking.find(buildMatch(eventMatch, currentStart, now))
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "user", select: "name" })
      .populate({ path: "event", select: "title" })
      .select("amount createdAt"),
    ItemBooking.find(buildMatch(itemMatch, currentStart, now))
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "user", select: "name" })
      .select("amount createdAt"),
    HotelBooking.find(buildMatch(hotelMatch, currentStart, now))
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: "user", select: "name" })
      .populate({ path: "hotel", select: "name" })
      .select("amount createdAt hotel"),
  ]);


  const bookingCurrentSummary = summariseAggregate(bookingCurrent);
  const bookingPreviousSummary = summariseAggregate(bookingPrevious);
  const eventCurrentSummary = summariseAggregate(eventCurrent);
  const eventPreviousSummary = summariseAggregate(eventPrevious);
  const itemCurrentSummary = summariseAggregate(itemCurrent);
  const itemPreviousSummary = summariseAggregate(itemPrevious);
  const hotelCurrentSummary = summariseAggregate(hotelCurrent);
  const hotelPreviousSummary = summariseAggregate(hotelPrevious);
  const revenueCurrent =
    bookingCurrentSummary.totalAmount +
    eventCurrentSummary.totalAmount +
    itemCurrentSummary.totalAmount +
    hotelCurrentSummary.totalAmount;
  const revenuePrevious =
    bookingPreviousSummary.totalAmount +
    eventPreviousSummary.totalAmount +
    itemPreviousSummary.totalAmount +
    hotelPreviousSummary.totalAmount;
  const bookingsCurrentCount =
    bookingCurrentSummary.count +
    eventCurrentSummary.count +
    itemCurrentSummary.count +
    hotelCurrentSummary.count;
  const bookingsPreviousCount =
    bookingPreviousSummary.count +
    eventPreviousSummary.count +
    itemPreviousSummary.count +
    hotelPreviousSummary.count;

  // Make dashboard totals reflect the selected time range (current period)
  const totalRevenue = revenueCurrent;
  const totalBookings = bookingsCurrentCount;

  const revenueIncrease = percentageChange(revenueCurrent, revenuePrevious);
  const userIncrease = percentageChange(usersCurrent, usersPrevious);
  const adventureIncrease = percentageChange(adventuresCurrent, adventuresPrevious);
  const bookingIncrease = percentageChange(bookingsCurrentCount, bookingsPreviousCount);

  const monthlyRevenueMap = new Map();
  [...bookingMonthly, ...eventMonthly, ...itemMonthly, ...hotelMonthly].forEach(({ _id, revenue }) => {
    // aggregated _id is a formatted date string (per dateFormat)
    const key = _id;
    monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) ?? 0) + revenue);
  });

  const pad = (n) => String(n).padStart(2, "0");
  const formatKey = (date) => {
    const Y = date.getFullYear();
    const M = pad(date.getMonth() + 1);
    const D = pad(date.getDate());
    const H = pad(date.getHours());
    if (dateFormat === "%Y-%m-%dT%H:00:00") {
      return `${Y}-${M}-${D}T${H}:00:00`;
    }
    if (dateFormat === "%Y-%m-%d") {
      return `${Y}-${M}-${D}`;
    }
    // %Y-%m
    return `${Y}-${M}`;
  };

  const monthlyRevenue = [];
  for (let i = 0; i < bucketCount; i += 1) {
    let date;
    if (range === "year") {
      // iterate months
      date = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1) + i, 1);
    } else {
      date = new Date(bucketStart.getTime() + i * bucketMs);
    }
    const key = formatKey(date);
    monthlyRevenue.push({
      month: labelFormatter(date),
      revenue: monthlyRevenueMap.get(key) ?? 0,
    });
  }

  const recentBookings = [
    ...recentAdventureBookings.map((booking) => ({
      id: `B-${booking._id.toString()}`,
      type: "session",
      user: booking.user?.name ?? "Unknown",
      adventure: booking.session?.adventureId?.name ?? "Adventure",
      date: booking.createdAt,
      amount: booking.amount ?? 0,
    })),
    ...recentEventBookings.map((booking) => ({
      id: `E-${booking._id.toString()}`,
      type: "event",
      user: booking.user?.name ?? "Unknown",
      adventure: booking.event?.title ?? "Event",
      date: booking.createdAt,
      amount: booking.amount ?? 0,
    })),
    ...recentItemBookings.map((booking) => ({
      id: `I-${booking._id.toString()}`,
      type: "item",
      user: booking.user?.name ?? "Unknown",
      adventure: "Item",
      date: booking.createdAt,
      amount: booking.amount ?? 0,
    })),
    ...recentHotelBookings.map((booking) => ({
      id: `H-${booking._id.toString()}`,
      type: "hotel",
      user: booking.user?.name ?? "Unknown",
      adventure: booking.hotel?.name ?? "Hotel",
      date: booking.createdAt,
      amount: booking.amount ?? 0,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((entry) => ({
      ...entry,
      date: entry.date,
    }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRevenue,
        totalUsers: usersCurrent,
        activeAdventures: adventuresCurrent,
        totalBookings,
        revenueIncrease,
        userIncrease,
        adventureIncrease,
        bookingIncrease,
        recentBookings,
        topAdventures: topAdventuresRaw.map((item) => ({
          id: item._id,
          name: item.name,
          bookings: item.bookings,
          revenue: item.revenue,
        })),
        monthlyRevenue,
      },
      "Dashboard stats retrieved successfully"
    )
  );
});

export const getDashboardLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({}).select("name address").lean()

  const parseAddress = (address = "") => {
    const allParts = address.split(",").map((s) => s.trim()).filter(Boolean)
    // Strip purely numeric segments (postcodes like "75007", "56001")
    const parts = allParts.filter((p) => !/^\d[\d\s-]*$/.test(p))
    return {
      country: parts.length > 0 ? parts[parts.length - 1] : "Unknown",
      // Second-to-last non-numeric segment is typically the state/city; third is the actual city
      // We prefer the third from end when available (skips state), otherwise fall back to second
      city: parts.length > 2
        ? parts[parts.length - 2]
        : parts.length > 1
          ? parts[parts.length - 2]
          : "Unknown",
    }
  }

  const data = locations.map((loc) => ({
    id: loc._id,
    name: loc.name,
    address: loc.address,
    ...parseAddress(loc.address),
  }))

  res.status(200).json(new ApiResponse(200, data, "Locations fetched"))
})

export const getAllAdmins = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10, search = '', role, adminRole } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build base query. If role is provided and not 'all', filter by it.
  // If role is missing or 'all', don't filter by role (return all users matching search).
  const query = {};
  if (role && String(role).toLowerCase() !== 'all') {
    query.role = role;
  }

  // If search provided, match name or email (case-insensitive)
  if (search && String(search).trim() !== '') {
    const s = String(search).trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }

  // If adminRole filter provided, we need to lookup the Admin document and filter by admin.adminRole
  if (adminRole && String(adminRole).trim() !== '') {
    // ensure we're looking at admin users
    if (!query.role) query.role = 'admin';

    // Build aggregation pipeline: match users, lookup admin doc, filter by adminRole, then paginate
    const matchStage = { $match: query };
    const lookupStage = {
      $lookup: {
        from: 'admins',
        localField: 'admin',
        foreignField: '_id',
        as: 'adminDoc',
      },
    };
    const unwindStage = { $unwind: '$adminDoc' };
    // When filtering for the special 'Admin' adminRole we treat empty adminRole arrays
    // as super-admins and include them in the results. For other adminRole values
    // match documents where the adminRole array contains the requested value.
    let matchAdminRoleStage;
    if (String(adminRole) === 'Admin') {
      matchAdminRoleStage = {
        $match: {
          $or: [
            { 'adminDoc.adminRole': adminRole },
            // include admins with an empty adminRole array (super-admins)
            { $expr: { $eq: [{ $size: '$adminDoc.adminRole' }, 0] } },
          ],
        },
      };
    } else {
      matchAdminRoleStage = { $match: { 'adminDoc.adminRole': adminRole } };
    }

    // For total count we run the pipeline without skip/limit
    const countPipeline = [matchStage, lookupStage, unwindStage, matchAdminRoleStage, { $count: 'count' }];
    const countRes = await User.aggregate(countPipeline);
    const total = countRes[0]?.count ?? 0;

    // For results include pagination and project admin as the populated doc
    const projStage = {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        admin: '$adminDoc',
        createdAt: 1,
      },
    };

    const pipeline = [matchStage, lookupStage, unwindStage, matchAdminRoleStage, projStage, { $skip: skip }, { $limit: parseInt(limit) }];
    const admins = await User.aggregate(pipeline);

    res.status(200).json({
      admins,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
    return;
  }

  const admins = await User.find(query)
    .populate('admin', 'adminRole')
    .skip(skip)
    .limit(parseInt(limit))
    .select('_id name email role admin createdAt');

  const total = await User.countDocuments(query);
  res.status(200).json({
    admins,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, adminRoles } = req.body;
  if (!name || !email || !password || !adminRoles) {
    throw new ApiError(400, "All fields are required");
  }
  const existingAdmin = await User.findOne({ email: email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin with this email already exists");
  }

  // Create Admin document first
  const adminDoc = await Admin.create({
    adminRole: Array.isArray(adminRoles) ? adminRoles : [adminRoles],
  });

  // Create User with reference to Admin
  const newAdmin = await User.create({
    name: name,
    email: email,
    verified: true,
    password: password,
    role: "admin",
    admin: adminDoc._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newAdmin, "Admin created successfully"));
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, adminRoles, password } = req.body;
  if (!name || !email || !adminRoles) {
    throw new ApiError(400, "Name, email, and admin roles are required");
  }
  const admin = await User.findById(id);
  if (!admin || admin.role !== "admin") {
    throw new ApiError(404, "Admin not found");
  }
  const updatedAdmin = await User.findByIdAndUpdate(
    id,
    {
      name: name,
      email: email,
      password: password,
    },
    { new: true }
  );
  if (!updatedAdmin) {
    throw new ApiError(500, "Failed to update admin");
  }
  const updatedAdminDoc = await Admin.findByIdAndUpdate(
    updatedAdmin.admin,
    {
      adminRole: Array.isArray(adminRoles) ? adminRoles : [adminRoles],
    },
    { new: true }
  );
  if (!updatedAdminDoc) {
    throw new ApiError(500, "Failed to update admin roles");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, "Admin updated successfully"));
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Admin ID is required");
  }

  const admin = await User.findById(id);
  if (!admin || admin.role !== "admin") {
    throw new ApiError(404, "Admin not found");
  }
  await User.findByIdAndDelete(id);
  await Admin.findByIdAndDelete(admin.admin);
  res.status(200).json(new ApiResponse(200, "Admin deleted successfully"));
});

/**
 * Get current admin user's permissions
 * Used by frontend for RBAC
 */
export const getAdminPermissions = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    throw new ApiError(403, "Admin access required");
  }

  let adminRoles = [];
  if (user.admin) {
    const adminDoc = await Admin.findById(user.admin);
    adminRoles = adminDoc?.adminRole || [];
  }

  const isSuperAdminUser = isSuperAdmin(adminRoles);
  const permissions = getUserPermissions(adminRoles);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isSuperAdmin: isSuperAdminUser,
        adminRoles,
        permissions,
        allPermissions: PERMISSIONS, // Send all permission constants for frontend reference
      },
      "Permissions retrieved successfully"
    )
  );
});
