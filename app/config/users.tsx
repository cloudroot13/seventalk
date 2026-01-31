// app/config/users.ts
export interface User {
  username: string;
  password: string;
  role: string;
}

export const ALLOWED_USERS: User[] = [
  { username: "Neo", password: "matrix123", role: "admin" },
  { username: "Trinity", password: "z10n0101", role: "user" },
  { username: "Morpheus", password: "redpill99", role: "user" },
  { username: "Anonymous", password: "opwh7js8f2", role: "anonymous" }
];