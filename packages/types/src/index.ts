export type UserRole = "builder" | "artist" | "fan" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  userId: string;
  createdAt: string;
};

export type Milestone = {
  key: string;
  title: string;
  goal: string;
};
