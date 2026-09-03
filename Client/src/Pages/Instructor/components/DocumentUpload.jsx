import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Label } from "../../../components/ui/label";

export const DocumentUpload = ({
    certificate,
    governmentId,
    onCertificateChange,
    onGovernmentIdChange,
    certificateError,
    governmentIdError,
}) => {
    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === "certificate") {
            onCertificateChange(file);
        } else if (type === "governmentId") {
            onGovernmentIdChange(file);
        }
    };

    const DocumentItem = ({ label, description, file, onChange, type, error }) => {
        return (
            <div className={`border rounded-md p-4 bg-white ${error ? "border-red-500" : "border-gray-200"}`}>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${file ? "bg-gray-100" : "bg-gray-50"}`}>
                        {file ? (
                            <CheckCircle className="w-5 h-5 text-black" />
                        ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Label className="font-medium text-sm text-black">{label}</Label>
                        <p className="text-xs text-gray-600 mt-1 mb-3">{description}</p>

                        {file ? (
                            <div className="space-y-2">
                                <div className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-900 truncate">
                                    {file.name}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    className="text-xs text-gray-600 hover:text-black underline"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <label className="inline-flex items-center gap-2 cursor-pointer bg-black hover:bg-gray-800 text-white text-sm py-2 px-4 rounded transition-colors">
                                <Upload className="w-4 h-4" />
                                <span>Upload</span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, type)}
                                />
                            </label>
                        )}

                        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm font-medium text-black">
                    Verification Documents
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                    Upload required documents for verification
                </p>
            </div>

            <div className="space-y-3">
                <DocumentItem
                    label="Certification"
                    description="Adventure certification (PDF, JPG, PNG - Max 5MB)"
                    file={certificate}
                    onChange={onCertificateChange}
                    type="certificate"
                    error={certificateError}
                />

                <DocumentItem
                    label="Government ID"
                    description="Valid government-issued ID (PDF, JPG, PNG - Max 5MB)"
                    file={governmentId}
                    onChange={onGovernmentIdChange}
                    type="governmentId"
                    error={governmentIdError}
                />
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                    Documents are securely stored and used only for verification purposes
                </p>
            </div>
        </div>
    );
};

