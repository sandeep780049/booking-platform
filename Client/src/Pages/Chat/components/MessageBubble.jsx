import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { isMessageFromUser } from '../../../utils/chatHelpers';
import { CheckCheck, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessageBubble = ({ message, userId, currentUser, friendData }) => {
    const isSender = isMessageFromUser(message, userId);
    const messageUser = isSender ? currentUser : friendData;

    // Format the timestamp
    const formattedTime = message.timestamp ? format(new Date(message.timestamp), 'h:mm a') : '';

    // Get the first letter of the name for avatar fallback
    const getInitial = (user) => {
        if (!user?.name) return '?';
        return user.name.charAt(0).toUpperCase();
    };

    // Parse message content for chat links
    const parseMessageContent = (content) => {
        if (!content) return null;

        // Regex to find chat links in the format: /chat?chat=<id>
        const chatLinkRegex = /(\/chat\?chat=[a-zA-Z0-9]+)/g;

        // Find all chat links in the message
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = chatLinkRegex.exec(content)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }

            // Add the link
            parts.push({
                type: 'link',
                content: match[0],
                url: match[0]
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after the last link
        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }

        // If no links found, return the original content as text
        return parts.length > 0 ? parts : [{ type: 'text', content }];
    };

    const renderMessageContent = (content) => {
        const parts = parseMessageContent(content);

        return parts.map((part, index) => {
            if (part.type === 'link') {
                return (
                    <Link
                        key={index}
                        to={part.url}
                        className={`inline-flex items-center gap-1 underline hover:no-underline ${isSender ? 'text-white font-semibold' : 'text-black font-semibold'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <MessageCircle size={14} />
                        Open Chat
                    </Link>
                );
            }
            return <span key={index}>{part.content}</span>;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2 px-4 group`}
        >
            {!isSender && (
                <div className="flex-shrink-0 mr-2">
                    <Avatar className="h-7 w-7 border border-black/10">
                        <AvatarImage
                            src={messageUser?.profilePicture || "/placeholder.svg"}
                            alt={messageUser?.name}
                        />
                        <AvatarFallback className="bg-black text-white text-xs font-semibold">
                            {getInitial(messageUser)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}

            <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%] md:max-w-[60%] lg:max-w-[50%]`}>
                <div
                    className={`
                        relative px-4 py-2 rounded-3xl
                        ${isSender ?
                            'bg-black text-white' :
                            'bg-neutral-100 text-black border border-black/5'
                        }
                    `}
                >
                    {(message.content || message.text) && (
                        <p className="m-0 whitespace-pre-wrap text-sm leading-5">
                            {renderMessageContent(message.content || message.text)}
                        </p>
                    )}

                    {message.attachments && message.attachments.length > 0 && (
                        <div className={`flex flex-wrap gap-2 ${(message.content || message.text) ? 'mt-2' : ''}`}>
                            {message.attachments.map((base64Image, attachmentIndex) => (
                                <div
                                    key={attachmentIndex}
                                    className="relative overflow-hidden rounded-lg border border-black/10"
                                >
                                    <img
                                        src={base64Image || "/placeholder.svg"}
                                        alt={`Image ${attachmentIndex + 1}`}
                                        className="max-w-full max-h-60 object-contain bg-neutral-50"
                                        loading="lazy"
                                        onClick={() => window.open(base64Image, '_blank')}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder.svg";
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {message.attachment && (
                        <div className={`${(message.content || message.text) ? 'mt-2' : ''}`}>
                            {message.attachment.type && message.attachment.type.startsWith('image/') ? (
                                <div className="relative overflow-hidden rounded-lg border border-black/10">
                                    <img
                                        src={message.attachment.url || "/placeholder.svg"}
                                        alt={message.attachment.name || "Image attachment"}
                                        className="max-w-full max-h-60 object-contain bg-neutral-50"
                                        loading="lazy"
                                        onClick={() => window.open(message.attachment.url, '_blank')}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder.svg";
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className={`
                                    file-attachment p-3 rounded-lg flex items-center border border-black/10
                                    ${isSender ? 'bg-white/10' : 'bg-white'}
                                `}>
                                    <div className="file-icon mr-3 text-2xl">📄</div>
                                    <div className="file-info flex-1 overflow-hidden">
                                        <div className="file-name font-medium text-sm truncate">
                                            {message.attachment.name}
                                        </div>
                                        <div className="file-size text-xs text-neutral-500">
                                            {(message.attachment.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    {message.attachment.url && (
                                        <a
                                            href={message.attachment.url}
                                            download={message.attachment.name}
                                            className={`
                                                download-button ml-2 p-1.5 rounded-full 
                                                ${isSender ? 'bg-white text-black' : 'bg-neutral-100 text-black'}
                                                hover:opacity-80 transition-opacity
                                            `}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={`flex items-center text-xs text-neutral-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="mx-1">{formattedTime}</span>

                    {isSender && (
                        <CheckCheck size={12} className="text-neutral-500" />
                    )}
                </div>
            </div>

            {isSender && (
                <div className="flex-shrink-0 ml-2">
                    <Avatar className="h-7 w-7 border border-black/10">
                        <AvatarImage
                            src={messageUser?.profilePicture || "/placeholder.svg"}
                            alt={messageUser?.name}
                        />
                        <AvatarFallback className="bg-black text-white text-xs font-semibold">
                            {getInitial(messageUser)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}
        </motion.div>
    );
};

export default MessageBubble;
