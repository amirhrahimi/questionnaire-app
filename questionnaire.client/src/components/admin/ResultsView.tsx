import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Paper,
    Chip,
    LinearProgress
} from '@mui/material';
import type { QuestionnaireResult } from '../../types';
import { QuestionType } from '../../types';

interface ResultsViewProps {
    results: QuestionnaireResult;
    onBack: () => void;
}

const ResultsView = ({ results, onBack }: ResultsViewProps) => {
    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Paper sx={{ p: { xs: 2, sm: 4 } }}>
                {/* Header */}
                <Box mb={4}>
                    <Button 
                        onClick={onBack}
                        sx={{ mb: 2 }}
                    >
                        ← Back to Admin Panel
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Results: {results.title}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Total Responses: {results.totalResponses}
                    </Typography>
                </Box>

                {results.description && (
                    <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                        {results.description}
                    </Typography>
                )}

                {/* Questions Results */}
                <Box>
                    {results.questions.map(question => (
                        <Card key={question.id} sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {question.text}
                                </Typography>
                                <Box display="flex" gap={1} mb={2}>
                                    <Chip 
                                        label={
                                            question.type === QuestionType.SingleChoice ? 'Single Choice' :
                                            question.type === QuestionType.MultipleChoice ? 'Multiple Choice' : 'Descriptive'
                                        }
                                        size="small"
                                    />
                                    {question.isRequired && (
                                        <Chip label="Required" color="primary" size="small" />
                                    )}
                                    <Chip 
                                        label={`${question.responseCount} responses`} 
                                        variant="outlined" 
                                        size="small" 
                                    />
                                </Box>

                                {question.type === QuestionType.Descriptive ? (
                                    <Box>
                                        {question.textAnswers.length > 0 ? (
                                            <Box>
                                                {question.textAnswers.map((answer, index) => (
                                                    <Paper 
                                                        key={index} 
                                                        variant="outlined" 
                                                        sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}
                                                    >
                                                        <Typography variant="body2">
                                                            {answer}
                                                        </Typography>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography color="text.secondary">
                                                No responses yet.
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Box>
                                        {question.options.map(option => (
                                            <Box key={option.id} sx={{ mb: 2 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Typography variant="body1">
                                                        {option.text}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {option.count} ({option.percentage.toFixed(1)}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={option.percentage} 
                                                    sx={{ height: 8, borderRadius: 1 }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
};

export default ResultsView;
