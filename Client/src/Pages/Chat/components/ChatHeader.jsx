import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const ChatHeader = ({ friend, toggleSidebar, onClose }) => {
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <motion.div
            className="chat-header p-4 bg-white border-b border-black/10 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-3">
                <button
                    className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} className="text-black" />
                </button>

                {friend?._id && (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-black/10">
                            <AvatarImage src={friend?.avatar} alt={friend?.name} />
                            <AvatarFallback className="bg-black text-white font-semibold text-sm">
                                {getInitials(friend?.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <h2 className="font-semibold text-black text-sm">{friend?.name || 'Unknown'}</h2>
                            {friend?.isOnline && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                    <span className="text-xs text-neutral-600">Active now</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {onClose && (
                <button
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 hover:bg-neutral-50 transition-colors"
                    onClick={onClose}
                    aria-label="Close chat"
                >
                    <X size={18} className="text-black" />
                </button>
            )}
        </motion.div>
    );
};

export default ChatHeader;
