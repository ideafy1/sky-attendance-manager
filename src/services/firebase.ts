import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { Employee, AttendanceRecord } from '@/types';

const firebaseConfig = {
  apiKey: "AIzaSyAXvihOdAIOsBOonbv5pxyeFrNJE2aUCsA",
  authDomain: "skyinve-96c28.firebaseapp.com",
  databaseURL: "https://skyinve-96c28-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skyinve-96c28",
  storageBucket: "skyinve-96c28.firebasestorage.app",
  messagingSenderId: "812146837776",
  appId: "1:812146837776:web:1ded0395564e8ae9177d95",
  measurementId: "G-7ZX26GXV2Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signOut = async () => {
  try {
    console.log('Signing out user');
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const loginUser = async (employeeId: string, password: string) => {
  try {
    console.log('Attempting to login with employeeId:', employeeId);
    
    // First, get the employee document
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('No employee found with ID:', employeeId);
      throw new Error('Employee not found');
    }

    const employeeDoc = querySnapshot.docs[0];
    const employeeData = employeeDoc.data() as Employee;
    
    // Attempt to sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, employeeData.email, password);
    
    // Check if this is the first login of the day
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = employeeData.attendance?.[today];
    const isFirstLogin = !todayAttendance;

    console.log('Login successful:', {
      employeeId: employeeData.employeeId,
      isFirstLogin,
      isAdmin: employeeData.isAdmin
    });

    return {
      ...employeeData,
      id: employeeDoc.id,
      uid: userCredential.user.uid,
      isFirstLogin
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const markAttendance = async (
  employeeId: string,
  photoUrl: string,
  location: { latitude: number; longitude: number; address: string }
) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString();
    const today = timestamp.split('T')[0];
    const formattedTime = now.toLocaleTimeString('en-US', { hour12: false });
    const isLate = formattedTime > '09:30:00';

    // Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();

    const attendanceData: AttendanceRecord = {
      employeeId,
      date: today,
      time: formattedTime,
      timestamp,
      status: isLate ? 'PL' : 'P',
      location,
      photo: photoUrl,
      ipAddress: ipData.ip
    };

    // Add to attendance collection
    const attendanceRef = collection(db, 'attendance');
    await addDoc(attendanceRef, attendanceData);

    // Update employee's attendance record
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const employeeDoc = querySnapshot.docs[0];
      const currentData = employeeDoc.data();
      
      await updateDoc(doc(db, 'employees', employeeDoc.id), {
        attendance: {
          ...currentData.attendance,
          [today]: attendanceData
        }
      });
    }

    console.log('Attendance marked successfully:', attendanceData);
    return attendanceData;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const submitRegularization = async (
  employeeId: string,
  regularizationData: {
    date: string;
    time: string;
    reason: string;
  }
) => {
  try {
    const regularizationRef = collection(db, 'regularization_requests');
    
    const request = {
      employeeId,
      ...regularizationData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    await addDoc(regularizationRef, request);
    console.log('Regularization request submitted:', request);
    return true;
  } catch (error) {
    console.error('Error submitting regularization:', error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    console.log('Fetching all employees');
    const employeesRef = collection(db, 'employees');
    const querySnapshot = await getDocs(employeesRef);
    const employees = querySnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data() 
    } as Employee));
    console.log('Fetched employees:', employees.length);
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getEmployeeAttendance = async (employeeId: string) => {
  try {
    const attendanceRef = collection(db, 'attendance');
    const q = query(attendanceRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};