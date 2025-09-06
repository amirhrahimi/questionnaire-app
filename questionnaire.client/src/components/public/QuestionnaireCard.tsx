import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { Questionnaire } from '../../types';
import fingerprintService from '../../services/fingerprint';

interface QuestionnaireCardProps {
    questionnaire: Questionnaire;
    onSelect: (id: string) => void;
}

const QuestionnaireCard = ({ questionnaire, onSelect }: QuestionnaireCardProps) => {
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [checkingSubmission, setCheckingSubmission] = useState<boolean>(true);

    useEffect(() => {
        const checkSubmissionStatus = async () => {
            try {
                setCheckingSubmission(true);
                const submitted = await fingerprintService.hasSubmittedResponse(questionnaire.id);
                setHasSubmitted(submitted);
            } catch (error) {
                console.error('Failed to check submission status:', error);
                setHasSubmitted(false);
            } finally {
                setCheckingSubmission(false);
            }
        };

        checkSubmissionStatus();
    }, [questionnaire.id]);

    return (
        <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            opacity: hasSubmitted ? 0.7 : 1,
            border: hasSubmitted ? '2px solid' : '1px solid',
            borderColor: hasSubmitted ? 'success.main' : 'divider'
        }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        {questionnaire.title}
                    </Typography>
                    {hasSubmitted && (
                        <CheckCircle color="success" fontSize="small" />
                    )}
                </Box>
                
                {questionnaire.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {questionnaire.description}
                    </Typography>
                )}
                
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                        label={`${questionnaire.questions?.length || 0} questions`}
                        size="small"
                        variant="outlined"
                    />
                    {questionnaire.isActive && (
                        <Chip 
                            label="Active"
                            size="small"
                            color="success"
                        />
                    )}
                    {hasSubmitted && (
                        <Chip 
                            label="Completed"
                            size="small"
                            color="success"
                            variant="filled"
                        />
                    )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                    Created: {new Date(questionnaire.createdAt).toLocaleDateString()}
                </Typography>
            </CardContent>
            <CardActions>
                <Button 
                    size="small" 
                    variant={hasSubmitted ? "outlined" : "contained"}
                    onClick={() => onSelect(questionnaire.id)}
                    disabled={!questionnaire.isActive || checkingSubmission}
                    fullWidth
                >
                    {checkingSubmission 
                        ? 'Checking...' 
                        : hasSubmitted 
                            ? 'View Details' 
                            : questionnaire.isActive 
                                ? 'Start Questionnaire' 
                                : 'Not Available'
                    }
                </Button>
            </CardActions>
        </Card>
    );
};

export default QuestionnaireCard;
