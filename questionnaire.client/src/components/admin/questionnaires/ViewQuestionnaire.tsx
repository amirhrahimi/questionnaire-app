import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  ToggleOff as DeactivateIcon,
  ToggleOn as ActivateIcon,
} from "@mui/icons-material";
import { QuestionType, type Questionnaire } from "../../../types";

interface ViewQuestionnaireProps {
  questionnaire: Questionnaire;
  onBack: () => void;
  onEdit: (questionnaire: Questionnaire) => void;
  onViewResults: (id: string) => void;
  onCopyLink: (id: string) => void;
  onShowQrCode: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ViewQuestionnaire = ({
  questionnaire,
  onBack,
  onEdit,
  onViewResults,
  onCopyLink,
  onShowQrCode,
  onToggleStatus,
}: ViewQuestionnaireProps) => {
  const getQuestionTypeLabel = (type: number) => {
    switch (type) {
      case QuestionType.SingleChoice:
        return "Single Choice";
      case QuestionType.MultipleChoice:
        return "Multiple Choice";
      case QuestionType.Descriptive:
        return "Descriptive";
      default:
        return "Unknown";
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={onBack} sx={{ p: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            View Questionnaire
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={() => onEdit(questionnaire)}
            startIcon={<EditIcon />}
            sx={{ minWidth: "fit-content" }}
          >
            Edit
          </Button>
          <Tooltip title="View Results">
            <span>
              <Button
                variant="outlined"
                onClick={() => onViewResults(questionnaire.id)}
                disabled={(questionnaire.responseCount || 0) === 0}
                startIcon={<VisibilityIcon />}
                sx={{ minWidth: "fit-content" }}
              >
                Results ({questionnaire.responseCount || 0})
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Questionnaire Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box flex={1}>
              <Typography variant="h5" component="h2" gutterBottom>
                {questionnaire.title}
              </Typography>
              {questionnaire.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {questionnaire.description}
                </Typography>
              )}
            </Box>
            <Chip
              label={questionnaire.isActive ? "Active" : "Inactive"}
              color={questionnaire.isActive ? "success" : "default"}
              sx={{ ml: 2 }}
            />
          </Box>

          <Divider />

          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong> {new Date(questionnaire.createdAt).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Questions:</strong> {questionnaire.questions?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Responses:</strong> {questionnaire.responseCount || 0}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={1} flexWrap="wrap" pt={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onCopyLink(questionnaire.id)}
              startIcon={<LinkIcon />}
            >
              Copy Link
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onShowQrCode(questionnaire.id)}
              startIcon={<QrCodeIcon />}
            >
              QR Code
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onToggleStatus(questionnaire.id)}
              color={questionnaire.isActive ? "warning" : "success"}
              startIcon={questionnaire.isActive ? <DeactivateIcon /> : <ActivateIcon />}
            >
              {questionnaire.isActive ? "Deactivate" : "Activate"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Questions */}
      <Typography variant="h6" component="h3" gutterBottom>
        Questions ({questionnaire.questions?.length || 0})
      </Typography>

      <Stack spacing={2}>
        {questionnaire.questions?.map((question, index) => (
          <Card key={question.id} variant="outlined">
            <CardContent>
              <Box display="flex" justify-content="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6" component="h4" sx={{ flex: 1 }}>
                  {index + 1}. {question.text}
                </Typography>
                <Box display="flex" gap={1} ml={2}>
                  <Chip
                    label={getQuestionTypeLabel(question.type)}
                    size="small"
                    variant="outlined"
                  />
                  {question.isRequired && (
                    <Chip
                      label="Required"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              {/* Options for choice questions */}
              {(question.type === QuestionType.SingleChoice ||
                question.type === QuestionType.MultipleChoice) &&
                question.options?.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Options:
                    </Typography>
                    <Stack spacing={1} ml={2}>
                      {question.options
                        .sort((a, b) => a.order - b.order)
                        .map((option) => (
                          <Typography key={option.id} variant="body2">
                            • {option.text}
                          </Typography>
                        ))}
                    </Stack>
                  </Box>
                )}

              {/* Descriptive question info */}
              {question.type === QuestionType.Descriptive && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Open-ended text response
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )) || (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No questions found in this questionnaire.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default ViewQuestionnaire;
