import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Box, Button, Avatar, useMediaQuery, IconButton, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';
import { Logout as LogoutIcon, Menu as MenuIcon, ColorLens as ColorLensIcon, AdminPanelSettings } from '@mui/icons-material';
import { Suspense, lazy, useState } from 'react';
import { ProtectedRoute } from './components';
const AdminPanel = lazy(() => import('./components').then(m => ({ default: m.AdminPanel })));
const UserPanel = lazy(() => import('./components').then(m => ({ default: m.UserPanel })));
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { ColorModeProvider, useColorMode } from './contexts/ColorModeContext';
import { Select, FormControl, InputLabel } from '@mui/material';
import { Loading } from './components/common/Loading';

function ModeSelect() {
    const { mode, setMode, resolvedMode } = useColorMode();
    return (
        <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="color-mode-label">Theme</InputLabel>
            <Select
                labelId="color-mode-label"
                value={mode}
                label="Theme"
                onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
            >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System ({resolvedMode})</MenuItem>
            </Select>
        </FormControl>
    );
}

function NavBar() {
    const location = useLocation();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const { mode, setMode, resolvedMode } = useColorMode();

    // Menus state
    const [navAnchor, setNavAnchor] = useState<null | HTMLElement>(null);
    const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
    const navOpen = Boolean(navAnchor);
    const userOpen = Boolean(userAnchor);

    const handleNavOpen = (e: React.MouseEvent<HTMLElement>) => setNavAnchor(e.currentTarget);
    const handleNavClose = () => setNavAnchor(null);
    const handleUserOpen = (e: React.MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
    const handleUserClose = () => setUserAnchor(null);

    const goAndClose = () => {
        handleNavClose();
    };

    const compactTitle = 'Questionnaires';

    return (
        <AppBar position="static" color="primary" enableColorOnDark>
            <Toolbar
                variant={isMobile ? 'dense' : undefined}
                sx={{
                    minHeight: { xs: 44, sm: 56 },
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center'
                }}
            >
                {/* Left Section: Hamburger on mobile */}
                {isMobile && (
                    <IconButton
                        color="inherit"
                        size="small"
                        aria-label="menu"
                        onClick={handleNavOpen}
                        sx={{ mr: 0.5 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                {/* Title */}
                <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    component={Link}
                    to="/"
                    onClick={() => handleNavClose()}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1.35rem' },
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {compactTitle}
                </Typography>

                {/* Desktop Nav Buttons */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/"
                            variant={location.pathname === '/' ? 'outlined' : 'text'}
                            size="small"
                        >
                            User Panel
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/admin"
                            variant={location.pathname.startsWith('/admin') ? 'outlined' : 'text'}
                            size="small"
                        >
                            Admin Panel
                        </Button>
                        <ModeSelect />
                    </Box>
                )}

                {/* Avatar / User Menu */}
                {isAuthenticated && isAdmin && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!isMobile && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.1 }}>{user?.name}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.75, display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <AdminPanelSettings fontSize="inherit" /> Admin
                                </Typography>
                            </Box>
                        )}
                        <IconButton
                            onClick={handleUserOpen}
                            size="small"
                            aria-controls={userOpen ? 'user-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={userOpen ? 'true' : undefined}
                        >
                            <Avatar
                                src={user?.picture}
                                alt={user?.name}
                                sx={{ width: 34, height: 34 }}
                            />
                        </IconButton>
                        {/* {!isMobile && (
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<LogoutIcon fontSize="small" />}
                                onClick={() => logout()}
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.4)',
                                    '&:hover': { borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }
                                }}
                            >
                                Logout
                            </Button>
                        )} */}
                    </Box>
                )}

                {/* Mobile Navigation Menu */}
                <Menu
                    anchorEl={navAnchor}
                    id="nav-menu"
                    open={navOpen}
                    onClose={handleNavClose}
                    onClick={handleNavClose}
                    PaperProps={{
                        sx: { width: 240 }
                    }}
                >
                    <MenuItem component={Link} to="/" selected={location.pathname === '/'} onClick={goAndClose}>User Panel</MenuItem>
                    <MenuItem component={Link} to="/admin" selected={location.pathname.startsWith('/admin')} onClick={goAndClose}>Admin Panel</MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem disabled sx={{ opacity: 0.7, fontSize: '0.75rem', textTransform: 'uppercase' }}>Theme</MenuItem>
                    <MenuItem onClick={() => setMode('light')} selected={mode === 'light'}>
                        <ListItemIcon><ColorLensIcon fontSize="small" /></ListItemIcon>
                        Light
                    </MenuItem>
                    <MenuItem onClick={() => setMode('dark')} selected={mode === 'dark'}>
                        <ListItemIcon><ColorLensIcon fontSize="small" /></ListItemIcon>
                        Dark
                    </MenuItem>
                    <MenuItem onClick={() => setMode('system')} selected={mode === 'system'}>
                        <ListItemIcon><ColorLensIcon fontSize="small" /></ListItemIcon>
                        System ({resolvedMode})
                    </MenuItem>
                </Menu>

                {/* User Menu */}
                <Menu
                    anchorEl={userAnchor}
                    id="user-menu"
                    open={userOpen}
                    onClose={handleUserClose}
                    onClick={handleUserClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5, maxWidth: 260 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AdminPanelSettings fontSize="inherit" /> Admin
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { logout(); }}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

function App() {
    return (
    <ColorModeProvider>
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
                            <Suspense fallback={<Loading label="Loading application…" /> }>
                            <Routes>
                                {/* User Routes */}
                                <Route path="/" element={<UserPanel />} />
                                <Route path="/questionnaire/:id" element={<UserPanel />} />
                                <Route path="/questionnaires" element={<UserPanel />} />
                                
                                {/* Admin Routes */}
                                <Route 
                                    path="/admin" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminPanel />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/create" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminPanel />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/edit/:id" 
                                    element={
                                        <ProtectedRoute>
                                            <AdminPanel />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/results/:id" 
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
                            </Suspense>
                        </Box>
                    </Box>
                </Router>
            </AuthProvider>
        </ColorModeProvider>
    );
}

export default App;