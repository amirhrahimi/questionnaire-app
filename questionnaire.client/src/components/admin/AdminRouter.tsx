import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom';
import type { Questionnaire, CreateQuestionnaire, QuestionnaireResult } from '../../types';
import QuestionnaireList from './QuestionnaireList';
import CreateQuestionnaireForm from './CreateQuestionnaireForm';
import ResultsView from './ResultsView';

interface AdminRouterProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    onCreateQuestionnaire: (questionnaire: CreateQuestionnaire) => Promise<void>;
    onUpdateQuestionnaire: (id: number, questionnaire: CreateQuestionnaire) => Promise<void>;
    onViewResults: (id: number) => Promise<QuestionnaireResult | null>;
    onCopyLink: (id: number) => void;
    onShowQrCode: (id: number) => void;
    onToggleStatus: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
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
        if (path.includes('/admin/results/')) return 'results';
        return 'list';
    };

    const currentRoute = getCurrentRoute();

    // Handle questionnaire creation
    const handleCreateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        await onCreateQuestionnaire(questionnaire);
        navigate('/admin');
    };

    // Handle questionnaire editing
    const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
        navigate(`/admin/edit/${questionnaire.id}`);
    };

    // Handle questionnaire update
    const handleUpdateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        if (!id) return;
        await onUpdateQuestionnaire(parseInt(id), questionnaire);
        navigate('/admin');
    };

    // Handle viewing results
    const handleViewResults = (questionnaireId: number) => {
        navigate(`/admin/results/${questionnaireId}`);
    };

    // Handle cancel operations
    const handleCancel = () => {
        navigate('/admin');
    };

    // Handle create new button
    const handleCreateNew = () => {
        navigate('/admin/create');
    };

    // Find questionnaire for editing
    const getQuestionnaireForEdit = () => {
        if (!id) return null;
        return questionnaires.find(q => q.id === parseInt(id)) || null;
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
                return <div>Loading...</div>;
            }
            return (
                <CreateQuestionnaireForm
                    questionnaire={editingQuestionnaire}
                    onSave={handleUpdateQuestionnaire}
                    onCancel={handleCancel}
                />
            );
        }

        case 'results':
            return (
                <ResultsViewWrapper
                    questionnaireId={id ? parseInt(id) : 0}
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
    questionnaireId: number;
    onViewResults: (id: number) => Promise<QuestionnaireResult | null>;
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
        return <div>Loading results...</div>;
    }

    if (!results) {
        return <Navigate to="/admin" replace />;
    }

    return <ResultsView results={results} onBack={onBack} />;
};

export default AdminRouter;
