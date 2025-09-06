import { useState, useEffect, useCallback } from 'react';
import { Loading } from '../common/Loading';
import { useParams, useNavigate } from 'react-router-dom';
import type { Questionnaire, QuestionResponse, SubmitResponse } from '../../types';
import { QuestionType } from '../../types';
import api from '../../services/api';
import QuestionnaireGrid from './QuestionnaireGrid';
import QuestionnaireForm from './QuestionnaireForm';
import AlreadySubmitted from './AlreadySubmitted';
import FingerprintDebug from '../debug/FingerprintDebug';
import fingerprintService from '../../services/fingerprint';

const UserPanel = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
    const [responses, setResponses] = useState<QuestionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<string[]>([]);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [checkingSubmission, setCheckingSubmission] = useState(false);

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

    const selectQuestionnaire = useCallback(async (questionnaireId: string) => {
        // Always navigate to the questionnaire URL to ensure URL consistency
        navigate(`/questionnaire/${questionnaireId}`);
    }, [navigate]);

    // Load questionnaire data when URL changes
    useEffect(() => {
        if (id) {
            // If we have an ID in the URL, load that specific questionnaire
            const loadQuestionnaire = async () => {
                setLoading(true);
                setCheckingSubmission(true);
                setAlreadySubmitted(false);
                
                try {
                    // First check if the user has already submitted a response
                    const hasSubmitted = await fingerprintService.hasSubmittedResponse(id);
                    
                    if (hasSubmitted) {
                        // Load questionnaire data for display purposes
                        const response = await api.get(`/api/questionnaire/${id}`);
                        setSelectedQuestionnaire(response.data);
                        setAlreadySubmitted(true);
                        setCheckingSubmission(false);
                        setLoading(false);
                        return;
                    }
                    
                    // If not submitted, load questionnaire normally
                    const response = await api.get(`/api/questionnaire/${id}`);
                    setSelectedQuestionnaire(response.data);
                    initializeResponses(response.data);
                    setSubmitStatus('idle');
                    setErrors([]);
                    setAlreadySubmitted(false);
                } catch (error) {
                    console.error('Failed to fetch questionnaire:', error);
                    // If questionnaire not found, redirect to main page
                    navigate('/');
                } finally {
                    setLoading(false);
                    setCheckingSubmission(false);
                }
            };
            loadQuestionnaire();
        } else {
            // If no ID, clear selected questionnaire and show the list
            setSelectedQuestionnaire(null);
            setResponses([]);
            setErrors([]);
            setSubmitStatus('idle');
            setAlreadySubmitted(false);
            setCheckingSubmission(false);
            fetchQuestionnaires();
        }
    }, [id, navigate, initializeResponses]);

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

        // Check one more time before submitting to prevent race conditions
        const hasSubmitted = await fingerprintService.hasSubmittedResponse(selectedQuestionnaire.id);
        if (hasSubmitted) {
            setAlreadySubmitted(true);
            return;
        }

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
            
            // Mark as submitted in browser fingerprint storage
            await fingerprintService.markAsSubmitted(selectedQuestionnaire.id);
            
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
        // Simply navigate back to the main questionnaire list
        navigate('/');
    };

    // Show selected questionnaire form if we have an ID in the URL
    if (id) {
        if (loading || checkingSubmission) {
            return <>
                {/* Centralized loading UI */}
                <Loading label={checkingSubmission ? "Checking submission status…" : "Loading questionnaire…"} />
            </>;
        }
        
        if (selectedQuestionnaire) {
            // Show already submitted message if user has already responded
            if (alreadySubmitted) {
                return (
                    <AlreadySubmitted
                        questionnaireName={selectedQuestionnaire.title}
                        onGoBack={handleBack}
                    />
                );
            }
            
            // Show the questionnaire form
            return (
                <>
                    <FingerprintDebug questionnaireId={selectedQuestionnaire.id} />
                    <QuestionnaireForm
                        questionnaire={selectedQuestionnaire}
                        responses={responses}
                        errors={errors}
                        submitStatus={submitStatus}
                        onBack={handleBack}
                        onUpdateResponse={updateResponse}
                        onSubmit={submitResponse}
                    />
                </>
            );
        }
        
        // If we have an ID but no questionnaire (e.g., not found), show loading or redirect
        return <Loading label="Loading questionnaire…" />;
    }

    // Show questionnaire grid when no ID in URL
    return (
        <QuestionnaireGrid
            questionnaires={questionnaires}
            loading={loading}
            onSelectQuestionnaire={selectQuestionnaire}
        />
    );
};

export default UserPanel;
