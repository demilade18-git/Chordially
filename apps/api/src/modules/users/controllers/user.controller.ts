import type { NextFunction, Request, Response } from "express"
import { updateMeSchema } from "@chordially/shared"
import { creatorService } from "../../creators/services/creator.service.js"
import { fanService } from "../../fans/services/fan.service.js"
import { toCreatorResponse } from "../../creators/types/creator.types.js"
import { toFanResponse } from "../../fans/types/fan.types.js"

export const userController = {
  async patchMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!
      const input = updateMeSchema.parse(req.body)

      const { displayName, avatarUrl, bio, genre, location } = input

      const creatorProfile = await creatorService.findByUserId(userId)
      const fanProfile = await fanService.findByUserId(userId)

      const creatorFields = { displayName, avatarUrl, bio, genre, location }
      const hasCreatorUpdate = Object.values(creatorFields).some((v) => v !== undefined)

      if (creatorProfile && hasCreatorUpdate) {
        await creatorService.updateCreatorProfile(
          creatorProfile.id,
          creatorFields,
          userId
        )
      }

      if (fanProfile && displayName !== undefined) {
        await fanService.updateFanProfile(fanProfile.id, { displayName }, userId)
      }

      res.status(200).json({ ok: true })
    } catch (error) {
      next(error)
    }
  },
}
