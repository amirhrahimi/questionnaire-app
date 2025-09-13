import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

// Mock FingerprintJS
vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn()
  }
}))

// Since the FingerprintService is exported as a singleton instance,
// we need to create a test that works with that pattern
describe('FingerprintService', () => {
  const mockVisitorId = 'test-visitor-id-123'
  const mockQuestionnaireId = 'test-questionnaire-id'
  
  // Mock browser APIs
  const mockScreen = {
    width: 1920,
    height: 1080,
    colorDepth: 24
  }
  
  const mockNavigator = {
    language: 'en-US',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
  
  const mockIntl = {
    DateTimeFormat: () => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' })
    })
  }

  let FingerprintService: typeof import('../fingerprint').default

  beforeEach(async () => {
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Setup mocks
    Object.defineProperty(global, 'screen', {
      value: mockScreen,
      writable: true
    })
    
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true
    })
    
    Object.defineProperty(global, 'Intl', {
      value: mockIntl,
      writable: true
    })
    
    // Mock canvas
    const mockCanvas = {
      getContext: vi.fn(() => ({
        textBaseline: '',
        font: '',
        fillText: vi.fn(),
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,mockcanvasdata12345678901234567890')
    }
    
    Object.defineProperty(global, 'document', {
      value: {
        createElement: vi.fn(() => mockCanvas)
      },
      writable: true
    })

    // Import the service fresh each time
    vi.clearAllMocks()
    const module = await import('../fingerprint')
    FingerprintService = module.default
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('getFingerprint', () => {
    it('should generate fingerprint using FingerprintJS when available', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const fingerprint = await FingerprintService.getFingerprint()
      
      expect(fingerprint).toBe(mockVisitorId)
      expect(FingerprintJS.load).toHaveBeenCalled()
      expect(mockFp.get).toHaveBeenCalled()
    })

    it('should use fallback fingerprint when FingerprintJS fails', async () => {
      vi.mocked(FingerprintJS.load).mockRejectedValue(new Error('FingerprintJS failed'))
      
      const fingerprint = await FingerprintService.getFingerprint()
      
      expect(fingerprint).toBeTruthy()
      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })
  })

  describe('getStorageKey', () => {
    it('should generate correct storage key format', () => {
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, mockVisitorId)
      
      expect(storageKey).toBe(`questionnaire_response_${mockQuestionnaireId}_${mockVisitorId}`)
    })
  })

  describe('hasSubmittedResponse', () => {
    it('should return false when no response has been submitted', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const hasSubmitted = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      
      expect(hasSubmitted).toBe(false)
    })

    it('should return true when response exists in localStorage', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, mockVisitorId)
      localStorage.setItem(storageKey, JSON.stringify({ submittedAt: '2023-01-01' }))
      
      const hasSubmitted = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      
      expect(hasSubmitted).toBe(true)
    })

    it('should return true when response exists in sessionStorage', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, mockVisitorId)
      sessionStorage.setItem(storageKey, JSON.stringify({ submittedAt: '2023-01-01' }))
      
      const hasSubmitted = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      
      expect(hasSubmitted).toBe(true)
    })

    it('should handle errors gracefully and return false', async () => {
      vi.mocked(FingerprintJS.load).mockRejectedValue(new Error('Test error'))
      
      const hasSubmitted = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      
      expect(hasSubmitted).toBe(false)
    })
  })

  describe('markAsSubmitted', () => {
    it('should store submission data in both localStorage and sessionStorage', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const timestamp = '2023-01-01T12:00:00Z'
      
      await FingerprintService.markAsSubmitted(mockQuestionnaireId, timestamp)
      
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, mockVisitorId)
      const localData = localStorage.getItem(storageKey)
      const sessionData = sessionStorage.getItem(storageKey)
      
      expect(localData).toBeTruthy()
      expect(sessionData).toBeTruthy()
      
      const parsedLocalData = JSON.parse(localData!)
      const parsedSessionData = JSON.parse(sessionData!)
      
      expect(parsedLocalData.submittedAt).toBe(timestamp)
      expect(parsedLocalData.fingerprint).toBe(mockVisitorId.slice(0, 8))
      expect(parsedSessionData).toEqual(parsedLocalData)
    })

    it('should use current timestamp when no timestamp provided', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const beforeTime = Date.now()
      
      await FingerprintService.markAsSubmitted(mockQuestionnaireId)
      
      const afterTime = Date.now()
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, mockVisitorId)
      const localData = localStorage.getItem(storageKey)
      
      expect(localData).toBeTruthy()
      
      const parsedData = JSON.parse(localData!)
      const submittedTime = new Date(parsedData.submittedAt).getTime()
      expect(submittedTime).toBeGreaterThanOrEqual(beforeTime)
      expect(submittedTime).toBeLessThanOrEqual(afterTime)
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(FingerprintJS.load).mockRejectedValue(new Error('Test error'))
      
      // Should not throw
      await expect(FingerprintService.markAsSubmitted(mockQuestionnaireId)).resolves.toBeUndefined()
    })

    it('should truncate fingerprint to 8 characters for privacy', async () => {
      const longVisitorId = 'very-long-visitor-id-12345678901234567890'
      
      // Clear storage and reset mocks
      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()
      
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: longVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      // Create a fresh import to reset the singleton
      vi.resetModules()
      const freshModule = await import('../fingerprint')
      const freshService = freshModule.default
      
      await freshService.markAsSubmitted(mockQuestionnaireId)
      
      // Get the actual fingerprint that was used
      const actualFingerprint = await freshService.getFingerprint()
      const storageKey = freshService.getStorageKey(mockQuestionnaireId, actualFingerprint)
      const localData = localStorage.getItem(storageKey)
      
      expect(localData).toBeTruthy()
      const parsedData = JSON.parse(localData!)
      
      expect(parsedData.fingerprint).toBe(longVisitorId.slice(0, 8))
      expect(parsedData.fingerprint.length).toBe(8)
    })
  })

  describe('clearSubmissionRecord', () => {
    it('should remove submission data from both localStorage and sessionStorage', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      // Get the actual fingerprint and storage key
      const actualFingerprint = await FingerprintService.getFingerprint()
      const storageKey = FingerprintService.getStorageKey(mockQuestionnaireId, actualFingerprint)
      
      // Set initial data
      localStorage.setItem(storageKey, JSON.stringify({ submittedAt: '2023-01-01' }))
      sessionStorage.setItem(storageKey, JSON.stringify({ submittedAt: '2023-01-01' }))
      
      await FingerprintService.clearSubmissionRecord(mockQuestionnaireId)
      
      expect(localStorage.getItem(storageKey)).toBeNull()
      expect(sessionStorage.getItem(storageKey)).toBeNull()
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(FingerprintJS.load).mockRejectedValue(new Error('Test error'))
      
      // Should not throw
      await expect(FingerprintService.clearSubmissionRecord(mockQuestionnaireId)).resolves.toBeUndefined()
    })
  })

  describe('fallback fingerprint generation', () => {
    it('should generate a fingerprint when FingerprintJS fails', async () => {
      vi.mocked(FingerprintJS.load).mockRejectedValue(new Error('FingerprintJS failed'))
      
      const fingerprint = await FingerprintService.getFingerprint()
      
      expect(fingerprint).toBeTruthy()
      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete workflow: check -> submit -> check again', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      // Initially not submitted
      const hasSubmittedBefore = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      expect(hasSubmittedBefore).toBe(false)
      
      // Mark as submitted
      await FingerprintService.markAsSubmitted(mockQuestionnaireId)
      
      // Now should be submitted
      const hasSubmittedAfter = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      expect(hasSubmittedAfter).toBe(true)
      
      // Clear record
      await FingerprintService.clearSubmissionRecord(mockQuestionnaireId)
      
      // Should not be submitted anymore
      const hasSubmittedAfterClear = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      expect(hasSubmittedAfterClear).toBe(false)
    })

    it('should handle multiple questionnaires independently', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      const questionnaire1 = 'questionnaire-1'
      const questionnaire2 = 'questionnaire-2'
      
      // Submit response for questionnaire 1
      await FingerprintService.markAsSubmitted(questionnaire1)
      
      // Check status
      const hasSubmitted1 = await FingerprintService.hasSubmittedResponse(questionnaire1)
      const hasSubmitted2 = await FingerprintService.hasSubmittedResponse(questionnaire2)
      
      expect(hasSubmitted1).toBe(true)
      expect(hasSubmitted2).toBe(false)
      
      // Submit response for questionnaire 2
      await FingerprintService.markAsSubmitted(questionnaire2)
      
      // Both should be submitted now
      const hasSubmittedBoth1 = await FingerprintService.hasSubmittedResponse(questionnaire1)
      const hasSubmittedBoth2 = await FingerprintService.hasSubmittedResponse(questionnaire2)
      
      expect(hasSubmittedBoth1).toBe(true)
      expect(hasSubmittedBoth2).toBe(true)
      
      // Clear only questionnaire 1
      await FingerprintService.clearSubmissionRecord(questionnaire1)
      
      // Check final status
      const hasFinal1 = await FingerprintService.hasSubmittedResponse(questionnaire1)
      const hasFinal2 = await FingerprintService.hasSubmittedResponse(questionnaire2)
      
      expect(hasFinal1).toBe(false)
      expect(hasFinal2).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error')
      })
      
      // Should not throw
      await expect(FingerprintService.markAsSubmitted(mockQuestionnaireId)).resolves.toBeUndefined()
      
      // Restore original function
      localStorage.setItem = originalSetItem
    })

    it('should handle sessionStorage errors gracefully', async () => {
      const mockFp = {
        get: vi.fn().mockResolvedValue({ visitorId: mockVisitorId })
      }
      vi.mocked(FingerprintJS.load).mockResolvedValue(mockFp)
      
      // Mock sessionStorage to throw an error
      const originalGetItem = sessionStorage.getItem
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('sessionStorage error')
      })
      
      // Should not throw and return false
      const hasSubmitted = await FingerprintService.hasSubmittedResponse(mockQuestionnaireId)
      expect(hasSubmitted).toBe(false)
      
      // Restore original function
      sessionStorage.getItem = originalGetItem
    })
  })
})