import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    TextField,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Checkbox,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { Questionnaire, QuestionResponse, SubmitResponse } from '../types';
import { QuestionType } from '../types';

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
            const response = await fetch('/api/questionnaire');
            if (response.ok) {
                const data = await response.json();
                setQuestionnaires(data);
            }
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

    const selectQuestionnaire = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/questionnaire/${id}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedQuestionnaire(data);
                initializeResponses(data);
            }
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
                    if (response.selectedOptionIds.length === 0) {
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

        setErrors([]);
        setSubmitStatus('submitting');

        const submitData: SubmitResponse = {
            questionnaireId: selectedQuestionnaire!.id,
            responses: responses
        };

        try {
            const response = await fetch('/api/questionnaire/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    setSelectedQuestionnaire(null);
                    setSubmitStatus('idle');
                    fetchQuestionnaires();
                }, 2000);
            } else {
                const errorData = await response.json();
                setErrors([errorData.message || 'Failed to submit response']);
                setSubmitStatus('error');
            }
        } catch {
            setErrors(['Network error. Please try again.']);
            setSubmitStatus('error');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (selectedQuestionnaire) {
        return (
            <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1000, mx: 'auto' }}>
                    {/* Header */}
                    <Box mb={4}>
                        <Button 
                            onClick={() => setSelectedQuestionnaire(null)}
                            startIcon={<ArrowBackIcon />}
                            sx={{ mb: 2 }}
                        >
                            Back to Questionnaires
                        </Button>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {selectedQuestionnaire.title}
                        </Typography>
                        {selectedQuestionnaire.description && (
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {selectedQuestionnaire.description}
                            </Typography>
                        )}
                    </Box>

                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <Box mb={3}>
                            {errors.map((error, index) => (
                                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                                    {error}
                                </Alert>
                            ))}
                        </Box>
                    )}

                    {/* Questionnaire Form */}
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); submitResponse(); }}>
                        {selectedQuestionnaire.questions.map((question, index) => {
                            const response = responses.find(r => r.questionId === question.id);
                            
                            return (
                                <Box key={question.id} mb={4}>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        Question {index + 1}
                                        {question.isRequired && (
                                            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                                *
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {question.text}
                                    </Typography>

                                    {question.type === QuestionType.Descriptive && (
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={response?.textAnswer || ''}
                                            onChange={(e) => updateResponse(question.id, { textAnswer: e.target.value })}
                                            placeholder="Enter your answer..."
                                            variant="outlined"
                                        />
                                    )}

                                    {question.type === QuestionType.SingleChoice && (
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                value={response?.selectedOptionId || ''}
                                                onChange={(e) => updateResponse(question.id, { selectedOptionId: parseInt(e.target.value) })}
                                            >
                                                {question.options.map(option => (
                                                    <FormControlLabel
                                                        key={option.id}
                                                        value={option.id}
                                                        control={<Radio />}
                                                        label={option.text}
                                                    />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    )}

                                    {question.type === QuestionType.MultipleChoice && (
                                        <FormControl component="fieldset">
                                            <Box>
                                                {question.options.map(option => (
                                                    <FormControlLabel
                                                        key={option.id}
                                                        control={
                                                            <Checkbox
                                                                checked={response?.selectedOptionIds?.includes(option.id) || false}
                                                                onChange={(e) => {
                                                                    const currentIds = response?.selectedOptionIds || [];
                                                                    const newIds = e.target.checked
                                                                        ? [...currentIds, option.id]
                                                                        : currentIds.filter(id => id !== option.id);
                                                                    updateResponse(question.id, { selectedOptionIds: newIds });
                                                                }}
                                                            />
                                                        }
                                                        label={option.text}
                                                    />
                                                ))}
                                            </Box>
                                        </FormControl>
                                    )}

                                    {index < selectedQuestionnaire.questions.length - 1 && (
                                        <Divider sx={{ mt: 3 }} />
                                    )}
                                </Box>
                            );
                        })}

                        <Box mt={4} display="flex" justifyContent="flex-end">
                            <Button 
                                type="submit" 
                                variant="contained"
                                size="large"
                                disabled={submitStatus === 'submitting'}
                                sx={{ px: 4 }}
                            >
                                {submitStatus === 'submitting' ? (
                                    <Box display="flex" alignItems="center">
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Submitting...
                                    </Box>
                                ) : (
                                    'Submit Response'
                                )}
                            </Button>
                        </Box>
                    </Box>

                    {submitStatus === 'success' && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Thank you! Your response has been submitted successfully.
                        </Alert>
                    )}
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Available Questionnaires
            </Typography>
            
            {questionnaires.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
                    <Typography variant="body1" color="text.secondary">
                        No active questionnaires available at the moment.
                    </Typography>
                </Paper>
            ) : (
                <Box 
                    sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { 
                            xs: '1fr', 
                            sm: 'repeat(2, 1fr)', 
                            md: 'repeat(3, 1fr)' 
                        }, 
                        gap: 3 
                    }}
                >
                    {questionnaires.map(questionnaire => (
                        <Box key={questionnaire.id}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => selectQuestionnaire(questionnaire.id)}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {questionnaire.title}
                                    </Typography>
                                    {questionnaire.description && (
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {questionnaire.description}
                                        </Typography>
                                    )}
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            {questionnaire.questions.length} question{questionnaire.questions.length !== 1 ? 's' : ''}
                                        </Typography>
                                        <Chip 
                                            label={questionnaire.isActive ? 'Active' : 'Inactive'}
                                            color={questionnaire.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        fullWidth
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectQuestionnaire(questionnaire.id);
                                        }}
                                    >
                                        Start Questionnaire
                                    </Button>
                                </CardActions>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UserPanel;
