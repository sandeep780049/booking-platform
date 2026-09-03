import React from 'react'

export const Loader = ({ btn }) => {
  return (
    <div className={`w-full ${btn ? `` : `h-[100vh] bg-white`} flex justify-center items-center`}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  )
}

export const PageLoader = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        <p className="text-sm font-medium tracking-[0.3em] text-gray-500 uppercase">
          Loading
        </p>
      </div>
    </div>
  )
}
