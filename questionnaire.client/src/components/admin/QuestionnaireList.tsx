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
    ButtonGroup,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Link as LinkIcon,
    ToggleOff as DeactivateIcon,
    ToggleOn as ActivateIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { Questionnaire } from '../../types';

interface QuestionnaireListProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    onCreateNew: () => void;
    onViewResults: (id: number) => void;
    onCopyLink: (id: number) => void;
    onToggleStatus: (id: number) => void;
    onDelete: (id: number) => void;
}

const QuestionnaireList = ({
    questionnaires,
    loading,
    onCreateNew,
    onViewResults,
    onCopyLink,
    onToggleStatus,
    onDelete
}: QuestionnaireListProps) => {
    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Admin Panel
                </Typography>
                <Button
                    variant="contained"
                    onClick={onCreateNew}
                    startIcon={<AddIcon />}
                >
                    Create New Questionnaire
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Questions</TableCell>
                                <TableCell>Responses</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questionnaires.map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="medium">
                                            {q.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}>
                                        <Typography variant="body2" noWrap>
                                            {q.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{q.questions?.length || 0}</TableCell>
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
                                                        onClick={() => onViewResults(q.id)}
                                                        disabled={(q.responseCount || 0) === 0}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Copy Link">
                                                <IconButton 
                                                    onClick={() => onCopyLink(q.id)}
                                                    color="success"
                                                    size="small"
                                                >
                                                    <LinkIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={q.isActive ? 'Deactivate' : 'Activate'}>
                                                <IconButton 
                                                    onClick={() => onToggleStatus(q.id)}
                                                    color={q.isActive ? 'warning' : 'success'}
                                                    size="small"
                                                >
                                                    {q.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton 
                                                    onClick={() => onDelete(q.id)}
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

export default QuestionnaireList;
