import React from 'react';

export const BackgroundEffects = ({ children }) => {
    return (
        <div className="relative w-full h-full overflow-hidden bg-white">
            {children}
        </div>
    );
};

export default BackgroundEffects;
