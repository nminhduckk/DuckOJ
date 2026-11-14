import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { DatabaseSync } from 'node:sqlite';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  crypto.createHash('sha256').update('duckoj-dev-jwt-secret-change-in-production').digest('hex');

export interface AuthUser {
  id: number;
  public_id: string;
  email: string;
  handle: string;
  name: string;
  role: 'student' | 'reviewer' | 'admin';
  is_active: boolean;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hexKey] = parts;
  try {
    const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const target = Buffer.from(hexKey, 'hex');
    if (derived.length !== target.length) return false;
    return crypto.timingSafeEqual(derived, target);
  } catch {
    return false;
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export function signAccessToken(user: AuthUser, ttlMinutes = 15): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      sub: user.public_id,
      role: user.role,
      iat: nowSec,
      exp: nowSec + ttlMinutes * 60,
    })
  );
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export function verifyAccessToken(token: string): { sub: string; role: string; exp: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof parsed.sub !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sha256Hex(val: string): string {
  return crypto.createHash('sha256').update(val).digest('hex');
}

export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  return { raw, hash: sha256Hex(raw) };
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export function getUserFromRequest(db: DatabaseSync, req: Request): AuthUser | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  const claims = verifyAccessToken(token);
  if (!claims) return undefined;

  // §11: Always re-read role and active status from DB rather than trusting JWT claims blindly
  const row = db
    .prepare(
      'SELECT id, public_id, email, handle, name, role, is_active FROM users WHERE public_id = ?'
    )
    .get(claims.sub) as
    | {
        id: number;
        public_id: string;
        email: string;
        handle: string;
        name: string;
        role: 'student' | 'reviewer' | 'admin';
        is_active: number;
      }
    | undefined;

  if (!row || !row.is_active) return undefined;
  return {
    id: Number(row.id),
    public_id: row.public_id,
    email: row.email,
    handle: row.handle,
    name: row.name,
    role: row.role,
    is_active: Boolean(row.is_active),
  };
}

export function attachOptionalAuth(db: DatabaseSync) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    req.user = getUserFromRequest(db, req);
    next();
  };
}

export function requireAuth(db: DatabaseSync) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const u = req.user ?? getUserFromRequest(db, req);
    if (!u) {
      res.status(401).json({
        error: { code: 'unauthorized', message: 'Vui lòng đăng nhập để tiếp tục.', details: {} },
      });
      return;
    }
    req.user = u;
    next();
  };
}

export function requireRole(db: DatabaseSync, roles: ('reviewer' | 'admin')[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const u = req.user ?? getUserFromRequest(db, req);
    if (!u) {
      res.status(401).json({
        error: { code: 'unauthorized', message: 'Vui lòng đăng nhập để tiếp tục.', details: {} },
      });
      return;
    }
    if (!roles.includes(u.role as 'reviewer' | 'admin')) {
      res.status(403).json({
        error: { code: 'forbidden', message: 'Bạn không có quyền thực hiện thao tác này.', details: {} },
      });
      return;
    }
    req.user = u;
    next();
  };
}
