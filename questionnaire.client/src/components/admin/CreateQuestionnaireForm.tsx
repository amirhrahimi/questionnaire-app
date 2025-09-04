import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    Paper,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { CreateQuestionnaire, CreateQuestion, Questionnaire, Question, QuestionOption } from '../../types';
import { QuestionType } from '../../types';

interface CreateQuestionnaireFormProps {
    questionnaire?: Questionnaire;
    onSave: (questionnaire: CreateQuestionnaire) => void;
    onCancel: () => void;
}

const CreateQuestionnaireForm = ({ questionnaire, onSave, onCancel }: CreateQuestionnaireFormProps) => {
    // Helper function to convert Questionnaire questions to CreateQuestion format
    const convertToCreateQuestions = (questions: Question[]): CreateQuestion[] => {
        return questions?.map(q => ({
            text: q.text,
            type: q.type,
            isRequired: q.isRequired,
            order: q.order,
            options: q.options?.map((opt: QuestionOption) => ({
                text: opt.text,
                order: opt.order
            })) || []
        })) || [];
    };

    const [title, setTitle] = useState(questionnaire?.title || '');
    const [description, setDescription] = useState(questionnaire?.description || '');
    const [questions, setQuestions] = useState<CreateQuestion[]>(
        questionnaire ? convertToCreateQuestions(questionnaire.questions) : []
    );

    const addQuestion = () => {
        const newQuestion: CreateQuestion = {
            text: '',
            type: QuestionType.SingleChoice,
            isRequired: false,
            order: questions.length + 1,
            options: []
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, updates: Partial<CreateQuestion>) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 })));
    };

    const addOption = (questionIndex: number) => {
        const question = questions[questionIndex];
        const newOption = {
            text: '',
            order: question.options.length + 1
        };
        updateQuestion(questionIndex, {
            options: [...question.options, newOption]
        });
    };

    const updateOption = (questionIndex: number, optionIndex: number, text: string) => {
        const question = questions[questionIndex];
        const updatedOptions = question.options.map((opt, i) => 
            i === optionIndex ? { ...opt, text } : opt
        );
        updateQuestion(questionIndex, { options: updatedOptions });
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const question = questions[questionIndex];
        const updatedOptions = question.options
            .filter((_, i) => i !== optionIndex)
            .map((opt, i) => ({ ...opt, order: i + 1 }));
        updateQuestion(questionIndex, { options: updatedOptions });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('Please enter a title for the questionnaire');
            return;
        }

        if (questions.length === 0) {
            alert('Please add at least one question');
            return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            if (!question.text.trim()) {
                alert(`Question ${i + 1} needs text`);
                return;
            }

            if (question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) {
                if (question.options.length === 0) {
                    alert(`Question ${i + 1} needs at least one option`);
                    return;
                }

                for (let j = 0; j < question.options.length; j++) {
                    if (!question.options[j].text.trim()) {
                        alert(`Question ${i + 1}, Option ${j + 1} needs text`);
                        return;
                    }
                }
            }
        }

        const questionnaire: CreateQuestionnaire = {
            title: title.trim(),
            description: description.trim() || undefined,
            questions
        };

        onSave(questionnaire);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h2">
                        {questionnaire ? 'Edit Questionnaire' : 'Create New Questionnaire'}
                    </Typography>
                    <Button variant="outlined" onClick={onCancel}>
                        Cancel
                    </Button>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter questionnaire title..."
                        required
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />
                    
                    <TextField
                        fullWidth
                        label="Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter questionnaire description..."
                        multiline
                        rows={3}
                        variant="outlined"
                        sx={{ mb: 4 }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5" component="h3">
                            Questions
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={addQuestion}
                            startIcon={<AddIcon />}
                        >
                            Add Question
                        </Button>
                    </Box>

                    {questions.length === 0 && (
                        <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                            No questions added yet. Click "Add Question" to get started.
                        </Typography>
                    )}

                    {questions.map((question, qIndex) => (
                        <Card key={qIndex} sx={{ mb: 3, p: 2 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        Question {qIndex + 1}
                                    </Typography>
                                    <Button 
                                        color="error" 
                                        onClick={() => removeQuestion(qIndex)}
                                        size="small"
                                        variant="outlined"
                                    >
                                        Remove
                                    </Button>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Question Text"
                                    value={question.text}
                                    onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                                    placeholder="Enter your question..."
                                    required
                                    variant="outlined"
                                    sx={{ mb: 2 }}
                                />

                                <Box display="flex" gap={2} mb={2}>
                                    <FormControl sx={{ minWidth: 200 }}>
                                        <InputLabel>Question Type</InputLabel>
                                        <Select
                                            value={question.type}
                                            label="Question Type"
                                            onChange={(e) => updateQuestion(qIndex, { type: e.target.value as QuestionType })}
                                        >
                                            <MenuItem value={QuestionType.SingleChoice}>Single Choice</MenuItem>
                                            <MenuItem value={QuestionType.MultipleChoice}>Multiple Choice</MenuItem>
                                            <MenuItem value={QuestionType.Descriptive}>Descriptive</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={question.isRequired}
                                                onChange={(e) => updateQuestion(qIndex, { isRequired: e.target.checked })}
                                            />
                                        }
                                        label="Required"
                                    />
                                </Box>

                                {(question.type === QuestionType.SingleChoice || question.type === QuestionType.MultipleChoice) && (
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="subtitle1">Options</Typography>
                                            <Button 
                                                size="small" 
                                                onClick={() => addOption(qIndex)}
                                                variant="outlined"
                                            >
                                                Add Option
                                            </Button>
                                        </Box>
                                        
                                        {question.options.map((option, oIndex) => (
                                            <Box key={oIndex} display="flex" gap={1} alignItems="center" mb={1}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label={`Option ${oIndex + 1}`}
                                                    value={option.text}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    placeholder="Enter option text..."
                                                />
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => removeOption(qIndex, oIndex)}
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ))}

                                        {question.options.length === 0 && (
                                            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                                No options added yet. Click "Add Option" to add choices.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
                        <Button variant="outlined" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" size="large">
                            {questionnaire ? 'Update Questionnaire' : 'Create Questionnaire'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default CreateQuestionnaireForm;
