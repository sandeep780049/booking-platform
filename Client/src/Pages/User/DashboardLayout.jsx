import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { Loader } from '../../components/Loader'

export default function DashboardLayout() {
  const { user, loading } = useAuth()

  // While auth status is loading, show loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <Loader />
      </div>
    )
  }

  // If not logged in, redirect to login page
  if (!user || !user.user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated: render nested dashboard routes
  return <Outlet />
}
