import { useState, useMemo, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CreditCard, Calendar, User, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import DateRangePicker from "../../components/ui/DateRangePicker"
import { Nav_Landing } from "../../components/Nav_Landing"
import { CartContext } from "../Cart/CartContext"
import { createBooking } from "../../Api/booking.api"

const itemPrice = (item) =>
  item?.rentalPeriod ? (item?.item?.rentalPrice ?? 0) : (item?.item?.price ?? 0)

const itemTotal = (item) => {
  const price = itemPrice(item)
  const qty = item?.quantity ?? 1
  const days = item?.rentalPeriod?.days ?? 1
  return item?.rentalPeriod ? price * days * qty : price * qty
}

const fmtDate = (ds) => {
  try {
    return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}

export const Cart = () => {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, clearCart, serverCart } = useContext(CartContext)
  const { loading, error } = serverCart || { loading: false, error: null }

  const [loadingItems, setLoadingItems] = useState({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [name, setName] = useState("")

  const subtotal = useMemo(
    () => (cart?.items ?? []).reduce((s, it) => s + itemTotal(it), 0),
    [cart?.items]
  )
  const platformFee = subtotal * 0.12
  const grandTotal = subtotal + platformFee

  const busy = (id) => !!loadingItems[id]

  const withLoading = async (id, fn) => {
    setLoadingItems((p) => ({ ...p, [id]: true }))
    try { await fn() } finally {
      setLoadingItems((p) => ({ ...p, [id]: false }))
    }
  }

  const handleQuantity = (item, delta) => {
    const id = item?.item?._id ?? item?._id
    if (!id) return
    const next = (item?.quantity ?? 1) + delta
    if (next < 1) return
    withLoading(id, () => updateQuantity(id, next, item?.purchase))
      .then(() => toast.success("Cart updated"))
      .catch(() => toast.error("Failed to update cart"))
  }

  const handleRemove = (item) => {
    const id = item?.item?._id ?? item?._id
    if (!id) return
    withLoading(id, () => removeFromCart(id, item?.purchase ?? false))
      .then(() => toast.success("Item removed"))
      .catch(() => toast.error("Failed to remove item"))
  }

  const handleClear = async () => {
    try {
      if (clearCart) await clearCart()
      toast.success("Cart cleared")
    } catch {
      toast.error("Failed to clear cart")
    }
  }

  const handleRentalDates = (item, startDate, endDate) => {
    const id = item?.item?._id ?? item?._id
    if (!id || !startDate || !endDate || !serverCart) return
    const days = Math.ceil((endDate - startDate) / 86400000)
    withLoading(id, () =>
      serverCart.updateCartItem({ itemId: id, rentalPeriod: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), days } })
    )
      .then(() => toast.success("Rental period updated"))
      .catch(() => toast.error("Failed to update rental period"))
  }

  const handleBooking = async (modeOfPayment) => {
    if (!name.trim()) { toast.error("Please enter your name"); return }
    setIsBookingLoading(true)
    const tid = toast.loading("Creating booking…")
    try {
      const res = await createBooking(name, modeOfPayment)
      toast.success("Booking created", { id: tid })
      setIsDialogOpen(false)
      setName("")
      window.location.href = res?.data?.data?.paymentOrder?.checkout_url ?? "/"
    } catch (e) {
      if (e?.response?.status === 401) {
        toast.error("Please enter the registered name", { id: tid })
      } else {
        toast.error(`Booking failed: ${e?.response?.data?.message ?? e?.message ?? "Unknown error"}`, { id: tid })
      }
    } finally {
      setIsBookingLoading(false)
    }
  }

  const handleCheckout = () => {
    if (!cart?.items?.length) { toast.error("Your cart is empty"); return }
    setIsDialogOpen(true)
  }

  const items = cart?.items ?? []
  const initialLoading = loading && items.length === 0

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Nav_Landing theme="dark" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
            <p className="text-sm text-neutral-500 tracking-wide">Loading your cart…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Nav_Landing theme="dark" />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>

          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-700" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Your Cart</h1>
              {items.length > 0 && (
                <p className="text-sm text-neutral-500 mt-0.5">{items.length} {items.length === 1 ? "item" : "items"}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading cart</p>
                <p className="text-sm text-red-600 mt-0.5">{error?.message ?? "Something went wrong. Please refresh."}</p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
                <ShoppingBag className="w-9 h-9 text-neutral-400" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Your cart is empty</h2>
              <p className="text-neutral-500 text-sm max-w-xs mb-8">Add some adventure gear to get started on your next journey.</p>
              <Link to="/shop">
                <Button className="rounded-full px-8 bg-neutral-900 hover:bg-neutral-700 text-white font-medium">
                  Browse the Shop
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-semibold text-neutral-700 uppercase tracking-wider">Items</h2>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const id = item?.item?._id
                    const name = item?.item?.name ?? "Unknown item"
                    const category = item?.item?.category
                    const description = item?.item?.description
                    const image = item?.item?.images?.[0]
                    const isRental = !!item?.rentalPeriod
                    const price = itemPrice(item)
                    const total = itemTotal(item)
                    const qty = item?.quantity ?? 1
                    const isBusy = busy(id)

                    return (
                      <motion.div
                        key={item?._id ?? id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-36 h-44 sm:h-auto flex-shrink-0 bg-neutral-100">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-neutral-300" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {category && (
                                    <Badge variant="outline" className="text-xs font-medium text-neutral-500 border-neutral-200 rounded-full">
                                      {category}
                                    </Badge>
                                  )}
                                  {isRental && (
                                    <Badge className="text-xs bg-amber-100 text-amber-700 border-0 rounded-full">
                                      Rental
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold text-neutral-900 leading-snug">{name}</h3>
                                {description && (
                                  <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{description}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleRemove(item)}
                                disabled={isBusy}
                                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors disabled:opacity-40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {isRental && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Rental period</p>
                                <div className="flex flex-wrap items-center gap-3">
                                  <DateRangePicker
                                    startDate={item?.rentalPeriod?.startDate ? new Date(item.rentalPeriod.startDate) : null}
                                    endDate={item?.rentalPeriod?.endDate ? new Date(item.rentalPeriod.endDate) : null}
                                    onChange={(s, e) => handleRentalDates(item, s, e)}
                                    className="flex-1"
                                  />
                                  {item?.rentalPeriod?.days > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                                      <Calendar className="w-3 h-3" />
                                      {item.rentalPeriod.days}d
                                    </span>
                                  )}
                                </div>
                                {item?.rentalPeriod?.startDate && item?.rentalPeriod?.endDate && (
                                  <p className="text-xs text-neutral-400">
                                    {fmtDate(item.rentalPeriod.startDate)} → {fmtDate(item.rentalPeriod.endDate)}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 bg-neutral-50 rounded-full p-1 border border-neutral-100">
                                <button
                                  onClick={() => handleQuantity(item, -1)}
                                  disabled={qty <= 1 || isBusy}
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all disabled:opacity-30"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold text-neutral-900">{qty}</span>
                                <button
                                  onClick={() => handleQuantity(item, 1)}
                                  disabled={isBusy}
                                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all disabled:opacity-30"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-neutral-400">
                                  €{price.toFixed(2)}{isRental ? "/day" : ""} × {qty}{isRental && item?.rentalPeriod?.days ? ` × ${item.rentalPeriod.days}d` : ""}
                                </p>
                                <p className="text-lg font-bold text-neutral-900">€{total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <div className="pt-4">
                  <Link to="/shop">
                    <Button variant="outline" className="rounded-full border-neutral-200 text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Continue shopping
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-28">
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-neutral-400" />
                      <h2 className="text-base font-semibold text-neutral-900">Order summary</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-neutral-600">
                        <span>Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
                        <span className="font-medium text-neutral-900">€{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-600">
                        <span>Platform fee <span className="text-neutral-400">(12%)</span></span>
                        <span className="font-medium text-neutral-900">€{platformFee.toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator className="bg-neutral-100" />

                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-neutral-900">Total</span>
                      <span className="text-2xl font-bold text-neutral-900">€{grandTotal.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      size="lg"
                      className="w-full rounded-full bg-neutral-900 hover:bg-neutral-700 text-white font-medium tracking-wide transition-all"
                    >
                      Proceed to checkout
                    </Button>

                    <p className="text-xs text-center text-neutral-400">Secure checkout · PayPal &amp; Revolut</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-900">
              <User className="w-5 h-5 text-neutral-400" />
              Complete your booking
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              Enter your registered name to finalise the order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <label htmlFor="checkout-name" className="text-sm font-medium text-neutral-700">Full name</label>
              <Input
                id="checkout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="rounded-xl"
                autoComplete="name"
              />
            </div>
            <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
              <span className="text-sm text-neutral-500">Total due</span>
              <span className="text-base font-bold text-neutral-900">€{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isBookingLoading}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleBooking("paypal")}
              disabled={isBookingLoading || !name.trim()}
              className="rounded-xl flex-1 bg-neutral-900 hover:bg-neutral-700 text-white"
            >
              {isBookingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Processing…
                </span>
              ) : "Pay with PayPal"}
            </Button>
            <Button
              onClick={() => handleBooking("revolut")}
              disabled={isBookingLoading || !name.trim()}
              className="rounded-xl flex-1 bg-neutral-900 hover:bg-neutral-700 text-white"
            >
              {isBookingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Processing…
                </span>
              ) : "Pay with Revolut"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
