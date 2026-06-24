import { describe, expect, it } from "vitest"
import {
  computeCreatorCompleteness,
  computeFanCompleteness,
} from "./profile-completeness.js"

const baseCreator = {
  id: "cp-1",
  userId: "u-1",
  displayName: "",
  slug: "test",
  bio: null,
  avatarUrl: null,
  genre: null,
  location: null,
  isVerified: false,
  followerCount: 0,
  trackCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const baseFan = {
  id: "fp-1",
  userId: "u-1",
  displayName: "",
  avatarUrl: null,
  genrePrefs: [] as string[],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

describe("computeCreatorCompleteness", () => {
  it("returns 0 when all fields are empty", () => {
    const result = computeCreatorCompleteness(baseCreator)
    expect(result.score).toBe(0)
  })

  it("returns 100 when all fields are filled", () => {
    const result = computeCreatorCompleteness({
      ...baseCreator,
      displayName: "Solar Vibes",
      bio: "Indie producer",
      avatarUrl: "https://example.com/avatar.jpg",
      genre: "Indie",
      location: "Lagos",
    })
    expect(result.score).toBe(100)
  })

  it("returns partial score for partially filled profiles", () => {
    const result = computeCreatorCompleteness({
      ...baseCreator,
      displayName: "Solar Vibes",
      bio: "Indie producer",
    })
    expect(result.score).toBe(40)
  })
})

describe("computeFanCompleteness", () => {
  it("returns 0 when all fields are empty", () => {
    const result = computeFanCompleteness(baseFan)
    expect(result.score).toBe(0)
  })

  it("returns 100 when all fields are filled", () => {
    const result = computeFanCompleteness({
      ...baseFan,
      displayName: "Cool Fan",
      avatarUrl: "https://example.com/avatar.jpg",
      genrePrefs: ["jazz", "indie"],
    })
    expect(result.score).toBe(100)
  })

  it("counts genrePrefs as filled only when non-empty", () => {
    const result = computeFanCompleteness({
      ...baseFan,
      displayName: "Cool Fan",
      genrePrefs: [],
    })
    expect(result.score).toBe(33)
  })
})
