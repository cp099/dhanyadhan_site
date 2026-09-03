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
  const headerUid = req.headers.get('x-user-uid');
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
