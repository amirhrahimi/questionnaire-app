import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '../../../../__tests__/utils/test-utils'
import QrCodeModal from '../QrCodeModal'

// Simple mocks for external dependencies
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('mock-qr-data-url'),
}))

vi.mock('react-share', () => ({
  FacebookShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="facebook-share">{children}</div>,
  TwitterShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="twitter-share">{children}</div>,
  LinkedinShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="linkedin-share">{children}</div>,
  TelegramShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="telegram-share">{children}</div>,
  WhatsappShareButton: ({ children }: { children: React.ReactNode }) => <div data-testid="whatsapp-share">{children}</div>,
  FacebookIcon: () => <div data-testid="facebook-icon" />,
  TwitterIcon: () => <div data-testid="twitter-icon" />,
  LinkedinIcon: () => <div data-testid="linkedin-icon" />,
  TelegramIcon: () => <div data-testid="telegram-icon" />,
  WhatsappIcon: () => <div data-testid="whatsapp-icon" />,
}))

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  questionnaireId: 'test-questionnaire-id',
  questionnaireTitle: 'Test Questionnaire',
}

describe('QrCodeModal', () => {
  it('does not render when open is false', () => {
    render(<QrCodeModal {...defaultProps} open={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<QrCodeModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })
})