import assert from "node:assert/strict";
import test from "node:test";

import { listUsers, loginUser, registerUser, resetAuthStore } from "../src/auth-store.js";

test("registerUser stores a contributor account", () => {
  resetAuthStore();

  const user = registerUser({
    email: "builder@example.com",
    password: "password123",
    displayName: "Builder"
  });

  assert.equal(user.email, "builder@example.com");
  assert.equal(listUsers().length, 1);
});

test("loginUser creates a starter session", () => {
  resetAuthStore();

  registerUser({
    email: "builder@example.com",
    password: "password123",
    displayName: "Builder"
  });

  const session = loginUser({
    email: "builder@example.com",
    password: "password123"
  });

  assert.match(session.token, /^session_/);
});
