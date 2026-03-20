import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// התחברות עם Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// התנתקות
export const logout = async () => {
  await signOut(auth);
};

// מאזין לשינויים במשתמש המחובר
export const onUserStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// קבלת המשתמש הנוכחי
export const getCurrentUser = () => {
  return auth.currentUser;
}; 