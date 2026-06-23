import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../../../app.js"

const app = createApp()

async function registerAndLogin(email: string) {
  await request(app)
    .post("/api/auth/register")
    .send({ email, password: "Password1!" })

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "Password1!" })

  return res.body.token as string
}

describe("PATCH /api/users/me", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).patch("/api/users/me").send({ displayName: "X" })
    expect(res.status).toBe(401)
  })

  it("returns 400 for an invalid payload", async () => {
    const token = await registerAndLogin("invalid-patch@test.com")
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ displayName: "X" })

    expect(res.status).toBe(400)
  })

  it("updates creator profile fields when the user has a creator profile", async () => {
    const token = await registerAndLogin("creator-patch@test.com")

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "creator-patch@test.com", password: "Password1!" })
    const userId = loginRes.body.user.id

    await request(app)
      .post("/api/creators")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId, displayName: "Original Name" })

    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ displayName: "Updated Name", bio: "New bio", genre: "jazz" })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it("succeeds with no profiles (no-op)", async () => {
    const token = await registerAndLogin("noprofile-patch@test.com")

    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ displayName: "Ghost" })

    expect(res.status).toBe(200)
  })
})
