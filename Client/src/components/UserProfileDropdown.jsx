import { useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { motion } from "framer-motion"
import { User, Calendar, TicketIcon, Settings, LogOut } from "lucide-react"

const UserProfileDropdown = ({ user, onLogout }) => {
    const navigate = useNavigate()

    const getUserLevel = () => {
        const bookingsCount = user?.bookings?.length || 0

        if (bookingsCount >= 20) return "Diamond"
        if (bookingsCount >= 10) return "Platinum"
        if (bookingsCount >= 5) return "Gold"
        if (bookingsCount >= 2) return "Silver"
        return "Bronze"
    }

    const getLevelColor = () => {
        const level = getUserLevel()
        switch (level) {
            case "Diamond":
                return "bg-gradient-to-r from-blue-400 to-purple-500"
            case "Platinum":
                return "bg-gradient-to-r from-gray-300 to-gray-500"
            case "Gold":
                return "bg-gradient-to-r from-yellow-300 to-yellow-500"
            case "Silver":
                return "bg-gradient-to-r from-gray-200 to-gray-400"
            default:
                return "bg-gradient-to-r from-amber-700 to-amber-900"
        }
    }

    const getInitials = (name) => {
        if (!name) return user?.email?.[0]?.toUpperCase() || "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const getProgressPercentage = () => {
        return Math.min((user?.bookings?.length || 0) * 5, 100)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <motion.button
                    className="focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Avatar className="h-10 w-10 border-2 border-blue-500 cursor-pointer">
                        {user?.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user?.name || "User"} />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                    <span className="font-bold">{user?.name || user?.email}</span>
                    <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">Level: </span>
                        <Badge className={`ml-1 ${getLevelColor()} text-white`}>
                            {getUserLevel()}
                        </Badge>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`${getLevelColor()} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/dashboard/bookings")} className="cursor-pointer">
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/dashboard/tickets")} className="cursor-pointer">
                    <TicketIcon className="w-4 h-4 mr-2" />
                    Tickets
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfileDropdown
