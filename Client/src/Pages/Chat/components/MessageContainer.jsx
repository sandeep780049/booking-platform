import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import EmptyState from './EmptyState';
import { EMPTY_STATES } from '../../../constants/chatConstants';

const MessageContainer = ({ messages, loading, error, userId, user, friend, messageEndRef }) => {
    if (loading && messages.length === 0) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <div className="loader animate-spin rounded-full h-10 w-10 border-2 border-t-black border-b-black border-l-transparent border-r-transparent"></div>
            </div>
        );
    }

    if (error === 'No message found') {
        return (
            <EmptyState
                title={EMPTY_STATES.NO_MESSAGES.title}
                description={EMPTY_STATES.NO_MESSAGES.description}
                friendName={friend.name}
            />
        );
    }

    if (!messages.length) {
        return (
            <EmptyState
                title={EMPTY_STATES.START_CONVERSATION.title}
                description={EMPTY_STATES.START_CONVERSATION.description}
            />
        );
    }

    return (
        <motion.div
            className="space-y-1 w-full max-w-full mx-auto py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div ref={messageEndRef} />
            <AnimatePresence>
                {messages.map((message, index) => (
                    <MessageBubble
                        key={index}
                        message={message}
                        userId={userId}
                        currentUser={user?.user}
                        friendData={friend}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

export default MessageContainer;
