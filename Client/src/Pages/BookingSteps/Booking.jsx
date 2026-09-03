"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { MapPin, Star, ArrowLeft, ChevronRight, Building, Check, Users, ShoppingCart } from 'lucide-react'
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useAuth } from "../AuthProvider"
import { useWebsiteSettings } from "../../contexts/WebsiteSettingsContext"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { Navbar } from "../../components/Navbar"
import { getAdventure } from "../../Api/adventure.api"
import { useSessions } from "../../hooks/useSession"

// Import step components
import { InstructorSelection } from "./InstructorSelection"
import { ShopSelection } from "./ShopSelection"
import { HotelSelection } from "./HotelSelection"
import { BookingSummary } from "./BookingSummary"

// Import data
import { useBrowse } from "../../hooks/useItems"
import { useHotels } from "../../hooks/useHotel"

export default function BookingFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search);
  const { user } = useAuth()
  const { isShopEnabled, isHotelsEnabled } = useWebsiteSettings()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adventure, setAdventure] = useState(null)
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false)
  const [currentInstructor, setCurrentInstructor] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])

  const [checkInDate, setCheckInDate] = useState(null)
  const [checkOutDate, setCheckOutDate] = useState(null)


  // Get location from query params or adventure location
  const locationFilter = query.get("location") || (adventure?.location?.[0]?.name);
  const { hotels } = useHotels({
    search: "",
    page: 1,
    limit: 10,
    verified: "approved",
    location: locationFilter || null
  });

  // Ref for BookingSummary section
  const bookingSummaryRef = useRef(null)

  const { sessions, instructors } = useSessions({ adventure: query.get("id"), location: query.get("location"), session_date: query.get("session_date") })
  const { items } = useBrowse({ adventureId: sessions.length > 0 ? (sessions[0]?.adventureId?._id || sessions[0]?.adventureId) : "" })

  // Load group members from sessionStorage if available
  useEffect(() => {
    const storedGroupMembers = sessionStorage.getItem("groupMembers")
    if (storedGroupMembers) {
      setGroupMembers(JSON.parse(storedGroupMembers))
    }
  }, [])

  const fetchAdventure = async () => {
    const query = new URLSearchParams(location.search)
    const adventureId = query.get("id")
    const res = await getAdventure(adventureId)
    if (res.status === 200) {
      setAdventure(res.data)
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchAdventure()
  }, [])

  useEffect(() => {
    if (!user.user) {
      toast(t("pleaseLogin"), { type: "error" })
      navigate("/login")
    }
  }, [user, navigate, t])

  const handleAddToCart = (itemId, isRental = false, rentalData = null) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === itemId && item.rent === isRental)
      if (existingItem) {
        // For rental items, check if dates match before incrementing quantity
        if (isRental && rentalData) {
          const datesMatch = existingItem.startDate && existingItem.endDate &&
            new Date(existingItem.startDate).getTime() === new Date(rentalData.startDate).getTime() &&
            new Date(existingItem.endDate).getTime() === new Date(rentalData.endDate).getTime()

          if (datesMatch) {
            // Same rental period - increment quantity
            return prev.map((item) =>
              item._id === itemId && item.rent === isRental ? { ...item, quantity: item.quantity + 1 } : item,
            )
          } else {
            // Different rental period - create new entry
            const newItem = {
              _id: itemId,
              quantity: 1,
              rent: isRental,
              startDate: rentalData.startDate,
              endDate: rentalData.endDate
            }
            return [...prev, newItem]
          }
        } else {
          // Purchase item - increment quantity
          return prev.map((item) =>
            item._id === itemId && item.rent === isRental ? { ...item, quantity: item.quantity + 1 } : item,
          )
        }
      } else {
        // Add new item with quantity 1
        const newItem = {
          _id: itemId,
          quantity: 1,
          rent: isRental
        }

        // Add rental dates if it's a rental item
        if (isRental && rentalData) {
          newItem.startDate = rentalData.startDate
          newItem.endDate = rentalData.endDate
        }

        return [...prev, newItem]
      }
    })
  }

  const handleRemoveFromCart = (itemId, isRental = false) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === itemId && item.rent === isRental)
      if (existingItem && existingItem.quantity > 1) {
        // Decrement quantity if more than 1
        return prev.map((item) =>
          item._id === itemId && item.rent === isRental ? { ...item, quantity: item.quantity - 1 } : item,
        )
      } else {
        // Remove item if quantity would be 0
        return prev.filter((item) => !(item._id === itemId && item.rent === isRental))
      }
    })
  }

  const handleInstructorSelect = (instructorId) => {
    const instructor = sessions.find((i) => i._id === instructorId)
    setSelectedInstructor((prev) => (prev?.id === instructorId ? null : instructor))
    setIsInstructorDialogOpen(false)
  }
  const openInstructorDialog = (instructor) => {
    setCurrentInstructor(instructor)
    setIsInstructorDialogOpen(true)
  }
  // Handle date changes for hotel booking with validation
  const handleDateChange = (startDate, endDate) => {
    // Validate dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      toast.error("Check-in date cannot be in the past")
      return
    }

    if (endDate && endDate <= startDate) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    setCheckInDate(startDate)
    setCheckOutDate(endDate)
  }

  // Calculate number of nights for hotel booking
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1
    const diffTime = Math.abs(checkOutDate - checkInDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays) // Minimum 1 night
  }

  // Hotel selection handler with smooth scroll to booking summary
  const handleHotelSelect = (hotelId) => {
    const newSelection = hotelId === selectedHotel ? null : hotelId
    setSelectedHotel(newSelection)

    // If a hotel is selected and we're on step 3, scroll to booking summary
    if (newSelection && currentStep === maxSteps) {
      // Use a longer timeout and multiple checks to ensure the ref is available
      const scrollToBookingSummary = () => {
        if (bookingSummaryRef.current) {
          bookingSummaryRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
        } else {
          // If ref is still not available, try again after a short delay
          setTimeout(scrollToBookingSummary, 100)
        }
      }

      // Initial delay to allow the UI to update and animations to settle
      setTimeout(scrollToBookingSummary, 500)
    }
  }

  const handleNext = () => {
    if (currentStep < maxSteps) {
      setCurrentStep((prev) => prev + 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    // For final step, let the BookingSummary component handle the booking
  }

  const handleSkip = () => {
    if (currentStep < maxSteps) {
      setCurrentStep((prev) => prev + 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      navigate(-1)
    }
  }
  // Calculate total price
  const calculateTotal = () => {
    const itemsPrice = cartItems.reduce((sum, item) => {
      const itemData = Array.isArray(items) ? items.find((i) => i._id == item._id) : null
      if (!itemData) return sum

      const price = Number(itemData.price || 0)
      return sum + price * item.quantity
    }, 0)

    let hotelPrice = 0
    if (selectedHotel && Array.isArray(hotels)) {
      const hotel = hotels.find((hotel) => hotel._id == selectedHotel || hotel.id == selectedHotel)
      const pricePerNight = Number(hotel?.pricePerNight || hotel?.price || 0)
      const nights = calculateNights()
      hotelPrice = pricePerNight * nights
    }

    let instructorPrice = 0
    if (selectedInstructor) {
      const baseFee = Number(selectedInstructor.price || selectedInstructor.fee || 0) + groupMembers.length * 30
      const commission = Number(selectedInstructor?.instructorId?.instructor?.commissionPercentage ?? 20)
      const platformFeeAmount = Number((baseFee * commission / 100).toFixed(2))
      instructorPrice = baseFee + platformFeeAmount
    } else if (groupMembers.length > 0) {
      instructorPrice = groupMembers.length * 30
    }

    return itemsPrice + hotelPrice + instructorPrice
  }


  // Animation variants
  const slideVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
      },
    }),
  }

  // If still loading or adventure not found
  if (isLoading || !adventure) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-slate-200 h-24 w-24 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  // Define step labels dynamically based on website settings
  const getStepLabels = () => {
    const steps = [
      { step: 1, icon: <Users size={18} />, label: "Instructor" }
    ];

    let currentStepNumber = 2;

    const shouldShowShop = isShopEnabled === true;
    const shouldShowHotels = isHotelsEnabled === true && Array.isArray(hotels) && hotels.length > 0;

    if (shouldShowShop) {
      steps.push({ step: currentStepNumber, icon: <ShoppingCart size={18} />, label: "Shop" });
      currentStepNumber++;
    }

    if (shouldShowHotels) {
      steps.push({ step: currentStepNumber, icon: <Building size={18} />, label: "Hotel" });
      currentStepNumber++;
    }

    return steps;
  };

  const stepLabels = getStepLabels();
  const maxSteps = stepLabels.length;

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Background elements - removed for minimal theme */}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mt-[10vh] mx-auto pt-20 p-4 sm:p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => handleBack()}
            className="flex items-center gap-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">Book Your Adventure</h1>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {Array.isArray(stepLabels) && stepLabels.map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                    currentStep === item.step
                      ? "bg-gray-900 text-white"
                      : currentStep > item.step
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-400 border-2 border-gray-300",
                  )}
                >
                  {currentStep > item.step ? <Check size={18} /> : item.icon}
                </div>
                <span
                  className={cn("text-sm font-medium", currentStep === item.step ? "text-gray-900" : "text-gray-500")}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adventure Info Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl mb-8 border border-white/50">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 overflow-hidden rounded-xl">
              <motion.img
                src={adventure.medias && adventure.medias[0] ? adventure.medias[0] : "/placeholder.svg?height=300&width=500"}
                alt={adventure.name}
                className="w-full h-64 object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin size={16} />
                  <span>{adventure.location && adventure.location[0] ? adventure.location[0].name : "Location"}</span>
                  <span className="text-gray-300">•</span>
                  <span>{adventure.date ? new Date(adventure.date).toLocaleDateString() : "Date"}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{adventure.name}</h2>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-gray-900 text-gray-900" />
                  ))}
                  <span className="text-sm ml-1 text-gray-500">4.8</span>
                </div>
                <p className="text-gray-600 mb-4">Experience the thrill of a lifetime with our carefully curated adventures.</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-gray-900 text-white hover:bg-gray-800">
                  +{adventure.exp || 100} EXP
                </Badge>

                {groupMembers.length > 0 && (
                  <Badge className="bg-gray-200 text-gray-900">
                    Group Size: {groupMembers.length + 1}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area with steps */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={currentStep}>
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <InstructorSelection
                  mockInstructors={sessions}
                  selectedInstructor={selectedInstructor}
                  handleInstructorSelect={handleInstructorSelect}
                  openInstructorDialog={openInstructorDialog}
                  isInstructorDialogOpen={isInstructorDialogOpen}
                  setIsInstructorDialogOpen={setIsInstructorDialogOpen}
                  currentInstructor={currentInstructor}
                  groupMembers={groupMembers}
                />
              </motion.div>
            )}

            {/* Step 2: Shop (if enabled) or direct to final booking */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                {isShopEnabled === true ? (
                  <div className="space-y-8">
                    <ShopSelection
                      mockItems={Array.isArray(items) ? items : []}
                      cartItems={cartItems}
                      handleAddToCart={handleAddToCart}
                      handleRemoveFromCart={handleRemoveFromCart}
                    />

                    {/* Show booking summary if this is the final step (shop enabled, hotels disabled) */}
                    {!(isHotelsEnabled === true && Array.isArray(hotels) && hotels.length > 0) && (
                      <div ref={bookingSummaryRef}>
                        <BookingSummary
                          user={user}
                          adventure={adventure}
                          selectedInstructor={selectedInstructor}
                          groupMembers={groupMembers}
                          cartItems={cartItems}
                          mockItems={Array.isArray(items) ? items : []}
                          selectedHotel={selectedHotel}
                          hotels={Array.isArray(hotels) ? hotels : []}
                          calculateTotal={calculateTotal}
                          checkInDate={checkInDate}
                          checkOutDate={checkOutDate}
                          calculateNights={calculateNights}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* If shop is disabled but hotels enabled, skip to hotels */
                  (isHotelsEnabled === true && Array.isArray(hotels) && hotels.length > 0) ? (
                    <div className="space-y-8">
                      <HotelSelection
                        selectedHotel={selectedHotel}
                        onSelectHotel={handleHotelSelect}
                        hotels={Array.isArray(hotels) ? hotels : []}
                        checkInDate={checkInDate}
                        checkOutDate={checkOutDate}
                        onDateChange={handleDateChange}
                        calculateNights={calculateNights}
                      />

                      <div ref={bookingSummaryRef}>
                        <BookingSummary
                          user={user}
                          adventure={adventure}
                          selectedInstructor={selectedInstructor}
                          groupMembers={groupMembers}
                          cartItems={cartItems}
                          mockItems={Array.isArray(items) ? items : []}
                          selectedHotel={selectedHotel}
                          mockHotels={Array.isArray(hotels) ? hotels : []}
                          calculateTotal={calculateTotal}
                          checkInDate={checkInDate}
                          checkOutDate={checkOutDate}
                          calculateNights={calculateNights}
                        />
                      </div>
                    </div>
                  ) : (
                    /* If both shop and hotels are disabled, show final booking */
                    <div ref={bookingSummaryRef}>
                      <BookingSummary
                        user={user}
                        adventure={adventure}
                        selectedInstructor={selectedInstructor}
                        groupMembers={groupMembers}
                        cartItems={cartItems}
                        mockItems={Array.isArray(items) ? items : []}
                        selectedHotel={selectedHotel}
                        hotels={Array.isArray(hotels) ? hotels : []}
                        calculateTotal={calculateTotal}
                        checkInDate={checkInDate}
                        checkOutDate={checkOutDate}
                        calculateNights={calculateNights}
                      />
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* Step 3: Hotels (only if both shop and hotels are enabled) */}
            {currentStep === 3 && isShopEnabled === true && isHotelsEnabled === true && Array.isArray(hotels) && hotels.length > 0 && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <div className="space-y-8">
                  <HotelSelection
                    selectedHotel={selectedHotel}
                    onSelectHotel={handleHotelSelect}
                    hotels={Array.isArray(hotels) ? hotels : []}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    onDateChange={handleDateChange}
                    calculateNights={calculateNights}
                  />

                  <div ref={bookingSummaryRef}>
                    <BookingSummary
                      user={user}
                      adventure={adventure}
                      selectedInstructor={selectedInstructor}
                      groupMembers={groupMembers}
                      cartItems={cartItems}
                      mockItems={Array.isArray(items) ? items : []}
                      selectedHotel={selectedHotel}
                      hotels={Array.isArray(hotels) ? hotels : []}
                      calculateTotal={calculateTotal}
                      checkInDate={checkInDate}
                      checkOutDate={checkOutDate}
                      calculateNights={calculateNights}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/70"
          >
            Back
          </Button>          <div className="flex gap-3">
            {currentStep < maxSteps && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="bg-white/50 backdrop-blur-sm border-white/50 hover:bg-white/70"
              >
                Skip
              </Button>
            )}

            {currentStep < maxSteps && (
              <Button
                onClick={handleNext}
                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
