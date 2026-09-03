import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { motion } from "framer-motion"
import { LogOut } from "lucide-react"

const AdminProfileDropdown = ({ user, onLogout }) => {
    const getInitials = (name) => {
        if (!name) return user?.email?.[0]?.toUpperCase() || "A"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <motion.button
                    className="focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Avatar className="h-10 w-10 border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors">
                        {user?.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user?.name || "Admin"} />
                        ) : (
                            <AvatarFallback className="bg-gray-900 text-white font-medium">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex flex-col">
                    <span className="font-bold text-gray-900">{user?.name || user?.email}</span>
                    <span className="text-xs text-gray-500 mt-0.5">Administrator</span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default AdminProfileDropdown
