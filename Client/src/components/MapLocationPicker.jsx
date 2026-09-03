import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons in React
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
});

export default function MapLocationPicker({
    coordinates,
    onCoordinatesChange,
    onLocationNameChange,
    onLocationDetailsChange,
    address = '',
    onAddressChange
}) {
    const [searchValue, setSearchValue] = useState(address);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [locationInput, setLocationInput] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [userInteracted, setUserInteracted] = useState(false);

    // Debounced update function to prevent conflicts
    const updateLocationData = useCallback((locationData) => {
        if (isUpdating) return; // Prevent concurrent updates

        setIsUpdating(true);
        const { latitude, longitude, displayName, address: locationAddress, city, country } = locationData;

        // Batch all updates together
        const newPosition = [latitude, longitude];
        setSelectedPosition(newPosition);
        setLocationInput(displayName);

        // Use setTimeout to ensure parent state updates happen after local state is stable
        setTimeout(() => {
            if (onCoordinatesChange) {
                onCoordinatesChange({ latitude, longitude });
            }

            if (onLocationNameChange) {
                onLocationNameChange(displayName);
            }

            if (onAddressChange) {
                onAddressChange(displayName);
            }

            if (onLocationDetailsChange && locationAddress) {
                onLocationDetailsChange({
                    city: city || "",
                    country: country || "",
                    fullAddress: displayName,
                    addressComponents: locationAddress
                });
            }

            setIsUpdating(false);
        }, 50); // Small delay to batch updates
    }, [onCoordinatesChange, onLocationNameChange, onAddressChange, onLocationDetailsChange, isUpdating]);

    // Map click handler component
    function LocationMarker() {
        useMapEvents({
            click(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                const newPosition = [lat, lng];

                // Mark that user has interacted with the map
                setUserInteracted(true);

                // Update local state immediately
                setSelectedPosition(newPosition);
                setLocationInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); // Temporary placeholder

                // Update parent coordinates immediately
                if (onCoordinatesChange) {
                    onCoordinatesChange({ latitude: lat, longitude: lng });
                }

                // Reverse geocode to get proper address (this will update the address later)
                reverseGeocodeFromClick(lat, lng);
            },
        });
        return selectedPosition ? <Marker position={selectedPosition} icon={markerIcon} /> : null;
    }

    // Helper component to recenter map
    function RecenterMap({ position }) {
        const map = useMap();
        useEffect(() => {
            if (position) {
                map.setView(position);
            }
        }, [position, map]);
        return null;
    }

    // Location search function using Nominatim API
    const searchLocation = async (query) => {
        if (!query || query.length < 3) {
            return;
        }

        setIsSearching(true);
        setUserInteracted(true); // Mark as user interaction
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=1&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Booking-Web/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);

                // Extract city and country from search result
                const address = location.address;
                const city = address?.city ||
                    address?.town ||
                    address?.village ||
                    address?.municipality ||
                    address?.county ||
                    address?.state_district ||
                    address?.state ||
                    '';
                const country = address?.country || '';

                // Use the new batch update function
                updateLocationData({
                    latitude: lat,
                    longitude: lon,
                    displayName: location.display_name,
                    address: address,
                    city: city,
                    country: country
                });
            } else {
                console.warn("No search results found for:", query);
            }
        } catch (error) {
            console.error("Error searching location:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // Reverse geocoding function specifically for map clicks - uses batch update
    const reverseGeocodeFromClick = async (lat, lng, retryCount = 0) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Booking-Web/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.display_name) {
                // Update location input display
                setLocationInput(data.display_name);

                // Extract city and country from address components
                const address = data.address;
                const city = address?.city ||
                    address?.town ||
                    address?.village ||
                    address?.municipality ||
                    address?.county ||
                    address?.state_district ||
                    address?.state ||
                    '';
                const country = address?.country || '';

                // Update parent callbacks without affecting map position
                if (onAddressChange) {
                    onAddressChange(data.display_name);
                }
                if (onLocationNameChange) {
                    onLocationNameChange(data.display_name);
                }
                if (onLocationDetailsChange) {
                    onLocationDetailsChange({
                        city: city || "",
                        country: country || "",
                        fullAddress: data.display_name,
                        addressComponents: address
                    });
                }
            } else {
                // If no data, use coordinates as fallback
                const fallbackText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocationInput(fallbackText);
                if (onAddressChange) {
                    onAddressChange(fallbackText);
                }
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);

            // Retry once if it's the first attempt
            if (retryCount === 0) {
                setTimeout(() => {
                    reverseGeocodeFromClick(lat, lng, 1);
                }, 1000);
                return;
            }

            // Fallback to coordinates if reverse geocoding fails after retry
            const fallbackText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocationInput(fallbackText);
            if (onAddressChange) {
                onAddressChange(fallbackText);
            }
        }
    };

    // Reverse geocoding function to get location name from coordinates (for initial load only)
    const reverseGeocode = async (lat, lng, retryCount = 0) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Booking-Web/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && data.display_name) {
                // Only update the location input display, don't trigger parent callbacks
                setLocationInput(data.display_name);

                // Update the parent address only after a delay to prevent conflicts
                setTimeout(() => {
                    if (onAddressChange && !isUpdating) {
                        onAddressChange(data.display_name);
                    }
                    if (onLocationNameChange && !isUpdating) {
                        onLocationNameChange(data.display_name);
                    }
                }, 100);
            } else {
                // If no data, use coordinates as fallback
                const fallbackText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                setLocationInput(fallbackText);
                setTimeout(() => {
                    if (onAddressChange && !isUpdating) {
                        onAddressChange(fallbackText);
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);

            // Retry once if it's the first attempt
            if (retryCount === 0) {
                setTimeout(() => {
                    reverseGeocode(lat, lng, 1);
                }, 1000);
                return;
            }

            // Fallback to coordinates if reverse geocoding fails after retry
            const fallbackText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocationInput(fallbackText);
            setTimeout(() => {
                if (onAddressChange && !isUpdating) {
                    onAddressChange(fallbackText);
                }
            }, 100);
        }
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onAddressChange) {
            onAddressChange(value);
        }
    };

    // Handle location search button click
    const handleLocationSearchClick = () => {
        if (searchValue && searchValue.length >= 3) {
            searchLocation(searchValue);
        }
    };

    // Handle search input key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLocationSearchClick();
        }
    };

    // Set initial position based on coordinates prop (only on mount or when coordinates change externally)
    useEffect(() => {
        // Don't override if user has manually interacted with the map
        if (userInteracted) return;

        if (coordinates?.latitude && coordinates?.longitude) {
            const newPosition = [coordinates.latitude, coordinates.longitude];
            // Only update if the position is actually different to avoid infinite loops
            if (!selectedPosition ||
                Math.abs(selectedPosition[0] - coordinates.latitude) > 0.0001 ||
                Math.abs(selectedPosition[1] - coordinates.longitude) > 0.0001) {
                setSelectedPosition(newPosition);
                // Only reverse geocode if we don't already have location input for this position
                if (!locationInput || locationInput.includes('coordinates')) {
                    reverseGeocode(coordinates.latitude, coordinates.longitude);
                }
            }
        } else if (!selectedPosition) {
            // Set default location only if no position is set
            const defaultPosition = [55.1694, 23.8813]; // Lithuania as default
            setSelectedPosition(defaultPosition);
            if (onCoordinatesChange) {
                onCoordinatesChange({ latitude: 55.1694, longitude: 23.8813 });
            }
        }
    }, [coordinates?.latitude, coordinates?.longitude, userInteracted]);

    // Update search value when address prop changes (but don't reset map position)
    useEffect(() => {
        if (address !== searchValue && !isUpdating) {
            setSearchValue(address);
        }
    }, [address, searchValue, isUpdating]);

    const mapCenter = selectedPosition || [55.1694, 23.8813];

    return (
        <div className="space-y-4">
            {/* Address Input */}
            <div>
                <Label htmlFor="address-input" className="text-sm font-medium">
                    Event Address *
                </Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="address-input"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Search Location"
                        className="flex-1"
                        required
                    />
                    <Button
                        type="button"
                        onClick={handleLocationSearchClick}
                        disabled={!searchValue.trim() || isSearching || searchValue.length < 3}
                        className="px-3"
                    >
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Type an address and click search, or click on the map below
                </p>
            </div>

            {/* Location Name Display */}
            {locationInput && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{locationInput}</span>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="border rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <RecenterMap position={selectedPosition} />
                    <LocationMarker />
                </MapContainer>
            </div>

            {/* Current Coordinates Display */}
            {coordinates?.latitude && coordinates?.longitude && (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                            Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                        </span>
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                Click on the map to select a location. The address will be automatically updated.
            </p>
        </div>
    );
}
