import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { signupSchema, loginSchema } from "../types/validation.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  existsByEmail,
} from "../repositories/user.repository.js";
import type { User } from "../types/domain.js";
import { ServiceError } from "./errors.js";

const SCRYPT_KEYLEN = 64;

export interface PublicUser {
  id: string;
  email: string;
  createdAt: string;
}

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
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

// Computed once at module load so login() has a real hash to compare against
// even when the email doesn't exist, this narrows (does not fully close)
// the timing gap between "no such user" and "wrong password".
const DUMMY_HASH = hashPassword("dummy-password-for-timing-safety");

export function signup(input: { email: string; password: string }): PublicUser {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid signup input"
    );
  }

  const email = normalizeEmail(parsed.data.email);

  if (existsByEmail(email)) {
    throw new ServiceError("CONFLICT", "An account with this email already exists");
  }

  const passwordHash = hashPassword(parsed.data.password);
  const user = createUser({ email, passwordHash });
  return toPublicUser(user);
}

export function login(input: { email: string; password: string }): PublicUser {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid login input"
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const user = findUserByEmail(email);

  if (!user) {
    verifyPassword(parsed.data.password, DUMMY_HASH); // constant-time-ish decoy
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