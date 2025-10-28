import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase";

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function emailPasswordSignIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignOut() {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

export type AuthUser = Pick<
  User,
  "uid" | "email" | "displayName" | "photoURL" | "emailVerified"
>;
