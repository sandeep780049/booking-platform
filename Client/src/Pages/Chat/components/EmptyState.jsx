import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const EmptyState = ({ title, description, friendName }) => {
    return (
        <motion.div
            className="flex items-center justify-center h-full w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-center p-8 max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
                        <MessageCircle className="h-8 w-8 text-black" />
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-3 text-black">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-neutral-600">
                        {description} {friendName && <span className="font-medium text-black">{friendName}</span>}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default EmptyState;
