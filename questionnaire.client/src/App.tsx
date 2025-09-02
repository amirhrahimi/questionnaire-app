import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Button, Avatar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
        },
        secondary: {
            main: '#16a34a',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

function NavBar() {
    const location = useLocation();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    
    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Questionnaire System
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Navigation Links */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/"
                            variant={location.pathname === '/' ? 'outlined' : 'text'}
                            sx={{ color: 'white', borderColor: 'white' }}
                        >
                            User Panel
                        </Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/admin"
                            variant={location.pathname.startsWith('/admin') ? 'outlined' : 'text'}
                            sx={{ color: 'white', borderColor: 'white' }}
                        >
                            Admin Panel
                        </Button>
                    </Box>

                    {/* User Info and Logout (only show if authenticated) */}
                    {isAuthenticated && isAdmin && (
                        <Box display="flex" alignItems="center" gap={2} sx={{ ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                            <Avatar 
                                src={user?.picture} 
                                alt={user?.name} 
                                sx={{ width: 32, height: 32 }} 
                            />
                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: '0.875rem' }}>
                                    {user?.name}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2, fontSize: '0.75rem' }}>
                                    Admin
                                </Typography>
                            </Box>
                            <Button 
                                color="inherit" 
                                startIcon={<LogoutIcon />}
                                onClick={logout}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    fontSize: '0.75rem',
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <NavBar />
                        <Box sx={{ flex: 1, width: '100%' }}>
                            <Routes>
                                <Route path="/" element={<UserPanel />} />
                                <Route path="/questionnaire/:id" element={<UserPanel />} />
                                <Route 
                                    path="/admin" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminPanel />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/*" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminPanel />
                                        </ProtectedRoute>
                                    } 
                                />
                            </Routes>
                        </Box>
                    </Box>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;