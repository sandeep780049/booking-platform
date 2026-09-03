/**
 * RBAC Permission Constants
 * Mirror of backend permissions for frontend use
 */

export const PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',

    // Users
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',

    // Instructors
    VIEW_INSTRUCTORS: 'view_instructors',
    MANAGE_INSTRUCTORS: 'manage_instructors',

    // Hotels/Accommodation
    VIEW_HOTELS: 'view_hotels',
    MANAGE_HOTELS: 'manage_hotels',

    // Admins (Super Admin only)
    VIEW_ADMINS: 'view_admins',
    MANAGE_ADMINS: 'manage_admins',

    // Bookings
    VIEW_BOOKINGS: 'view_bookings',
    MANAGE_BOOKINGS: 'manage_bookings',

    // Adventures
    VIEW_ADVENTURES: 'view_adventures',
    MANAGE_ADVENTURES: 'manage_adventures',

    // Sessions
    VIEW_SESSIONS: 'view_sessions',
    MANAGE_SESSIONS: 'manage_sessions',

    // Tickets & Support
    VIEW_TICKETS: 'view_tickets',
    MANAGE_TICKETS: 'manage_tickets',

    // Store/Items
    VIEW_STORE: 'view_store',
    MANAGE_STORE: 'manage_store',

    // Locations
    VIEW_LOCATIONS: 'view_locations',
    MANAGE_LOCATIONS: 'manage_locations',

    // Events
    VIEW_EVENTS: 'view_events',
    MANAGE_EVENTS: 'manage_events',

    // Terms & Declarations
    VIEW_TERMS: 'view_terms',
    MANAGE_TERMS: 'manage_terms',
    VIEW_DECLARATIONS: 'view_declarations',
    MANAGE_DECLARATIONS: 'manage_declarations',

    // Website Settings
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings',

    // Sponsors
    VIEW_SPONSORS: 'view_sponsors',
    MANAGE_SPONSORS: 'manage_sponsors',

    // Achievement Rules
    VIEW_ACHIEVEMENT_RULES: 'view_achievement_rules',
    MANAGE_ACHIEVEMENT_RULES: 'manage_achievement_rules',
};

// Role to permissions mapping (should mirror backend)
export const ROLE_PERMISSIONS = {
    // User Admin - manages user-related features
    User: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.VIEW_TICKETS,
        PERMISSIONS.MANAGE_TICKETS,
    ],

    // Instructor Admin - manages instructor-related features
    Instructor: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_INSTRUCTORS,
        PERMISSIONS.MANAGE_INSTRUCTORS,
        PERMISSIONS.VIEW_ADVENTURES,
        PERMISSIONS.MANAGE_ADVENTURES,
        PERMISSIONS.VIEW_SESSIONS,
        PERMISSIONS.MANAGE_SESSIONS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.MANAGE_BOOKINGS,
        PERMISSIONS.VIEW_LOCATIONS,
        PERMISSIONS.MANAGE_LOCATIONS,
        PERMISSIONS.VIEW_EVENTS,
        PERMISSIONS.MANAGE_EVENTS,
        PERMISSIONS.VIEW_ACHIEVEMENT_RULES,
        PERMISSIONS.MANAGE_ACHIEVEMENT_RULES,
    ],

    // Hotel/Accommodation Admin - manages hotel-related features
    Hotel: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_HOTELS,
        PERMISSIONS.MANAGE_HOTELS,
        PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.MANAGE_BOOKINGS,
        PERMISSIONS.VIEW_LOCATIONS,
    ],

    // Admin role gets all permissions
    Admin: Object.values(PERMISSIONS),
};

/**
 * Get all permissions for given admin roles
 */
export const getUserPermissions = (adminRoles) => {
    if (!adminRoles || !Array.isArray(adminRoles) || adminRoles.length === 0) {
        // Empty roles means super admin - return all permissions
        return Object.values(PERMISSIONS);
    }

    const permissions = new Set();

    adminRoles.forEach((role) => {
        const rolePerms = ROLE_PERMISSIONS[role];
        if (rolePerms) {
            rolePerms.forEach((perm) => permissions.add(perm));
        }
    });

    return Array.from(permissions);
};

/**
 * Check if roles indicate super admin (empty array)
 */
export const isSuperAdmin = (adminRoles) => {
    return !adminRoles || !Array.isArray(adminRoles) || adminRoles.length === 0;
};

// Admin role types with labels for UI
export const ADMIN_ROLE_OPTIONS = [
    { value: 'User', label: 'User Admin', description: 'Manage users, view bookings, handle support tickets' },
    { value: 'Instructor', label: 'Instructor Admin', description: 'Manage instructors, adventures, sessions, and events' },
    { value: 'Hotel', label: 'Accommodation Admin', description: 'Manage hotels, accommodations, and related bookings' },
    { value: 'Admin', label: 'Full Admin', description: 'Full access to all admin features (not super admin)' },
];

export default {
    PERMISSIONS,
    ROLE_PERMISSIONS,
    getUserPermissions,
    isSuperAdmin,
    ADMIN_ROLE_OPTIONS,
};
