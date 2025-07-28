// middleware/authMiddleware.js 

import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS_URL = process.env.IDP_JWKS_URL || 'http://localhost:3000/api/auth/jwks';
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '').trim();

    // Debug: print env and JWT header
    console.log('[verifyToken] process.env.JWT_AUDIENCE:', process.env.JWT_AUDIENCE);
    console.log('[verifyToken] process.env.JWT_ISSUER:', process.env.JWT_ISSUER);
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.log('[verifyToken] JWT claims:', claims);
      }
    } catch (decodeErr) {
      console.warn('[verifyToken] Failed to decode JWT claims:', decodeErr);
    }

    const { payload } = await jwtVerify(token, JWKS, {
      audience: process.env.JWT_AUDIENCE || 'better-auth-demo',
      issuer: process.env.JWT_ISSUER || 'better-auth-demo',
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      ...payload,
    };

    next();
  } catch (err) {
    console.error('[verifyToken] JWT validation failed:', err);
    if (err && err.stack) {
      console.error('[verifyToken] Error stack:', err.stack);
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
