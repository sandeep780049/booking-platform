"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Plus, Minus, Calendar, ShoppingCart } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { useTranslation } from "react-i18next"
import { containerVariants, itemVariants } from "../../assets/Animations"
import DateRangePicker from "../../components/ui/DateRangePicker"
import { toast } from "sonner"

export const ShopSelection = ({ mockItems, cartItems, handleAddToCart, handleRemoveFromCart }) => {
    const { t } = useTranslation()
    const [selectedRentalItem, setSelectedRentalItem] = useState(null)
    const [rentalStartDate, setRentalStartDate] = useState(null)
    const [rentalEndDate, setRentalEndDate] = useState(null)
    const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false)

    const handleRentalClick = (item) => {
        setSelectedRentalItem(item)
        setRentalStartDate(null)
        setRentalEndDate(null)
        setIsRentalDialogOpen(true)
    }

    const handleRentalDateConfirm = () => {
        if (!rentalStartDate || !rentalEndDate) {
            toast.error("Please select both start and end dates for rental")
            return
        }

        if (rentalStartDate >= rentalEndDate) {
            toast.error("End date must be after start date")
            return
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (rentalStartDate < today) {
            toast.error("Start date cannot be in the past")
            return
        }

        // Add rental item with dates to cart
        handleAddToCart(selectedRentalItem._id, true, {
            startDate: rentalStartDate,
            endDate: rentalEndDate
        })

        setIsRentalDialogOpen(false)
        setSelectedRentalItem(null)
        setRentalStartDate(null)
        setRentalEndDate(null)
    }

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-8 border border-gray-200">
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{t("shopItems")}</h2>
                <p className="text-gray-600 leading-relaxed">
                    {t("Recommended items to have before continuing to your adventure")}
                </p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {mockItems.map((item) => {
                    const rentCartItem = cartItems.find((ci) => ci._id === item._id && ci.rent)
                    const isInCart = rentCartItem && rentCartItem.quantity > 0
                    return (
                        <motion.div key={item._id} variants={itemVariants}>
                            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl bg-white border-2 border-gray-200 hover:border-gray-400 group">
                                <div className="relative h-56 overflow-hidden bg-gray-100">
                                    <img
                                        src={item.images[0] || "/placeholder.svg"}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        For Rent
                                    </div>
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl font-bold text-gray-900 leading-tight">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="pb-5">
                                    <div className="flex items-center gap-1 mb-4">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < Math.floor(item.totalReviews || 0)
                                                        ? "fill-gray-900 text-gray-900"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm ml-2 text-gray-600 font-medium">({item.totalReviews})</span>
                                    </div>
                                    <div className="mb-4">
                                        <span className="inline-block bg-gray-100 text-gray-900 text-xs px-3 py-1.5 rounded-full font-medium border border-gray-200">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="text-center py-2 border-t border-gray-200">
                                            <span className="text-3xl font-bold text-gray-900">
                                                ${item.price}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-1">/day</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {isInCart ? (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 font-medium"
                                                    onClick={() => handleRentalClick(item)}
                                                >
                                                    <Calendar size={16} className="mr-2" />
                                                    Update Dates
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                                                    onClick={() => handleRentalClick(item)}
                                                >
                                                    <Calendar size={16} className="mr-2" />
                                                    Rent Now
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
                <motion.div
                    className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-900 rounded-lg">
                            <ShoppingCart className="text-white" size={20} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{t("yourCart")}</h3>
                    </div>
                    <div className="space-y-4">                        {cartItems.map((cartItem) => {
                        const item = mockItems.find((i) => i._id === cartItem._id)
                        let price = cartItem.rent ? item?.price : item?.price
                        let totalPrice = (price || 0) * cartItem.quantity

                        // Calculate rental pricing based on dates
                        if (cartItem.rent && cartItem.startDate && cartItem.endDate) {
                            const days = Math.ceil((new Date(cartItem.endDate) - new Date(cartItem.startDate)) / (1000 * 60 * 60 * 24))
                            totalPrice = (price || 0) * days * cartItem.quantity
                        }

                        return (
                            <div
                                key={`${cartItem._id}-${cartItem.rent}`}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img
                                            src={item?.images[0] || "/placeholder.svg"}
                                            alt={item?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {item?.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-sm bg-gray-100 text-gray-900 px-2.5 py-1 rounded-full font-medium border border-gray-200">
                                                Rental
                                            </span>
                                            <span className="text-sm text-gray-600 font-medium">
                                                Qty: {cartItem.quantity}
                                            </span>
                                        </div>
                                        {cartItem.rent && cartItem.startDate && cartItem.endDate && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {new Date(cartItem.startDate).toLocaleDateString()} - {new Date(cartItem.endDate).toLocaleDateString()}
                                                <span className="font-medium text-gray-900 ml-2">
                                                    ({Math.ceil((new Date(cartItem.endDate) - new Date(cartItem.startDate)) / (1000 * 60 * 60 * 24))} days)
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">€{totalPrice.toFixed(2)}</div>
                                    <div className="text-sm text-gray-500 font-medium">€{price}/day</div>
                                </div>
                            </div>
                        )
                    })}                        <div className="pt-4 border-t-2 border-gray-300 flex justify-between items-center">
                            <span className="text-2xl font-bold text-gray-900">{t("cartTotal")}</span>
                            <span className="text-3xl font-bold text-gray-900">
                                $
                                {cartItems
                                    .reduce((sum, cartItem) => {
                                        const itemData = mockItems.find((i) => i._id === cartItem._id)
                                        const price = cartItem.rent ? itemData?.price : itemData?.price
                                        let itemTotal = (price || 0) * cartItem.quantity

                                        // Calculate rental pricing based on dates
                                        if (cartItem.rent && cartItem.startDate && cartItem.endDate) {
                                            const days = Math.ceil((new Date(cartItem.endDate) - new Date(cartItem.startDate)) / (1000 * 60 * 60 * 24))
                                            itemTotal = (price || 0) * days * cartItem.quantity
                                        }

                                        return sum + itemTotal
                                    }, 0)
                                    .toFixed(2)}
                            </span>
                        </div>
                    </div>                </motion.div>
            )}

            {/* Rental Date Selection Dialog */}
            <Dialog open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen}>
                <DialogContent className="sm:max-w-[550px] bg-white rounded-xl border border-gray-200">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold text-gray-900">
                            <Calendar className="w-6 h-6 text-gray-900" />
                            Select Rental Period
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        {selectedRentalItem && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                                <img
                                    src={selectedRentalItem.images[0] || "/placeholder.svg"}
                                    alt={selectedRentalItem.name}
                                    className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                                />
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{selectedRentalItem.name}</h4>
                                    <p className="text-gray-900 font-bold text-xl">€{selectedRentalItem.price}/day</p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-900 block">Choose your rental dates:</label>
                            <DateRangePicker
                                startDate={rentalStartDate}
                                endDate={rentalEndDate}
                                onChange={(startDate, endDate) => {
                                    setRentalStartDate(startDate)
                                    setRentalEndDate(endDate)
                                }}
                            />
                        </div>

                        {rentalStartDate && rentalEndDate && (
                            <div className="p-5 bg-gray-50 rounded-lg border-2 border-gray-200">
                                <h5 className="font-bold text-gray-900 mb-4 text-lg">Rental Summary</h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Duration:</span>
                                        <span className="font-bold text-gray-900">
                                            {Math.ceil((rentalEndDate - rentalStartDate) / (1000 * 60 * 60 * 24))} days
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-medium">Daily Rate:</span>
                                        <span className="font-bold text-gray-900">€{selectedRentalItem?.price || 0}</span>
                                    </div>
                                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">Total Cost:</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${((selectedRentalItem?.price || 0) * Math.ceil((rentalEndDate - rentalStartDate) / (1000 * 60 * 60 * 24))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                variant="outline"
                                className="px-6 font-medium border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400"
                                onClick={() => setIsRentalDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                                onClick={handleRentalDateConfirm}
                                disabled={!rentalStartDate || !rentalEndDate}
                            >
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
