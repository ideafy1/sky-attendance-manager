import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { Employee } from '@/types';

export const loginUser = async (employeeId: string, password: string) => {
  try {
    // First find the user document by employee ID
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Employee not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as Employee;

    // Use the email from Firestore to login with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
    
    // Update the user data with the auth UID
    return {
      ...userData,
      id: userDoc.id,
      uid: userCredential.user.uid
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    const employeesRef = collection(db, 'users');
    const querySnapshot = await getDocs(employeesRef);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data() 
    } as Employee));
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const addNewEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  try {
    // First create the auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employeeData.email,
      employeeData.password as string
    );

    // Then create the user document in Firestore
    const userDoc = {
      name: employeeData.name,
      email: employeeData.email,
      employeeId: employeeData.employeeId,
      isAdmin: false,
      attendance: {},
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
    
    return {
      id: userCredential.user.uid,
      ...userDoc
    };
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const getEmployeeAttendance = async (employeeId: string) => {
  try {
    const userRef = doc(db, 'users', employeeId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as Employee;
    return userData.attendance || {};
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};