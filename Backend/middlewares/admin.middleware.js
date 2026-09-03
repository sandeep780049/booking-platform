import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import {
    getUserPermissions,
    hasPermission as checkPermission,
    hasAnyPermission as checkAnyPermission,
    isSuperAdmin as checkIsSuperAdmin,
} from "../config/permissions.js";

/**
 * Basic admin verification - checks if user is admin or superadmin
 */
export const verifyAdmin = asyncHandler(async (req, _, next) => {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new ApiError(403, "Unauthorized request - Admin access required");
    }

    // Populate admin roles for subsequent middleware
    if (user.admin) {
        const adminDoc = await Admin.findById(user.admin);
        req.adminRoles = adminDoc?.adminRole || [];
        req.isSuperAdmin = checkIsSuperAdmin(req.adminRoles);
    } else {
        req.adminRoles = [];
        req.isSuperAdmin = true; // Treat as super admin if no admin doc
    }

    next();
});

/**
 * Instructor verification middleware
 */
export const verifyInstructor = asyncHandler(async (req, _, next) => {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'instructor' && user.role !== 'superadmin') {
        throw new ApiError(403, "Unauthorized request - Instructor access required");
    }
    next();
});

/**
 * Middleware factory to require a specific permission
 * Must be used AFTER verifyAdmin middleware
 * @param {string} permission - The permission constant to check
 */
export const requirePermission = (permission) => asyncHandler(async (req, _, next) => {
    const user = req.user;

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        throw new ApiError(403, "Admin access required");
    }

    // Get admin roles if not already populated
    let adminRoles = req.adminRoles;
    if (adminRoles === undefined) {
        if (user.admin) {
            const adminDoc = await Admin.findById(user.admin);
            adminRoles = adminDoc?.adminRole || [];
        } else {
            adminRoles = [];
        }
        req.adminRoles = adminRoles;
    }

    // Super admin (empty adminRole) has all permissions
    if (checkIsSuperAdmin(adminRoles)) {
        req.isSuperAdmin = true;
        return next();
    }

    // Check if user's roles grant the required permission
    if (!checkPermission(adminRoles, permission)) {
        throw new ApiError(403, `Insufficient permissions: ${permission} required`);
    }

    next();
});

/**
 * Middleware factory to require any of the specified permissions (OR condition)
 * Must be used AFTER verifyAdmin middleware
 * @param {string[]} permissions - Array of permission constants (user must have at least one)
 */
export const requireAnyPermission = (permissions) => asyncHandler(async (req, _, next) => {
    const user = req.user;

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        throw new ApiError(403, "Admin access required");
    }

    // Get admin roles if not already populated
    let adminRoles = req.adminRoles;
    if (adminRoles === undefined) {
        if (user.admin) {
            const adminDoc = await Admin.findById(user.admin);
            adminRoles = adminDoc?.adminRole || [];
        } else {
            adminRoles = [];
        }
        req.adminRoles = adminRoles;
    }

    // Super admin has all permissions
    if (checkIsSuperAdmin(adminRoles)) {
        req.isSuperAdmin = true;
        return next();
    }

    // Check if user has any of the required permissions
    if (!checkAnyPermission(adminRoles, permissions)) {
        throw new ApiError(403, `Insufficient permissions: one of [${permissions.join(', ')}] required`);
    }

    next();
});

/**
 * Middleware to require Super Admin access only
 * Must be used AFTER verifyAdmin middleware
 */
export const requireSuperAdmin = asyncHandler(async (req, _, next) => {
    const user = req.user;

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        throw new ApiError(403, "Admin access required");
    }

    // Get admin roles if not already populated
    let adminRoles = req.adminRoles;
    if (adminRoles === undefined) {
        if (user.admin) {
            const adminDoc = await Admin.findById(user.admin);
            adminRoles = adminDoc?.adminRole || [];
        } else {
            adminRoles = [];
        }
        req.adminRoles = adminRoles;
    }

    // Only super admin (empty adminRole) can proceed
    if (!checkIsSuperAdmin(adminRoles)) {
        throw new ApiError(403, "Super Admin access required");
    }

    req.isSuperAdmin = true;
    next();
});

/**
 * Helper middleware to check if current user is super admin
 * Populates req.isSuperAdmin boolean
 * Must be used AFTER verifyAdmin middleware
 */
export const checkSuperAdmin = asyncHandler(async (req, _, next) => {
    let adminRoles = req.adminRoles;

    if (adminRoles === undefined && req.user?.admin) {
        const adminDoc = await Admin.findById(req.user.admin);
        adminRoles = adminDoc?.adminRole || [];
        req.adminRoles = adminRoles;
    }

    req.isSuperAdmin = checkIsSuperAdmin(adminRoles || []);
    next();
});