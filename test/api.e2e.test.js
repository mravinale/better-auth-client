// test/full_auth_flow.e2e.test.js
import request from 'supertest';

const API_URL = 'http://localhost:3005/api';
const IDP_URL = 'http://localhost:3000/api/auth';
const EMAIL = 'testuser@example.com';
const PASSWORD = 'TestPass123!';
const NAME = 'Test User';

describe('Better Auth Full Auth Flow (E2E, HTTP only)', () => {
  let sessionToken;
  let cookie;
  let jwt;

  it('should sign up the user (or ignore if already exists)', async () => {
    try {
      const res = await request(IDP_URL)
        .post('/sign-up/email')
        .send({ email: EMAIL, password: PASSWORD, name: NAME })
        .set('Content-Type', 'application/json');
      console.log('Sign-up:', res.status, res.body, res.headers);
      // Accept 200, 409, or 422 with USER_ALREADY_EXISTS
      if ([200, 409].includes(res.status)) {
        expect([200, 409]).toContain(res.status);
      } else if (res.status === 422) {
        expect(res.body.code).toBe('USER_ALREADY_EXISTS');
      } else {
        throw new Error(`Unexpected status: ${res.status}`);
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      throw err;
    }
  });

  it('should sign in to IdP and get a session token and cookie', async () => {
    try {
      const res = await request(IDP_URL)
        .post('/sign-in/email')
        .send({ email: EMAIL, password: PASSWORD })
        .set('Content-Type', 'application/json');
      console.log('Sign-in:', res.status, res.body, res.headers);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      sessionToken = res.body.token;
      cookie = res.headers['set-cookie']?.find(c => c.startsWith('better-auth.session_token'));
      expect(sessionToken).toBeTruthy();
      expect(cookie).toBeTruthy();
    } catch (err) {
      console.error('Sign-in error:', err);
      throw err;
    }
  });

  it('should exchange the session token for a JWT using the cookie', async () => {
    try {
      const res = await request(IDP_URL)
        .get('/token')
        .set('Cookie', cookie);
      console.log('Token exchange:', res.status, res.body, res.headers);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      jwt = res.body.token;
      expect(jwt).toBeTruthy();
    } catch (err) {
      console.error('Token exchange error:', err);
      throw err;
    }
  });

  it('should access the protected API endpoint with the JWT', async () => {
    try {
      const res = await request(API_URL)
        .get('/protected')
        .set('Authorization', `Bearer ${jwt}`);
      console.log('Protected endpoint:', res.status, res.body, res.headers);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email');
    } catch (err) {
      console.error('Protected endpoint error:', err);
      throw err;
    }
  });
});
