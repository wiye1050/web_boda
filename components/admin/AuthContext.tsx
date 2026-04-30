"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-auth";

type AuthState = {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        // Forzamos el refresco del token para asegurarnos de tener los claims más recientes
        const token = await nextUser.getIdTokenResult(true);
        console.log("Auth claims:", token.claims);
        console.log("User email:", nextUser.email);
        
        const isEmailAdmin = 
          nextUser.email === "guillemenendez1050@gmail.com" || 
          nextUser.email === "varelamaciasalba@gmail.com";
          
        setIsAdmin(!!token.claims.admin || isEmailAdmin);
      } else {
        setIsAdmin(false);
      }
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin, isLoading }),
    [user, isAdmin, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
