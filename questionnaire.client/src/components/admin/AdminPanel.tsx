import { useState, useEffect } from 'react';
import type { Questionnaire, CreateQuestionnaire, QuestionnaireResult } from '../../types';
import api from '../../services/api';
import AdminRouter from './AdminRouter';
import QrCodeModal from './QrCodeModal';

const AdminPanel = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(false);
    const [qrCodeModal, setQrCodeModal] = useState<{
        open: boolean;
        questionnaireId: number;
        questionnaireTitle: string;
    }>({
        open: false,
        questionnaireId: 0,
        questionnaireTitle: ''
    });

    const fetchQuestionnaires = async () => {
        try {
            setLoading(true);
            console.log('Fetching questionnaires for admin...');
            const response = await api.get('/api/admin/questionnaires');
            console.log('Admin questionnaires data:', response.data);
            setQuestionnaires(response.data);
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestionnaires();
    }, []);

    const handleCreateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        try {
            console.log('Creating questionnaire:', questionnaire);
            const response = await api.post('/api/admin/questionnaires', questionnaire);
            console.log('Created questionnaire:', response.data);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to create questionnaire:', error);
            throw error;
        }
    };

    const handleUpdateQuestionnaire = async (id: number, questionnaire: CreateQuestionnaire) => {
        try {
            console.log('Updating questionnaire:', id, questionnaire);
            const response = await api.put(`/api/admin/questionnaires/${id}`, questionnaire);
            console.log('Updated questionnaire:', response.data);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to update questionnaire:', error);
            throw error;
        }
    };

    const handleViewResults = async (id: number): Promise<QuestionnaireResult | null> => {
        try {
            console.log('Fetching results for questionnaire:', id);
            const response = await api.get(`/api/admin/questionnaires/${id}/results`);
            console.log('Results data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch results:', error);
            throw error;
        }
    };

    const copyQuestionnaireLink = (id: number) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/questionnaire/${id}`;
        
        navigator.clipboard.writeText(link).then(() => {
            console.log('Link copied to clipboard:', link);
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link');
        });
    };

    const showQrCode = (id: number) => {
        const questionnaire = questionnaires.find(q => q.id === id);
        setQrCodeModal({
            open: true,
            questionnaireId: id,
            questionnaireTitle: questionnaire?.title || `Questionnaire #${id}`
        });
    };

    const closeQrCodeModal = () => {
        setQrCodeModal({
            open: false,
            questionnaireId: 0,
            questionnaireTitle: ''
        });
    };

    const toggleQuestionnaireStatus = async (id: number) => {
        try {
            console.log('Toggling status for questionnaire:', id);
            await api.patch(`/api/admin/questionnaires/${id}/toggle`);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to toggle questionnaire status:', error);
            throw error;
        }
    };

    const deleteQuestionnaire = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this questionnaire? This action cannot be undone.')) {
            try {
                console.log('Deleting questionnaire:', id);
                await api.delete(`/api/admin/questionnaires/${id}`);
                fetchQuestionnaires();
            } catch (error) {
                console.error('Failed to delete questionnaire:', error);
                throw error;
            }
        }
    };

    return (
        <>
            <AdminRouter
                questionnaires={questionnaires}
                loading={loading}
                onCreateQuestionnaire={handleCreateQuestionnaire}
                onUpdateQuestionnaire={handleUpdateQuestionnaire}
                onViewResults={handleViewResults}
                onCopyLink={copyQuestionnaireLink}
                onShowQrCode={showQrCode}
                onToggleStatus={toggleQuestionnaireStatus}
                onDelete={deleteQuestionnaire}
            />
            
            <QrCodeModal
                open={qrCodeModal.open}
                onClose={closeQrCodeModal}
                questionnaireId={qrCodeModal.questionnaireId}
                questionnaireTitle={qrCodeModal.questionnaireTitle}
            />
        </>
    );
};

export default AdminPanel;
