"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Star, Building, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { useTranslation } from "react-i18next"
import DateRangePicker from "../../components/ui/DateRangePicker"


export const HotelSelection = ({
    hotels,
    selectedHotel,
    onSelectHotel,
    checkInDate,
    checkOutDate,
    onDateChange,
    calculateNights
}) => {
    const { t } = useTranslation()

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    }

    return (
        <motion.div
            className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-8 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
        >            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Building className="w-7 h-7" /> {t("selectAccommodation")}
                </h2>
            </div>

            {/* Date Range Picker */}
            <div className="mb-8 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> {t("selectDates")}
                </h3>
                <DateRangePicker
                    startDate={checkInDate}
                    endDate={checkOutDate}
                    onChange={onDateChange}
                    className="max-w-md"
                />
                {checkInDate && checkOutDate && (
                    <p className="text-sm text-gray-600 mt-3 font-medium">
                        {calculateNights()} {calculateNights() === 1 ? "night" : "nights"} selected
                    </p>
                )}
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {hotels?.map((hotel) => (
                    <motion.div key={hotel?._id} variants={itemVariants}>
                        <Card
                            className={cn(
                                "overflow-hidden h-full transition-all duration-300 cursor-pointer border-2 group hover:shadow-xl",
                                selectedHotel === hotel?._id
                                    ? "border-gray-900 shadow-lg bg-gray-50"
                                    : "border-gray-200 hover:border-gray-400 bg-white",
                            )}
                            onClick={() => onSelectHotel(hotel?._id === selectedHotel ? null : hotel?._id)}
                        >
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-2/5 h-full overflow-hidden bg-gray-100">
                                    <img
                                        src={hotel?.medias || "/placeholder.svg"}
                                        alt={hotel?.name}
                                        className="w-full h-full object-cover md:h-56 transition-transform duration-300 group-hover:scale-110"
                                    />
                                </div>
                                <div className="md:w-3/5 p-5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <MapPin size={14} className="flex-shrink-0" />
                                        <span className="font-medium">{hotel?.location?.name || hotel?.location}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{hotel?.name}</h3>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-4 h-4 fill-gray-900 text-gray-900" />
                                        ))}
                                        <span className="text-sm ml-1.5 text-gray-600 font-medium">{hotel?.rating}</span>
                                    </div>                                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-2xl">
                                                ${(hotel.pricePerNight || hotel?.price) * calculateNights()}
                                                {calculateNights() > 1 && (
                                                    <span className="text-sm font-normal text-gray-500 ml-1">
                                                        total
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-sm text-gray-600 font-medium mt-1">
                                                ${hotel?.pricePerNight || hotel?.price}/night × {calculateNights()} {calculateNights() === 1 ? "night" : "nights"}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={selectedHotel === hotel?._id ? "default" : "outline"}
                                            className={cn(
                                                "font-medium",
                                                selectedHotel === hotel?._id
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-white text-gray-900 border-gray-300"
                                            )}
                                        >
                                            {selectedHotel === hotel?._id ? t("selected") : t("select")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}
