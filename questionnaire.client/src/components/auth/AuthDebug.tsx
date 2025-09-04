import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import Cookies from 'js-cookie';

const AuthDebug: React.FC = () => {
    const { user, token, isAuthenticated, isAdmin } = useAuth();

    const checkToken = () => {
        const cookieToken = Cookies.get('authToken');
        const cookieUser = Cookies.get('authUser');
        
        console.log('Auth Debug:', {
            contextToken: token,
            cookieToken,
            contextUser: user,
            cookieUser: cookieUser ? JSON.parse(cookieUser) : null,
            isAuthenticated,
            isAdmin
        });
    };

    return (
        <Paper sx={{ p: 2, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                Authentication Debug
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                    <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                    <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                    <strong>User:</strong> {user ? user.name : 'None'}
                </Typography>
                <Typography variant="body2">
                    <strong>Email:</strong> {user ? user.email : 'None'}
                </Typography>
                <Typography variant="body2">
                    <strong>Token Present:</strong> {token ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                    <strong>Token Length:</strong> {token ? token.length : 0}
                </Typography>
            </Box>
            <Button variant="outlined" onClick={checkToken}>
                Log Auth State to Console
            </Button>
        </Paper>
    );
};

export default AuthDebug;
