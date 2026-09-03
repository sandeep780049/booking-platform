import { useWebsiteSettings } from '../contexts/WebsiteSettingsContext';
import { Navigate } from 'react-router-dom';

// Component to protect feature routes based on website settings
export const FeatureRoute = ({ children, feature }) => {
    const { settings, loading } = useWebsiteSettings();

    // Show loading while fetching settings
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>;
    }

    // Check if the feature is enabled
    const isFeatureEnabled = () => {
        switch (feature) {
            case 'shop':
                return settings.shopEnabled;
            case 'hotels':
                return settings.hotelsEnabled;
            default:
                return true;
        }
    };

    // Redirect to home if feature is disabled
    if (!isFeatureEnabled()) {
        return <Navigate to="/" replace />;
    }

    return children;
};
