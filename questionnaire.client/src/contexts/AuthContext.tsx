import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { AuthContext, type AuthContextType } from './AuthContext';
import Cookies from 'js-cookie';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing token and user data on mount
        const savedToken = Cookies.get('authToken');
        const savedUser = Cookies.get('authUser');
        
        if (savedToken && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                logout();
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        
        // Save to cookies
        Cookies.set('authToken', newToken, { expires: 7 }); // 7 days
        Cookies.set('authUser', JSON.stringify(newUser), { expires: 7 });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        
        // Remove from cookies
        Cookies.remove('authToken');
        Cookies.remove('authUser');
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.isAdmin || false;

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
