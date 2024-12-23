import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const signOut = async () => {
  try {
    console.log('Signing out user');
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    // Clear any local storage or state if needed
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};