import type { Questionnaire, CreateQuestionnaire, User } from '../../types'

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg',
  isAdmin: false
}

export const mockAdminUser: User = {
  id: 2,
  email: 'admin@example.com',
  name: 'Admin User',
  picture: 'https://example.com/admin-avatar.jpg',
  isAdmin: true
}

export const mockQuestionnaire: Questionnaire = {
  id: '1',
  title: 'Sample Questionnaire',
  description: 'A test questionnaire for unit testing',
  createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
  isActive: true,
  responseCount: 5,
  questions: [
    {
      id: 1,
      text: 'What is your favorite color?',
      type: 1, // SingleChoice
      isRequired: true,
      order: 1,
      options: [
        { id: 1, text: 'Red', order: 1 },
        { id: 2, text: 'Blue', order: 2 },
        { id: 3, text: 'Green', order: 3 }
      ]
    },
    {
      id: 2,
      text: 'What are your hobbies?',
      type: 2, // MultipleChoice
      isRequired: false,
      order: 2,
      options: [
        { id: 4, text: 'Reading', order: 1 },
        { id: 5, text: 'Sports', order: 2 },
        { id: 6, text: 'Gaming', order: 3 }
      ]
    },
    {
      id: 3,
      text: 'Tell us about yourself',
      type: 3, // Descriptive
      isRequired: false,
      order: 3,
      options: []
    }
  ]
}

export const mockCreateQuestionnaire: CreateQuestionnaire = {
  title: 'New Test Questionnaire',
  description: 'A questionnaire created for testing',
  questions: [
    {
      text: 'What is your age group?',
      type: 1, // SingleChoice
      isRequired: true,
      order: 1,
      options: [
        { text: '18-25', order: 1 },
        { text: '26-35', order: 2 },
        { text: '36-45', order: 3 },
        { text: '46+', order: 4 }
      ]
    }
  ]
}

export const mockQuestionnaireList: Questionnaire[] = [
  mockQuestionnaire,
  {
    id: '2',
    title: 'Another Questionnaire',
    description: 'Another test questionnaire',
    createdAt: new Date('2024-01-02T00:00:00Z').toISOString(),
    isActive: false,
    responseCount: 0,
    questions: []
  }
]

export const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.abc123'

export const mockFingerprint = 'test-fingerprint-123'