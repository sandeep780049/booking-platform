import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAdventures } from "../../hooks/useAdventure";
import { VerifyUser } from "../../Auth/UserAuth";
import { useInstructorRegistration } from "./hooks/useInstructorRegistration";
import { BasicInformationSection } from "./components/BasicInformationSection";
import { ProfessionalInformationSection } from "./components/ProfessionalInformationSection";
import { OTPVerificationModal } from "./components/OTPVerificationModal";

export const InstructorRegister = () => {
    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { adventures } = useAdventures();

    const {
        formData,
        errors,
        locations,
        isSubmitting,
        handleInputChange,
        handleSelectChange,
        handleProfileImageChange,
        handleMediaFilesChange,
        handleRemoveMediaFile,
        handleDocumentChange,
        submitRegistration,
    } = useInstructorRegistration(adventures);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await submitRegistration();
        if (result) {
            setIsOTPModalOpen(true);
        }
    };

    const handleVerifyOTP = async (otp) => {
        const data = { email: formData.email, otp };
        try {
            const statusCode = await VerifyUser(data, dispatch);

            if (statusCode === 200) {
                toast.success("Email verified successfully");
                setIsOTPModalOpen(false);
                navigate("/instructor/pending-review");
            } else if (statusCode === 400) {
                toast.error("Invalid or expired OTP. Please check the code and try again.");
                throw new Error("Invalid OTP");
            } else {
                toast.error("OTP verification failed. Please try again.");
                throw new Error("Verification failed");
            }
        } catch (error) {
            if (error?.response?.status === 410) {
                toast.error("OTP has expired. Please request a new one.");
            } else if (error?.response?.status === 404) {
                toast.error("User not found. Please register first.");
            } else if (!error?.response) {
                toast.error("Invalid OTP. Please try again.");
            }
            throw error;
        }
    };

    const handleCloseOTPModal = () => {
        setIsOTPModalOpen(false);
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-white px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Button
                        type="button"
                        onClick={handleBackToHome}
                        className="bg-white hover:bg-gray-100 text-black border border-gray-300"
                    >
                        ← Back to Home
                    </Button>
                </div>
                <Card className="border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-black">
                            Instructor Registration
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Apply to join our team of professional instructors
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <BasicInformationSection
                                    formData={formData}
                                    errors={errors}
                                    onChange={handleInputChange}
                                    onProfileImageChange={handleProfileImageChange}
                                />

                                <ProfessionalInformationSection
                                    formData={formData}
                                    errors={errors}
                                    adventures={adventures}
                                    locations={locations}
                                    onChange={handleInputChange}
                                    onSelectChange={handleSelectChange}
                                    onMediaFilesChange={handleMediaFilesChange}
                                    onRemoveMediaFile={handleRemoveMediaFile}
                                    onDocumentChange={handleDocumentChange}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black hover:bg-gray-800 text-white disabled:bg-gray-400"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </Button>
                            <p className="mt-3 text-xs text-gray-500 text-center">
                                By submitting, you agree to our terms and conditions
                            </p>
                        </div>
                    </form>
                </Card>
            </div>

            <OTPVerificationModal
                isOpen={isOTPModalOpen}
                onClose={handleCloseOTPModal}
                onVerify={handleVerifyOTP}
                email={formData.email}
            />
        </div>
    );
};
