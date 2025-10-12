import { useProfileStore } from '@/store/profile-store';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';


interface ProtectedRouteProps {
    element: ReactNode;
    allowedRoles?: string[];
}

/**
 * Component that protects routes based on user roles
 * If no allowedRoles specified, any authenticated user can access
 * If allowedRoles specified, user must have one of those roles
 */
export const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
    const { profile } = useProfileStore();

    // If no role restrictions, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
        return <>{element}</>;
    }

    // Check if user has required role
    const hasAccess = profile?.isAdmin

    // If no access, redirect to appropriate page
    if (!hasAccess) {
        // Redirect others based on their role
        return <Navigate to={'/dashboard'} replace />;
    }

    return <>{element}</>;
};