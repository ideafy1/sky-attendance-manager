import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { Employee, AttendanceRecord } from '@/types';

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.data() as Employee;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
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

export const markAttendance = async (userId: string, attendanceData: AttendanceRecord) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as Employee;
    
    const attendance = userData.attendance || {};
    attendance[attendanceData.date] = attendanceData.status;
    
    await updateDoc(userRef, {
      attendance,
      lastLogin: {
        date: attendanceData.date,
        time: attendanceData.time,
        location: attendanceData.location,
        photo: attendanceData.photo
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    const employeesRef = collection(db, 'users');
    const querySnapshot = await getDocs(employeesRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const addNewEmployee = async (employeeData: Omit<Employee, 'id'>) => {
  try {
    const employeesRef = collection(db, 'users');
    await setDoc(doc(employeesRef), employeeData);
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