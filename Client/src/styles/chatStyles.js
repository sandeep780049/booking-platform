// Common chat UI styles

// Message container styles
export const messageContainerStyle = (isSender) => ({
  display: 'flex',
  justifyContent: isSender ? 'flex-end' : 'flex-start',
  marginBottom: '16px',
  alignItems: 'flex-end',
  gap: '8px',
});

export const avatarContainerStyle = {
  flexShrink: 0,
};

export const messageContentStyle = (isSender) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isSender ? 'flex-end' : 'flex-start',
  maxWidth: '70%',
});

export const messageBubbleStyle = (isSender) => ({
  padding: '10px 12px',
  backgroundColor: isSender ? '#3b82f6' : '#e5e7eb',
  color: isSender ? 'white' : '#111',
  borderRadius: '12px',
  borderTopRightRadius: isSender ? '4px' : '12px',
  borderTopLeftRadius: isSender ? '12px' : '4px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
});

export const timestampStyle = {
  fontSize: '11px',
  color: '#6b7280',
  marginTop: '4px',
};

// Attachment styles
export const attachmentContainerStyle = (hasContent) => ({
  marginTop: hasContent ? '8px' : '0',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

export const imageAttachmentStyle = {
  borderRadius: '8px',
  overflow: 'hidden',
};

// Empty state styles
export const emptyStateContainerStyle = {
  textAlign: 'center',
  padding: '24px',
  backgroundColor: '#f3f4f6',
  borderRadius: '12px',
  maxWidth: '400px',
};

export const attachmentImageStyle = {
  maxWidth: '100%',
  maxHeight: window.innerWidth >= 768 ? '200px' : '150px',
  objectFit: 'contain',
  borderRadius: '8px',
  cursor: 'pointer',
};
