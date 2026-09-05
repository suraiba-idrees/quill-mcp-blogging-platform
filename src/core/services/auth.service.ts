import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { signupSchema, loginSchema } from "../types/validation.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  existsByEmail,
  existsByUsername,
} from "../repositories/user.repository.js";
import type { User } from "../types/domain.js";
import { ServiceError } from "./errors.js";

const SCRYPT_KEYLEN = 64;

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN);
  const storedBuffer = Buffer.from(hashHex, "hex");
  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(derivedKey, storedBuffer);
}

const DUMMY_HASH = hashPassword("dummy-password-for-timing-safety");

export function signup(input: { email: string; username: string; password: string }): PublicUser {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid signup input");
  }

  const email = normalizeEmail(parsed.data.email);
  const username = parsed.data.username;

  if (existsByEmail(email)) {
    throw new ServiceError("CONFLICT", "An account with this email already exists");
  }
  if (existsByUsername(username)) {
    throw new ServiceError("CONFLICT", "This username is already taken");
  }

  const passwordHash = hashPassword(parsed.data.password);
  const user = createUser({ email, username, passwordHash });
  return toPublicUser(user);
}

export function login(input: { email: string; password: string }): PublicUser {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid login input");
  }

  const email = normalizeEmail(parsed.data.email);
  const user = findUserByEmail(email);

  if (!user) {
    verifyPassword(parsed.data.password, DUMMY_HASH);
    throw new ServiceError("UNAUTHORIZED", "Invalid email or password");
  }
  if (!verifyPassword(parsed.data.password, user.passwordHash)) {
    throw new ServiceError("UNAUTHORIZED", "Invalid email or password");
  }

  return toPublicUser(user);
}

export function getUserById(id: string): PublicUser | null {
  const user = findUserById(id);
  return user ? toPublicUser(user) : null;
}