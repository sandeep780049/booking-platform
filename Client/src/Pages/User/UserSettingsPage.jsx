import UserLayout from "./UserLayout"
import { UserSettings } from "./UserSettings"

export default function UserSettingsPage() {
    return (
        <UserLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-blue-800 bg-clip-text text-transparent mb-2">Profile & Settings</h1>
                            <p className="text-gray-600 text-lg">Manage your profile, contact details and security preferences</p>
                        </div>
                    </div>

                    {/* Content */}
                    <UserSettings />
                </div>
            </div>
        </UserLayout>
    )
}
