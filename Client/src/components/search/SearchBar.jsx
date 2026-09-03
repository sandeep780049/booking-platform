import { memo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Compass, MapPin, Calendar, Users, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import LocationAutocomplete from "../ui/LocationAutocomplete"
import { staggerContainer } from "../../assets/Animations"

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const SearchBar = memo(({
  adventures,
  adventure,
  onAdventureChange,
  location,
  onLocationChange,
  date,
  onDateChange,
  groupMembers,
  onShowGroupDialog,
  onNavigate,
  t,
  locationsList,
  locationsLoading
}) => {
  const [dateValue, setDateValue] = useState(() => date || getTodayDate())

  useEffect(() => {
    if (!date) {
      onDateChange?.(getTodayDate())
    }
  }, [])

  const handleDateChange = (e) => {
    setDateValue(e.target.value)
    onDateChange?.(e.target.value)
  }

  return (
    <motion.div
      className="search-bar w-full max-w-5xl mx-auto px-4 md:px-0"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="flex rounded-3xl flex-wrap md:flex-nowrap items-center justify-center">
        {/* Unified search container */}
        <div className="relative w-full flex-1 items-center flex flex-col md:flex-row md:bg-white md:shadow-xl md:rounded-full md:overflow-hidden gap-2 md:gap-0">
          {/* Adventure selection */}
          <div className="w-full md:flex-1 flex items-center mobile-glass-input md:!bg-white h-12 md:h-16 rounded-2xl md:rounded-none md:shadow-none md:!border-none transition-all duration-300">
            <div className="flex items-center pl-5">
              <Compass className="h-5 w-5 text-white md:text-gray-900 drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <LocationAutocomplete
                locations={(adventures || []).map((a) => a.name || a)}
                value={adventure}
                onChange={onAdventureChange}
                placeholder={t("selectAdventure")}
                className="pl-3 py-3 text-base border-0 focus:ring-0 flex-1 bg-transparent h-full text-white md:text-gray-900 placeholder:text-white/70 md:placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Location input with autocomplete */}
          <div className="w-full md:flex-1 flex items-center mobile-glass-input md:!bg-white h-12 md:h-16 rounded-2xl md:rounded-none md:shadow-none md:!border-none md:border-l md:border-gray-100 transition-all duration-300">
            <div className="flex items-center pl-5">
              <MapPin className="h-5 w-5 text-white md:text-gray-900 drop-shadow-sm" />
            </div>
            <div className="flex-1">
              <LocationAutocomplete
                locations={locationsList || []}
                value={location}
                onChange={onLocationChange}
                placeholder={t("searchLocation")}
                className="pl-3 py-3 text-base border-0 focus:ring-0 flex-1 bg-transparent h-full text-white md:text-gray-900 placeholder:text-white/70 md:placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Date input */}
          <div className="w-full md:flex-1 flex items-center mobile-glass-input md:!bg-white h-12 md:h-16 rounded-2xl md:rounded-none md:shadow-none md:!border-none md:border-l md:border-gray-100 transition-all duration-300">
            <div className="flex items-center pl-5 pointer-events-none">
              <Calendar className="h-5 w-5 text-white md:text-gray-900 drop-shadow-sm" />
            </div>
            <Input
              onChange={handleDateChange}
              type="date"
              className="search-date-input pl-3 py-3 text-base border-0 focus:ring-0 flex-1 h-full bg-transparent text-white md:text-gray-900 placeholder:text-white/70 md:placeholder:text-gray-400 font-medium [color-scheme:dark] md:[color-scheme:light] cursor-pointer w-full"
              value={dateValue}
              required
            />
          </div>

          {/* Group button */}
          <div className="w-full md:w-auto flex items-center mobile-glass-input md:!bg-white h-12 md:h-16 rounded-2xl md:rounded-none md:shadow-none md:!border-none md:border-l md:border-gray-100 transition-all duration-300">
            <Button
              onClick={() => onShowGroupDialog?.(true)}
              className="w-full h-full px-5 py-3 bg-transparent md:bg-white hover:bg-white/10 md:hover:bg-gray-50 text-white md:text-gray-900 border-0 justify-center md:justify-start font-medium transition-all duration-200"
            >
              <Users className="h-5 w-5 mr-3 text-white md:text-gray-900 drop-shadow-sm" />
              <span className="text-sm md:text-base drop-shadow-sm">
                {groupMembers.length > 0 ? `${t("group")} (${groupMembers.length + 1})` : t("addGroup")}
              </span>
            </Button>
          </div>

          {/* Search button - premium glass effect on mobile */}
          <div className="w-full md:w-auto flex items-center h-12 md:h-16 rounded-2xl md:rounded-none md:border-0 md:bg-white md:p-2 mt-1 md:mt-0">
            <Button
              onClick={onNavigate}
              className="w-full h-full md:rounded-full px-8 py-3 bg-white/95 md:bg-black hover:bg-white md:hover:bg-gray-800 text-gray-900 md:text-white border-0 justify-center font-semibold transition-all duration-300 shadow-lg md:shadow-none backdrop-blur-sm"
              disabled={!location || !date}
            >
              <Search className="h-5 w-5" />
              <span className="ml-2 md:hidden text-base font-semibold">{t("search") || "Search"}</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar