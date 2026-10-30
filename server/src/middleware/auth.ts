import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

/**
 * Middleware to require a verified Clerk user.
 * If CLERK_SECRET_KEY is configured, checks the JWT token from the Authorization header.
 * If CLERK_SECRET_KEY is omitted (e.g. in local development without Clerk), passes through.
 */
export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!process.env.CLERK_SECRET_KEY) {
    // Development fallback
    return next();
  }

  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({
      error: 'Unauthorized: Ein gültiger Clerk-Benutzertoken wird für diesen Endpunkt benötigt.'
    });
  }

  (req as any).userId = auth.userId;
  next();
}

/**
 * Optional helper to get verified userId from Clerk or fallback from body/query
 */
export function getVerifiedUserId(req: Request): string {
  if (process.env.CLERK_SECRET_KEY) {
    const auth = getAuth(req);
    if (auth.userId) return auth.userId;
  }
  return req.body?.userId || (req.query?.userId as string) || 'guest';
}
