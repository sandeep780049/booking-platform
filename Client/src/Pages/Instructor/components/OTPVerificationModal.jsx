import { useState } from "react";
import { Modal } from "antd";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../../components/ui/input-otp";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { ResendOtp } from "../../../Auth/UserAuth";

export const OTPVerificationModal = ({ isOpen, onClose, onVerify, email }) => {
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP code.");
            return;
        }

        setIsVerifying(true);
        try {
            await onVerify(otp);
            setOtp("");
        } catch (error) {
            // error handled by parent
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            toast.error("Email not found. Please try again.");
            return;
        }

        setIsResending(true);
        const toastId = toast.loading("Resending verification code...");
        try {
            const res = await ResendOtp(email);
            if (res === 403) {
                toast.error("Account is already verified.", { id: toastId });
            } else {
                toast.success("New verification code sent to your email!", { id: toastId });
            }
        } catch (err) {
            if (err?.response?.status === 429) {
                toast.error("Too many requests. Please wait before requesting another code.", { id: toastId });
            } else {
                toast.error("Failed to resend verification code. Please try again.", { id: toastId });
            }
        } finally {
            setIsResending(false);
        }
    };

    const handleClose = () => {
        setOtp("");
        onClose();
    };

    return (
        <Modal open={isOpen} footer={null} onCancel={handleClose} centered>
            <div className="space-y-6 p-4">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-black">Verify Your Email</h2>
                    <p className="text-sm text-gray-600">
                        Enter the 6-digit code sent to{" "}
                        <span className="text-blue-500 break-all">{email}</span>
                    </p>
                </div>

                <div className="flex justify-center">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleVerify}
                        disabled={otp.length !== 6 || isVerifying}
                        className="w-full bg-black hover:bg-gray-800 text-white"
                    >
                        {isVerifying ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <button
                        onClick={handleResendOtp}
                        type="button"
                        disabled={isVerifying || isResending}
                        className="text-blue-500 text-sm w-full py-1 hover:text-blue-700 transition-colors disabled:text-gray-400"
                    >
                        {isResending ? "Resending..." : "Didn't receive code? Resend OTP"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
