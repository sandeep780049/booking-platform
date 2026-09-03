import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function LocationAutocomplete({
  locations = [],
  value,
  onChange,
  placeholder = "Select",
  className = "",
  allowAdd = true,
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || "")
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const [dropdownRect, setDropdownRect] = useState(null)
  const dropdownRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const normalize = (v) => (v == null ? "" : String(v))

  // Normalize incoming locations into { value, label, subtitle?, icon? }
  const normalized = (locations || []).map((loc) => {
    if (typeof loc === "string") return { value: loc, label: loc }
    // support common shapes
    return {
      value: loc.value ?? loc.id ?? loc.name ?? loc.label,
      label: loc.label ?? loc.name ?? loc.title ?? String(loc.value ?? loc.id ?? ""),
      subtitle: loc.subtitle ?? loc.city ?? loc.region ?? null,
      icon: loc.icon ?? loc.avatar ?? null,
    }
  })

  const filtered = inputValue.trim() === ""
    ? normalized
    : normalized.filter((it) => it.label.toLowerCase().includes(inputValue.toLowerCase()))

  const isExactMatch = normalized.some((it) => it.label.toLowerCase() === inputValue.trim().toLowerCase())

  // default styling: remove any red outline and use a subtle focus ring
  const inputClass = className || "pl-2 py-4 text-base border-0 outline-none focus:outline-none focus:ring-0 flex-1 bg-transparent h-full"

  const onInputChange = (e) => {
    const v = e.target.value
    setInputValue(v)
    onChange?.(v)
    setOpen(true)
    setHighlight(0)
  }

  const selectItem = (val) => {
    // val may be a normalized item object or a string
    const newVal = val && typeof val === 'object' ? (val.label ?? val.value ?? String(val)) : val
    setInputValue(newVal)
    onChange?.(newVal)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, filtered.length + (allowAdd && !isExactMatch ? 0 : -1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      if (open) {
        const addIndex = filtered.length
        const maxIndex = allowAdd && !isExactMatch ? addIndex : Math.max(filtered.length - 1, 0)
        const idx = Math.min(highlight, maxIndex)
        if (idx < filtered.length) {
          selectItem(filtered[idx])
        } else if (allowAdd && inputValue.trim() !== "" && !isExactMatch) {
          selectItem(inputValue.trim())
        } else {
          setOpen(false)
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  // click outside to close
  useEffect(() => {
    const onDoc = (e) => {
      const target = e.target
      // if click is inside the input container or the portaled dropdown, do nothing
      if (
        (containerRef.current && containerRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  // compute dropdown position based on input rect so it can be rendered in a portal
  useEffect(() => {
    if (open && inputRef.current && typeof window !== 'undefined') {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width })
    } else {
      setDropdownRect(null)
    }
  }, [open])

  // reposition dropdown on scroll/resize
  useEffect(() => {
    if (!open) return
    const update = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownRect({ top: rect.bottom, left: rect.left, width: rect.width })
      }
    }
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex items-center w-full rounded-2xl ${isFocused ? 'ring-2 ring-indigo-200/60' : ''}`}>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="autocomplete-list"
          aria-autocomplete="list"
          aria-activedescendant={open ? `option-${highlight}` : undefined}
          value={normalize(inputValue)}
          onChange={onInputChange}
          onFocus={() => { setOpen(true); setIsFocused(true) }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClass}
          // Inline style to aggressively remove browser focus outlines/box-shadows (orange ring)
          style={{ outline: 'none', boxShadow: 'none', WebkitBoxShadow: 'none' }}
          autoComplete="off"
        />
      </div>

      {open && dropdownRect && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.ul
            ref={dropdownRef}
            id="autocomplete-list"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'fixed',
              top: dropdownRect.top + 'px',
              left: dropdownRect.left + 'px',
              width: dropdownRect.width + 'px',
              zIndex: 9999
            }}
            role="listbox"
            className="bg-white border border-gray-100 mt-1 rounded-2xl shadow-2xl max-h-56 overflow-auto"
          >
            {filtered.map((it, idx) => (
              <li
                id={`option-${idx}`}
                role="option"
                aria-selected={highlight === idx}
                key={it.value + idx}
                onMouseDown={() => selectItem(it.label)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${highlight === idx ? 'bg-gray-50' : ''}`}
              >
                {it.icon && (
                  typeof it.icon === 'string' ? (
                    <img src={it.icon} alt="" className="w-6 h-6 rounded-md object-cover mt-0.5" />
                  ) : (
                    <span className="w-6 h-6 mt-0.5 inline-block">{it.icon}</span>
                  )
                )}
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-800">{it.label}</div>
                  {it.subtitle && <div className="text-xs text-gray-500">{it.subtitle}</div>}
                </div>
              </li>
            ))}

            {allowAdd && inputValue.trim() !== "" && !isExactMatch && (
              <li
                id={`option-${filtered.length}`}
                role="option"
                aria-selected={highlight === filtered.length}
                onMouseDown={() => selectItem(inputValue.trim())}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${highlight === filtered.length ? 'bg-gray-50' : ''}`}
              >
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-800">Add "{inputValue.trim()}"</div>
                </div>
              </li>
            )}

            {filtered.length === 0 && !(allowAdd && inputValue.trim() !== "" && !isExactMatch) && (
              <li className="px-4 py-3 text-sm text-gray-500">No results</li>
            )}
          </motion.ul>
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
