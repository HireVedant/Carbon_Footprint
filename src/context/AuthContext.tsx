import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, updateProfile as authUpdateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
  UserProfile,
  getUserDocument,
  updateUserDocument as firestoreUpdateUser,
  bootstrapOwnerAccount,
} from '../firebase/firestore';
import {
  signUpWithEmail as authSignUp,
  loginWithEmail as authLogin,
  resetPassword as authResetPassword,
  logoutUser as authLogout,
  sendEmailVerificationLink as authSendVerify,
} from '../firebase/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  updateProfileData: (name: string, photoURL: string, userType: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        if (currentUser.email) {
          void bootstrapOwnerAccount(currentUser.uid, currentUser.email);
        }
        try {
          const profile = await getUserDocument(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Fallback when Firestore profile is missing — keeps header menu visible
            setUserProfile({
              uid: currentUser.uid,
              name: currentUser.displayName || 'Eco User',
              email: currentUser.email || '',
              photo: currentUser.photoURL || '',
              userType: 'Individual',
              createdAt: null,
            });
          }
        } catch (error) {
          setUserProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || 'Eco User',
            email: currentUser.email || '',
            photo: currentUser.photoURL || '',
            userType: 'Individual',
            createdAt: null,
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const newUser = await authSignUp(email, password, name);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedUser = await authLogin(email, password);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authResetPassword(email);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authLogout();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    await authSendVerify();
  };

  const updateProfileData = async (name: string, photoURL: string, userType: string) => {
    if (!user) throw new Error('No authenticated user found.');

    // 1. Update Authentication profile
    await authUpdateProfile(user, {
      displayName: name,
      photoURL: photoURL,
    });

    // 2. Update Firestore user profile document
    await firestoreUpdateUser(user.uid, {
      name,
      photo: photoURL,
      userType,
    });

    // 3. Update local state
    setUserProfile((prev) =>
      prev ? { ...prev, name, photo: photoURL, userType } : null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signUp,
        login,
        resetPassword,
        logout,
        sendEmailVerification,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
