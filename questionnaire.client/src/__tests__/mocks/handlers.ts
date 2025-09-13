import { http, HttpResponse } from 'msw'
import type { CreateQuestionnaire, Questionnaire, SubmitResponse } from '../../types'

const baseUrl = 'https://localhost:7154/api'

export const handlers = [
  // Auth endpoints
  http.post(`${baseUrl}/auth/google`, () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        fingerprint: 'test-fingerprint'
      }
    })
  }),

  http.post(`${baseUrl}/auth/google-admin`, () => {
    return HttpResponse.json({
      token: 'mock-admin-jwt-token',
      user: {
        id: '2',
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true,
        fingerprint: 'admin-fingerprint'
      }
    })
  }),

  // Questionnaire endpoints
  http.get(`${baseUrl}/questionnaire`, () => {
    const questionnaires: Questionnaire[] = [
      {
        id: '1',
        title: 'Sample Questionnaire',
        description: 'A test questionnaire for unit testing',
        createdAt: new Date().toISOString(),
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
            text: 'Tell us about yourself',
            type: 3, // Descriptive
            isRequired: false,
            order: 2,
            options: []
          }
        ]
      }
    ]
    return HttpResponse.json(questionnaires)
  }),

  http.get(`${baseUrl}/questionnaire/:id`, ({ params }) => {
    const { id } = params
    const questionnaire: Questionnaire = {
      id: id as string,
      title: 'Sample Questionnaire',
      description: 'A test questionnaire for unit testing',
      createdAt: new Date().toISOString(),
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
        }
      ]
    }
    return HttpResponse.json(questionnaire)
  }),

  http.post(`${baseUrl}/questionnaire`, async ({ request }) => {
    const newQuestionnaire = await request.json() as CreateQuestionnaire
    const questionnaire: Questionnaire = {
      id: '999',
      title: newQuestionnaire.title,
      description: newQuestionnaire.description,
      createdAt: new Date().toISOString(),
      isActive: true,
      responseCount: 0,
      questions: newQuestionnaire.questions.map((q, index) => ({
        id: index + 1,
        text: q.text,
        type: q.type,
        isRequired: q.isRequired,
        order: q.order,
        options: q.options.map((opt, optIndex) => ({
          id: optIndex + 1,
          text: opt.text,
          order: opt.order
        }))
      }))
    }
    return HttpResponse.json(questionnaire, { status: 201 })
  }),

  http.put(`${baseUrl}/questionnaire/:id`, async ({ params, request }) => {
    const { id } = params
    const updateData = await request.json() as Partial<Questionnaire>
    const questionnaire: Questionnaire = {
      id: id as string,
      title: updateData.title || 'Updated Questionnaire',
      description: updateData.description,
      createdAt: new Date().toISOString(),
      isActive: updateData.isActive ?? true,
      responseCount: 0,
      questions: updateData.questions || []
    }
    return HttpResponse.json(questionnaire)
  }),

  http.delete(`${baseUrl}/questionnaire/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Response endpoints
  http.post(`${baseUrl}/questionnaire/:id/response`, async ({ params, request }) => {
    const { id } = params
    const responseData = await request.json() as SubmitResponse
    const response = {
      ...responseData,
      id: '1',
      questionnaireId: id as string,
      submittedAt: new Date().toISOString()
    }
    return HttpResponse.json(response, { status: 201 })
  }),

  // Admin endpoints
  http.get(`${baseUrl}/admin/questionnaires`, () => {
    const questionnaires: Questionnaire[] = [
      {
        id: '1',
        title: 'Admin Questionnaire 1',
        description: 'Admin test questionnaire',
        createdAt: new Date().toISOString(),
        isActive: true,
        responseCount: 10,
        questions: []
      }
    ]
    return HttpResponse.json(questionnaires)
  }),

  http.get(`${baseUrl}/admin/questionnaire/:id/responses`, ({ params }) => {
    const { id } = params
    const responses = [
      {
        id: '1',
        questionnaireId: id as string,
        fingerprint: 'test-fingerprint',
        submittedAt: new Date().toISOString(),
        responses: [
          {
            questionId: 1,
            selectedOptionIds: [1],
            textResponse: ''
          }
        ]
      }
    ]
    return HttpResponse.json(responses)
  }),

  // Social share endpoints
  http.get(`${baseUrl}/social-share/metadata/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      title: 'Sample Questionnaire',
      description: 'A test questionnaire for unit testing',
      url: `https://example.com/questionnaire/${id}`,
      imageUrl: 'https://example.com/image.jpg'
    })
  }),

  // Error handlers for testing error scenarios
  http.get(`${baseUrl}/questionnaire/error`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.post(`${baseUrl}/auth/google-error`, () => {
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Catch-all handler for unmatched requests to prevent MSW errors
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return new HttpResponse(null, { status: 404 })
  })
]