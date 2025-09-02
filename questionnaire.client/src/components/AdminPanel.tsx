import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    CircularProgress,
    ButtonGroup,
    Tooltip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Link as LinkIcon,
    ToggleOff as DeactivateIcon,
    ToggleOn as ActivateIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { Questionnaire, CreateQuestionnaire, CreateQuestion, QuestionnaireResult } from '../types';
import { QuestionType } from '../types';
import api from '../services/api';

const AdminPanel = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedResults, setSelectedResults] = useState<QuestionnaireResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestionnaires();
    }, []);

    const fetchQuestionnaires = async () => {
        try {
            const response = await api.get('/api/admin/questionnaires');
            setQuestionnaires(response.data);
        } catch {
            console.error('Failed to fetch questionnaires');
        }
    };

    const toggleQuestionnaireStatus = async (id: number) => {
        try {
            await api.put(`/api/admin/questionnaires/${id}/toggle`);
            fetchQuestionnaires();
        } catch {
            console.error('Failed to toggle questionnaire status');
        }
    };

    const deleteQuestionnaire = async (id: number) => {
        if (!confirm('Are you sure you want to delete this questionnaire? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/admin/questionnaires/${id}`);
            fetchQuestionnaires();
        } catch {
            console.error('Failed to delete questionnaire');
        }
    };

    const viewResults = async (id: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/questionnaires/${id}/results`);
            setSelectedResults(response.data);
        } catch {
            console.error('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const createQuestionnaire = async (questionnaire: CreateQuestionnaire) => {
        try {
            await api.post('/api/admin/questionnaires', questionnaire);
            alert('Questionnaire created successfully!');
            setShowCreateForm(false);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to create questionnaire:', error);
            alert('Failed to create questionnaire. Please try again.');
        }
    };

    const copyQuestionnaireLink = async (id: number) => {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/questionnaire/${id}`;
        
        try {
            await navigator.clipboard.writeText(link);
            alert('Link copied to clipboard!');
        } catch {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (selectedResults) {
        return <ResultsView results={selectedResults} onBack={() => setSelectedResults(null)} />;
    }

    if (showCreateForm) {
        return (
            <CreateQuestionnaireForm 
                onSave={(questionnaire) => {
                    createQuestionnaire(questionnaire);
                    setShowCreateForm(false);
                }}
                onCancel={() => setShowCreateForm(false)}
            />
        );
    }

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Admin Panel
                </Typography>
                <Button 
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateForm(true)}
                    size="large"
                >
                    Create New Questionnaire
                </Button>
            </Box>

            {questionnaires.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                    No questionnaires created yet.
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Questions</TableCell>
                                <TableCell>Responses</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questionnaires.map(q => (
                                <TableRow key={q.id}>
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            {q.title}
                                        </Typography>
                                        {q.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {q.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{q.questions.length}</TableCell>
                                    <TableCell>{q.responseCount || 0}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={q.isActive ? 'Active' : 'Inactive'}
                                            color={q.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <ButtonGroup size="small" variant="outlined">
                                            <Tooltip title="View Results">
                                                <span>
                                                    <IconButton 
                                                        onClick={() => viewResults(q.id)}
                                                        disabled={(q.responseCount || 0) === 0}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Copy Link">
                                                <IconButton 
                                                    onClick={() => copyQuestionnaireLink(q.id)}
                                                    color="success"
                                                    size="small"
                                                >
                                                    <LinkIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={q.isActive ? 'Deactivate' : 'Activate'}>
                                                <IconButton 
                                                    onClick={() => toggleQuestionnaireStatus(q.id)}
                                                    color={q.isActive ? 'warning' : 'success'}
                                                    size="small"
                                                >
                                                    {q.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton 
                                                    onClick={() => deleteQuestionnaire(q.id)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ButtonGroup>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

interface CreateQuestionnaireFormProps {
    onSave: (questionnaire: CreateQuestionnaire) => void;
    onCancel: () => void;
}

const CreateQuestionnaireForm = ({ onSave, onCancel }: CreateQuestionnaireFormProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<CreateQuestion[]>([]);

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
                        Create New Questionnaire
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
                            Create Questionnaire
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

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

export default AdminPanel;
