import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from '../../components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  BarChart3,
  BarChart2,
  BookOpen,
  ClipboardCheck,
  Compass,
  FileCheck,
  Hotel,
  LogOut,
  Mountain,
  Settings,
  Store,
  TicketCheck,
  User,
  Award,
  Shield,
  UserCheck
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import AdminProfileDropdown from '../../components/AdminProfileDropdown'
import { useAuth } from '../AuthProvider'

const ROLE_ACCESS_CONFIG = {
  Dashboard: [],
  Locations: [],
  Adventures: ['Instructor'],
  'Adventure Insights': ['Instructor'],
  Bookings: ['Hotel', 'Instructor'],
  Admins: ['Admin'],
  Users: ['User'],
  Instructor: ['Instructor'],
  Stores: [],
  Hotels: ['Hotel'],
  Events: [],
  'Achievement Rules': [],
  'Tickets & Support': ['User'],
  'Terms & Condition': [],
  'User Declaration': [],
  'Website Settings': [],
  Sponsors: [],
  'System Admins': [],
  'Registration Limits': ['Instructor'],
}

const SIDEBAR_ITEMS = [
  { key: 'Adventures', path: '/admin/adventures', icon: Compass, label: 'Adventures' },
  { key: 'Adventure Insights', path: '/admin/adventure-insights', icon: BarChart2, label: 'Adventure Insights' },
  { key: 'Bookings', path: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { key: 'Events', path: '/admin/events', icon: Hotel, label: 'Events' },
  { key: 'Achievement Rules', path: '/admin/achievement-rules', icon: Award, label: 'Achievement Rules' },
  { key: 'Admins', path: '/admin/manager', icon: User, label: 'Admins' },
  { key: 'Hotels', path: '/admin/hotels', icon: Hotel, label: 'Accomodation' },
  { key: 'Instructor', path: '/admin/instructors', icon: User, label: 'Instructor' },
  { key: 'Locations', path: '/admin/locations', icon: Compass, label: 'Locations' },
  { key: 'Registration Limits', path: '/admin/registration-limits', icon: UserCheck, label: 'Registration Limits' },
  { key: 'Sponsors', path: '/admin/sponsors', icon: Settings, label: 'Sponsors' },
  { key: 'Stores', path: '/admin/store', icon: Store, label: 'Stores' },
  { key: 'Terms & Condition', path: '/admin/terms', icon: FileCheck, label: 'Terms & Condition' },
  { key: 'Tickets & Support', path: '/admin/tickets', icon: TicketCheck, label: 'Tickets & Support' },
  { key: 'User Declaration', path: '/admin/declaration', icon: ClipboardCheck, label: 'User Declaration' },
  { key: 'Users', path: '/admin/users', icon: User, label: 'Users' },
  { key: 'Website Settings', path: '/admin/website-settings', icon: Settings, label: 'Website Settings' },
  { key: 'System Admins', path: '/admin/rbac', icon: Shield, label: 'System Admins' },
]

export default function AdminLayout() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [isMounted, setIsMounted] = useState(false)
  const { logout } = useAuth()

  const user = useSelector((state) => state?.user?.user)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("Logout failed. Please try again.")
    }
  }

  const handleHomeClick = (e) => {
    e.preventDefault()
    navigate('/')
  }

  if (!isMounted) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar pathname={pathname} user={user} onLogout={handleLogout} />
        <SidebarInset className="bg-muted/40 flex flex-col flex-1 min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 text-lg font-semibold truncate">
              Adventure Booking Admin
            </div>
            <AdminProfileDropdown user={user} onLogout={handleLogout} />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function AdminSidebar({ pathname, user, onLogout }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const roles = Array.isArray(user?.admin?.adminRole) ? user.admin.adminRole : []
  const isSuperAdmin = roles.length === 0

  const canSeeTab = (tabKey) => {
    if (isSuperAdmin) return true

    const allowedRoles = ROLE_ACCESS_CONFIG[tabKey]
    if (!allowedRoles || allowedRoles.length === 0) return true

    return roles.some((role) => allowedRoles.includes(role))
  }

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-6">
        <Link
          to="/"
          onClick={closeMobileSidebar}
          className="flex items-center justify-center gap-2 font-semibold hover:text-gray-700 transition-colors cursor-pointer"
        >
          <Mountain className="h-6 w-6" />
          <span>Adventure Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                  <Link to="/admin" onClick={closeMobileSidebar}>
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_ITEMS.map((item) => {
                if (!canSeeTab(item.key)) return null

                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={pathname === item.path}>
                      <Link to={item.path} onClick={closeMobileSidebar}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start"
          size="sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}