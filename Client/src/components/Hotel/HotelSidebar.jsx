import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Home, Calendar, FileText, Settings, BarChart3, Users } from 'lucide-react';

export const HotelSidebar = ({ activeTab, onTabChange, hotel }) => {
    const menuItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: Home,
            description: 'Hotel details and information'
        },
        {
            id: 'bookings',
            label: 'Bookings',
            icon: Calendar,
            description: 'Manage reservations',
            badge: hotel?.stats?.totalBookings || 0
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FileText,
            description: 'Certificates and licenses'
        },
        {
            id: 'statistics',
            label: 'Statistics',
            icon: BarChart3,
            description: 'Revenue and analytics'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            description: 'Hotel settings'
        }
    ];

    return (
        <Card className="sticky top-4">
            <CardContent className="p-4">
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? 'default' : 'ghost'}
                                className={`w-full justify-start ${isActive ? '' : 'hover:bg-accent'}`}
                                onClick={() => onTabChange(item.id)}
                            >
                                <Icon className="h-4 w-4 mr-3" />
                                <div className="flex-1 text-left">
                                    <div className="flex items-center justify-between">
                                        <span>{item.label}</span>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
