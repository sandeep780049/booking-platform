import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { MediaUpload } from "./MediaUpload";
import { DocumentUpload } from "./DocumentUpload";

export const ProfessionalInformationSection = ({
    formData,
    errors,
    adventures,
    locations,
    onChange,
    onSelectChange,
    onMediaFilesChange,
    onRemoveMediaFile,
    onDocumentChange,
}) => {
    return (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-black">
                Professional Information
            </h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-black">
                        Professional Bio
                    </Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={onChange}
                        placeholder="Share your experience, qualifications, and teaching approach"
                        className={`min-h-32 resize-none ${errors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}`}
                    />
                    {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">
                            Adventure Specialty
                        </Label>
                        <Select
                            value={formData.adventure}
                            onValueChange={(value) => onSelectChange("adventure", value)}
                        >
                            <SelectTrigger className={errors.adventure ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}>
                                <SelectValue placeholder="Select adventure" />
                            </SelectTrigger>
                            <SelectContent>
                                {adventures?.map((adventure) => (
                                    <SelectItem key={adventure._id} value={adventure._id}>
                                        {adventure.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.adventure && (
                            <p className="text-sm text-red-600">{errors.adventure}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-black">
                            Preferred Location
                        </Label>
                        <Select
                            value={formData.location}
                            onValueChange={(value) => onSelectChange("location", value)}
                            disabled={!formData.adventure}
                        >
                            <SelectTrigger className={errors.location ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}>
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations?.map((location) => (
                                    <SelectItem key={location._id} value={location._id}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.location && (
                            <p className="text-sm text-red-600">{errors.location}</p>
                        )}
                    </div>
                </div>

                <MediaUpload
                    files={formData.mediaFiles}
                    onChange={onMediaFilesChange}
                    onRemove={onRemoveMediaFile}
                />

                <DocumentUpload
                    certificate={formData.certificate}
                    governmentId={formData.governmentId}
                    onCertificateChange={(file) => onDocumentChange("certificate", file)}
                    onGovernmentIdChange={(file) =>
                        onDocumentChange("governmentId", file)
                    }
                    certificateError={errors.certificate}
                    governmentIdError={errors.governmentId}
                />
            </div>
        </div>
    );
};
