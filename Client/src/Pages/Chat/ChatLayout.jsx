import React, { useEffect, useState } from 'react'
import { ChatArea } from './ChatArea'
import { useSenders } from '../../hooks/useSenders';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { motion } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ChatLayout = () => {
    const { senders, fetchSenders } = useSenders();
    // Map senders to the same `friend` shape this component expects

    const friends = (senders || []).map(s => ({
        _id: s._id,
        name: s.user?.name || s.hotel?.name || 'Unknown',
        email: s.user?.email || '',
        profilePicture: s.user?.profilePicture || '',
        latestMessage: s.latestMessage,
        unreadCount: s.unreadCount || 0,
        hotelName: s.hotel?.name || null
    }));

    console.log('Mapped friends:', friends);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchSenders();

        // Hide sidebar on mobile by default
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setShowSidebar(false);
            } else {
                setShowSidebar(true);
            }
        };

        // Initial check
        handleResize();

        // Listen for window resize events
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle chat query parameter to auto-select a friend
    useEffect(() => {
        const chatUserId = searchParams.get('chat');
        if (chatUserId && friends.length > 0) {
            const friend = friends.find(f => f._id === chatUserId);
            if (friend) {
                setSelectedFriend(friend);
                // On mobile, show chat area and hide sidebar
                if (window.innerWidth < 768) {
                    setShowSidebar(false);
                }
            }
        }
    }, [searchParams, friends]);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const handleCloseChatClick = () => {
        setSelectedFriend(null);
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className='h-full w-full flex relative bg-white'>
            <motion.div
                className={`sidebar md:min-w-[360px] w-full md:w-[360px] md:relative absolute z-10 h-full flex flex-col bg-white border-r border-black/10`}
                initial={{ x: typeof window !== 'undefined' && window.innerWidth < 768 ? -360 : 0 }}
                animate={{ x: showSidebar ? 0 : -360 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ maxWidth: '100%' }}
            >
                <div className="sidebar-header p-4 border-b border-black/10 bg-white">
                    <div className="flex items-center justify-between">
                        <h2 className='text-xl font-bold text-black'>Messages</h2>
                        <MessageCircle size={20} className="text-black" />
                    </div>
                </div>

                <div className="p-3 border-b border-black/10 bg-white">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 pl-9 bg-neutral-50 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-neutral-400"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent'>
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <motion.div
                                key={friend._id}
                                onClick={() => {
                                    setSelectedFriend(friend);
                                    if (window.innerWidth < 768) setShowSidebar(false);
                                }}
                                className={`p-3 flex gap-3 items-center cursor-pointer transition-colors ${selectedFriend?._id === friend._id
                                        ? 'bg-neutral-50 border-l-2 border-black'
                                        : 'border-l-2 border-transparent hover:bg-neutral-50/50'
                                    }`}
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Avatar className='w-12 h-12 border border-black/10'>
                                    <AvatarImage src={friend.profilePicture} alt={friend.name} />
                                    <AvatarFallback className='w-12 h-12 bg-black text-white font-semibold text-sm'>
                                        {friend.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className='text-sm font-semibold text-black truncate'>{friend.name}</h3>
                                        {friend.unreadCount > 0 && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-black text-white text-xs font-bold rounded-full min-w-[18px] text-center">
                                                {friend.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-xs text-neutral-500 truncate'>
                                        {friend.latestMessage || (friend.hotelName ? friend.hotelName : friend.email)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-neutral-500 bg-white m-4">
                            {searchQuery ? "No conversations match your search" : "No conversations yet"}
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="flex-1 w-full h-full">
                <ChatArea
                    selectedFriend={selectedFriend}
                    toggleSidebar={toggleSidebar}
                    onClose={handleCloseChatClick}
                />
            </div>
        </div>
    )
}
