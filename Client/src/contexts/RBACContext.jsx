import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../Pages/AuthProvider';
import { axiosClient } from '../AxiosClient/axios';
import {
    getUserPermissions,
    isSuperAdmin as checkIsSuperAdmin,
    PERMISSIONS,
    ROLE_PERMISSIONS,
} from '../constants/permissions';

const RBACContext = createContext(null);

export const RBACProvider = ({ children }) => {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [adminRoles, setAdminRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverPermissions, setServerPermissions] = useState(null);

    // Helper function to get admin roles safely
    // Returns:
    //   - empty array [] for super admin (no admin doc, or admin doc with empty adminRole)
    //   - array of roles for role-restricted admins
    //   - null if admin is ObjectId string (not populated yet)
    const getAdminRoles = (userObj) => {
        // No admin field at all = super admin (legacy or intentional)
        if (!userObj?.admin) return [];

        // Check if admin is just an ObjectId string (not populated)
        if (typeof userObj.admin === 'string') return null;

        // Admin is populated, return adminRole array (or empty array for super admin)
        return userObj.admin.adminRole || [];
    };

    // Determine if current user is a super admin (empty adminRole array or no admin doc)
    const isSuperAdmin = useMemo(() => {
        if (!user?.user) return false;
        if (user.user.role !== 'admin') return false;

        const roles = getAdminRoles(user.user);

        // If roles is null, admin field is ObjectId (not populated) - need to fetch
        // Default to false to be safe, will be updated when data loads
        if (roles === null) return false;

        // Empty array = super admin (either no admin doc, or adminRole is empty)
        return checkIsSuperAdmin(roles);
    }, [user]);

    // Get permissions from user object (local calculation)
    const localPermissions = useMemo(() => {
        if (!user?.user || user.user.role !== 'admin') return [];

        const roles = getAdminRoles(user.user);

        // If roles is null, admin data not available - return empty permissions
        if (roles === null) return [];

        return getUserPermissions(roles);
    }, [user]);

    // Optionally fetch permissions from server for accuracy
    const fetchPermissions = useCallback(async () => {
        if (!user?.user || user.user.role !== 'admin') {
            setLoading(false);
            return;
        }

        try {
            const response = await axiosClient.get('/api/admin/permissions');
            if (response.data?.data) {
                setServerPermissions(response.data.data);
                setPermissions(response.data.data.permissions || []);
                setAdminRoles(response.data.data.adminRoles || []);
            }
        } catch (error) {
            // Fall back to local calculation if API fails
            console.warn('Failed to fetch permissions from server, using local calculation', error);
            const roles = getAdminRoles(user.user) || [];
            setPermissions(getUserPermissions(roles));
            setAdminRoles(roles);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Use local permissions first for quick loading
        if (user?.user?.role === 'admin') {
            const roles = getAdminRoles(user.user) || [];
            setAdminRoles(roles);
            setPermissions(getUserPermissions(roles));
            setLoading(false);

            // Optionally fetch from server for verification (can be disabled for performance)
            // fetchPermissions();
        } else {
            setAdminRoles([]);
            setPermissions([]);
            setLoading(false);
        }
    }, [user]);

    /**
     * Check if user has a specific permission
     */
    const hasPermission = useCallback((permission) => {
        if (isSuperAdmin) return true;
        return permissions.includes(permission);
    }, [isSuperAdmin, permissions]);

    /**
     * Check if user has any of the specified permissions
     */
    const hasAnyPermission = useCallback((permissionList) => {
        if (isSuperAdmin) return true;
        return permissionList.some((perm) => permissions.includes(perm));
    }, [isSuperAdmin, permissions]);

    /**
     * Check if user has all of the specified permissions
     */
    const hasAllPermissions = useCallback((permissionList) => {
        if (isSuperAdmin) return true;
        return permissionList.every((perm) => permissions.includes(perm));
    }, [isSuperAdmin, permissions]);

    /**
     * Check if user has any of the specified admin roles
     */
    const hasAnyRole = useCallback((roles) => {
        if (isSuperAdmin) return true;
        return roles.some((role) => adminRoles.includes(role));
    }, [isSuperAdmin, adminRoles]);

    /**
     * Check if user has all of the specified admin roles
     */
    const hasAllRoles = useCallback((roles) => {
        if (isSuperAdmin) return true;
        return roles.every((role) => adminRoles.includes(role));
    }, [isSuperAdmin, adminRoles]);

    /**
     * Check if user is an admin (any type)
     */
    const isAdmin = useMemo(() => {
        return user?.user?.role === 'admin';
    }, [user]);

    const value = {
        // State
        permissions,
        adminRoles,
        loading,

        // Booleans
        isSuperAdmin,
        isAdmin,

        // Permission checks
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Role checks
        hasAnyRole,
        hasAllRoles,

        // Constants
        PERMISSIONS,
        ROLE_PERMISSIONS,

        // Refresh function
        refreshPermissions: fetchPermissions,
    };

    return (
        <RBACContext.Provider value={value}>
            {children}
        </RBACContext.Provider>
    );
};

/**
 * Hook to access RBAC context
 */
export const useRBAC = () => {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within an RBACProvider');
    }
    return context;
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = (permission) => (WrappedComponent) => {
    return function PermissionWrapper(props) {
        const { hasPermission } = useRBAC();

        if (!hasPermission(permission)) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};

export default RBACContext;
