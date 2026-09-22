/**
 * Authentication Service
 * Handles user authentication via Firebase Auth with local persistent fallback
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const MOCK_STORAGE_KEY = 'legalease_mock_user';

// Default mock user profile matching Stitch design
const DEFAULT_MOCK_USER = {
  uid: 'user_sarah_jenkins_demo',
  displayName: 'Sarah Jenkins',
  email: 'sarah.jenkins@example.com',
  photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApfp-7bfhNreITR4xIA52b9v9CMJld7IulirKCc6uTEOuocEB8gV4VF8IxgKGOk5rV7sLS--1o9nuwlnuLfi9fElymz8vW2VodFS7u_WlyyjdOXqmIWjDCHCbF-_QgEOefb-NPl9cUdSuGMkHXHDrmREQXJl0W1BbZ1Zis3DMN1eudijRwqUSxUARuE8E2xQ24UzQ5OyIyGCx_9stJLMCJAf6gGtLThDwCZnNDswUwovAgQ0BNGkHU',
  createdAt: new Date().toISOString()
};

class AuthService {
  constructor() {
    this.mockListeners = new Set();
    this.currentUser = this.getStoredMockUser();
  }

  getStoredMockUser() {
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      console.warn("Could not read local mock user");
    }
    // Default logged in user for immediate seamless experience
    return DEFAULT_MOCK_USER;
  }

  setStoredMockUser(user) {
    this.currentUser = user;
    try {
      if (user) {
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(MOCK_STORAGE_KEY);
      }
    } catch {
      console.warn("Could not store local mock user");
    }
    this.notifyMockListeners();
  }

  notifyMockListeners() {
    for (const listener of this.mockListeners) {
      listener(this.currentUser);
    }
  }

  onAuthStateChanged(callback) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, callback);
    }

    this.mockListeners.add(callback);
    // Immediately call callback with current state
    callback(this.currentUser);

    return () => {
      this.mockListeners.delete(callback);
    };
  }

  async signInWithEmail(email, password) {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    }

    // Mock sign in
    const user = {
      uid: 'user_' + btoa(email).replace(/=/g, '').slice(0, 12),
      displayName: email.split('@')[0].replace('.', ' '),
      email: email,
      photoURL: DEFAULT_MOCK_USER.photoURL,
      createdAt: new Date().toISOString()
    };
    this.setStoredMockUser(user);
    return user;
  }

  async signUpWithEmail(email, password, displayName) {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    }

    // Mock registration
    const user = {
      uid: 'user_' + btoa(email).replace(/=/g, '').slice(0, 12),
      displayName: displayName || email.split('@')[0],
      email: email,
      photoURL: DEFAULT_MOCK_USER.photoURL,
      createdAt: new Date().toISOString()
    };
    this.setStoredMockUser(user);
    return user;
  }

  async signInWithGoogle() {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    }

    // Mock Google sign in
    const user = {
      ...DEFAULT_MOCK_USER,
      uid: 'user_google_' + Date.now()
    };
    this.setStoredMockUser(user);
    return user;
  }

  async signOut() {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
      return;
    }

    this.setStoredMockUser(null);
  }

  async resetPassword(email) {
    if (isFirebaseConfigured && auth) {
      return await sendPasswordResetEmail(auth, email);
    }
    // Mock password reset response
    return true;
  }
}

export const authService = new AuthService();
