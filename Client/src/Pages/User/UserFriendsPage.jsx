import UserLayout from "./UserLayout"
import { UserFriendRequests } from "./UserFriendRequests"

export default function UserFriendsPage() {
    return (
        <UserLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Friends</h1>
                            <p className="text-gray-600 text-lg">Connect with adventure partners</p>
                        </div>
                    </div>

                    {/* Content */}
                    <UserFriendRequests />
                </div>
            </div>
        </UserLayout>
    )
}
