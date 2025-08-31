import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';

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
    
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Questionnaire System
                </Typography>
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
            </Toolbar>
        </AppBar>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <NavBar />
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <Routes>
                            <Route path="/" element={<UserPanel />} />
                            <Route path="/questionnaire/:id" element={<UserPanel />} />
                            <Route path="/admin" element={<AdminPanel />} />
                            <Route path="/admin/*" element={<AdminPanel />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;