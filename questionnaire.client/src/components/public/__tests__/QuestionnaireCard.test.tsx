import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { buildLegacyTheme } from '../../../theme'
import QuestionnaireCard from '../QuestionnaireCard'
import { mockQuestionnaire } from '../../../__tests__/utils/mock-data'
import fingerprintService from '../../../services/fingerprint'

// Mock fingerprint service
vi.mock('../../../services/fingerprint', () => ({
  default: {
    hasSubmittedResponse: vi.fn(),
  },
}))

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('QuestionnaireCard', () => {
  const mockOnSelect = vi.fn()
  const theme = buildLegacyTheme()

  const renderComponent = (questionnaire = mockQuestionnaire) => {
    return render(
      <ThemeProvider theme={theme}>
        <QuestionnaireCard questionnaire={questionnaire} onSelect={mockOnSelect} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(false)
  })

  describe('Rendering', () => {
    it('should render questionnaire title and description', async () => {
      renderComponent()

      expect(screen.getByText(mockQuestionnaire.title)).toBeInTheDocument()
      expect(screen.getByText(mockQuestionnaire.description!)).toBeInTheDocument()
    })

    it('should render questionnaire without description', async () => {
      const questionnaireWithoutDesc = {
        ...mockQuestionnaire,
        description: undefined
      }
      
      renderComponent(questionnaireWithoutDesc)

      expect(screen.getByText(mockQuestionnaire.title)).toBeInTheDocument()
      expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    })

    it('should show active status for active questionnaire', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })
    })

    it('should not show any status chip for inactive questionnaire', async () => {
      const inactiveQuestionnaire = {
        ...mockQuestionnaire,
        isActive: false
      }
      
      renderComponent(inactiveQuestionnaire)

      await waitFor(() => {
        expect(screen.queryByText('Active')).not.toBeInTheDocument()
        expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
      })
    })

    it('should display question count', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText(`${mockQuestionnaire.questions.length} questions`)).toBeInTheDocument()
      })
    })
  })

  describe('Submission Status', () => {
    it('should check submission status on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(fingerprintService.hasSubmittedResponse).toHaveBeenCalledWith(mockQuestionnaire.id)
      })
    })

    it('should show "Start Questionnaire" button when not submitted', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(false)
      
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Start Questionnaire')).toBeInTheDocument()
      })
    })

    it('should show "View Details" status when already submitted', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(true)
      
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('View Details')).toBeInTheDocument()
        expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
      })
    })

    it('should apply different styling when submitted', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(true)
      
      const { container } = renderComponent()

      await waitFor(() => {
        const card = container.querySelector('.MuiCard-root')
        expect(card).toHaveStyle({ opacity: '0.7' })
      })
    })

    it('should handle submission status check errors', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockRejectedValue(new Error('Network error'))
      
      renderComponent()

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to check submission status:', expect.any(Error))
        expect(screen.getByText('Start Questionnaire')).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('should call onSelect when Start Questionnaire button is clicked', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(false)
      
      renderComponent()

      await waitFor(() => {
        const startButton = screen.getByText('Start Questionnaire')
        fireEvent.click(startButton)
        expect(mockOnSelect).toHaveBeenCalledWith(mockQuestionnaire.id)
      })
    })

    it('should call onSelect when View Details button is clicked', async () => {
      vi.mocked(fingerprintService.hasSubmittedResponse).mockResolvedValue(true)
      
      renderComponent()

      await waitFor(() => {
        const detailsButton = screen.getByText('View Details')
        fireEvent.click(detailsButton)
        expect(mockOnSelect).toHaveBeenCalledWith(mockQuestionnaire.id)
      })
    })

    it('should disable button when checking submission status', async () => {
      // Mock a delayed response to test loading state
      let resolveSubmissionCheck: (value: boolean) => void
      const submissionPromise = new Promise<boolean>((resolve) => {
        resolveSubmissionCheck = resolve
      })
      vi.mocked(fingerprintService.hasSubmittedResponse).mockReturnValue(submissionPromise)
      
      renderComponent()

      // Button should be disabled while checking
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()

      // Resolve the promise
      resolveSubmissionCheck!(false)

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Date Formatting', () => {
    it('should display formatted creation date', async () => {
      renderComponent()

      await waitFor(() => {
        // Check that some date text is present (exact format may vary)
        expect(screen.getByText(/Created:/)).toBeInTheDocument()
      })
    })
  })
})