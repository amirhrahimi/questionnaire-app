import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './components';
const AdminPanel = lazy(() => import('./components').then(m => ({ default: m.AdminPanel })));
const UserPanel = lazy(() => import('./components').then(m => ({ default: m.UserPanel })));
import { AuthProvider } from './contexts/AuthProvider';
import { ColorModeProvider } from './contexts/ColorModeContext';
import { Loading } from './components/common/Loading';
import { Layout } from './components/layout/Layout';

function App() {
    return (
        <ColorModeProvider>
            <AuthProvider>
                <Router>
                    <Layout>
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
                    </Layout>
                </Router>
            </AuthProvider>
        </ColorModeProvider>
    );
}

export default App;