import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function SearchableDropdown({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    label,
    required = false,
    icon: Icon,
    onClear
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchTerm("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])

    const handleSelect = (option) => {
        if (option !== value) {
            onChange(option)
        }
        setIsOpen(false)
        setSearchTerm("")
    }

    const handleClear = (e) => {
        e.stopPropagation()
        onClear?.()
        setSearchTerm("")
    }

    return (
        <div className="space-y-2" ref={dropdownRef}>
            {label && (
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    {Icon && <Icon size={16} className="text-gray-600" />}
                    {label}
                    {required && <span className="text-gray-500 text-xs font-normal">(Required)</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 text-left rounded-lg border-2 transition-all bg-white ${!value && required
                        ? 'border-gray-400 hover:border-gray-600'
                        : 'border-gray-300 hover:border-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent flex items-center justify-between`}
                >
                    <span className={value ? "text-gray-900" : "text-gray-500"}>
                        {value || placeholder}
                    </span>
                    <div className="flex items-center gap-2">
                        {value && (
                            <X
                                size={16}
                                className="text-gray-400 hover:text-gray-600"
                                onClick={handleClear}
                            />
                        )}
                        <ChevronDown
                            size={18}
                            className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-60 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className="w-full px-4 py-2.5 text-left hover:bg-gray-100 transition-colors flex items-center justify-between group"
                                        >
                                            <span className="text-gray-900 text-sm">{option}</span>
                                            {value?.toLowerCase() === option.toLowerCase() && (
                                                <Check size={16} className="text-gray-900" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                        No results found
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
