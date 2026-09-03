import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../Pages/AuthProvider'
import { useEffect } from 'react'
import { getInstructorById } from '../Api/instructor.api';

/**
 * Admin Route - Protects routes that require admin access
 * Works with the RBAC system - any admin type can access admin layout
 * More granular permission checking is done at the page/component level
 */
export const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user.user === null) {
        navigate('/login')
      }
      else if (user.user.role !== 'admin' && user.user.role !== 'superadmin') {
        navigate("/")
      }
    }
  }, [user, loading, navigate])

  // Don't render anything while checking auth
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in
  if (user.user === null) {
    return <Navigate to="/login" replace />;
  }

  // Not an admin
  if (user.user.role !== 'admin' && user.user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Instructor Route - Protects routes that require instructor access
 */
export const InstructorRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const getStatus = async () => {
    try {
      const instructorId = typeof user.user.instructor === 'object'
        ? user.user.instructor._id
        : user.user.instructor;
      const res = await getInstructorById(instructorId)
      if (res.data.message.instructor?.instructor?.documentVerified === "pending") {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  useEffect(() => {
    if (!loading) {
      if (user.user === null) {
        navigate('/login')
      }
      else if (user.user.role !== 'instructor') {
        navigate("/")
      }
      else if (user.user.role === 'instructor' && user.user.instructor !== null) {
        getStatus().then((res) => {
          if (res === false) {
            navigate("/instructor/pending-review")
          }
        })
      }
    }
  }, [user, loading, navigate])

  // Don't render anything while checking auth
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}

/**
 * Hotel Route - Protects routes that require hotel owner access
 */
export const HotelRoute = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user.user === null) {
        navigate('/login')
      }
      else if (user.user.role !== 'hotel') {
        navigate("/")
      }
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}
