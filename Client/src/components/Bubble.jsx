import React from 'react'

export const Bubble = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="bubble absolute top-[10%] left-[15%] w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-[80px] transition-transform duration-1000 ease-in-out"></div>
            <div className="bubble absolute top-[40%] left-[60%] w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-[100px] transition-transform duration-1000 ease-in-out"></div>
            <div className="bubble absolute bottom-[10%] right-[20%] w-72 h-72 bg-cyan-200 rounded-full opacity-20 blur-[90px] transition-transform duration-1000 ease-in-out"></div>
        </div>
    )
}
