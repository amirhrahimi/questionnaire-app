import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import QRCode from 'qrcode';

interface QrCodeModalProps {
    open: boolean;
    onClose: () => void;
    questionnaireId: number;
    questionnaireTitle?: string;
}

const QrCodeModal = ({ open, onClose, questionnaireId, questionnaireTitle }: QrCodeModalProps) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const generateQrCodeEffect = async () => {
            if (!open || !questionnaireId) return;
            
            setLoading(true);
            try {
                const baseUrl = window.location.origin;
                const questionnaireUrl = `${baseUrl}/questionnaire/${questionnaireId}`;
                
                const qrCodeUrl = await QRCode.toDataURL(questionnaireUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                
                setQrCodeDataUrl(qrCodeUrl);
            } catch (error) {
                console.error('Failed to generate QR code:', error);
                setQrCodeDataUrl('');
            } finally {
                setLoading(false);
            }
        };

        generateQrCodeEffect();
    }, [open, questionnaireId]);

    const downloadQrCode = () => {
        if (!qrCodeDataUrl) return;

        const link = document.createElement('a');
        link.href = qrCodeDataUrl;
        link.download = `questionnaire-${questionnaireId}-qr-code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setSnackbarMessage('QR Code downloaded successfully!');
        setSnackbarOpen(true);
    };

    const copyQrCodeLink = async () => {
        const baseUrl = window.location.origin;
        const questionnaireUrl = `${baseUrl}/questionnaire/${questionnaireId}`;
        
        try {
            await navigator.clipboard.writeText(questionnaireUrl);
            setSnackbarMessage('Link copied to clipboard!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Failed to copy link:', error);
            setSnackbarMessage('Failed to copy link');
            setSnackbarOpen(true);
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    gap: 2,
                    pr: 1
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            flex: 1,
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                            pr: 1
                        }}
                    >
                        QR Code for {questionnaireTitle || `Questionnaire #${questionnaireId}`}
                    </Typography>
                    <IconButton 
                        onClick={onClose} 
                        size="small"
                        sx={{ 
                            flexShrink: 0,
                            mt: -0.5
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <Typography>Generating QR Code...</Typography>
                            </Box>
                        ) : qrCodeDataUrl ? (
                            <>
                                <Box
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        bgcolor: 'white'
                                    }}
                                >
                                    <img 
                                        src={qrCodeDataUrl} 
                                        alt="QR Code for questionnaire"
                                        style={{ display: 'block', maxWidth: '100%' }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    Scan this QR code to access the questionnaire directly
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="primary" 
                                    textAlign="center" 
                                    sx={{ 
                                        wordBreak: 'break-all',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        '&:hover': {
                                            textDecoration: 'none'
                                        }
                                    }}
                                    component="a"
                                    href={`${window.location.origin}/questionnaire/${questionnaireId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {`${window.location.origin}/questionnaire/${questionnaireId}`}
                                </Typography>
                            </>
                        ) : (
                            <Typography color="error">Failed to generate QR code</Typography>
                        )}
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ gap: 1, p: 2, justifyContent: 'center' }}>
                    {isMobile ? (
                        // Mobile: Icon buttons only
                        <>
                            <IconButton
                                color="primary"
                                onClick={copyQrCodeLink}
                                sx={{ 
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.50'
                                    }
                                }}
                            >
                                <CopyIcon />
                            </IconButton>
                            <IconButton
                                color="success"
                                onClick={downloadQrCode}
                                disabled={!qrCodeDataUrl}
                                sx={{ 
                                    border: '1px solid',
                                    borderColor: 'success.main',
                                    '&:hover': {
                                        backgroundColor: 'success.50'
                                    },
                                    '&:disabled': {
                                        borderColor: 'grey.300'
                                    }
                                }}
                            >
                                <DownloadIcon />
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={onClose}
                                sx={{ 
                                    border: '1px solid',
                                    borderColor: 'error.main',
                                    '&:hover': {
                                        backgroundColor: 'error.50'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) : (
                        // Desktop: Full buttons with text and icons
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<CopyIcon />}
                                onClick={copyQrCodeLink}
                            >
                                Copy Link
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={downloadQrCode}
                                disabled={!qrCodeDataUrl}
                            >
                                Download QR Code
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default QrCodeModal;
