import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Button, Avatar, useMediaQuery } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { AdminPanel, UserPanel, ProtectedRoute } from './components';
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography 
                    variant={isMobile ? "h6" : "h6"} 
                    component="div" 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        minWidth: 'fit-content'
                    }}
                >
                    Questionnaire System
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 1, sm: 2 },
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                }}>
                    {/* Navigation Links */}
                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/"
                            variant={location.pathname === '/' ? 'outlined' : 'text'}
                            sx={{ 
                                color: 'white', 
                                borderColor: 'white',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                padding: { xs: '4px 8px', sm: '6px 16px' }
                            }}
                        >
                            {isMobile ? 'User' : 'User Panel'}
                        </Button>
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/admin"
                            variant={location.pathname.startsWith('/admin') ? 'outlined' : 'text'}
                            sx={{ 
                                color: 'white', 
                                borderColor: 'white',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                padding: { xs: '4px 8px', sm: '6px 16px' }
                            }}
                        >
                            {isMobile ? 'Admin' : 'Admin Panel'}
                        </Button>
                    </Box>

                    {/* User Info and Logout (only show if authenticated) */}
                    {isAuthenticated && isAdmin && (
                        <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={{ xs: 1, sm: 2 }} 
                            sx={{ 
                                ml: { xs: 1, sm: 2 }, 
                                pl: { xs: 1, sm: 2 }, 
                                borderLeft: '1px solid rgba(255,255,255,0.2)',
                                flexWrap: isMobile ? 'wrap' : 'nowrap'
                            }}
                        >
                            <Avatar 
                                src={user?.picture} 
                                alt={user?.name} 
                                sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }} 
                            />
                            {!isMobile && (
                                <Box display="flex" flexDirection="column" alignItems="flex-start">
                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2, fontSize: '0.875rem' }}>
                                        {user?.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.2, fontSize: '0.75rem' }}>
                                        Admin
                                    </Typography>
                                </Box>
                            )}
                            <Button 
                                color="inherit" 
                                startIcon={!isMobile ? <LogoutIcon /> : undefined}
                                onClick={logout}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    fontSize: { xs: '0.75rem', sm: '0.75rem' },
                                    padding: { xs: '2px 6px', sm: '4px 12px' },
                                    minWidth: { xs: '60px', sm: 'auto' },
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {isMobile ? 'Logout' : 'Logout'}
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
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        minHeight: '100vh',
                        width: '100%',
                        overflow: 'hidden' // Prevent horizontal overflow
                    }}>
                        <NavBar />
                        <Box sx={{ 
                            flex: 1, 
                            width: '100%',
                            overflow: 'auto', // Allow vertical scrolling
                            maxWidth: '100vw' // Prevent content from exceeding viewport width
                        }}>
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