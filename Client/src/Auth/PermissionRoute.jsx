import { Navigate } from 'react-router-dom';
import { useRBAC } from '../contexts/RBACContext';

/**
 * Permission-based route protection component
 * 
 * Usage:
 * <PermissionRoute permission={PERMISSIONS.VIEW_USERS}>
 *   <UsersPage />
 * </PermissionRoute>
 * 
 * Or with roles:
 * <PermissionRoute roles={['User', 'Instructor']}>
 *   <SomePage />
 * </PermissionRoute>
 * 
 * Or require super admin:
 * <PermissionRoute requireSuperAdmin>
 *   <RBACManagement />
 * </PermissionRoute>
 */
export const PermissionRoute = ({
    permission,
    permissions,
    roles,
    requireSuperAdmin = false,
    children,
    fallback = null,
    redirectTo = '/admin',
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAnyRole,
        isSuperAdmin,
        isAdmin,
        loading
    } = useRBAC();

    // Don't render anything while loading
    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Check if user is admin at all
    if (!isAdmin) {
        return fallback || <Navigate to="/login" replace />;
    }

    // Super admin check
    if (requireSuperAdmin) {
        if (!isSuperAdmin) {
            return fallback || <Navigate to={redirectTo} replace />;
        }
        return children;
    }

    // Super admin bypasses all permission checks
    if (isSuperAdmin) {
        return children;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return fallback || <Navigate to={redirectTo} replace />;
    }

    // Check multiple permissions (OR - any one matches)
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        if (!hasAnyPermission(permissions)) {
            return fallback || <Navigate to={redirectTo} replace />;
        }
    }

    // Check roles (OR - any role matches)
    if (roles && Array.isArray(roles) && roles.length > 0) {
        if (!hasAnyRole(roles)) {
            return fallback || <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

/**
 * Component for conditionally rendering content based on permissions
 * Unlike PermissionRoute, this doesn't redirect - it just hides content
 * 
 * Usage:
 * <PermissionGate permission={PERMISSIONS.MANAGE_USERS}>
 *   <EditButton />
 * </PermissionGate>
 */
export const PermissionGate = ({
    permission,
    permissions,
    roles,
    requireSuperAdmin = false,
    children,
    fallback = null,
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAnyRole,
        isSuperAdmin,
        isAdmin,
    } = useRBAC();

    // Not an admin - hide content
    if (!isAdmin) {
        return fallback;
    }

    // Super admin check
    if (requireSuperAdmin && !isSuperAdmin) {
        return fallback;
    }

    // Super admin sees everything
    if (isSuperAdmin) {
        return children;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return fallback;
    }

    // Check multiple permissions (OR)
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        if (!hasAnyPermission(permissions)) {
            return fallback;
        }
    }

    // Check roles (OR)
    if (roles && Array.isArray(roles) && roles.length > 0) {
        if (!hasAnyRole(roles)) {
            return fallback;
        }
    }

    return children;
};

export default PermissionRoute;
