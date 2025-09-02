import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const SimpleLoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Simple validation for development
        if (email === 'ah.rahimy@gmail.com' && password === 'admin123') {
            // Mock user data for development
            const mockUser = {
                id: 1,
                email: 'ah.rahimy@gmail.com',
                name: 'Admin User',
                picture: '',
                isAdmin: true
            };
            
            const mockToken = 'dev-token-' + Date.now();
            login(mockToken, mockUser);
        } else {
            setError('Invalid credentials. Use ah.rahimy@gmail.com / admin123');
        }
    };

    return (
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
                <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                    Development Mode - Use ah.rahimy@gmail.com / admin123
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default SimpleLoginPage;
