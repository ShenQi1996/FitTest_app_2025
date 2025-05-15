import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @returns Promise<UserCredential>
 */
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(getAuth(), email, password);

/**
 * Sign in an existing user
 * @param {string} email
 * @param {string} password
 * @returns Promise<UserCredential>
 */
export const signIn = (email, password) =>
  signInWithEmailAndPassword(getAuth(), email, password);

/**
 * Sign out the current user
 * @returns Promise<void>
 */
export const signOut = () => firebaseSignOut(getAuth());
