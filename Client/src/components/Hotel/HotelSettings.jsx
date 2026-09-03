import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Settings as SettingsIcon, Save, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateHotel } from '../../Api/hotel.api';

export const HotelSettings = ({ hotel, onUpdateSuccess }) => {
    const [formData, setFormData] = React.useState({
        name: hotel.name || '',
        description: hotel.description || '',
        contactNo: hotel.contactNo || '',
        managerName: hotel.managerName || '',
        fullAddress: hotel.fullAddress || '',
        price: hotel.price || 0,
        noRoom: hotel.noRoom || 0,
        website: hotel.website || '',
    });

    const [saving, setSaving] = React.useState(false);
    const [profileImage, setProfileImage] = React.useState(null);
    const [hotelImages, setHotelImages] = React.useState([]);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages on change
        setError('');
        setSuccess('');
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setProfileImage(file);
            setError('');
        }
    };

    const handleHotelImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('You can upload maximum 5 images');
            return;
        }
        
        // Validate each file
        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError('All files must be images');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image should be less than 5MB');
                return;
            }
            validFiles.push(file);
        }
        
        setHotelImages(validFiles);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Create FormData for multipart/form-data
            const formDataToSend = new FormData();
            
            // Append text fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append files if selected
            if (profileImage) {
                formDataToSend.append('profileImage', profileImage);
            }

            if (hotelImages.length > 0) {
                hotelImages.forEach(image => {
                    formDataToSend.append('hotelImages', image);
                });
            }

            // Call API
            const response = await updateHotel(hotel._id, formDataToSend);

            if (response.data && response.data.success) {
                setSuccess('Hotel settings updated successfully!');

                // Call parent callback with updated hotel data
                if (onUpdateSuccess && response.data.data.hotel) {
                    onUpdateSuccess(response.data.data.hotel);
                }

                // Reset file inputs
                setProfileImage(null);
                setHotelImages([]);
                
                // Clear file input fields
                const profileInput = document.getElementById('profileImage');
                const imagesInput = document.getElementById('hotelImages');
                if (profileInput) profileInput.value = '';
                if (imagesInput) imagesInput.value = '';
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const errorMessage = response.response?.data?.message || 'Failed to update hotel settings';
                setError(errorMessage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error updating hotel:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred while updating hotel settings';
            setError(errorMessage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        setFormData({
            name: hotel.name || '',
            description: hotel.description || '',
            contactNo: hotel.contactNo || '',
            managerName: hotel.managerName || '',
            fullAddress: hotel.fullAddress || '',
            price: hotel.price || 0,
            noRoom: hotel.noRoom || 0,
            website: hotel.website || '',
        });
        setProfileImage(null);
        setHotelImages([]);
        setError('');
        setSuccess('');
        
        // Clear file inputs
        const profileInput = document.getElementById('profileImage');
        const imagesInput = document.getElementById('hotelImages');
        if (profileInput) profileInput.value = '';
        if (imagesInput) imagesInput.value = '';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        <CardTitle className="text-xl">Hotel Settings</CardTitle>
                    </div>
                    <CardDescription>Manage your hotel information and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">Success</p>
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Hotel Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter hotel name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="managerName">Manager Name</Label>
                                    <Input
                                        id="managerName"
                                        name="managerName"
                                        value={formData.managerName}
                                        onChange={handleChange}
                                        placeholder="Enter manager name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactNo">Contact Number</Label>
                                    <Input
                                        id="contactNo"
                                        name="contactNo"
                                        value={formData.contactNo}
                                        onChange={handleChange}
                                        placeholder="Enter contact number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://yourhotel.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Description</h3>
                            <div className="space-y-2">
                                <Label htmlFor="description">Hotel Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your hotel..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Location */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Location</h3>
                            <div className="space-y-2">
                                <Label htmlFor="fullAddress">Full Address</Label>
                                <Textarea
                                    id="fullAddress"
                                    name="fullAddress"
                                    value={formData.fullAddress}
                                    onChange={handleChange}
                                    placeholder="Enter full address"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Pricing & Capacity */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Pricing & Capacity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price per Night (€)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="noRoom">Number of Rooms</Label>
                                    <Input
                                        id="noRoom"
                                        name="noRoom"
                                        type="number"
                                        value={formData.noRoom}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Media Upload */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Media</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="profileImage">Hotel Logo</Label>
                                    <div className="mt-2 flex items-center gap-4">
                                        {hotel.logo && (
                                            <img
                                                src={hotel.logo}
                                                alt="Hotel logo"
                                                className="w-16 h-16 rounded-full object-cover border"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <Input
                                                id="profileImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                className="cursor-pointer"
                                            />
                                            {profileImage && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Selected: {profileImage.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload a new logo (max 5MB, JPG/PNG)
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="hotelImages">Hotel Images</Label>
                                    <div className="mt-2">
                                        <Input
                                            id="hotelImages"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleHotelImagesChange}
                                            className="cursor-pointer"
                                        />
                                        {hotelImages.length > 0 && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Selected: {hotelImages.length} image(s)
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload up to 5 images (max 5MB each, JPG/PNG)
                                    </p>
                                    {hotel.medias && hotel.medias.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-muted-foreground mb-2">Current images:</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {hotel.medias.slice(0, 5).map((media, index) => (
                                                    <img
                                                        key={index}
                                                        src={media}
                                                        alt={`Hotel ${index + 1}`}
                                                        className="w-16 h-16 rounded object-cover border"
                                                    />
                                                ))}
                                                {hotel.medias.length > 5 && (
                                                    <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center">
                                                        <span className="text-xs text-muted-foreground">
                                                            +{hotel.medias.length - 5}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
