import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { Employee } from '@/types';

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

export const loginUser = async (employeeId: string, password: string) => {
  try {
    console.log('Attempting to login with employeeId:', employeeId);
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("employeeId", "==", employeeId));
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot:', querySnapshot.empty ? 'No matching documents' : 'Found matching documents');
    
    if (querySnapshot.empty) {
      throw new Error('Employee not found');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as Employee;
    
    console.log('Found user data:', { ...userData, password: '[REDACTED]' });

    const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
    
    console.log('Firebase Auth successful');

    // Check if this is the first login of the day
    const today = new Date().toISOString().split('T')[0];
    const isFirstLogin = !userData.attendance?.[today];

    return {
      ...userData,
      id: userDoc.id,
      uid: userCredential.user.uid,
      isFirstLogin
    };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/wrong-password') {
      throw new Error('Invalid password');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Employee not found');
    }
    throw error;
  }
};

export const markAttendance = async (
  userId: string,
  photoUrl: string,
  location: { latitude: number; longitude: number; address: string }
) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
    const isLate = currentTime > '09:30:00';

    const attendanceData = {
      date: today,
      time: currentTime,
      status: isLate ? 'PL' : 'P',
      location,
      photo: photoUrl,
      ipAddress: await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
    };

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`attendance.${today}`]: attendanceData
    });

    return attendanceData;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const submitRegularization = async (
  userId: string,
  regularizationData: {
    date: string;
    time: string;
    reason: string;
  }
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const regularizationRef = collection(db, 'regularizations');
    
    await setDoc(doc(regularizationRef), {
      userId,
      ...regularizationData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error submitting regularization:', error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    console.log('Fetching all employees');
    const employeesRef = collection(db, 'users');
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

export const addNewEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  try {
    console.log('Adding new employee:', { ...employeeData, password: '[REDACTED]' });
    
    // First create the auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employeeData.email,
      employeeData.password as string
    );

    console.log('Created auth user:', userCredential.user.uid);

    // Then create the user document in Firestore
    const userDoc = {
      name: employeeData.name,
      email: employeeData.email,
      employeeId: employeeData.employeeId,
      isAdmin: false,
      attendance: {},
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
    
    console.log('Added employee document to Firestore');

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
    console.log('Fetching attendance for employee:', employeeId);
    const userRef = doc(db, 'users', employeeId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('Employee not found');
    }
    const userData = userDoc.data() as Employee;
    console.log('Fetched attendance:', userData.attendance || {});
    return userData.attendance || {};
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};
