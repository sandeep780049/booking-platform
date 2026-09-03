import { Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { useTranslation } from "react-i18next"

const UpcomingBookingsCard = ({ bookings, onViewAll }) => {
    const { t } = useTranslation()
    return (
        <Card className="h-full">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">{t("instructor.upcomingBookings")}</CardTitle>
                <CardDescription className="text-sm">{t("instructor.nextScheduledSessions")}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors gap-3 sm:gap-4"
                        >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm sm:text-base truncate">{booking.adventure}</h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-0">
                                        <div className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">{booking.location}</span>
                                        </div>
                                        <span className="hidden sm:inline mx-2">•</span>
                                        <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="whitespace-nowrap">
                                                {new Date(booking.date).toLocaleDateString()} {booking.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                                <div className="text-left sm:text-right">
                                    <div className="font-medium text-sm sm:text-base">€{booking.amount}</div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                        {booking.participants} {t("instructor.participants")}
                                    </div>
                                </div>
                                <Badge variant={booking.status === "confirmed" ? "default" : "outline"} className={`text-xs ${booking.status === "confirmed" ? "bg-black hover:bg-gray-800" : ""}`}>
                                    {booking.status === "confirmed" ? t("instructor.confirmed") : t("instructor.pending")}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-3 sm:p-6 pt-0">
                <Button variant="outline" className="w-full text-sm sm:text-base" onClick={onViewAll}>
                    {t("instructor.viewAllBookings")}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default UpcomingBookingsCard
