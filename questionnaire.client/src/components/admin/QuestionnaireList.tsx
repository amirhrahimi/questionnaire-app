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
    CircularProgress,
    Card,
    CardContent,
    Stack,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Link as LinkIcon,
    ToggleOff as DeactivateIcon,
    ToggleOn as ActivateIcon,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon
} from '@mui/icons-material';
import type { Questionnaire } from '../../types';

interface QuestionnaireListProps {
    questionnaires: Questionnaire[];
    loading: boolean;
    onCreateNew: () => void;
    onViewResults: (id: number) => void;
    onCopyLink: (id: number) => void;
    onShowQrCode: (id: number) => void;
    onToggleStatus: (id: number) => void;
    onDelete: (id: number) => void;
}

const QuestionnaireList = ({
    questionnaires,
    loading,
    onCreateNew,
    onViewResults,
    onCopyLink,
    onShowQrCode,
    onToggleStatus,
    onDelete
}: QuestionnaireListProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const renderMobileCard = (q: Questionnaire) => (
        <Card key={q.id} sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                            {q.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {q.description || 'No description'}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            <Chip 
                                label={`${q.questions?.length || 0} Questions`} 
                                size="small" 
                                variant="outlined"
                            />
                            <Chip 
                                label={`${q.responseCount || 0} Responses`} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                            />
                            <Chip 
                                label={q.isActive ? 'Active' : 'Inactive'} 
                                color={q.isActive ? 'success' : 'default'}
                                size="small"
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Created: {new Date(q.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    <Tooltip title="View Results">
                        <span>
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => onViewResults(q.id)}
                                disabled={(q.responseCount || 0) === 0}
                                sx={{
                                    border: '1px solid',
                                    borderColor: (q.responseCount || 0) === 0 ? 'grey.300' : 'primary.main',
                                    borderRadius: 1,
                                    '&:hover': {
                                        backgroundColor: 'primary.50',
                                        borderColor: 'primary.dark'
                                    },
                                    '&:disabled': {
                                        borderColor: 'grey.300',
                                        color: 'grey.400'
                                    }
                                }}
                            >
                                <VisibilityIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Copy Link">
                        <IconButton
                            color="success"
                            size="small"
                            onClick={() => onCopyLink(q.id)}
                            sx={{
                                border: '1px solid',
                                borderColor: 'success.main',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: 'success.50',
                                    borderColor: 'success.dark'
                                }
                            }}
                        >
                            <LinkIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Show QR Code">
                        <IconButton
                            color="info"
                            size="small"
                            onClick={() => onShowQrCode(q.id)}
                            sx={{
                                border: '1px solid',
                                borderColor: 'info.main',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: 'info.50',
                                    borderColor: 'info.dark'
                                }
                            }}
                        >
                            <QrCodeIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={q.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                            color={q.isActive ? 'warning' : 'success'}
                            size="small"
                            onClick={() => onToggleStatus(q.id)}
                            sx={{
                                border: '1px solid',
                                borderColor: q.isActive ? 'warning.main' : 'success.main',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: q.isActive ? 'warning.50' : 'success.50',
                                    borderColor: q.isActive ? 'warning.dark' : 'success.dark'
                                }
                            }}
                        >
                            {q.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            color="error"
                            size="small"
                            onClick={() => onDelete(q.id)}
                            sx={{
                                border: '1px solid',
                                borderColor: 'error.main',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: 'error.50',
                                    borderColor: 'error.dark'
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </CardContent>
        </Card>
    );

    const renderDesktopTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Questions</TableCell>
                        <TableCell>Responses</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell sx={{ minWidth: 500 }}>Actions</TableCell>
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
                                            <Button 
                                                onClick={() => onViewResults(q.id)}
                                                disabled={(q.responseCount || 0) === 0}
                                                startIcon={<VisibilityIcon />}
                                                color="primary"
                                            >
                                                Results
                                            </Button>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Copy Link">
                                        <Button 
                                            onClick={() => onCopyLink(q.id)}
                                            color="success"
                                            startIcon={<LinkIcon />}
                                        >
                                            Copy Link
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Show QR Code">
                                        <Button 
                                            onClick={() => onShowQrCode(q.id)}
                                            color="info"
                                            startIcon={<QrCodeIcon />}
                                        >
                                            QR Code
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={q.isActive ? 'Deactivate' : 'Activate'}>
                                        <Button 
                                            onClick={() => onToggleStatus(q.id)}
                                            color={q.isActive ? 'warning' : 'success'}
                                            startIcon={q.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                                        >
                                            {q.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <Button 
                                            onClick={() => onDelete(q.id)}
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                        >
                                            Delete
                                        </Button>
                                    </Tooltip>
                                </ButtonGroup>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ width: '100%', p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Responsive Header */}
            <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
                mb={3}
            >
                <Typography variant="h4" component="h1">
                    Admin Panel
                </Typography>
                <Button
                    variant="contained"
                    onClick={onCreateNew}
                    startIcon={<AddIcon />}
                    sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: 'fit-content' }
                    }}
                >
                    Create New Questionnaire
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Mobile view - Card layout */}
                    {isMobile ? (
                        <Box>
                            {questionnaires.length === 0 ? (
                                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                                    No questionnaires found. Create your first questionnaire to get started.
                                </Typography>
                            ) : (
                                questionnaires.map(renderMobileCard)
                            )}
                        </Box>
                    ) : (
                        /* Desktop view - Table layout */
                        questionnaires.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    No questionnaires found. Create your first questionnaire to get started.
                                </Typography>
                            </Paper>
                        ) : (
                            renderDesktopTable()
                        )
                    )}
                </>
            )}
        </Box>
    );
};

export default QuestionnaireList;
