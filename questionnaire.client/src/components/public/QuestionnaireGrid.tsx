import {
    Box,
    Typography,
    Grid,
    CircularProgress
} from '@mui/material';
import type { Questionnaire } from '../../types';
import QuestionnaireCard from './QuestionnaireCard';

interface QuestionnaireGridProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    onSelectQuestionnaire: (id: number) => void;
}

const QuestionnaireGrid = ({ questionnaires, loading, onSelectQuestionnaire }: QuestionnaireGridProps) => {
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (questionnaires.length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No questionnaires available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Please check back later for new questionnaires.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Available Questionnaires
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Select a questionnaire to begin answering questions.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {questionnaires.map((questionnaire) => (
                    <Grid key={questionnaire.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <QuestionnaireCard
                            questionnaire={questionnaire}
                            onSelect={onSelectQuestionnaire}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default QuestionnaireGrid;
