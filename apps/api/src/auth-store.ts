import type { AuthSession, AuthUser } from "@chordially/types";

type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const users = new Map<string, AuthUser & { password: string }>();
const sessions = new Map<string, AuthSession>();

export function resetAuthStore(): void {
  users.clear();
  sessions.clear();
}

export function listUsers(): AuthUser[] {
  return Array.from(users.values()).map(({ password: _password, ...user }) => user);
}

export function registerUser(input: RegisterInput): AuthUser {
  const email = input.email.trim().toLowerCase();

  if (users.has(email)) {
    throw new Error("A user with that email already exists.");
  }

  const user: AuthUser & { password: string } = {
    id: `user_${users.size + 1}`,
    email,
    displayName: input.displayName.trim(),
    role: "builder",
    password: input.password
  };

  users.set(email, user);

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function loginUser(input: LoginInput): AuthSession {
  const email = input.email.trim().toLowerCase();
  const user = users.get(email);

  if (!user || user.password !== input.password) {
    throw new Error("Invalid email or password.");
  }

  const session: AuthSession = {
    token: `session_${sessions.size + 1}`,
    userId: user.id,
    createdAt: new Date().toISOString()
  };

  sessions.set(session.token, session);
  return session;
}

export function logoutUser(token: string): boolean {
  return sessions.delete(token);
}
