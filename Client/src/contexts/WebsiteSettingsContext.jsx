import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicWebsiteSettings } from '../Api/websiteSettings.api';

const WebsiteSettingsContext = createContext();

export const useWebsiteSettings = () => {
    const context = useContext(WebsiteSettingsContext);
    if (!context) {
        throw new Error('useWebsiteSettings must be used within a WebsiteSettingsProvider');
    }
    return context;
};

export const WebsiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        shopEnabled: true,
        hotelsEnabled: true,
        maintenanceMode: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPublicSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getPublicWebsiteSettings();
            setSettings(response.data);
        } catch (err) {
            console.error('Error fetching website settings:', err);
            setError(err);
            // Keep default settings on error
            setSettings({
                shopEnabled: true,
                hotelsEnabled: true,
                maintenanceMode: false,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicSettings();
    }, []);

    const refreshSettings = () => {
        fetchPublicSettings();
    };

    const value = {
        settings,
        loading,
        error,
        refreshSettings,
        // Helper functions
        isShopEnabled: settings.shopEnabled,
        isHotelsEnabled: settings.hotelsEnabled,
        isMaintenanceMode: settings.maintenanceMode,
    };

    return (
        <WebsiteSettingsContext.Provider value={value}>
            {children}
        </WebsiteSettingsContext.Provider>
    );
};
