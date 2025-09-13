import { describe, it, expect } from 'vitest'

describe('Sample Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with async code', async () => {
    const result = await Promise.resolve('hello')
    expect(result).toBe('hello')
  })
})