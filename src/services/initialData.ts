import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types';

const initialEmployees = [
  {
    id: 'emp1',
    name: 'Admin User',
    email: 'admin@skyinvestments.com',
    employeeId: '00000',
    password: 'admin001',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    attendance: {}
  },
  {
    id: 'emp2',
    name: 'Aditya',
    email: 'aditya@skyinvestments.com',
    employeeId: '39466',
    password: 'Aditya@123',
    isAdmin: false,
    createdAt: new Date().toISOString(),
    attendance: {}
  }
];

export const setupInitialData = async () => {
  try {
    console.log('Checking if initial data needs to be set up...');
    const employeesRef = collection(db, 'employees');
    const snapshot = await getDocs(employeesRef);
    
    if (snapshot.empty) {
      console.log('No existing employees found, setting up initial data...');
      for (const employee of initialEmployees) {
        await setDoc(doc(employeesRef, employee.id), employee);
      }
      console.log('Initial employee data setup complete');
    } else {
      console.log('Existing employees found, skipping initial setup');
    }
  } catch (error) {
    console.error('Error setting up initial data:', error);
    throw error;
  }
};