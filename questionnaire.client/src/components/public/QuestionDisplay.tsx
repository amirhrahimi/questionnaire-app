import {
    Box,
    Typography,
    TextField,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Checkbox
} from '@mui/material';
import type { Question, QuestionResponse } from '../../types';
import { QuestionType } from '../../types';

interface QuestionDisplayProps {
    question: Question;
    response: QuestionResponse | undefined;
    questionIndex: number;
    onUpdateResponse: (questionId: number, update: Partial<QuestionResponse>) => void;
}

const QuestionDisplay = ({ question, response, questionIndex, onUpdateResponse }: QuestionDisplayProps) => {
    const handleTextChange = (value: string) => {
        onUpdateResponse(question.id, { textAnswer: value });
    };

    const handleSingleChoiceChange = (value: string) => {
        const selectedOptionId = parseInt(value);
        onUpdateResponse(question.id, { selectedOptionId });
    };

    const handleMultipleChoiceChange = (optionId: number, checked: boolean) => {
        if (!response) return;
        
        const currentSelections = response.selectedOptionIds || [];
        const newSelections = checked 
            ? [...currentSelections, optionId]
            : currentSelections.filter(id => id !== optionId);
            
        onUpdateResponse(question.id, { selectedOptionIds: newSelections });
    };

    return (
        <Box mb={4}>
            <Typography variant="h6" component="h3" gutterBottom>
                Question {questionIndex + 1}
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
                    variant="outlined"
                    placeholder="Enter your answer..."
                    value={response?.textAnswer || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                />
            )}

            {question.type === QuestionType.SingleChoice && (
                <FormControl component="fieldset">
                    <RadioGroup
                        value={response?.selectedOptionId?.toString() || ''}
                        onChange={(e) => handleSingleChoiceChange(e.target.value)}
                    >
                        {question.options.map((option) => (
                            <FormControlLabel
                                key={option.id}
                                value={option.id.toString()}
                                control={<Radio />}
                                label={option.text}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            )}

            {question.type === QuestionType.MultipleChoice && (
                <Box>
                    {question.options.map((option) => (
                        <FormControlLabel
                            key={option.id}
                            control={
                                <Checkbox
                                    checked={response?.selectedOptionIds?.includes(option.id) || false}
                                    onChange={(e) => handleMultipleChoiceChange(option.id, e.target.checked)}
                                />
                            }
                            label={option.text}
                            sx={{ display: 'block', mb: 1 }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default QuestionDisplay;
