import { describe, it, expect } from 'vitest'
import { updateRating, socialScenarios } from '@/lib/social-scenarios'

describe('Social Scenarios', () => {
  it('updateRating calculates weighted average', () => {
    const r = updateRating({ stars: 4, votes: 2 }, 5)
    expect(r.stars).toBeCloseTo(4.33, 2)
    expect(r.votes).toBe(3)
  })

  it('has at least 5 categories and svg icons', () => {
    expect(socialScenarios.length).toBeGreaterThanOrEqual(5)
    expect(socialScenarios[0].icon.svg).toContain('<svg')
  })
})
