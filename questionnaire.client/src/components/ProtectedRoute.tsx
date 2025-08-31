import React from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated || !isAdmin) {
        return <LoginPage />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
