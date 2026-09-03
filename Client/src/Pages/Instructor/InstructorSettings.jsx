import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { Globe, Lock, Mail, ShieldCheck } from 'lucide-react'
import InstructorLayout from "./InstructorLayout"
import { UpdateEmail, UpdatePassword, VerifyNewEmail } from "../../Auth/UserAuth"
import { useAuth } from "../AuthProvider"
import { Modal } from "antd"
import { InputOTPSlot, InputOTP, InputOTPGroup } from "../../components/ui/input-otp"
import { updateLanguageHeaders } from "../../Api/language.api.js"
import { setLanguage } from "../../Store/LanguageSlice.js"

const InstructorSettings = () => {
    const { t, i18n } = useTranslation()
    const dispatch = useDispatch()
    const currentLanguageCode = useSelector((state) => state.language.currentLanguage)
    const [loading, setLoading] = useState(false)
    const { user } = useAuth();
    const [newEmail, setNewEmail] = useState("");
    const [openOtp, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const [settings, setSettings] = useState({
        email: user?.user?.email || "",
        newEmail: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        language: currentLanguageCode || "en",
    })

    const handleSettingChange = (section, field, value) => {
        if (section) {
            setSettings((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value,
                },
            }))
        } else {
            setSettings((prev) => ({
                ...prev,
                [field]: value,
            }))

            if (field === "language") {
                dispatch(setLanguage(value))
                i18n.changeLanguage(value)
                updateLanguageHeaders(value)
                setTimeout(() => {
                    window.location.reload()
                }, 100)
            }
        }
    }

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        if (!newEmail) {
            toast.error(t("instructor.pleaseEnterNewEmail"))
            return
        }
        setLoading(true)
        try {
            const res = await VerifyNewEmail(newEmail);
            if (res?.status === 200) {
                setOtpSent(true);
                toast.success(t("instructor.otpSentToEmail") || "OTP sent to your new email")
            }
        } catch (error) {
            console.error("Error verifying email:", error);
            toast.error(t("instructor.errorVerifyingEmail") || "An error occurred while verifying email");
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error(t("instructor.pleaseEnterOtp") || "Please enter the 6-digit OTP");
            return;
        }
        setLoading(true);
        try {
            const data = { email: newEmail, otp };
            const res = await UpdateEmail(data);
            if (res?.status === 200) {
                toast.success(t("instructor.emailVerifiedSuccessfully") || "Email updated successfully");
                setOtpSent(false);
                setOtp("");
                setNewEmail("");
            } else {
                toast.error(t("instructor.invalidOtp") || "Invalid OTP. Please try again.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            toast.error(t("instructor.errorVerifyingOtp") || "An error occurred while verifying OTP");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()

        if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
            toast.error(t("instructor.pleaseCompleteAllFields"))
            return
        }

        if (settings.newPassword !== settings.confirmPassword) {
            toast.error(t("instructor.passwordsDoNotMatch"))
            return
        }

        if (settings.newPassword.length < 6) {
            toast.error(t("instructor.passwordTooShort") || "Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            const res = await UpdatePassword({
                extpassword: settings.currentPassword,
                newpassword: settings.newPassword,
            })

            if (res?.status === 200 || res?.statusCode === 200) {
                toast.success(t("instructor.passwordUpdatedSuccessfully"))
                setSettings(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }))
            } else if (res?.status === 400 || res?.response?.status === 400) {
                toast.error(t("instructor.currentPasswordIncorrect"))
            } else {
                toast.error(t("instructor.somethingWentWrong"))
            }
        } catch (err) {
            toast.error(t("instructor.somethingWentWrong"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <InstructorLayout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Page Header */}
                <div className="border-b pb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                        {t("instructor.settings")}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        {t("instructor.manageYourAccountSettings")}
                    </p>
                </div>

                {/* Account Settings Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-neutral-900">
                            {t("instructor.accountSettings")}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500">
                            {t("instructor.manageYourAccountInformation")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-0">
                        {/* Email Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                                <h3 className="text-sm font-semibold text-neutral-800">
                                    {t("instructor.emailAddress")}
                                </h3>
                            </div>
                            <p className="text-xs text-neutral-500 pl-6">
                                {t("instructor.currentEmail")}:{" "}
                                <span className="font-medium text-neutral-700 break-all">
                                    {settings.email}
                                </span>
                            </p>
                            <form onSubmit={handleEmailUpdate} className="pl-6 space-y-3 max-w-sm">
                                <div className="space-y-1.5">
                                    <Label htmlFor="newEmail" className="text-xs font-medium text-neutral-700">
                                        {t("instructor.newEmail")}
                                    </Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new.email@example.com"
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    size="sm"
                                    className="text-sm"
                                >
                                    {loading
                                        ? t("instructor.updating")
                                        : t("instructor.updateEmail")}
                                </Button>
                            </form>
                        </div>

                        <Separator />

                        {/* Language Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-neutral-400 shrink-0" />
                                <h3 className="text-sm font-semibold text-neutral-800">
                                    {t("instructor.language")}
                                </h3>
                            </div>
                            <p className="text-xs text-neutral-500 pl-6">
                                {t("instructor.selectYourPreferredLanguage")}
                            </p>
                            <div className="pl-6">
                                <Select
                                    value={currentLanguageCode}
                                    onValueChange={(value) => handleSettingChange(null, "language", value)}
                                >
                                    <SelectTrigger className="w-48 h-9 text-sm">
                                        <SelectValue placeholder={t("instructor.selectLanguage")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="de">Deutsch</SelectItem>
                                        <SelectItem value="it">Italiano</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-neutral-900">
                            {t("instructor.securitySettings")}
                        </CardTitle>
                        <CardDescription className="text-sm text-neutral-500">
                            {t("instructor.manageYourSecurityPreferences")}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-neutral-400 shrink-0" />
                                <h3 className="text-sm font-semibold text-neutral-800">
                                    {t("instructor.changePassword")}
                                </h3>
                            </div>
                            <p className="text-xs text-neutral-500 pl-6">
                                {t("instructor.updateYourPassword")}
                            </p>

                            <form onSubmit={handlePasswordUpdate} className="pl-6 space-y-3 max-w-sm">
                                <div className="space-y-1.5">
                                    <Label htmlFor="currentPassword" className="text-xs font-medium text-neutral-700">
                                        {t("instructor.currentPassword")}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={settings.currentPassword}
                                            onChange={(e) => handleSettingChange(null, "currentPassword", e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword" className="text-xs font-medium text-neutral-700">
                                        {t("instructor.newPassword")}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={settings.newPassword}
                                            onChange={(e) => handleSettingChange(null, "newPassword", e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-neutral-700">
                                        {t("instructor.confirmPassword")}
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={settings.confirmPassword}
                                            onChange={(e) => handleSettingChange(null, "confirmPassword", e.target.value)}
                                            className="pl-9 h-9 text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    size="sm"
                                    className="text-sm"
                                >
                                    {loading
                                        ? t("instructor.updating")
                                        : t("instructor.updatePassword")}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* OTP Verification Modal */}
            <Modal
                open={openOtp}
                footer={null}
                onCancel={() => {
                    setOtpSent(false);
                    setOtp("");
                }}
                centered
                width={400}
            >
                <div className="py-4 space-y-5">
                    <div className="text-center space-y-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {t("instructor.verifyEmail") || "Verify your new email"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t("instructor.otpSentTo") || "Enter the 6-digit code sent to"}{" "}
                            <span className="font-medium text-blue-600 break-all">{newEmail}</span>
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

                    <Button
                        onClick={verifyOtp}
                        disabled={loading || otp.length !== 6}
                        className="w-full"
                    >
                        {loading ? t("instructor.verifying") || "Verifying..." : t("instructor.verifyOtp") || "Verify OTP"}
                    </Button>
                </div>
            </Modal>
        </InstructorLayout>
    )
}

export default InstructorSettings