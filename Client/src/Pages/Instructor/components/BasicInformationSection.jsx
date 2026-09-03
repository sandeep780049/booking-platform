import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ProfileImageUpload } from "./ProfileImageUpload";

export const BasicInformationSection = ({
    formData,
    errors,
    onChange,
    onProfileImageChange,
}) => {
    const getInitial = () => {
        return formData.name ? formData.name.charAt(0).toUpperCase() : "I";
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-black">Basic Information</h2>

            <div className="flex justify-start">
                <ProfileImageUpload
                    initialImage={formData.profileImage}
                    onChange={onProfileImageChange}
                    getInitial={getInitial}
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-black">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        placeholder="Enter your full name"
                        required
                        className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-black">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="your.email@example.com"
                        required
                        className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-black">
                        Password
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="Create a secure password"
                        required
                        className={errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-black"
                    >
                        Confirm Password
                    </Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="Re-enter your password"
                        required
                        className={errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-black focus:ring-black"}
                    />
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
