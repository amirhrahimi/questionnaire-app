import { useEffect, useState } from 'react';
import { Loading } from '../../common/Loading';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import type { Questionnaire, CreateQuestionnaire, QuestionnaireResult } from '../../../types';
import { QuestionnaireList, CreateQuestionnaireForm, ViewQuestionnaire } from '../questionnaires/index';
import { ResultsView } from '../results/index';

interface AdminRouterProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    onCreateQuestionnaire: (questionnaire: CreateQuestionnaire) => Promise<void>;
    onUpdateQuestionnaire: (id: string, questionnaire: CreateQuestionnaire) => Promise<void>;
    onViewResults: (id: string) => Promise<QuestionnaireResult | null>;
    onCopyLink: (id: string) => void;
    onShowQrCode: (id: string) => void;
    onToggleStatus: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const AdminRouter = ({
    questionnaires,
    loading,
    onCreateQuestionnaire,
    onUpdateQuestionnaire,
    onViewResults,
    onCopyLink,
    onShowQrCode,
    onToggleStatus,
    onDelete
}: AdminRouterProps) => {
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Helper function to get current route
    const getCurrentRoute = () => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/') return 'list';
        if (path === '/admin/create') return 'create';
        if (path.includes('/admin/edit/')) return 'edit';
        if (path.includes('/admin/view/')) return 'view';
        if (path.includes('/admin/results/')) return 'results';
        return 'list';
    };

    const currentRoute = getCurrentRoute();

    // Handle questionnaire creation
    const handleCreateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        await onCreateQuestionnaire(questionnaire);
        navigate('/admin');
    };

    // Handle questionnaire viewing
    const handleViewQuestionnaire = (questionnaire: Questionnaire) => {
        navigate(`/admin/view/${questionnaire.id}`, {
            state: { from: '/admin' }
        });
    };

    // Handle questionnaire editing
    const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
        const currentPath = location.pathname;
        navigate(`/admin/edit/${questionnaire.id}`, { 
            state: { from: currentPath }
        });
    };

    // Handle questionnaire update
    const handleUpdateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        if (!id) return;
        await onUpdateQuestionnaire(id, questionnaire);
        
        // Navigate back to where we came from, or default to admin panel
        const fromPath = (location.state as { from?: string })?.from;
        if (fromPath && fromPath.includes('/admin/view/')) {
            navigate(fromPath);
        } else {
            navigate('/admin');
        }
    };

    // Handle viewing results
    const handleViewResults = (questionnaireId: string) => {
        navigate(`/admin/results/${questionnaireId}`);
    };

    // Handle cancel operations
    const handleCancel = () => {
        // Navigate back to where we came from, or default to admin panel
        const fromPath = (location.state as { from?: string })?.from;
        if (fromPath) {
            navigate(fromPath);
        } else {
            navigate('/admin');
        }
    };

    // Handle cancel from edit specifically
    const handleEditCancel = () => {
        const fromPath = (location.state as { from?: string })?.from;
        if (fromPath) {
            navigate(fromPath, { replace: true });
        } else {
            navigate('/admin', { replace: true });
        }
    };

    // Handle create new button
    const handleCreateNew = () => {
        navigate('/admin/create');
    };

    // Find questionnaire for editing
    const getQuestionnaireForEdit = () => {
        if (!id) return null;
        return questionnaires.find(q => q.id === id) || null;
    };

    // Render based on current route
    switch (currentRoute) {
        case 'create':
            return (
                <CreateQuestionnaireForm
                    onSave={handleCreateQuestionnaire}
                    onCancel={handleCancel}
                />
            );

        case 'edit': {
            const editingQuestionnaire = getQuestionnaireForEdit();
            if (!editingQuestionnaire && !loading) {
                // Questionnaire not found, redirect to admin
                return <Navigate to="/admin" replace />;
            }
            if (!editingQuestionnaire) {
                return <Loading label="Loading questionnaire…" />;
            }
            return (
                <CreateQuestionnaireForm
                    questionnaire={editingQuestionnaire}
                    onSave={handleUpdateQuestionnaire}
                    onCancel={handleEditCancel}
                />
            );
        }

        case 'view': {
            const viewingQuestionnaire = getQuestionnaireForEdit();
            if (!viewingQuestionnaire && !loading) {
                // Questionnaire not found, redirect to admin
                return <Navigate to="/admin" replace />;
            }
            if (!viewingQuestionnaire) {
                return <Loading label="Loading questionnaire…" />;
            }
            return (
                <ViewQuestionnaire
                    questionnaire={viewingQuestionnaire}
                    onBack={handleCancel}
                    onEdit={handleEditQuestionnaire}
                    onViewResults={handleViewResults}
                    onCopyLink={onCopyLink}
                    onShowQrCode={onShowQrCode}
                    onToggleStatus={onToggleStatus}
                />
            );
        }

        case 'results':
            return (
                <ResultsViewWrapper
                    questionnaireId={id || ''}
                    onViewResults={onViewResults}
                    onBack={handleCancel}
                />
            );

        case 'list':
        default:
            return (
                <QuestionnaireList
                    questionnaires={questionnaires}
                    loading={loading}
                    onCreateNew={handleCreateNew}
                    onEdit={handleEditQuestionnaire}
                    onView={handleViewQuestionnaire}
                    onViewResults={handleViewResults}
                    onCopyLink={onCopyLink}
                    onShowQrCode={onShowQrCode}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                />
            );
    }
};

// Wrapper component for results view that handles async data loading
interface ResultsViewWrapperProps {
    questionnaireId: string;
    onViewResults: (id: string) => Promise<QuestionnaireResult | null>;
    onBack: () => void;
}

const ResultsViewWrapper = ({ questionnaireId, onViewResults, onBack }: ResultsViewWrapperProps) => {
    const [results, setResults] = useState<QuestionnaireResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!questionnaireId) {
                onBack();
                return;
            }
            
            try {
                setLoading(true);
                const data = await onViewResults(questionnaireId);
                setResults(data);
            } catch (error) {
                console.error('Failed to fetch results:', error);
                onBack();
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [questionnaireId, onViewResults, onBack]);

    if (loading) {
        return <Loading label="Loading results…" />;
    }

    if (!results) {
        return <Navigate to="/admin" replace />;
    }

    return <ResultsView results={results} onBack={onBack} />;
};

export default AdminRouter;
