"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Filter,
    ChevronDown,
    Shield,
    UserPlus,
    Edit,
    Trash2,
    Check,
    X,
    Info,
    Users,
    Hotel,
    GraduationCap,
    Crown,
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Label } from "../../../components/ui/label"
import { Checkbox } from "../../../components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../../../components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../../components/ui/tooltip"
import { createAdmin, deleteAdmin, fetchAdmins, updateAdmin } from "../../../Api/admin.api"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRBAC } from "../../../contexts/RBACContext"
import { ADMIN_ROLE_OPTIONS, ROLE_PERMISSIONS, PERMISSIONS } from "../../../constants/permissions"
import { Navigate } from "react-router-dom"

// Role icons mapping
const roleIcons = {
    User: Users,
    Instructor: GraduationCap,
    Hotel: Hotel,
    Admin: Shield,
};

// Role colors for badges
const roleColors = {
    User: "bg-blue-100 text-blue-700 border-blue-200",
    Instructor: "bg-green-100 text-green-700 border-green-200",
    Hotel: "bg-amber-100 text-amber-700 border-amber-200",
    Admin: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function RBACManagement() {
    const { isSuperAdmin, loading: rbacLoading } = useRBAC();

    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [adminRoleFilter, setAdminRoleFilter] = useState("all")
    const [admins, setAdmins] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showAddAdmin, setShowAddAdmin] = useState(false)
    const [showPermissions, setShowPermissions] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)
    const [addAdminLoading, setAddAdminLoading] = useState(false)
    const [addAdminForm, setAddAdminForm] = useState({
        name: "",
        email: "",
        password: "",
        adminRoles: [],
    })
    const [addAdminError, setAddAdminError] = useState("")
    const [isEdit, setIsEdit] = useState(false)

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 400)
        return () => clearTimeout(t)
    }, [searchTerm])

    // Fetch admins
    const getAdmins = useCallback(async () => {
        if (!isSuperAdmin && !rbacLoading) return; // Don't fetch if not super admin
        setLoading(true)
        try {
            const adminRoleParam = adminRoleFilter !== 'all' ? adminRoleFilter : undefined
            const res = await fetchAdmins({
                search: debouncedSearch,
                role: 'admin',
                adminRole: adminRoleParam,
                page,
                limit: 10,
            })
            setAdmins(res.admins)
            setTotalPages(res.totalPages)
        } catch (e) {
            setAdmins([])
            setTotalPages(1)
        }
        setLoading(false)
    }, [debouncedSearch, page, adminRoleFilter, isSuperAdmin, rbacLoading])

    useEffect(() => {
        if (!rbacLoading && isSuperAdmin) {
            getAdmins()
        }
    }, [getAdmins, rbacLoading, isSuperAdmin])

    // Reset to page 1 on new search
    useEffect(() => {
        setPage(1)
    }, [searchTerm])

    // Handle delete
    const handleDeleteAdmin = async (adminId) => {
        const toastId = toast.loading("Deleting admin...")
        try {
            await deleteAdmin(adminId)
            await getAdmins()
            toast.success("Admin deleted successfully", { id: toastId })
        } catch (error) {
            console.error("Error deleting admin:", error)
            toast.error("Error deleting admin", { id: toastId })
        }
    }

    // Handle form changes
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setAddAdminForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Handle role checkbox changes
    const handleRoleChange = (role, checked) => {
        setAddAdminForm((prev) => {
            if (checked) {
                return {
                    ...prev,
                    adminRoles: [...prev.adminRoles, role],
                }
            } else {
                return {
                    ...prev,
                    adminRoles: prev.adminRoles.filter((r) => r !== role),
                }
            }
        })
    }

    // Reset form
    const resetForm = () => {
        setAddAdminForm({
            name: "",
            email: "",
            password: "",
            adminRoles: [],
        })
        setAddAdminError("")
        setIsEdit(false)
    }

    // Handle edit
    const handleEdit = (admin) => {
        setAddAdminForm({
            name: admin.name || "",
            email: admin.email || "",
            password: "",
            adminRoles: admin.admin?.adminRole || [],
            _id: admin._id || "",
        })
        setShowAddAdmin(true)
        setIsEdit(true)
    }

    // View permissions for an admin
    const handleViewPermissions = (admin) => {
        setSelectedAdmin(admin)
        setShowPermissions(true)
    }

    // Get permissions for admin roles
    const getPermissionsForRoles = (roles) => {
        if (!roles || roles.length === 0) {
            return Object.values(PERMISSIONS);
        }
        const permissions = new Set();
        roles.forEach((role) => {
            const rolePerms = ROLE_PERMISSIONS[role];
            if (rolePerms) {
                rolePerms.forEach((perm) => permissions.add(perm));
            }
        });
        return Array.from(permissions);
    }

    // Handle form submission
    const handleAddAdmin = async (e) => {
        e.preventDefault()
        setAddAdminLoading(true)
        setAddAdminError("")
        try {
            if (!isEdit) {
                const res = await createAdmin(addAdminForm)
                if (res.statusCode === 201) {
                    toast.success("Admin created successfully!")
                    resetForm()
                    setShowAddAdmin(false)
                    getAdmins()
                }
            } else {
                const res = await updateAdmin(addAdminForm)
                if (res.statusCode === 200) {
                    toast.success("Admin updated successfully!")
                    resetForm()
                    setShowAddAdmin(false)
                    getAdmins()
                }
            }
        } catch (error) {
            console.error("Error saving admin:", error)
            setAddAdminError("Failed to save admin. Please try again.")
            toast.error("Error saving admin")
        } finally {
            setAddAdminLoading(false)
        }
    }

    // Handle dialog close
    const handleDialogClose = () => {
        setShowAddAdmin(false)
        resetForm()
    }

    // Stats for dashboard
    const stats = {
        total: admins.length,
        superAdmins: admins.filter(a => !a.admin?.adminRole || a.admin.adminRole.length === 0).length,
        userAdmins: admins.filter(a => a.admin?.adminRole?.includes('User')).length,
        instructorAdmins: admins.filter(a => a.admin?.adminRole?.includes('Instructor')).length,
        hotelAdmins: admins.filter(a => a.admin?.adminRole?.includes('Hotel')).length,
    };

    // Loading state
    if (rbacLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        RBAC Management
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage admin roles and permissions across the platform
                    </p>
                </div>
                <Button onClick={() => { resetForm(); setShowAddAdmin(true); }} size="sm" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Create Admin
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Admins</CardDescription>
                        <CardTitle className="text-2xl">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <Crown className="h-3 w-3" /> Super Admins
                        </CardDescription>
                        <CardTitle className="text-2xl text-purple-700">{stats.superAdmins}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> User Admins
                        </CardDescription>
                        <CardTitle className="text-2xl text-blue-700">{stats.userAdmins}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> Instructor Admins
                        </CardDescription>
                        <CardTitle className="text-2xl text-green-700">{stats.instructorAdmins}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <Hotel className="h-3 w-3" /> Hotel Admins
                        </CardDescription>
                        <CardTitle className="text-2xl text-amber-700">{stats.hotelAdmins}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search admins..."
                        className="w-full sm:w-[300px] pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter by Role
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem onClick={() => setAdminRoleFilter("all")}>
                                All Admins
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAdminRoleFilter("Admin")}>
                                <Crown className="mr-2 h-4 w-4 text-purple-600" /> Super Admins
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAdminRoleFilter("User")}>
                                <Users className="mr-2 h-4 w-4 text-blue-600" /> User Admins
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAdminRoleFilter("Instructor")}>
                                <GraduationCap className="mr-2 h-4 w-4 text-green-600" /> Instructor Admins
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setAdminRoleFilter("Hotel")}>
                                <Hotel className="mr-2 h-4 w-4 text-amber-600" /> Hotel Admins
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Admins Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admin</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !admins || admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No admins found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => {
                                    const roles = admin.admin?.adminRole || [];
                                    const isSuperAdminUser = roles.length === 0;
                                    const permissions = getPermissionsForRoles(roles);

                                    return (
                                        <TableRow key={admin._id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{admin.name}</span>
                                                    <span className="text-sm text-muted-foreground">{admin.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {isSuperAdminUser ? (
                                                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
                                                            <Crown className="h-3 w-3" />
                                                            Super Admin
                                                        </Badge>
                                                    ) : (
                                                        roles.map((role) => {
                                                            const Icon = roleIcons[role] || Shield;
                                                            return (
                                                                <Badge key={role} className={`${roleColors[role] || ''} flex items-center gap-1`}>
                                                                    <Icon className="h-3 w-3" />
                                                                    {role}
                                                                </Badge>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-muted-foreground"
                                                                onClick={() => handleViewPermissions(admin)}
                                                            >
                                                                <Info className="h-4 w-4 mr-1" />
                                                                {permissions.length} permissions
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Click to view all permissions</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                {admin?.createdAt && new Date(admin.createdAt).getTime()
                                                    ? format(new Date(admin.createdAt), 'dd MMM yyyy')
                                                    : 'N/A'
                                                }
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(admin)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex justify-end items-center gap-2 p-4 border-t">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Role-Permission Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Role-Permission Matrix
                    </CardTitle>
                    <CardDescription>
                        Overview of permissions granted to each admin role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Permission</TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Crown className="h-4 w-4 text-purple-600" />
                                            Super Admin
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            User Admin
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <GraduationCap className="h-4 w-4 text-green-600" />
                                            Instructor Admin
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Hotel className="h-4 w-4 text-amber-600" />
                                            Hotel Admin
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(PERMISSIONS).map(([key, permission]) => (
                                    <TableRow key={permission}>
                                        <TableCell className="font-medium">
                                            {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {ROLE_PERMISSIONS.User?.includes(permission) ? (
                                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {ROLE_PERMISSIONS.Instructor?.includes(permission) ? (
                                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {ROLE_PERMISSIONS.Hotel?.includes(permission) ? (
                                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Admin Dialog */}
            <Dialog open={showAddAdmin} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isEdit ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                            {isEdit ? "Edit Admin" : "Create New Admin"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? "Update admin details and role assignments."
                                : "Create a new admin account and assign roles to control access."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-name">Full Name</Label>
                            <Input
                                id="admin-name"
                                name="name"
                                value={addAdminForm.name}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-email">Email Address</Label>
                            <Input
                                id="admin-email"
                                name="email"
                                type="email"
                                value={addAdminForm.email}
                                onChange={handleInputChange}
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-password">
                                Password {isEdit && <span className="text-muted-foreground">(leave empty to keep current)</span>}
                            </Label>
                            <Input
                                id="admin-password"
                                name="password"
                                type="password"
                                value={addAdminForm.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                required={!isEdit}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Assign Roles</Label>
                            <p className="text-sm text-muted-foreground">
                                Leave empty for Super Admin (full access to everything)
                            </p>
                            <div className="grid grid-cols-1 gap-3 mt-2">
                                {ADMIN_ROLE_OPTIONS.map((r) => {
                                    const Icon = roleIcons[r.value] || Shield;
                                    return (
                                        <div
                                            key={r.value}
                                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${addAdminForm.adminRoles.includes(r.value)
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Checkbox
                                                id={`role-${r.value}`}
                                                checked={addAdminForm.adminRoles.includes(r.value)}
                                                onCheckedChange={(checked) => handleRoleChange(r.value, checked)}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <Label htmlFor={`role-${r.value}`} className="flex items-center gap-2 cursor-pointer">
                                                    <Icon className="h-4 w-4" />
                                                    {r.label}
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {addAdminForm.adminRoles.length === 0 && (
                                <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                    <Crown className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm text-purple-700">This admin will be a Super Admin with full access</span>
                                </div>
                            )}
                        </div>

                        {addAdminError && (
                            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{addAdminError}</div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleDialogClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addAdminLoading}>
                                {addAdminLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-t-white border-gray-300 rounded-full animate-spin mr-2"></div>
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    isEdit ? "Update Admin" : "Create Admin"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Permissions Dialog */}
            <Dialog open={showPermissions} onOpenChange={() => setShowPermissions(false)}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Permissions for {selectedAdmin?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedAdmin?.admin?.adminRole?.length === 0 || !selectedAdmin?.admin?.adminRole ? (
                                <span className="flex items-center gap-1">
                                    <Crown className="h-4 w-4 text-purple-600" />
                                    Super Admin - Has access to all permissions
                                </span>
                            ) : (
                                <span>
                                    Roles: {selectedAdmin?.admin?.adminRole?.join(', ')}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        {selectedAdmin && getPermissionsForRoles(selectedAdmin?.admin?.adminRole || []).map((permission) => (
                            <div key={permission} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                    {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowPermissions(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
