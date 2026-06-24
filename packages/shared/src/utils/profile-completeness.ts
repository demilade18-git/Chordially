import type { CreatorProfileResponse } from "../types/creator.js"
import type { FanProfileResponse } from "../types/fan.js"

export interface ProfileCompletenessResult {
  score: number
}

export function computeCreatorCompleteness(
  profile: CreatorProfileResponse
): ProfileCompletenessResult {
  const fields = [
    profile.displayName,
    profile.bio,
    profile.avatarUrl,
    profile.genre,
    profile.location,
  ]

  const filled = fields.filter((f) => f !== null && f !== "").length
  const score = Math.round((filled / fields.length) * 100)

  return { score }
}

export function computeFanCompleteness(
  profile: FanProfileResponse
): ProfileCompletenessResult {
  const fields = [
    profile.displayName,
    profile.avatarUrl,
    profile.genrePrefs.length > 0 ? "filled" : null,
  ]

  const filled = fields.filter((f) => f !== null && f !== "").length
  const score = Math.round((filled / fields.length) * 100)

  return { score }
}
