import { useState, useEffect } from "react";
import { Camera } from "lucide-react";

export const ProfileImageUpload = ({ initialImage, onChange, getInitial }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (initialImage instanceof File) {
            const url = URL.createObjectURL(initialImage);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [initialImage]);

    const handleFileChange = (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        if (file.type.startsWith("image/")) {
            onChange(file);
        }
    };

    return (
        <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group border-2 border-gray-200">
            {previewUrl ? (
                <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-3xl font-semibold text-gray-600">
                    {getInitial()}
                </span>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-6 h-6" />
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    aria-label="Upload profile image"
                />
            </div>
        </div>
    );
};

