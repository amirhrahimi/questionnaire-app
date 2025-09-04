import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Box
} from '@mui/material';
import type { Questionnaire } from '../../types';

interface QuestionnaireCardProps {
    questionnaire: Questionnaire;
    onSelect: (id: number) => void;
}

const QuestionnaireCard = ({ questionnaire, onSelect }: QuestionnaireCardProps) => {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    {questionnaire.title}
                </Typography>
                {questionnaire.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {questionnaire.description}
                    </Typography>
                )}
                <Box display="flex" gap={1} mb={2}>
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
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Created: {new Date(questionnaire.createdAt).toLocaleDateString()}
                </Typography>
            </CardContent>
            <CardActions>
                <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => onSelect(questionnaire.id)}
                    disabled={!questionnaire.isActive}
                    fullWidth
                >
                    {questionnaire.isActive ? 'Start Questionnaire' : 'Not Available'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default QuestionnaireCard;
