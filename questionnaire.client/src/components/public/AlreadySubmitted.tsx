import { Box, Typography, Paper, Button } from '@mui/material';
import { CheckCircle, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface AlreadySubmittedProps {
    questionnaireName: string;
    onGoBack?: () => void;
}

const AlreadySubmitted = ({ questionnaireName, onGoBack }: AlreadySubmittedProps) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            navigate('/');
        }
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                p: 2 
            }}
        >
            <Paper 
                elevation={3}
                sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    maxWidth: 500,
                    width: '100%'
                }}
            >
                <CheckCircle 
                    color="success" 
                    sx={{ fontSize: 64, mb: 2 }} 
                />
                
                <Typography variant="h4" gutterBottom color="success.main">
                    Already Submitted
                </Typography>
                
                <Typography variant="body1" paragraph color="text.secondary">
                    You have already submitted a response to the questionnaire:
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
                    "{questionnaireName}"
                </Typography>
                
                <Typography variant="body2" paragraph color="text.secondary">
                    Each participant can only submit one response per questionnaire. 
                    Thank you for your participation!
                </Typography>
                
                <Button
                    variant="contained"
                    startIcon={<Home />}
                    onClick={handleGoHome}
                    sx={{ mt: 3 }}
                >
                    Back to Questionnaires
                </Button>
            </Paper>
        </Box>
    );
};

export default AlreadySubmitted;
