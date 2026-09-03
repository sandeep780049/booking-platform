import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { MapPin, Phone, Home, Users, PocketIcon as Pool, Edit, Euro } from 'lucide-react';

export const HotelOverview = ({ hotel, onUpdatePrice }) => {
    const formatDisplay = (value) => {
        if (value == null) return '';
        if (typeof value === 'object') {
            if (Object.prototype.hasOwnProperty.call(value, 'name')) return value.name;
            if (Object.prototype.hasOwnProperty.call(value, 'title')) return value.title;
            try {
                return JSON.stringify(value);
            } catch {
                return '';
            }
        }
        return value;
    };

    return (
        <div className="space-y-6">
            {/* Hotel Header */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        {hotel.logo && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border">
                                <img
                                    src={hotel.logo || "/placeholder.svg"}
                                    alt={`${hotel.name} logo`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = "/placeholder.svg?height=64&width=64";
                                    }}
                                />
                            </div>
                        )}
                        <div>
                            <CardTitle className="text-2xl">{hotel.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <CardDescription>
                                    {typeof hotel.location === 'object' && hotel.location?.name
                                        ? hotel.location.name
                                        : typeof hotel.location === 'string'
                                            ? hotel.location
                                            : "Location not specified"}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium mb-2">Hotel Details</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>Manager: {hotel.managerName}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>Contact: {hotel.contactNo}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                    <span>Rooms: {hotel.noRoom}</span>
                                </li>
                                <li className="flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Euro className="h-4 w-4 text-muted-foreground" />
                                        <span>Price: €{hotel.price}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={onUpdatePrice}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <span>Address: {hotel.fullAddress}</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {hotel.amenities && hotel.amenities.map((amenity, index) => (
                                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                                        {(typeof amenity === 'object' && amenity?.name ? amenity.name : amenity) === 'Pool' && <Pool className="h-3 w-3" />}
                                        {typeof amenity === 'object' && amenity?.name
                                            ? amenity.name
                                            : typeof amenity === 'string'
                                                ? amenity
                                                : 'Amenity'}
                                    </Badge>
                                ))}
                            </div>

                            <h3 className="font-medium mt-6 mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground">{hotel.description}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gallery Section */}
            {hotel.medias && hotel.medias.length > 0 && (
                <HotelGallery medias={hotel.medias} />
            )}
        </div>
    );
};

const HotelGallery = ({ medias }) => {
    const [activeImage, setActiveImage] = React.useState(medias[0]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Gallery</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video rounded-md overflow-hidden mb-4 bg-muted">
                    <img
                        src={activeImage || "/placeholder.svg"}
                        alt="Hotel view"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "/placeholder.svg?height=400&width=600";
                        }}
                    />
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {medias.map((media, index) => (
                        <div
                            key={index}
                            className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${activeImage === media ? 'border-primary' : 'border-transparent'}`}
                            onClick={() => setActiveImage(media)}
                        >
                            <img
                                src={media || "/placeholder.svg"}
                                alt={`Hotel view ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "/placeholder.svg?height=80&width=80";
                                }}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
