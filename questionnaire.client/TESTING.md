# Testing Guide

This document explains the testing setup and conventions for the questionnaire app frontend.

## Testing Stack

- **Vitest**: Fast unit test runner with native Vite integration
- **React Testing Library**: Testing utilities for React components
- **MSW (Mock Service Worker)**: API mocking for tests
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: Utilities for simulating user interactions

## Getting Started

### Installation

Install all testing dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── test/
│   ├── setup.ts                 # Test environment setup
│   ├── mocks/
│   │   ├── server.ts            # MSW server setup
│   │   └── handlers.ts          # API mocking handlers
│   └── utils/
│       ├── test-utils.tsx       # Custom render utilities
│       └── mock-data.ts         # Mock data for tests
├── components/
│   ├── **/*.test.tsx            # Component tests
├── contexts/
│   ├── **/*.test.tsx            # Context tests
└── services/
    ├── **/*.test.ts             # Service tests
```

## Testing Conventions

### File Naming

- Component tests: `ComponentName.test.tsx`
- Service tests: `serviceName.test.ts`
- Hook tests: `useHookName.test.tsx`
- Context tests: `ContextName.test.tsx`

### Test Organization

Each test file should follow this structure:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
// Import component and utilities

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

### Component Testing

Use the custom render utility from `test-utils.tsx` for components that need providers:

```typescript
import { render, screen } from '../test/utils/test-utils'
import MyComponent from './MyComponent'

test('renders component with providers', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello World')).toBeInTheDocument()
})
```

### API Mocking

MSW handlers are defined in `src/test/mocks/handlers.ts`. They automatically intercept HTTP requests during tests.

To override a handler for a specific test:

```typescript
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

test('handles API error', async () => {
  server.use(
    http.get('/api/questionnaire', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  
  // Test error handling
})
```

### Testing Context

For testing components that use contexts, use `renderHook` with the appropriate wrapper:

```typescript
import { renderHook } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthProvider'
import { useAuth } from '../contexts/AuthContext'

test('provides auth context', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider
  })
  
  expect(result.current.isAuthenticated).toBe(false)
})
```

## Mock Data

Predefined mock data is available in `src/test/utils/mock-data.ts`:

- `mockUser`: Regular user object
- `mockAdminUser`: Admin user object
- `mockQuestionnaire`: Complete questionnaire with questions
- `mockCreateQuestionnaire`: Data for creating a new questionnaire
- `mockJwtToken`: Mock JWT token

## Testing Patterns

### Authentication Testing

```typescript
import { mockUser, mockAdminUser } from '../test/utils/mock-data'

// Test with authenticated user
vi.mocked(useAuth).mockReturnValue({
  isAuthenticated: true,
  isAdmin: false,
  user: mockUser,
  // ... other auth context values
})
```

### Form Testing

```typescript
import userEvent from '@testing-library/user-event'

test('submits form with user input', async () => {
  const user = userEvent.setup()
  render(<MyForm onSubmit={mockSubmit} />)
  
  await user.type(screen.getByLabelText('Title'), 'Test Title')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  
  expect(mockSubmit).toHaveBeenCalledWith({ title: 'Test Title' })
})
```

### Async Component Testing

```typescript
import { waitFor } from '@testing-library/react'

test('loads data on mount', async () => {
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

## Coverage Goals

- **Components**: 80%+ coverage
- **Services**: 90%+ coverage  
- **Utilities**: 95%+ coverage
- **Critical paths**: 100% (auth, data submission)

## Best Practices

1. **Test behavior, not implementation**: Focus on what the user sees and does
2. **Use semantic queries**: Prefer `getByRole` and `getByLabelText` over `getByTestId`
3. **Mock external dependencies**: Always mock API calls, services, and browser APIs
4. **Test edge cases**: Include error states, loading states, and boundary conditions
5. **Keep tests focused**: Each test should verify one specific behavior
6. **Use descriptive test names**: Test names should clearly explain what is being tested

## Common Testing Scenarios

### Testing Protected Routes

```typescript
test('redirects to login when not authenticated', () => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: false,
    isAdmin: false,
    // ... other values
  })
  
  render(<ProtectedRoute><AdminPage /></ProtectedRoute>)
  
  expect(screen.getByTestId('login-page')).toBeInTheDocument()
})
```

### Testing Material-UI Components

```typescript
test('opens dialog when button clicked', async () => {
  const user = userEvent.setup()
  render(<ComponentWithDialog />)
  
  await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
  
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
```

### Testing Error Boundaries

```typescript
test('displays error when component throws', () => {
  const ThrowingComponent = () => {
    throw new Error('Test error')
  }
  
  render(
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>
  )
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
```

## Debugging Tests

### Running Tests in Debug Mode

```bash
# Run specific test file
npm run test -- ComponentName.test.tsx

# Run tests matching pattern
npm run test -- --grep "user authentication"

# Run with verbose output
npm run test -- --reporter=verbose
```

### VS Code Integration

Install the "Vitest" VS Code extension to:
- Run tests from within VS Code
- Set breakpoints in test files
- View test results inline

### Browser Debugging

```typescript
// Add screen.debug() to see the DOM
test('renders correctly', () => {
  render(<MyComponent />)
  screen.debug() // Prints current DOM to console
})
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Before deployment

The CI pipeline requires:
- All tests to pass
- Minimum coverage thresholds to be met
- No TypeScript errors
- ESLint checks to pass

## Troubleshooting

### Common Issues

1. **MSW handlers not working**: Ensure `server.listen()` is called in setup
2. **Material-UI theme errors**: Use the custom render utility
3. **Router errors**: Wrap components in `BrowserRouter` when testing
4. **Context errors**: Provide the appropriate context wrapper

### Getting Help

- Check the [Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/)
- Review [Vitest documentation](https://vitest.dev/)
- Look at existing test files for patterns
- Ask the team for guidance on complex testing scenarios