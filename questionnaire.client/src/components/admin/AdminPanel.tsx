import { useState, useEffect } from 'react';
import type { Questionnaire, CreateQuestionnaire, QuestionnaireResult } from '../../types';
import api from '../../services/api';
import QuestionnaireList from './QuestionnaireList';
import CreateQuestionnaireForm from './CreateQuestionnaireForm';
import ResultsView from './ResultsView';

const AdminPanel = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedResults, setSelectedResults] = useState<QuestionnaireResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestionnaires();
    }, []);

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

    const handleCreateQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        try {
            console.log('Creating questionnaire:', questionnaire);
            const response = await api.post('/api/admin/questionnaires', questionnaire);
            console.log('Created questionnaire:', response.data);
            setShowCreateForm(false);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to create questionnaire:', error);
        }
    };

    const viewResults = async (id: number) => {
        try {
            console.log('Fetching results for questionnaire:', id);
            const response = await api.get(`/api/admin/questionnaires/${id}/results`);
            console.log('Results data:', response.data);
            setSelectedResults(response.data);
        } catch (error) {
            console.error('Failed to fetch results:', error);
        }
    };

    const copyQuestionnaireLink = (id: number) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/${id}`;
        
        navigator.clipboard.writeText(link).then(() => {
            console.log('Link copied to clipboard:', link);
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link');
        });
    };

    const toggleQuestionnaireStatus = async (id: number) => {
        try {
            console.log('Toggling status for questionnaire:', id);
            await api.patch(`/api/admin/questionnaires/${id}/toggle`);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to toggle questionnaire status:', error);
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
            }
        }
    };

    // Show results view if selected
    if (selectedResults) {
        return <ResultsView results={selectedResults} onBack={() => setSelectedResults(null)} />;
    }

    // Show create form if requested
    if (showCreateForm) {
        return (
            <CreateQuestionnaireForm
                onSave={handleCreateQuestionnaire}
                onCancel={() => setShowCreateForm(false)}
            />
        );
    }

    // Show main questionnaire list
    return (
        <QuestionnaireList
            questionnaires={questionnaires}
            loading={loading}
            onCreateNew={() => setShowCreateForm(true)}
            onViewResults={viewResults}
            onCopyLink={copyQuestionnaireLink}
            onToggleStatus={toggleQuestionnaireStatus}
            onDelete={deleteQuestionnaire}
        />
    );
};

export default AdminPanel;
