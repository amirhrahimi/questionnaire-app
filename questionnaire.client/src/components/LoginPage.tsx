import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
    Box,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../types';
import api from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

// Debug logging - remove this after fixing
console.log('Environment variables debug:');
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('All env vars:', import.meta.env);
console.log('Using client ID:', GOOGLE_CLIENT_ID);

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        try {
            setError(null);
            
            if (!credentialResponse.credential) {
                setError('Google login failed');
                return;
            }

            const loginRequest: LoginRequest = {
                googleToken: credentialResponse.credential
            };

            const response = await api.post<LoginResponse>('/api/auth/google-login', loginRequest);
            
            login(response.data.token, response.data.user);
            
        } catch (error: unknown) {
            console.error('Login error:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    setError('Access denied. Admin privileges required.');
                } else if (error.response?.status === 401) {
                    setError('Invalid Google token.');
                } else {
                    setError('Login failed. Please try again.');
                }
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="grey.100"
            >
                <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Admin Login
                    </Typography>
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
                        Sign in with your Google account to access the admin panel
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box display="flex" justifyContent="center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            text="signin_with"
                        />
                    </Box>
                </Paper>
            </Box>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;
