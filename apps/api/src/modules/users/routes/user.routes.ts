import { Router } from "express"
import { requireAuth } from "../../../shared/middleware/auth.middleware.js"
import { userController } from "../controllers/user.controller.js"

export const usersRouter: Router = Router()

usersRouter.patch("/me", requireAuth, userController.patchMe)
