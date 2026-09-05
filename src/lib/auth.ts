import { NextRequest } from 'next/server';
import { UserProfile } from './types';
import { getUserProfile } from './firebase/admin';

export const AUTH_COOKIE_NAME = 'dhanyadhan_session_uid';

/**
 * Extracts currently authenticated user from NextRequest.
 * Reads the uid from cookie or authorization header.
 */
export async function getCurrentUser(req: NextRequest): Promise<UserProfile | null> {
  const cookieUid = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  // Security Hardening: Client-supplied x-user-uid header is untrusted and rejected in production.
  // Only honored if explicitly enabled by test environment configuration:
  const isTestRunner = Boolean(
    process.env.DHANYADHAN_ALLOW_TEST_HEADER === 'true' &&
    (process.env.DHANYADHAN_DB_FILE || process.env.NODE_ENV === 'test')
  );
  const headerUid = isTestRunner ? req.headers.get('x-user-uid') : null;
  const uid = cookieUid || headerUid;

  if (!uid) {
    return null;
  }

  return await getUserProfile(uid);
}

/**
 * Validates that user has access to specified class.
 * - sdg_admin: full access to all classes
 * - class_admin: access only if classId matches assigned classId
 */
export function verifyClassAccess(user: UserProfile, targetClassId: string): boolean {
  if (user.role === 'sdg_admin') {
    return true;
  }
  if (user.role === 'class_admin' && user.classId === targetClassId) {
    return true;
  }
  return false;
}

/**
 * Validates that user has access to Faculty portal / records.
 * - sdg_admin: full access
 * - faculty: authorized faculty coordinator
 */
export function verifyFacultyAccess(user: UserProfile): boolean {
  return user.role === 'sdg_admin' || user.role === 'faculty';
}
