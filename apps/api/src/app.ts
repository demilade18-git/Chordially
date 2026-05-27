import express from "express";
import { z } from "zod";

import { env } from "./env.js";
import { listUsers, loginUser, logoutUser, registerUser } from "./auth-store.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const logoutSchema = z.object({
  token: z.string().min(1)
});

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: env.APP_NAME
    });
  });

  app.get("/api/v1/meta", (_request, response) => {
    response.json({
      app: "Chordially",
      phase: "hackathon-starter",
      currentMilestone: "authentication"
    });
  });

  app.get("/api/v1/auth/users", (_request, response) => {
    response.json({ users: listUsers() });
  });

  app.post("/api/v1/auth/register", (request, response) => {
    const payload = registerSchema.parse(request.body);
    const user = registerUser(payload);

    response.status(201).json({
      message: "Registration starter flow completed.",
      user
    });
  });

  app.post("/api/v1/auth/login", (request, response) => {
    const payload = loginSchema.parse(request.body);
    const session = loginUser(payload);

    response.status(200).json({
      message: "Login starter flow completed.",
      session
    });
  });

  app.post("/api/v1/auth/logout", (request, response) => {
    const payload = logoutSchema.parse(request.body);
    const removed = logoutUser(payload.token);

    response.status(200).json({
      message: removed ? "Session removed." : "Session was already absent."
    });
  });

  return app;
}
