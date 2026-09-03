import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog"
import { createLocation, updateLocation, deleteLocation, fetchLocations } from "../../../Api/location.api"
import { MapPin, Plus, Edit2, Trash2, Search } from "lucide-react"

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
})

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} icon={markerIcon} /> : null
}

function FocusMapOnPosition({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true })
    }
  }, [position, map])
  return null
}

function fetchAddressFromCoords(lat, lng, setAddress) {
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    .then((res) => res.json())
    .then((data) => setAddress(data.display_name || "Unknown address"))
    .catch(() => setAddress("Unknown address"))
}

function fetchCoordsFromAddress(address, setPosition, setAddress, setError) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data[0]) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        setAddress(data[0].display_name)
        setError("")
      } else {
        setError("Address not found")
      }
    })
    .catch(() => setError("Error fetching coordinates"))
}

function LocationFormModal({ open, onClose, onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [position, setPosition] = useState(initialData?.position || null)
  const [address, setAddress] = useState(initialData?.address || "")
  const [addressInput, setAddressInput] = useState("")
  const [geoError, setGeoError] = useState("")

  useEffect(() => {
    if (position) {
      fetchAddressFromCoords(position[0], position[1], setAddress)
    } else {
      setAddress("")
    }
  }, [position])

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setPosition(initialData.position || null)
      setAddress(initialData.address || "")
      setAddressInput("")
      setGeoError("")
    } else if (open && !initialData) {
      setName("")
      setDescription("")
      setPosition(null)
      setAddress("")
      setAddressInput("")
      setGeoError("")
    }
  }, [open, initialData])

  const handleAddressSearch = (e) => {
    e.preventDefault()
    if (!addressInput.trim()) return
    fetchCoordsFromAddress(addressInput, setPosition, setAddress, setGeoError)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !position) return
    onSubmit({
      name,
      description,
      position,
      address,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          {initialData ? "Edit Location" : "Add New Location"}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">
              Location Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Description</label>
            <Input
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900">
              Map Location <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-600">Click on the map or search by address</p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search address..."
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddressSearch}
                variant="outline"
                className="px-6"
              >
                Find
              </Button>
            </div>

            {geoError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                {geoError}
              </div>
            )}

            <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
              <MapContainer
                center={position || [27.7, 85.3]}
                zoom={position ? 14 : 6}
                style={{ height: "350px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <FocusMapOnPosition position={position} />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            {position && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                <div className="text-sm font-medium text-gray-900">
                  Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </div>
                <div className="text-sm text-gray-600">
                  {address || "Loading address..."}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!position || !name.trim()}
              className="px-8 bg-black hover:bg-gray-800 text-white"
            >
              {initialData ? "Save Changes" : "Add Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchLocations()
      .then((res) => {
        setLocations(
          (res.data || []).map((loc) => ({
            id: loc._id,
            name: loc.name,
            description: loc.description,
            lat: loc.location?.coordinates[1],
            lng: loc.location?.coordinates[0],
            address: loc.address,
            instructorLimit: loc.instructorLimit,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAddClick = () => {
    setEditIndex(null)
    setModalOpen(true)
  }

  const handleEditClick = (idx) => {
    setEditIndex(idx)
    setModalOpen(true)
  }

  const handleDelete = async (idx) => {
    const loc = locations[idx]
    if (!loc) return
    if (!confirm(`Are you sure you want to delete "${loc.name}"?`)) return

    setLoading(true)
    try {
      await deleteLocation(loc.id)
      setLocations((prev) => prev.filter((_, i) => i !== idx))
    } finally {
      setLoading(false)
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleModalSubmit = async (data) => {
    setLoading(true)
    try {
      if (editIndex === null) {
        const res = await createLocation(data)
        const loc = res.data
        setLocations((prev) => [
          ...prev,
          {
            id: loc._id,
            name: loc.name,
            description: loc.description,
            lat: loc.location?.coordinates[1],
            lng: loc.location?.coordinates[0],
            address: loc.address,
            instructorLimit: loc.instructorLimit,
          },
        ])
      } else {
        const loc = locations[editIndex]
        const res = await updateLocation(loc.id, data)
        const updated = res.data
        setLocations((prev) =>
          prev.map((l, i) =>
            i === editIndex
              ? {
                id: updated._id,
                name: updated.name,
                description: updated.description,
                lat: updated.location?.coordinates[1],
                lng: updated.location?.coordinates[0],
                address: updated.address,
              }
              : l
          )
        )
      }
    } finally {
      setLoading(false)
      setModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <MapPin className="h-10 w-10" />
              Locations
            </h1>
            <p className="text-gray-600 mt-2">Manage adventure locations and coordinates</p>
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-black hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Add Location
          </Button>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-10 w-10 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-900 font-semibold text-lg">No locations yet</p>
                  <p className="text-gray-500 text-sm mt-1">Get started by adding your first location</p>
                </div>
                <Button
                  onClick={handleAddClick}
                  className="mt-2 bg-black hover:bg-gray-800 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((loc, idx) => (
                  <div
                    key={loc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{loc.name}</h3>
                            {loc.description && (
                              <p className="text-sm text-gray-600 mt-1">{loc.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-7 space-y-1">
                          <div className="text-sm text-gray-500 font-mono">
                            {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-1">
                            {loc.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 md:ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(idx)}
                          className="border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200 group/edit"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1.5 group-hover/edit:scale-110 transition-transform duration-200" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(idx)}
                          className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 group/delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5 group-hover/delete:scale-110 transition-transform duration-200" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <LocationFormModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialData={
            editIndex !== null
              ? {
                name: locations[editIndex]?.name,
                description: locations[editIndex]?.description,
                position: locations[editIndex] ? [locations[editIndex].lat, locations[editIndex].lng] : null,
                address: locations[editIndex]?.address,
              }
              : undefined
          }
        />
      </div>
    </div>
  )
}
