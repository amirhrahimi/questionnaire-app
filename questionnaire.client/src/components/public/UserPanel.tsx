import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Questionnaire, QuestionResponse, SubmitResponse } from '../../types';
import { QuestionType } from '../../types';
import api from '../../services/api';
import QuestionnaireGrid from './QuestionnaireGrid';
import QuestionnaireForm from './QuestionnaireForm';

const UserPanel = () => {
    const { id } = useParams<{ id: string }>();
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<string[]>([]);

    const fetchQuestionnaires = async () => {
        try {
            console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
            console.log('Fetching questionnaires...');
            const response = await api.get('/api/questionnaire');
            console.log('Questionnaires data:', response.data);
            setQuestionnaires(response.data);
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
        }
    };

    const initializeResponses = useCallback((questionnaire: Questionnaire) => {
        const initialResponses: QuestionResponse[] = questionnaire.questions.map(q => ({
            questionId: q.id,
            textAnswer: '',
            selectedOptionId: undefined,
            selectedOptionIds: []
        }));
        setResponses(initialResponses);
    }, []);

    const selectQuestionnaire = useCallback(async (questionnaireId: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/questionnaire/${questionnaireId}`);
            setSelectedQuestionnaire(response.data);
            initializeResponses(response.data);
            setSubmitStatus('idle');
            setErrors([]);
        } catch (error) {
            console.error('Failed to fetch questionnaire:', error);
        } finally {
            setLoading(false);
        }
    }, [initializeResponses]);

    useEffect(() => {
        if (id) {
            // If we have an ID in the URL, load that specific questionnaire
            selectQuestionnaire(parseInt(id));
        } else {
            // If no ID, show the list of available questionnaires
            fetchQuestionnaires();
        }
    }, [id, selectQuestionnaire]);

    const updateResponse = (questionId: number, update: Partial<QuestionResponse>) => {
        setResponses(prev => prev.map(r => 
            r.questionId === questionId ? { ...r, ...update } : r
        ));
    };

    const validateResponses = (): string[] => {
        const validationErrors: string[] = [];
        
        if (!selectedQuestionnaire) return validationErrors;

        selectedQuestionnaire.questions.forEach(question => {
            const response = responses.find(r => r.questionId === question.id);
            
            if (question.isRequired && response) {
                if (question.type === QuestionType.Descriptive) {
                    if (!response.textAnswer?.trim()) {
                        validationErrors.push(`"${question.text}" is required`);
                    }
                } else if (question.type === QuestionType.SingleChoice) {
                    if (!response.selectedOptionId) {
                        validationErrors.push(`"${question.text}" is required`);
                    }
                } else if (question.type === QuestionType.MultipleChoice) {
                    if (!response.selectedOptionIds || response.selectedOptionIds.length === 0) {
                        validationErrors.push(`"${question.text}" is required`);
                    }
                }
            }
        });

        return validationErrors;
    };

    const submitResponse = async () => {
        const validationErrors = validateResponses();
        
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!selectedQuestionnaire) return;

        setErrors([]);
        setSubmitStatus('submitting');

        try {
            const submitData: SubmitResponse = {
                questionnaireId: selectedQuestionnaire.id,
                responses: responses.map(r => ({
                    questionId: r.questionId,
                    textAnswer: r.textAnswer || undefined,
                    selectedOptionId: r.selectedOptionId,
                    selectedOptionIds: r.selectedOptionIds && r.selectedOptionIds.length > 0 ? r.selectedOptionIds : []
                }))
            };

            console.log('Submitting response:', submitData);
            const response = await api.post('/api/questionnaire/submit', submitData);
            console.log('Response submitted:', response.data);
            
            setSubmitStatus('success');
        } catch (error: unknown) {
            console.error('Failed to submit response:', error);
            // Better error handling without 'any' type
            let errorMessage = 'Failed to submit response';
            if (error && typeof error === 'object' && 'response' in error) {
                const responseError = error as { response?: { data?: { message?: string } } };
                errorMessage = responseError.response?.data?.message || errorMessage;
            }
            setErrors([errorMessage]);
            setSubmitStatus('error');
        }
    };

    const handleBack = () => {
        setSelectedQuestionnaire(null);
        setResponses([]);
        setErrors([]);
        setSubmitStatus('idle');
        
        // If we came from a direct link, go back to the questionnaire list
        if (id) {
            window.history.pushState({}, '', '/');
        }
    };

    // Show selected questionnaire form
    if (selectedQuestionnaire) {
        return (
            <QuestionnaireForm
                questionnaire={selectedQuestionnaire}
                responses={responses}
                errors={errors}
                submitStatus={submitStatus}
                onBack={handleBack}
                onUpdateResponse={updateResponse}
                onSubmit={submitResponse}
            />
        );
    }

    // Show questionnaire grid
    return (
        <QuestionnaireGrid
            questionnaires={questionnaires}
            loading={loading}
            onSelectQuestionnaire={selectQuestionnaire}
        />
    );
};

export default UserPanel;
