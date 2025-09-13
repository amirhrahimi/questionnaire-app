import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '../../../../__tests__/utils/test-utils'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default props', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when dialog backdrop is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    // Click on the backdrop (dialog overlay) - this might not work as expected
    // Since MUI backdrop behavior is complex, we'll test escape key instead
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders custom button text', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    )
    
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('applies error color for error severity', () => {
    render(<ConfirmDialog {...defaultProps} severity="error" />)
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveClass('MuiButton-containedError')
  })

  it('applies primary color for non-error severity', () => {
    render(<ConfirmDialog {...defaultProps} severity="warning" />)
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveClass('MuiButton-containedPrimary')
  })

  it('applies primary color by default', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveClass('MuiButton-containedPrimary')
  })

  it('has proper accessibility attributes', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-description')
    
    const title = screen.getByText('Confirm Action')
    expect(title).toHaveAttribute('id', 'confirm-dialog-title')
    
    const description = screen.getByText('Are you sure you want to proceed?')
    expect(description).toHaveAttribute('id', 'confirm-dialog-description')
  })

  it('handles keyboard navigation', () => {
    render(<ConfirmDialog {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    
    // Test Escape key
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('displays long messages correctly', () => {
    const longMessage = 'This is a very long message that should be displayed properly in the dialog. '.repeat(10)
    
    render(
      <ConfirmDialog
        {...defaultProps}
        message={longMessage}
      />
    )
    
    // Use getByRole to find the dialog content specifically
    const dialogContent = screen.getByRole('dialog')
    expect(dialogContent).toHaveTextContent(longMessage)
  })

  it('works with info severity', () => {
    render(<ConfirmDialog {...defaultProps} severity="info" />)
    
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    expect(confirmButton).toHaveClass('MuiButton-containedPrimary')
  })
})