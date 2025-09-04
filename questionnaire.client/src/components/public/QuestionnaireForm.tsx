import {
    Box,
    Typography,
    Button,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { Questionnaire, QuestionResponse } from '../../types';
import QuestionDisplay from './QuestionDisplay';

interface QuestionnaireFormProps {
    questionnaire: Questionnaire;
    responses: QuestionResponse[];
    errors: string[];
    submitStatus: 'idle' | 'submitting' | 'success' | 'error';
    onBack: () => void;
    onUpdateResponse: (questionId: number, update: Partial<QuestionResponse>) => void;
    onSubmit: () => void;
}

const QuestionnaireForm = ({
    questionnaire,
    responses,
    errors,
    submitStatus,
    onBack,
    onUpdateResponse,
    onSubmit
}: QuestionnaireFormProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    if (submitStatus === 'success') {
        return (
            <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom color="success.main">
                        Thank You!
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Your response has been submitted successfully.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        onClick={onBack}
                        startIcon={<ArrowBackIcon />}
                    >
                        Back to Questionnaires
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1000, mx: 'auto' }}>
                {/* Header */}
                <Box mb={4}>
                    <Button 
                        onClick={onBack}
                        startIcon={<ArrowBackIcon />}
                        sx={{ mb: 2 }}
                        disabled={submitStatus === 'submitting'}
                    >
                        Back to Questionnaires
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {questionnaire.title}
                    </Typography>
                    {questionnaire.description && (
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {questionnaire.description}
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
                <Box component="form" onSubmit={handleSubmit}>
                    {questionnaire.questions.map((question, index) => {
                        const response = responses.find(r => r.questionId === question.id);
                        
                        return (
                            <QuestionDisplay
                                key={question.id}
                                question={question}
                                response={response}
                                questionIndex={index}
                                onUpdateResponse={onUpdateResponse}
                            />
                        );
                    })}

                    {/* Submit Button */}
                    <Box mt={4} textAlign="center">
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large"
                            disabled={submitStatus === 'submitting'}
                            startIcon={submitStatus === 'submitting' ? <CircularProgress size={20} color="inherit" /> : undefined}
                        >
                            {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Response'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default QuestionnaireForm;
