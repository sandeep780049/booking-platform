import { MapPin, Calendar, X, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { SearchableDropdown } from "./SearchableDropdown"

export function SearchFilterBar({
  adventure,
  setAdventure,
  loc,
  setLoc,
  date,
  setDate,
  clearFilter,
  onSearch,
  locations = [],
  allAdventures = [],
}) {
  // Extract unique adventure names from all adventures
  const adventureOptions = [...new Set(allAdventures.map(adv => adv.name))].filter(Boolean)

  // Extract location names
  const locationOptions = adventure
    ? allAdventures
        .find(adv => adv.name?.toLowerCase() === adventure.toLowerCase())
        ?.location?.map(l => l.name)
        .filter(Boolean) || []
    : locations.map(location => location.name).filter(Boolean)

  return (
    <div className="space-y-4">
      {/* Main Search Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adventure Dropdown */}
        <SearchableDropdown
          value={adventure}
          onChange={(value) => {
            const newAdventure = value.toLowerCase()
            setAdventure(newAdventure)
            // Pass the NEW value directly to onSearch
            onSearch?.({ adventure: newAdventure, location: loc, date })
          }}
          options={adventureOptions}
          placeholder="Search adventures..."
          label="Adventure Type"
          icon={Sparkles}
          onClear={() => clearFilter("adventure")}
        />

        {/* Location Dropdown */}
        <SearchableDropdown
          value={loc.charAt(0).toUpperCase() + loc.slice(1)}
          onChange={(value) => {
            const newLoc = value.toLowerCase()
            setLoc(newLoc)
            // Pass the NEW value directly to onSearch
            onSearch?.({ adventure, location: newLoc, date })
          }}
          options={locationOptions}
          placeholder="Select location..."
          label="Location"
          icon={MapPin}
          required
          onClear={() => clearFilter("location")}
        />

        {/* Date Picker */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Calendar size={16} className="text-gray-600" />
            Date
          </label>
          <div className="relative group">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors pointer-events-none z-10"
            />
            <input
              type="date"
              value={date ? date.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const selectedDate = e.target.value ? new Date(e.target.value) : undefined
                setDate(selectedDate)
                // Pass the NEW value directly to onSearch
                onSearch?.({ adventure, location: loc, date: selectedDate })
              }}
              className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white hover:border-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer text-gray-900"
              placeholder=""
            />
            {date && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => clearFilter("date")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
              >
                <X size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
