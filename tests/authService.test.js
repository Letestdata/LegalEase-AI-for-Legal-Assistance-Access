import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/authService';

describe('Auth Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides a default logged-in profile for demo and test evaluation', () => {
    const user = authService.getStoredMockUser();
    expect(user).toBeDefined();
    expect(user.displayName).toBe('Sarah Jenkins');
    expect(user.email).toBe('sarah.jenkins@example.com');
  });

  it('signs in with email and persists credentials', async () => {
    const email = 'alex.founder@startup.io';
    const user = await authService.signInWithEmail(email, 'securePassword123');
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.displayName).toContain('alex');
  });

  it('signs up a new user with custom display name', async () => {
    const user = await authService.signUpWithEmail('michael.scott@dundermifflin.com', 'testPass', 'Michael Scott');
    expect(user.displayName).toBe('Michael Scott');
    expect(user.email).toBe('michael.scott@dundermifflin.com');
  });

  it('simulates Google single sign-on', async () => {
    const user = await authService.signInWithGoogle();
    expect(user).toBeDefined();
    expect(user.uid).toContain('user_google_');
  });

  it('signs out and clears user session', async () => {
    await authService.signOut();
    expect(authService.currentUser).toBeNull();
  });
});
