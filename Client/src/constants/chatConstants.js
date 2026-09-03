// Socket configuration
export const SOCKET_URL = 'http://localhost:8080';
export const SOCKET_CONFIG = {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false, // Don't connect automatically, we'll do it in useEffect
};

// Empty state text
export const EMPTY_STATES = {
  NO_FRIEND_SELECTED: {
    title: 'Select a friend to start chatting',
  },
  NO_MESSAGES: {
    title: 'Say Hi 👋',
    description: 'Start a conversation with',
  },
  START_CONVERSATION: {
    title: 'Start a conversation',
    description: 'Send a message to begin chatting',
  },
};

// Attachment types
export const ATTACHMENT_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  LOCATION: 'location',
};

// Attachment type icons
export const ATTACHMENT_ICONS = {
  [ATTACHMENT_TYPES.IMAGE]: '📷',
  [ATTACHMENT_TYPES.DOCUMENT]: '📄',
  [ATTACHMENT_TYPES.LOCATION]: '📍',
};
