import React from 'react';
import { X, Image, File } from 'lucide-react';
import { ATTACHMENT_TYPES } from '../../../constants/chatConstants';
import { openFileBrowser } from '../../../utils/fileBrowserUtils';

const AttachmentPanel = ({ onClose, onAttachmentSelect }) => {
    // Direct handlers to ensure click events propagate correctly
    const handleImageClick = (e) => {
        e.preventDefault(); // Prevent any default behaviors
        e.stopPropagation(); // Stop event bubbling

        // Directly open the file browser
        openFileBrowser('image/*', (file) => {
            // Create a synthetic event object similar to input onChange
            const syntheticEvent = {
                target: {
                    files: [file]
                }
            };

            // Close the panel first
            onClose();

            // Then process the file with a slight delay to ensure panel is closed
            setTimeout(() => {
                onAttachmentSelect(ATTACHMENT_TYPES.IMAGE, syntheticEvent);
            }, 100);
        });
    };

    const handleFileClick = (e) => {
        e.preventDefault(); // Prevent any default behaviors
        e.stopPropagation(); // Stop event bubbling

        // Directly open the file browser
        openFileBrowser('*.*', (file) => {
            // Create a synthetic event object similar to input onChange
            const syntheticEvent = {
                target: {
                    files: [file]
                }
            };

            // Close the panel first
            onClose();

            // Then process the file with a slight delay to ensure panel is closed
            setTimeout(() => {
                onAttachmentSelect(ATTACHMENT_TYPES.DOCUMENT, syntheticEvent);
            }, 100);
        });
    };

    return (
        <div className="absolute bottom-full mb-2 left-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 z-10">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Add Attachment</span>
                <X
                    size={16}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleImageClick}
                    className="p-3 hover:bg-gray-100 rounded text-center transition-colors duration-200"
                >
                    <Image className="mx-auto mb-1 text-blue-500" size={24} />
                    <span className="text-xs">Image</span>
                </button>
                <button
                    onClick={handleFileClick}
                    className="p-3 hover:bg-gray-100 rounded text-center transition-colors duration-200"
                >
                    <File className="mx-auto mb-1 text-green-500" size={24} />
                    <span className="text-xs">File</span>
                </button>
            </div>
        </div>
    );
};

export default AttachmentPanel;
