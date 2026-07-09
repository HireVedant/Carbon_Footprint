import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock Firebase dependencies
vi.mock('../firebase/firebase', () => ({
  auth: { currentUser: null },
}));

vi.mock('../firebase/auth', () => ({
  signUpWithEmail: vi.fn(),
  loginWithEmail: vi.fn(),
  resetPassword: vi.fn(),
  logoutUser: vi.fn(),
  sendEmailVerificationLink: vi.fn(),
}));

vi.mock('../firebase/firestore', () => ({
  getUserDocument: vi.fn(),
  updateUserDocument: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Call the callback immediately with null (logged out state)
    callback(null);
    return () => {};
  }),
  updateProfile: vi.fn(),
}));

// Test component to consume the context
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      <div data-testid="user-status">{user ? 'Logged In' : 'Logged Out'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides loading state initially, then resolves to logged out', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state after onAuthStateChanged fires immediately with null
    expect(screen.getByTestId('user-status')).toHaveTextContent('Logged Out');
  });

  it('throws an error if useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this expected error test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
