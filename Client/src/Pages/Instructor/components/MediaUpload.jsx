import { useState } from "react";
import { Upload, X, ImageIcon, Film } from "lucide-react";
import { Label } from "../../../components/ui/label";

export const MediaUpload = ({ files, onChange, onRemove }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer?.files?.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(
                (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
            );
            if (newFiles.length > 0) {
                onChange(newFiles);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target?.files?.length > 0) {
            const newFiles = Array.from(e.target.files).filter(
                (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
            );
            if (newFiles.length > 0) {
                onChange(newFiles);
            }
        }
    };

    const getFilePreview = (file, index) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        return (
            <div
                key={`${file.name}-${index}`}
                className="relative group rounded border border-gray-200 overflow-hidden"
            >
                <div className="aspect-square w-full bg-gray-50 flex items-center justify-center">
                    {isImage ? (
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    ) : isVideo ? (
                        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                            <Film className="text-white w-8 h-8" />
                            <span className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
                                Video
                            </span>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">Unsupported</div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="absolute top-1 right-1 bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-black">
                    Portfolio Media
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                    Optional: Showcase your work
                </p>
            </div>

            <div
                className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${dragActive
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-700 mb-1">
                        Drag and drop media files here
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                        JPG, PNG, GIF, MP4 (max 10MB each)
                    </p>
                    <label className="cursor-pointer bg-black hover:bg-gray-800 text-white text-sm py-2 px-4 rounded transition-colors">
                        Browse Files
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            {files.length > 0 && (
                <div>
                    <Label className="mb-2 block text-sm text-gray-700">
                        Uploaded: {files.length} {files.length === 1 ? "file" : "files"}
                    </Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {files.map((file, index) => getFilePreview(file, index))}
                    </div>
                </div>
            )}
        </div>
    );
};

