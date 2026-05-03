"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  /** The current authenticated Firebase user, or null if logged out */
  user: User | null;
  /** True while Firebase is initially verifying the session on load */
  loading: boolean;
}

/**
 * Context to provide global access to the user's authentication state.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that listens to Firebase auth state changes 
 * and broadcasts the current user to the rest of the application.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to securely access the AuthContext.
 * @throws Will throw an error if used outside of an <AuthProvider> tree.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};